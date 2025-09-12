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
            ->with(['section.subject', 'section.guru.user']);

        // Filter by status
        if ($request->has('status')) {
            $status = $request->get('status');
            if ($status === 'pending') {
                $query->where('due_date', '>=', now())
                    ->whereDoesntHave('submissions', function ($q) use ($siswa) {
                        $q->where('siswa_id', $siswa->id);
                    });
            } elseif ($status === 'submitted') {
                $query->whereHas('submissions', function ($q) use ($siswa) {
                    $q->where('siswa_id', $siswa->id);
                });
            } elseif ($status === 'overdue') {
                $query->where('due_date', '<', now())
                    ->whereDoesntHave('submissions', function ($q) use ($siswa) {
                        $q->where('siswa_id', $siswa->id);
                    });
            }
        }

        // Filter by subject
        if ($request->has('subject_id')) {
            $query->whereHas('section', function ($q) use ($request) {
                $q->where('subject_id', $request->get('subject_id'));
            });
        }

        $assignments = $query->orderBy('due_date', 'asc')
            ->paginate(10)
            ->withQueryString();

        // Add submission status for each assignment
        $assignments->getCollection()->transform(function ($assignment) use ($siswa) {
            $submission = $assignment->submissions()->where('siswa_id', $siswa->id)->first();
            $assignment->submission_status = $submission ? 'submitted' : 
                ($assignment->due_date < now() ? 'overdue' : 'pending');
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
            'subjects' => $subjects,
            'filters' => $request->only(['status', 'subject_id']),
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

        $assignment->load(['section.subject', 'section.guru.user']);
        
        $submission = $assignment->submissions()
            ->where('siswa_id', $siswa->id)
            ->first();

        return Inertia::render('Siswa/Tugas/Show', [
            'assignment' => $assignment,
            'submission' => $submission,
            'canSubmit' => !$submission && $assignment->due_date >= now(),
            'isOverdue' => $assignment->due_date < now(),
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
            ->where('siswa_id', $siswa->id)
            ->first();

        if ($existingSubmission) {
            return redirect()->route('siswa.tugas.view-submission', $assignment)
                ->with('info', 'Anda sudah mengumpulkan tugas ini.');
        }

        $assignment->load(['section.subject', 'section.guru.user']);

        return Inertia::render('Siswa/Tugas/Submit', [
            'assignment' => $assignment,
            'isOverdue' => $assignment->due_date < now(),
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
            ->where('siswa_id', $siswa->id)
            ->first();

        if ($existingSubmission) {
            return redirect()->route('siswa.tugas.view-submission', $assignment)
                ->with('error', 'Anda sudah mengumpulkan tugas ini.');
        }

        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
            'file' => 'nullable|file|max:10240|mimes:pdf,doc,docx,txt,jpg,jpeg,png,zip,rar',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            $submissionData = [
                'assignment_id' => $assignment->id,
                'siswa_id' => $siswa->id,
                'content' => $request->content,
                'submitted_at' => now(),
                'status' => $assignment->due_date < now() ? 'late' : 'on_time',
            ];

            // Handle file upload
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('submissions', $fileName, 'public');
                $submissionData['file_path'] = $filePath;
                $submissionData['file_name'] = $file->getClientOriginalName();
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
            ->where('siswa_id', $siswa->id)
            ->first();

        if (!$submission) {
            return redirect()->route('siswa.tugas.submit', $assignment)
                ->with('info', 'Anda belum mengumpulkan tugas ini.');
        }

        $assignment->load(['section.subject', 'section.guru.user']);

        return Inertia::render('Siswa/Tugas/ViewSubmission', [
            'assignment' => $assignment,
            'submission' => $submission,
            'canEdit' => !$submission->grade && $assignment->due_date >= now(),
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
            ->where('siswa_id', $siswa->id)
            ->first();

        if (!$submission) {
            return redirect()->route('siswa.tugas.submit', $assignment)
                ->with('error', 'Submission tidak ditemukan.');
        }

        // Check if can edit (not graded and not overdue)
        if ($submission->grade || $assignment->due_date < now()) {
            return redirect()->route('siswa.tugas.view-submission', $assignment)
                ->with('error', 'Submission tidak dapat diubah.');
        }

        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
            'file' => 'nullable|file|max:10240|mimes:pdf,doc,docx,txt,jpg,jpeg,png,zip,rar',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            $updateData = [
                'content' => $request->content,
                'submitted_at' => now(),
            ];

            // Handle file upload
            if ($request->hasFile('file')) {
                // Delete old file if exists
                if ($submission->file_path) {
                    Storage::disk('public')->delete($submission->file_path);
                }

                $file = $request->file('file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('submissions', $fileName, 'public');
                $updateData['file_path'] = $filePath;
                $updateData['file_name'] = $file->getClientOriginalName();
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
}