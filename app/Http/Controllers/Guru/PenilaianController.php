<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Section;
use App\Models\Submission;
use App\Models\Grade;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PenilaianController extends Controller
{
    /**
     * Display submissions for a specific assignment.
     */
    public function submissions(Assignment $assignment)
    {
        if (!Gate::allows('access-section', $assignment->section)) {
            abort(403, 'Unauthorized access to this section.');
        }
        
        $submissions = Submission::with('user.siswaProfile')
            ->where('assignment_id', $assignment->id)
            ->orderBy('submitted_at', 'desc')
            ->get()
            ->map(function ($submission) use ($assignment) {
                return [
                    'id' => $submission->id,
                    'user' => [
                        'id' => $submission->user->id,
                        'name' => $submission->user->name,
                        'nis' => $submission->user->siswaProfile->nis ?? null,
                    ],
                    'konten_teks' => $submission->konten_teks,
                    'file_path' => $submission->file_path,
                    'link_url' => $submission->link_url,
                    'submitted_at' => $submission->submitted_at,
                    'score' => $submission->score,
                    'feedback' => $submission->feedback,
                    'is_late' => $submission->submitted_at > $assignment->deadline,
                    'created_at' => $submission->created_at,
                ];
            });

        return Inertia::render('Guru/Penilaian/Submissions', [
            'assignment' => $assignment->load('section.subject'),
            'submissions' => $submissions,
        ]);
    }

    /**
     * Show the grading form for a specific submission.
     */
    public function show(Submission $submission)
    {
        if (!Gate::allows('access-section', $submission->assignment->section)) {
            abort(403, 'Unauthorized access to this section.');
        }
        
        $submission->load(['user.siswaProfile', 'assignment.section.subject']);
        
        return Inertia::render('Guru/Penilaian/Grade', [
            'submission' => [
                'id' => $submission->id,
                'user' => [
                    'id' => $submission->user->id,
                    'name' => $submission->user->name,
                    'nis' => $submission->user->siswaProfile->nis ?? null,
                ],
                'assignment' => $submission->assignment,
                'konten_teks' => $submission->konten_teks,
                'file_path' => $submission->file_path,
                'link_url' => $submission->link_url,
                'submitted_at' => $submission->submitted_at,
                'score' => $submission->score,
                'feedback' => $submission->feedback,
                'is_late' => $submission->submitted_at > $submission->assignment->deadline,
            ],
        ]);
    }

    /**
     * Update the grade and feedback for a submission.
     */
    public function update(Request $request, Submission $submission)
    {
        if (!Gate::allows('access-section', $submission->assignment->section)) {
            abort(403, 'Unauthorized access to this section.');
        }
        
        $request->validate([
            'score' => 'required|numeric|min:0|max:100',
            'feedback' => 'nullable|string',
        ]);

        $submission->update([
            'score' => $request->score,
            'feedback' => $request->feedback,
        ]);

        return redirect()->route('guru.penilaian.submissions', $submission->assignment)
            ->with('success', 'Penilaian berhasil disimpan.');
    }

    /**
     * Bulk grade multiple submissions.
     */
    public function bulkGrade(Request $request, Assignment $assignment)
    {
        if (!Gate::allows('access-section', $assignment->section)) {
            abort(403, 'Unauthorized access to this section.');
        }
        
        $request->validate([
            'grades' => 'required|array',
            'grades.*.submission_id' => 'required|exists:submissions,id',
            'grades.*.score' => 'required|numeric|min:0|max:100',
            'grades.*.feedback' => 'nullable|string',
        ]);

        foreach ($request->grades as $gradeData) {
            $submission = Submission::findOrFail($gradeData['submission_id']);
            
            // Verify submission belongs to this assignment
            if ($submission->assignment_id !== $assignment->id) {
                continue;
            }
            
            $submission->update([
                'score' => $gradeData['score'],
                'feedback' => $gradeData['feedback'] ?? null,
            ]);
        }

        return redirect()->route('guru.penilaian.submissions', $assignment)
            ->with('success', 'Penilaian massal berhasil disimpan.');
    }

    /**
     * Export grades for a section to CSV.
     */
    public function export(Section $section)
    {
        if (!Gate::allows('access-section', $section)) {
            abort(403, 'Unauthorized access to this section.');
        }
        
        $section->load([
            'subject',
            'sectionStudents.user.siswaProfile',
            'assignments.submissions'
        ]);
        
        $filename = 'nilai_' . str_replace(' ', '_', $section->subject->nama) . '_' . date('Y-m-d') . '.csv';
        
        return new StreamedResponse(function () use ($section) {
            $handle = fopen('php://output', 'w');
            
            // Add BOM for UTF-8
            fwrite($handle, "\xEF\xBB\xBF");
            
            // Prepare headers
            $headers = ['No', 'NIS', 'Nama Siswa'];
            foreach ($section->assignments as $assignment) {
                $headers[] = $assignment->judul;
            }
            $headers[] = 'Rata-rata';
            
            fputcsv($handle, $headers);
            
            // Prepare data
            foreach ($section->sectionStudents as $index => $sectionStudent) {
                $row = [
                    $index + 1,
                    $sectionStudent->user->siswaProfile->nis ?? '-',
                    $sectionStudent->user->name,
                ];
                
                $scores = [];
                foreach ($section->assignments as $assignment) {
                    $submission = $assignment->submissions->where('user_id', $sectionStudent->user_id)->first();
                    $score = $submission ? $submission->score : '-';
                    $row[] = $score;
                    
                    if (is_numeric($score)) {
                        $scores[] = $score;
                    }
                }
                
                // Calculate average
                $average = count($scores) > 0 ? round(array_sum($scores) / count($scores), 2) : '-';
                $row[] = $average;
                
                fputcsv($handle, $row);
            }
            
            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}