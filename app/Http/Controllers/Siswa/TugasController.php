<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Submission;
use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Carbon\Carbon;

class TugasController extends Controller
{
    /**
     * Display list of assignments for student
     */
    public function index(Request $request)
    {
        $siswa = Auth::user()->siswaProfile;

        if (!$siswa) {
            return redirect()->route('siswa.dashboard')
                ->with('error', 'Profile siswa tidak ditemukan.');
        }

        // Get sections where student is enrolled
        $sectionIds = $siswa->sections()->pluck('sections.id');

        $query = Assignment::whereIn('section_id', $sectionIds)
            ->with(['section.subject', 'section.guru']); // guru langsung ke User

        // Filter by status
        if ($request->has('status')) {
            $status = $request->get('status');
            if ($status === 'pending') {
                $query->where('deadline', '>=', now())
                    ->whereDoesntHave('submissions', function ($q) use ($siswa) {
                        $q->where('user_id', $siswa->user_id);
                    });
            } elseif ($status === 'submitted') {
                $query->whereHas('submissions', function ($q) use ($siswa) {
                    $q->where('user_id', $siswa->user_id);
                });
            } elseif ($status === 'overdue') {
                $query->where('deadline', '<', now())
                    ->whereDoesntHave('submissions', function ($q) use ($siswa) {
                        $q->where('user_id', $siswa->user_id);
                    });
            }
        }

        // Filter by subject
        if ($request->has('subject_id') && $request->get('subject_id')) {
            $query->whereHas('section', function ($q) use ($request) {
                $q->where('subject_id', $request->get('subject_id'));
            });
        }

        $assignments = $query->orderBy('deadline', 'asc')
            ->paginate(10)
            ->withQueryString();

        // Add submission status for each assignment
        $assignments->getCollection()->transform(function ($assignment) use ($siswa) {
            $submission = $assignment->submissions()
                ->where('user_id', $siswa->user_id)
                ->first();

            $deadline = $this->getDeadline($assignment);

            $assignment->submission_status = $submission
                ? 'submitted'
                : ($deadline && $deadline->lt(now()) ? 'overdue' : 'pending');

            $assignment->submission = $submission;
            return $assignment;
        });

        // Get subjects for filter
        $subjects = Section::whereIn('id', $sectionIds)
            ->with('subject')
            ->get()
            ->pluck('subject')
            ->unique('id')
            ->values();

        return Inertia::render('Siswa/Tugas/Index', [
            'assignments' => $assignments,
            'subjects'    => $subjects,
            'filters'     => $request->only(['status', 'subject_id']),
        ]);
    }

    /**
     * Display assignment details
     */
    public function show(Assignment $assignment)
    {
        $siswa = Auth::user()->siswaProfile;

        if (!$siswa) {
            return redirect()->route('siswa.dashboard')
                ->with('error', 'Profile siswa tidak ditemukan.');
        }

        // Check if student is enrolled in this section
        if (!$siswa->sections()->where('sections.id', $assignment->section_id)->exists()) {
            abort(403, 'Anda tidak memiliki akses ke tugas ini.');
        }

        $assignment->load(['section.subject', 'section.guru']);

        $submission = $assignment->submissions()
            ->where('user_id', $siswa->user_id)
            ->first();

        $deadline = $this->getDeadline($assignment);
        $isGraded = $submission ? $this->isSubmissionGraded($submission) : false;

        return Inertia::render('Siswa/Tugas/Show', [
            'assignment' => $assignment,
            'submission' => $submission,
            'canSubmit'  => !$submission && $deadline && $deadline->gte(now()),
            'isOverdue'  => $deadline ? $deadline->lt(now()) : false,
            // canEdit dipertimbangkan di viewSubmission (lihat method di bawah)
        ]);
    }

    /**
     * Show submission form
     */
    public function submit(Assignment $assignment)
    {
        $siswa = Auth::user()->siswaProfile;

        if (!$siswa) {
            return redirect()->route('siswa.dashboard')
                ->with('error', 'Profile siswa tidak ditemukan.');
        }

        // Check if student is enrolled in this section
        if (!$siswa->sections()->where('sections.id', $assignment->section_id)->exists()) {
            abort(403, 'Anda tidak memiliki akses ke tugas ini.');
        }

        // Check if already submitted
        $existingSubmission = $assignment->submissions()
            ->where('user_id', $siswa->user_id)
            ->first();

        if ($existingSubmission) {
            return redirect()->route('siswa.tugas.view-submission', $assignment)
                ->with('info', 'Anda sudah mengumpulkan tugas ini.');
        }

        $assignment->load(['section.subject', 'section.guru']);

        $deadline = $this->getDeadline($assignment);

        return Inertia::render('Siswa/Tugas/Submit', [
            'assignment' => $assignment,
            'isOverdue'  => $deadline ? $deadline->lt(now()) : false,
        ]);
    }

    /**
     * Store submission
     */
    public function storeSubmission(Request $request, Assignment $assignment)
    {
        $siswa = Auth::user()->siswaProfile;

        if (!$siswa) {
            return redirect()->route('siswa.dashboard')
                ->with('error', 'Profile siswa tidak ditemukan.');
        }

        // Check if student is enrolled in this section
        if (!$siswa->sections()->where('sections.id', $assignment->section_id)->exists()) {
            abort(403, 'Anda tidak memiliki akses ke tugas ini.');
        }

        // Check if already submitted
        $existingSubmission = $assignment->submissions()
            ->where('user_id', $siswa->user_id)
            ->first();

        if ($existingSubmission) {
            return redirect()->route('siswa.tugas.view-submission', $assignment)
                ->with('error', 'Anda sudah mengumpulkan tugas ini.');
        }

        // Terima 'konten_teks' (sesuai model) atau fallback dari field 'content' jika frontend masih kirim 'content'
        $text = $request->input('konten_teks', $request->input('content'));

        $validator = Validator::make(
            ['konten_teks' => $text, 'file' => $request->file('file'), 'link_url' => $request->input('link_url')],
            [
                'konten_teks' => 'nullable|string',
                'file'        => 'nullable|file|max:10240|mimes:pdf,doc,docx,txt,jpg,jpeg,png,zip,rar',
                'link_url'    => 'nullable|url',
            ]
        );

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Pastikan minimal ada salah satu isi
        if (!$text && !$request->hasFile('file') && !$request->filled('link_url')) {
            return redirect()->back()
                ->withErrors(['konten_teks' => 'Isi jawaban, unggah file, atau masukkan tautan.'])
                ->withInput();
        }

        try {
            $submissionData = [
                'assignment_id' => $assignment->id,
                'user_id'       => $siswa->user_id,
                'konten_teks'   => $text,
                'link_url'      => $request->input('link_url'),
                'submitted_at'  => now(),
            ]

            ;

            // Handle file upload
            if ($request->hasFile('file')) {
                $file     = $request->file('file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('submissions', $fileName, 'public');
                $submissionData['file_path'] = $filePath;
            }

            Submission::create($submissionData);

            return redirect()->route('siswa.tugas.show', $assignment)
                ->with('success', 'Tugas berhasil dikumpulkan.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Gagal mengumpulkan tugas: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * View submission details
     */
    public function viewSubmission(Assignment $assignment)
    {
        $siswa = Auth::user()->siswaProfile;

        if (!$siswa) {
            return redirect()->route('siswa.dashboard')
                ->with('error', 'Profile siswa tidak ditemukan.');
        }

        // Check if student is enrolled in this section
        if (!$siswa->sections()->where('sections.id', $assignment->section_id)->exists()) {
            abort(403, 'Anda tidak memiliki akses ke tugas ini.');
        }

        $submission = $assignment->submissions()
            ->where('user_id', $siswa->user_id)
            ->first();

        if (!$submission) {
            return redirect()->route('siswa.tugas.submit', $assignment)
                ->with('info', 'Anda belum mengumpulkan tugas ini.');
        }

        $assignment->load(['section.subject', 'section.guru']);

        $deadline = $this->getDeadline($assignment);
        $isGraded = $this->isSubmissionGraded($submission);

        return Inertia::render('Siswa/Tugas/ViewSubmission', [
            'assignment' => $assignment,
            'submission' => $submission,
            // canEdit: belum dinilai & belum lewat deadline
            'canEdit'    => !$isGraded && $deadline && $deadline->gte(now()),
        ]);
    }

    /**
     * Update submission (if allowed)
     */
    public function updateSubmission(Request $request, Assignment $assignment)
    {
        $siswa = Auth::user()->siswaProfile;

        if (!$siswa) {
            return redirect()->route('siswa.dashboard')
                ->with('error', 'Profile siswa tidak ditemukan.');
        }

        // Check if student is enrolled in this section
        if (!$siswa->sections()->where('sections.id', $assignment->section_id)->exists()) {
            abort(403, 'Anda tidak memiliki akses ke tugas ini.');
        }

        $submission = $assignment->submissions()
            ->where('user_id', $siswa->user_id)
            ->first();

        if (!$submission) {
            return redirect()->route('siswa.tugas.submit', $assignment)
                ->with('error', 'Submission tidak ditemukan.');
        }

        $deadline = $this->getDeadline($assignment);
        $isGraded = $this->isSubmissionGraded($submission);

        // Blokir jika sudah dinilai atau sudah lewat deadline
        if ($isGraded || ($deadline && $deadline->lt(now()))) {
            return redirect()->route('siswa.tugas.view-submission', $assignment)
                ->with('error', 'Submission tidak dapat diubah (sudah dinilai atau melewati batas waktu).');
        }

        // Terima 'konten_teks' atau fallback dari 'content'
        $text = $request->input('konten_teks', $request->input('content'));

        $validator = Validator::make(
            ['konten_teks' => $text, 'file' => $request->file('file'), 'link_url' => $request->input('link_url')],
            [
                'konten_teks' => 'nullable|string',
                'file'        => 'nullable|file|max:10240|mimes:pdf,doc,docx,txt,jpg,jpeg,png,zip,rar',
                'link_url'    => 'nullable|url',
            ]
        );

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Minimal ada salah satu
        if (!$text && !$request->hasFile('file') && !$request->filled('link_url')) {
            return redirect()->back()
                ->withErrors(['konten_teks' => 'Isi jawaban, unggah file, atau masukkan tautan.'])
                ->withInput();
        }

        try {
            $updateData = [
                'konten_teks'  => $text,
                'link_url'     => $request->input('link_url'),
                'submitted_at' => now(),
            ];

            // Handle file upload
            if ($request->hasFile('file')) {
                // Delete old file if exists
                if (!empty($submission->file_path)) {
                    Storage::disk('public')->delete($submission->file_path);
                }

                $file     = $request->file('file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('submissions', $fileName, 'public');
                $updateData['file_path'] = $filePath;
            }

            $submission->update($updateData);

            return redirect()->route('siswa.tugas.view-submission', $assignment)
                ->with('success', 'Submission berhasil diperbarui.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Gagal memperbarui submission: ' . $e->getMessage())
                ->withInput();
        }
    }

    // ========================
    // Helpers
    // ========================

    /**
     * Ambil deadline sebagai Carbon|null menggunakan getAttribute(),
     * agar static analyzer tidak men-flag PHP1416.
     */
    private function getDeadline(Assignment $assignment): ?Carbon
    {
        $raw = $assignment->getAttribute('deadline');
        if (!$raw) {
            return null;
        }
        // Jika sudah dicast ke datetime di model Assignment, ini bisa langsung berupa Carbon
        if ($raw instanceof Carbon) {
            return $raw;
        }
        try {
            return Carbon::parse($raw);
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Submission dianggap sudah dinilai jika ada score atau feedback.
     * Gunakan getAttribute() agar aman dari PHP1416.
     */
    private function isSubmissionGraded(Submission $submission): bool
    {
        $score    = $submission->getAttribute('score');
        $feedback = $submission->getAttribute('feedback');

        return !is_null($score) || !is_null($feedback);
    }
}
