<?php

namespace App\Http\Controllers\Chat;

use App\Http\Controllers\Controller;
use App\Models\ChatSession;
use App\Models\ChatMessage;
use App\Models\ChatConfig;
use App\Services\Chat\GeminiClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    protected $geminiClient;

    public function __construct(GeminiClient $geminiClient)
    {
        $this->geminiClient = $geminiClient;
    }

    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
            'session_id' => 'nullable|exists:chat_sessions,id',
            'source' => 'required|in:landing,siswa,guru,admin'
        ]);

        try {
            // Get or create session
            $session = $this->getOrCreateSession(
                $request->session_id,
                $request->source,
                Auth::user()
            );

            // Save user message
            $userMessage = ChatMessage::create([
                'session_id' => $session->id,
                'sender' => 'user',
                'content' => $request->message
            ]);

            // Get context for the user
            $context = $this->buildContext($session, Auth::user());

            // Get response from Gemini
            $botResponse = $this->geminiClient->sendMessage(
                $request->message,
                $context,
                $this->getConversationHistory($session)
            );

            // Save bot response
            $botMessage = ChatMessage::create([
                'session_id' => $session->id,
                'sender' => 'bot',
                'content' => $botResponse,
                'meta_json' => [
                    'model' => 'gemini-pro',
                    'timestamp' => now()->toISOString()
                ]
            ]);

            return response()->json([
                'success' => true,
                'session_id' => $session->id,
                'user_message' => $userMessage,
                'bot_message' => $botMessage
            ]);

        } catch (\Exception $e) {
            Log::error('Chat error: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'message' => $request->message,
                'source' => $request->source
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Maaf, terjadi kesalahan. Silakan coba lagi.'
            ], 500);
        }
    }

    public function getHistory(Request $request)
    {
        $request->validate([
            'session_id' => 'required|exists:chat_sessions,id'
        ]);

        $session = ChatSession::findOrFail($request->session_id);
        
        // Check if user owns this session (for authenticated users)
        if (Auth::check() && $session->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $messages = $session->messages()
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'session' => $session,
            'messages' => $messages
        ]);
    }

    public function getSessions(Request $request)
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
            'success' => true,
            'sessions' => $sessions
        ]);
    }

    public function deleteSession(Request $request)
    {
        $request->validate([
            'session_id' => 'required|exists:chat_sessions,id'
        ]);

        $session = ChatSession::findOrFail($request->session_id);
        
        // Check if user owns this session
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
            'role' => $user?->roles->first()?->name,
            'source' => $source
        ]);
    }

    private function buildContext($session, $user = null)
    {
        $context = [];
        
        // Base context based on source
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

        // Add current date and time
        $context[] = "Tanggal dan waktu saat ini: " . now()->format('d F Y, H:i:s');
        
        // Add system guidelines
        $context[] = "Jawab dalam bahasa Indonesia yang sopan dan profesional.";
        $context[] = "Jika tidak yakin dengan jawaban, sarankan untuk menghubungi admin atau guru.";
        $context[] = "Fokus pada topik yang berkaitan dengan pendidikan dan SIMS.";

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
                    'role' => $message->sender === 'user' ? 'user' : 'model',
                    'parts' => [['text' => $message->content]]
                ];
            })
            ->toArray();
    }
}