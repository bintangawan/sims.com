<?php

namespace App\Http\Controllers\Chat;

use App\Http\Controllers\Controller;
use App\Models\ChatSession;
use App\Models\ChatMessage;
use App\Services\Chat\GeminiClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ChatController extends Controller
{
    protected GeminiClient $geminiClient;

    public function __construct(GeminiClient $geminiClient)
    {
        $this->geminiClient = $geminiClient;
    }

    /**
     * Endpoint chat untuk user yang LOGIN (dilindungi middleware auth).
     * Menggunakan handleChatCore() dengan user terautentikasi.
     */
    public function chat(Request $request)
    {
        $request->validate([
            'message'    => 'required|string|max:2000',
            'session_id' => 'nullable|exists:chat_sessions,id',
            'source'     => 'required|in:landing,siswa,guru,admin'
        ]);

        return $this->handleChatCore($request, /*use-auth*/ 'use-auth');
    }

    /**
     * Endpoint chat untuk tamu/guest (tanpa login).
     * Orang tua bisa tanya via halaman landing.
     */
    public function publicChat(Request $request)
    {
        // Paksa default source = 'landing' kalau tidak dikirim
        $request->merge([
            'source' => $request->input('source', 'landing'),
        ]);

        $request->validate([
            'message'    => 'required|string|max:2000',
            'session_id' => 'nullable|exists:chat_sessions,id',
            'source'     => 'required|in:landing,siswa,guru,admin',
        ]);

        // Jalankan core tanpa user terautentikasi (guest)
        return $this->handleChatCore($request, /*forceUser*/ null);
    }

    /**
     * Ambil daftar sesi milik user yang login.
     * (Route: GET /api/chat/sessions)
     */
    public function sessions(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $sessions = ChatSession::where('user_id', Auth::id())
            ->with(['messages' => function ($query) {
                $query->latest()->limit(1);
            }])
            ->orderBy('updated_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success'  => true,
            'sessions' => $sessions
        ]);
    }

    /**
     * Ambil detail 1 sesi + seluruh pesan (dengan implicit route model binding).
     * (Route: GET /api/chat/sessions/{session})
     */
    public function getSession(ChatSession $session)
    {
        if (Auth::check() && $session->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $messages = $session->messages()->orderBy('created_at', 'asc')->get();

        return response()->json([
            'success'  => true,
            'session'  => $session,
            'messages' => $messages
        ]);
    }

    /**
     * Hapus satu sesi beserta semua pesannya.
     * (Route: DELETE /api/chat/sessions/{session})
     */
    public function deleteSession(ChatSession $session)
    {
        if (Auth::check() && $session->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $session->messages()->delete();
        $session->delete();

        return response()->json([
            'success' => true,
            'message' => 'Session berhasil dihapus'
        ]);
    }

    /* ==================== CORE RUNNER (dipakai auth & guest) ==================== */

    /**
     * Core chat runner: dipakai oleh chat() (auth) & publicChat() (guest).
     * - Jika $forceUser === 'use-auth' → gunakan Auth::user()
     * - Jika $forceUser === null → guest
     */
    private function handleChatCore(Request $request, $forceUser = 'use-auth')
    {
        $user = ($forceUser === 'use-auth') ? Auth::user() : $forceUser;

        try {
            // 1) Get or create session
            $session = $this->getOrCreateSession(
                $request->session_id,
                $request->source,
                $user // boleh null untuk guest
            );

            // 2) Save user message
            $userMessage = ChatMessage::create([
                'session_id' => $session->id,
                'sender'     => 'user',
                'content'    => $request->message
            ]);

            // 3) Build context & history
            $context = $this->buildContext($session, $user);
            $history = $this->getConversationHistory($session);

            // 4) Tools
            $tools = $this->toolDeclarations();

            // 5) Phase-1: minta toolCall ke Gemini
            $first = $this->geminiClient->generate(
                contents: array_merge($history, [[
                    'role'  => 'user',
                    'parts' => [['text' => $context . "\n\nUSER: " . $request->message]]
                ]]),
                tools:   $tools,
                toolConfig: ['functionCallingConfig' => ['mode' => 'AUTO']]
            );

            // 6) Extract function calls (bisa kosong)
            $calls = $this->extractFunctionCalls($first);

            if (empty($calls)) {
                $finalText = $this->extractText($first) ?? 'Maaf, saya belum menemukan jawabannya.';
                $botMessage = ChatMessage::create([
                    'session_id' => $session->id,
                    'sender'     => 'bot',
                    'content'    => $finalText,
                    'meta_json'  => [
                        'model'     => env('GEMINI_MODEL', 'gemini-pro'),
                        'timestamp' => now()->toISOString(),
                        'phase'     => 'no_tool'
                    ]
                ]);

                return response()->json([
                    'success'      => true,
                    'session_id'   => $session->id,
                    'user_message' => $userMessage,
                    'bot_message'  => $botMessage
                ]);
            }

            // 7) Jalankan tools yang diminta model
            $toolResponsesBlocks = [];
            foreach ($calls as $call) {
                $name = $call['name'];
                $args = is_array($call['args'] ?? null) ? $call['args'] : [];

                $result = $this->executeTool($name, $args, $session);

                $toolResponsesBlocks[] = [
                    'functionResponse' => [
                        'name'     => $name,
                        'response' => $result,
                    ],
                ];
            }

            // 8) Phase-2: kirim toolResponses agar model merangkai jawaban generatif yang grounded
            $second = $this->geminiClient->generateWithToolResponse(
                contents: array_merge($history, [[
                    'role'  => 'user',
                    'parts' => [['text' => $context . "\n\nUSER: " . $request->message]]
                ]]),
                toolResponses: $toolResponsesBlocks
            );

            $finalText = $this->extractText($second) ?? 'Maaf, saya belum menemukan jawabannya.';
            $botMessage = ChatMessage::create([
                'session_id' => $session->id,
                'sender'     => 'bot',
                'content'    => $finalText,
                'meta_json'  => [
                    'model'        => env('GEMINI_MODEL', 'gemini-pro'),
                    'timestamp'    => now()->toISOString(),
                    'phase'        => 'with_tool',
                    'tool_calls'   => $calls,
                    'tool_results' => $toolResponsesBlocks,
                ]
            ]);

            return response()->json([
                'success'      => true,
                'session_id'   => $session->id,
                'user_message' => $userMessage,
                'bot_message'  => $botMessage
            ]);

        } catch (\Exception $e) {
            Log::error('Chat error: ' . $e->getMessage(), [
                'user_id' => $user?->id,
                'message' => $request->message,
                'source'  => $request->source,
                'trace'   => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'error'   => 'Maaf, terjadi kesalahan. Silakan coba lagi.'
            ], 500);
        }
    }

    /* ==================== TOOLS (DECLARATION & EXECUTION) ==================== */

    /**
     * Deklarasi tool/fungsi yang boleh dipanggil model.
     * Sesuaikan dengan kebutuhan SIMS & tabel MySQL yang tersedia.
     */
    private function toolDeclarations(): array
    {
        return [[
            'functionDeclarations' => [
                [
                    'name'        => 'count_students',
                    'description' => 'Hitung total siswa di sistem.',
                    'parameters'  => [
                        'type'       => 'OBJECT',
                        'properties' => [],
                    ],
                ],
                [
                    'name'        => 'count_teachers',
                    'description' => 'Hitung total guru di sistem.',
                    'parameters'  => [
                        'type'       => 'OBJECT',
                        'properties' => [],
                    ],
                ],
                [
                    'name'        => 'get_announcements_this_week',
                    'description' => 'Ambil pengumuman untuk minggu berjalan, filter berdasarkan peran jika ada.',
                    'parameters'  => [
                        'type'       => 'OBJECT',
                        'properties' => [
                            'role' => ['type' => 'STRING', 'description' => 'admin|guru|siswa|guest'],
                        ],
                    ],
                ],
                [
                    'name'        => 'get_upcoming_assignments',
                    'description' => 'Ambil tugas yang akan datang (7 hari ke depan).',
                    'parameters'  => [
                        'type'       => 'OBJECT',
                        'properties' => [
                            'days_ahead' => ['type' => 'INTEGER', 'description' => 'Jumlah hari ke depan', 'default' => 7],
                        ],
                    ],
                ],
                [
                    'name'        => 'get_today_attendance_stats',
                    'description' => 'Rekap status kehadiran untuk hari ini, seluruh kelas.',
                    'parameters'  => [
                        'type'       => 'OBJECT',
                        'properties' => [],
                    ],
                ],
            ],
        ]];
    }

    /**
     * Jalankan tool yang diminta model (SELECT-only; aman & dibatasi).
     */
    private function executeTool(string $name, array $args, ChatSession $session): array
    {
        switch ($name) {
            case 'count_students':
                $total = (int) DB::table('siswa_profiles')->count();
                return ['total_students' => $total];

            case 'count_teachers':
                $total = (int) DB::table('guru_profiles')->count();
                return ['total_teachers' => $total];

            case 'get_announcements_this_week': {
                $tz = 'Asia/Jakarta';
                $start = Carbon::now($tz)->startOfWeek(); // Senin
                $end   = Carbon::now($tz)->endOfWeek();   // Minggu

                $role  = $this->normalizeRoleForAnnouncements(
                    $args['role'] ?? $this->roleFromSource($session->source)
                );

                $q = DB::table('announcements')
                    ->select('id','title','content','scope_type','scope_id','role_name','published_at')
                    ->whereBetween('published_at', [
                        $start->clone()->timezone('UTC'),
                        $end->clone()->timezone('UTC'),
                    ])
                    ->orderBy('published_at','desc');

                // Tampilkan 'global' + role yang cocok
                $q->where(function ($w) use ($role) {
                    $w->where('scope_type', 'global')
                      ->orWhere(function ($ww) use ($role) {
                          $ww->where('scope_type', 'role')
                             ->where('role_name', $role);
                      });
                });

                $rows = $q->limit(20)->get();

                return [
                    'range' => [
                        'start' => $start->toDateString(),
                        'end'   => $end->toDateString(),
                        'tz'    => $tz,
                    ],
                    'role'  => $role,
                    'items' => $rows,
                ];
            }

            case 'get_upcoming_assignments': {
                $daysAhead = (int) ($args['days_ahead'] ?? 7);
                $tz = 'Asia/Jakarta';
                $now = Carbon::now($tz);
                $until = $now->clone()->addDays(max(1, $daysAhead));

                $rows = DB::table('assignments')
                    ->select('id','section_id','judul','deadline','published_at')
                    ->whereBetween('deadline', [
                        $now->clone()->timezone('UTC'),
                        $until->clone()->timezone('UTC'),
                    ])
                    ->orderBy('deadline')
                    ->limit(50)
                    ->get();

                return [
                    'from'  => $now->toDateTimeString(),
                    'until' => $until->toDateTimeString(),
                    'items' => $rows,
                ];
            }

            case 'get_today_attendance_stats': {
                $tz = 'Asia/Jakarta';
                $today = Carbon::now($tz)->toDateString();

                $attendanceIds = DB::table('attendances')
                    ->whereDate('tanggal', $today)
                    ->pluck('id');

                if ($attendanceIds->isEmpty()) {
                    return [
                        'date'   => $today,
                        'counts' => ['hadir' => 0, 'izin' => 0, 'sakit' => 0, 'alpha' => 0],
                        'total'  => 0,
                    ];
                }

                $raw = DB::table('attendance_details')
                    ->select('status', DB::raw('COUNT(*) as cnt'))
                    ->whereIn('attendance_id', $attendanceIds)
                    ->groupBy('status')
                    ->pluck('cnt','status');

                $counts = [
                    'hadir' => (int) ($raw['hadir'] ?? 0),
                    'izin'  => (int) ($raw['izin'] ?? 0),
                    'sakit' => (int) ($raw['sakit'] ?? 0),
                    'alpha' => (int) ($raw['alpha'] ?? 0),
                ];

                return [
                    'date'   => $today,
                    'counts' => $counts,
                    'total'  => array_sum($counts),
                ];
            }

            default:
                return ['error' => 'unknown_function'];
        }
    }

    /** Mapping sumber → role_name untuk announcements */
    private function roleFromSource(string $source): string
    {
        return match ($source) {
            'siswa' => 'siswa',
            'guru'  => 'guru',
            'admin' => 'admin',
            default => 'guest',
        };
    }

    /** Normalisasi role agar termasuk set yang diizinkan */
    private function normalizeRoleForAnnouncements(?string $role): string
    {
        $r = strtolower((string) $role);
        return in_array($r, ['siswa','guru','admin','guest'], true) ? $r : 'guest';
    }

    /* ==================== PARSER HELPERS ==================== */

    private function extractFunctionCalls(array $resp): array
    {
        $calls = [];
        foreach (($resp['candidates'] ?? []) as $cand) {
            $parts = data_get($cand, 'content.parts', []);
            foreach ($parts as $p) {
                if (isset($p['functionCall']['name'])) {
                    $calls[] = [
                        'name' => $p['functionCall']['name'],
                        'args' => $p['functionCall']['args'] ?? [],
                    ];
                }
            }
        }
        return $calls;
    }

    private function extractText(array $resp): ?string
    {
        foreach (($resp['candidates'] ?? []) as $cand) {
            $parts = data_get($cand, 'content.parts', []);
            foreach ($parts as $p) {
                if (isset($p['text'])) {
                    return $p['text'];
                }
            }
        }
        return null;
    }

    /* ==================== UTIL YANG SUDAH ADA (dibiarkan) ==================== */

    private function getOrCreateSession($sessionId, $source, $user = null)
    {
        if ($sessionId) {
            $session = ChatSession::find($sessionId);
            if ($session) {
                return $session;
            }
        }

        return ChatSession::create([
            'user_id' => $user?->id,
            'role'    => $user?->roles->first()?->name,
            'source'  => $source
        ]);
    }

    private function buildContext($session, $user = null)
    {
        $context = [];

        switch ($session->source) {
            case 'landing':
                $context[] = "Anda adalah asisten AI untuk website SIMS (Sistem Informasi Manajemen Sekolah).";
                $context[] = "Bantu pengunjung memahami fitur-fitur SIMS dan cara menggunakannya.";
                break;

            case 'siswa':
                $context[] = "Anda adalah asisten AI untuk siswa di SIMS.";
                $context[] = "Bantu siswa dengan pertanyaan tentang jadwal, tugas, nilai, absensi, dan materi pembelajaran.";
                if ($user) {
                    $context[] = "Nama siswa: {$user->name}";
                    if ($user->siswaProfile) {
                        $context[] = "NIS: {$user->siswaProfile->nis}";
                        $context[] = "Kelas: {$user->siswaProfile->kelas}";
                        $context[] = "Angkatan: {$user->siswaProfile->angkatan}";
                    }
                }
                break;

            case 'guru':
                $context[] = "Anda adalah asisten AI untuk guru di SIMS.";
                $context[] = "Bantu guru dengan pertanyaan tentang pengelolaan kelas, pembuatan tugas, penilaian, absensi, dan materi.";
                if ($user) {
                    $context[] = "Nama guru: {$user->name}";
                    if ($user->guruProfile) {
                        $context[] = "Mata pelajaran keahlian: {$user->guruProfile->mapel_keahlian}";
                    }
                }
                break;

            case 'admin':
                $context[] = "Anda adalah asisten AI untuk admin di SIMS.";
                $context[] = "Bantu admin dengan pertanyaan tentang manajemen pengguna, master data, jadwal, laporan, dan konfigurasi sistem.";
                if ($user) {
                    $context[] = "Nama admin: {$user->name}";
                }
                break;
        }

        $context[] = "Tanggal dan waktu saat ini: " . now('Asia/Jakarta')->format('d F Y, H:i:s T');
        $context[] = "Jawab dalam bahasa Indonesia yang sopan dan profesional.";
        $context[] = "Jika tidak yakin dengan jawaban, sarankan untuk menghubungi admin atau guru.";
        $context[] = "Fokus pada topik yang berkaitan dengan pendidikan dan SIMS.";
        $context[] = "Jika membutuhkan data faktual, panggil fungsi (tool) yang tersedia lalu rangkai jawaban berdasarkan hasilnya.";

        return implode("\n", $context);
    }

    private function getConversationHistory($session, $limit = 10)
    {
        return $session->messages()
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->reverse()
            ->map(function ($message) {
                return [
                    'role'  => $message->sender === 'user' ? 'user' : 'model',
                    'parts' => [['text' => $message->content]]
                ];
            })
            ->toArray();
    }
}
