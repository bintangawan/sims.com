<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\Section;
use App\Models\Term;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Concerns\FromArray;

class NilaiController extends Controller
{
    /**
     * Overview nilai siswa (ringkasan per mapel)
     */
    public function index(Request $request)
    {
        $siswa = Auth::user()->siswaProfile;

        if (!$siswa) {
            return redirect()->route('siswa.dashboard')
                ->with('error', 'Profile siswa tidak ditemukan.');
        }

        // Term aktif (fallback kalau query tidak ada)
        $currentTerm = Term::where('aktif', true)->first();
        $termId = $request->get('term_id', $currentTerm?->id);

        // Semua section tempat siswa terdaftar
        $sectionIds = $siswa->sections()->pluck('sections.id');

        // Ambil submissions milik siswa pada section dan term yg sesuai
        $submissions = Submission::where('user_id', $siswa->user_id)
            ->whereHas('assignment.section', function ($q) use ($sectionIds, $termId) {
                $q->whereIn('sections.id', $sectionIds);
                if ($termId) {
                    $q->where('term_id', $termId);
                }
            })
            ->with([
                'assignment:id,section_id,judul',
                'assignment.section:id,subject_id,guru_id,term_id',
                'assignment.section.subject:id,nama,kode',
                'assignment.section.guru:id,name',     // ← cukup guru (User), tanpa .user
                'assignment.section.term:id,semester,tahun',
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        // Group by nama mapel
        $bySubject = $submissions->groupBy(function ($s) {
            return $s->assignment?->section?->subject?->nama ?? 'Tanpa Nama';
        });

        // Bentuk ringkasan per mapel
        $subjectSummary = $bySubject->map(function ($items, $subjectName) {
            $total = $items->count();
            $avg   = (float) $items->avg('score');
            $latest = $items->sortByDesc('created_at')->first();

            // Samakan bentuk "latest_grade" untuk FE (grade = score)
            $latestGrade = $latest ? [
                'id' => $latest->id,
                'section' => [
                    'id' => $latest->assignment?->section?->id,
                    'subject' => [
                        'id'   => $latest->assignment?->section?->subject?->id,
                        'nama' => $latest->assignment?->section?->subject?->nama,
                        'kode' => $latest->assignment?->section?->subject?->kode,
                    ],
                    // FE kamu kadang pakai guru.user.name → kita bungkus manual dari User(name)
                    'guru' => [
                        'id' => $latest->assignment?->section?->guru?->id,
                        'user' => [
                            'id'   => $latest->assignment?->section?->guru?->id,
                            'name' => $latest->assignment?->section?->guru?->name,
                        ],
                    ],
                ],
                'assignment' => [
                    'id'    => $latest->assignment?->id,
                    'judul' => $latest->assignment?->judul,
                ],
                'grade' => $latest->score !== null ? (float) $latest->score : null,
                'created_at' => optional($latest->created_at)->toIso8601String(),
            ] : null;

            // Ambil maksimal 5 item terbaru untuk ditampilkan di kartu mapel
            $latestFive = $items->sortByDesc('created_at')->take(5)->values()->map(function ($s) {
                return [
                    'id' => $s->id,
                    'section' => [
                        'id' => $s->assignment?->section?->id,
                        'subject' => [
                            'id'   => $s->assignment?->section?->subject?->id,
                            'nama' => $s->assignment?->section?->subject?->nama,
                            'kode' => $s->assignment?->section?->subject?->kode,
                        ],
                        'guru' => [
                            'id' => $s->assignment?->section?->guru?->id,
                            'user' => [
                                'id'   => $s->assignment?->section?->guru?->id,
                                'name' => $s->assignment?->section?->guru?->name,
                            ],
                        ],
                    ],
                    'assignment' => [
                        'id'    => $s->assignment?->id,
                        'judul' => $s->assignment?->judul,
                    ],
                    'grade' => $s->score !== null ? (float) $s->score : null,
                    'created_at' => optional($s->created_at)->toIso8601String(),
                ];
            });

            return [
                'subject_name'  => $subjectName,
                'total_grades'  => $total,
                'average_grade' => round($avg, 2),
                'latest_grade'  => $latestGrade,
                'grades'        => $latestFive,
            ];
        });

        // Overall GPA = rata-rata score semua submissions
        $overallGPA = $submissions->isNotEmpty() ? round((float) $submissions->avg('score'), 2) : 0.0;

        // Daftar term untuk selector
        $terms = Term::orderBy('tahun', 'desc')->get();

        // Daftar subject untuk dialog export (pakai 'nama' & 'kode')
        $subjects = Section::whereIn('id', $sectionIds)
            ->with('subject')
            ->get()
            ->pluck('subject')
            ->unique('id')
            ->values()
            ->map(function ($s) {
                return [
                    'id'   => $s->id,
                    'nama' => $s->nama ?? 'Tanpa Nama',
                    'kode' => $s->kode ?? null,
                ];
            });

        return Inertia::render('Siswa/Nilai/Index', [
            'subjectSummary' => $subjectSummary,
            'overallGPA'     => $overallGPA,
            'totalGrades'    => $submissions->count(),
            'terms'          => $terms,
            'currentTerm'    => $currentTerm,
            'selectedTermId' => $termId,
            'subjects'       => $subjects,
        ]);
    }

    /**
     * Daftar nilai untuk 1 mapel (paginasi)
     */
    public function bySubject(Subject $subject, Request $request)
    {
        $siswa = Auth::user()->siswaProfile;

        if (!$siswa) {
            return redirect()->route('siswa.dashboard')
                ->with('error', 'Profile siswa tidak ditemukan.');
        }

        // Pastikan siswa terdaftar di subject ini
        $sectionIds = $siswa->sections()
            ->where('subject_id', $subject->id)
            ->pluck('sections.id');

        if ($sectionIds->isEmpty()) {
            abort(403, 'Anda tidak memiliki akses ke mata pelajaran ini.');
        }

        $currentTerm = Term::where('aktif', true)->first();
        $termId = $request->get('term_id', $currentTerm?->id);

        // Paginasi submissions milik siswa utk subject & term terkait
        $submissions = Submission::where('user_id', $siswa->user_id)
            ->whereHas('assignment.section', function ($q) use ($sectionIds, $termId) {
                $q->whereIn('sections.id', $sectionIds);
                if ($termId) {
                    $q->where('term_id', $termId);
                }
            })
            ->with([
                'assignment:id,section_id,judul',
                'assignment.section:id,guru_id',
                'assignment.section.guru:id,name', // ← tanpa .user
            ])
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Statistik (diambil dari semua submissions yg difilter)
        $all = Submission::where('user_id', $siswa->user_id)
            ->whereHas('assignment.section', function ($q) use ($sectionIds, $termId) {
                $q->whereIn('sections.id', $sectionIds);
                if ($termId) {
                    $q->where('term_id', $termId);
                }
            })
            ->get();

        $statistics = [
            'total_grades'  => $all->count(),
            'average_grade' => $all->isNotEmpty() ? round((float) $all->avg('score'), 2) : 0.0,
            'highest_grade' => $all->isNotEmpty() ? (float) $all->max('score') : 0.0,
            'lowest_grade'  => $all->isNotEmpty() ? (float) $all->min('score') : 0.0,
        ];

        // Bentuk shape item agar cocok dg front-end: grade = score
        $submissions->getCollection()->transform(function ($s) {
            return [
                'id' => $s->id,
                'section' => [
                    'id' => $s->assignment?->section?->id,
                    // bungkus ke guru.user agar FE lama tetap jalan
                    'guru' => [
                        'id' => $s->assignment?->section?->guru?->id,
                        'user' => [
                            'id'   => $s->assignment?->section?->guru?->id,
                            'name' => $s->assignment?->section?->guru?->name,
                        ],
                    ],
                ],
                'assignment' => [
                    'id'    => $s->assignment?->id,
                    'judul' => $s->assignment?->judul,
                ],
                'grade' => $s->score !== null ? (float) $s->score : null,
                'created_at' => optional($s->created_at)->toIso8601String(),
            ];
        });

        $terms = Term::orderBy('tahun', 'desc')->get();

        return Inertia::render('Siswa/Nilai/BySubject', [
            'subject'        => $subject,
            'grades'         => $submissions,
            'statistics'     => $statistics,
            'terms'          => $terms,
            'currentTerm'    => $currentTerm,
            'selectedTermId' => $termId,
        ]);
    }

    /**
     * Export nilai ke Excel (dari submissions.score)
     */
    public function export(Request $request)
    {
        $siswa = Auth::user()->siswaProfile;

        if (!$siswa) {
            return redirect()->route('siswa.dashboard')
                ->with('error', 'Profile siswa tidak ditemukan.');
        }

        $termId  = $request->get('term_id');
        $classId = $request->get('class_id'); // subject id

        $term    = $termId ? Term::find($termId) : Term::where('aktif', true)->first();
        $subject = $classId ? Subject::find($classId) : null;

        $sectionIds = $siswa->sections()->pluck('sections.id');

        $submissions = Submission::where('user_id', $siswa->user_id)
            ->whereHas('assignment.section', function ($q) use ($sectionIds, $termId, $classId) {
                $q->whereIn('sections.id', $sectionIds);
                if ($termId) {
                    $q->where('term_id', $termId);
                }
                if ($classId) {
                    $q->where('subject_id', $classId);
                }
            })
            ->with([
                'assignment:id,section_id,judul',
                'assignment.section:id,subject_id,guru_id,term_id',
                'assignment.section.subject:id,nama,kode',
                'assignment.section.guru:id,name', // ← tanpa .user
                'assignment.section.term:id,semester,tahun',
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        // Build rows
        $rows   = [];
        $rows[] = ['Mata Pelajaran', 'Kode', 'Tugas', 'Nilai', 'Guru', 'Tanggal', 'Semester', 'Tahun'];

        foreach ($submissions as $s) {
            $rows[] = [
                $s->assignment?->section?->subject?->nama ?? '',
                $s->assignment?->section?->subject?->kode ?? '',
                $s->assignment?->judul ?? '',
                $s->score !== null ? (float) $s->score : null,
                $s->assignment?->section?->guru?->name ?? '',
                optional($s->created_at)->format('Y-m-d H:i'),
                $s->assignment?->section?->term?->semester ?? '',
                $s->assignment?->section?->term?->tahun ?? '',
            ];
        }

        // Nama file aman
        $studentName = $this->safeFilePart($siswa->user?->name ?? 'siswa');
        $termLabel   = $term ? $this->safeFilePart(($term->tahun ?? '') . '-' . ($term->semester ?? '')) : 'semua-semester';
        $subjectLbl  = $subject ? $this->safeFilePart($subject->nama ?? 'mapel') : null;

        $parts    = array_filter(['nilai', $studentName, $termLabel, $subjectLbl, date('Y-m-d')]);
        $fileName = implode('_', $parts) . '.xlsx';

        // Download Excel dari array
        return Excel::download(new class($rows) implements FromArray {
            private array $rows;
            public function __construct(array $rows) { $this->rows = $rows; }
            public function array(): array { return $this->rows; }
        }, $fileName);
    }

    /**
     * Sanitizer nama file
     */
    private function safeFilePart(string $value): string
    {
        // ganti karakter terlarang Windows/HTTP header
        $value = preg_replace('/[\/\\\\:\*\?"<>\|]+/', '-', $value);
        // hilangkan kontrol karakter & trim
        $value = trim(preg_replace('/[\x00-\x1F\x7F]+/u', '', (string) $value));
        if ($value === '') {
            $value = 'export';
        }
        return mb_substr($value, 0, 150);
    }
}