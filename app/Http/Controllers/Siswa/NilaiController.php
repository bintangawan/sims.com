<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Subject;
use App\Models\Section;
use App\Models\Term;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\StudentGradesExport;

class NilaiController extends Controller
{
    /**
     * Display student grades overview
     */
    public function index(Request $request)
    {
        $siswa = Auth::user()->siswaProfile;
        
        if (!$siswa) {
            return redirect()->route('siswa.dashboard')
                ->with('error', 'Profile siswa tidak ditemukan.');
        }

        // Get current term or filter by term
        $currentTerm = Term::where('is_active', true)->first();
        $termId = $request->get('term_id', $currentTerm?->id);

        // Get sections where student is enrolled
        $sectionIds = $siswa->sections()->pluck('sections.id');

        // Get grades grouped by subject
        $grades = Grade::where('siswa_id', $siswa->id)
            ->whereHas('section', function ($query) use ($sectionIds, $termId) {
                $query->whereIn('id', $sectionIds);
                if ($termId) {
                    $query->where('term_id', $termId);
                }
            })
            ->with(['section.subject', 'section.guru.user', 'assignment'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Group grades by subject
        $gradesBySubject = $grades->groupBy('section.subject.name');

        // Calculate subject averages
        $subjectSummary = $gradesBySubject->map(function ($subjectGrades, $subjectName) {
            $totalGrades = $subjectGrades->count();
            $averageGrade = $subjectGrades->avg('grade');
            $latestGrade = $subjectGrades->first();
            
            return [
                'subject_name' => $subjectName,
                'total_grades' => $totalGrades,
                'average_grade' => round($averageGrade, 2),
                'latest_grade' => $latestGrade,
                'grades' => $subjectGrades->take(5), // Show latest 5 grades
            ];
        });

        // Calculate overall GPA
        $overallGPA = $grades->isNotEmpty() ? round($grades->avg('grade'), 2) : 0;

        // Get available terms
        $terms = Term::orderBy('start_date', 'desc')->get();

        // Get subjects for navigation
        $subjects = Section::whereIn('id', $sectionIds)
            ->with('subject')
            ->get()
            ->pluck('subject')
            ->unique('id')
            ->values();

        return Inertia::render('Siswa/Nilai/Index', [
            'subjectSummary' => $subjectSummary,
            'overallGPA' => $overallGPA,
            'totalGrades' => $grades->count(),
            'terms' => $terms,
            'currentTerm' => $currentTerm,
            'selectedTermId' => $termId,
            'subjects' => $subjects,
        ]);
    }

    /**
     * Display grades for specific subject
     */
    public function bySubject(Subject $subject, Request $request)
    {
        $siswa = Auth::user()->siswaProfile;
        
        if (!$siswa) {
            return redirect()->route('siswa.dashboard')
                ->with('error', 'Profile siswa tidak ditemukan.');
        }

        // Check if student is enrolled in any section of this subject
        $sectionIds = $siswa->sections()
            ->where('subject_id', $subject->id)
            ->pluck('sections.id');

        if ($sectionIds->isEmpty()) {
            abort(403, 'Anda tidak memiliki akses ke mata pelajaran ini.');
        }

        // Get current term or filter by term
        $currentTerm = Term::where('is_active', true)->first();
        $termId = $request->get('term_id', $currentTerm?->id);

        // Get grades for this subject
        $grades = Grade::where('siswa_id', $siswa->id)
            ->whereHas('section', function ($query) use ($sectionIds, $termId) {
                $query->whereIn('id', $sectionIds);
                if ($termId) {
                    $query->where('term_id', $termId);
                }
            })
            ->with(['section.guru.user', 'assignment'])
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Calculate statistics
        $allGrades = Grade::where('siswa_id', $siswa->id)
            ->whereHas('section', function ($query) use ($sectionIds, $termId) {
                $query->whereIn('id', $sectionIds);
                if ($termId) {
                    $query->where('term_id', $termId);
                }
            })
            ->get();

        $statistics = [
            'total_grades' => $allGrades->count(),
            'average_grade' => $allGrades->isNotEmpty() ? round($allGrades->avg('grade'), 2) : 0,
            'highest_grade' => $allGrades->isNotEmpty() ? $allGrades->max('grade') : 0,
            'lowest_grade' => $allGrades->isNotEmpty() ? $allGrades->min('grade') : 0,
        ];

        // Get available terms
        $terms = Term::orderBy('start_date', 'desc')->get();

        return Inertia::render('Siswa/Nilai/BySubject', [
            'subject' => $subject,
            'grades' => $grades,
            'statistics' => $statistics,
            'terms' => $terms,
            'currentTerm' => $currentTerm,
            'selectedTermId' => $termId,
        ]);
    }

    /**
     * Export grades to Excel
     */
    public function export(Request $request)
    {
        $siswa = Auth::user()->siswaProfile;
        
        if (!$siswa) {
            return redirect()->route('siswa.dashboard')
                ->with('error', 'Profile siswa tidak ditemukan.');
        }

        $termId = $request->get('term_id');
        $term = $termId ? Term::find($termId) : Term::where('is_active', true)->first();
        
        $fileName = 'nilai_' . $siswa->user->name . '_' . ($term ? $term->name : 'semua') . '_' . date('Y-m-d') . '.xlsx';
        
        return Excel::download(new StudentGradesExport($siswa->id, $termId), $fileName);
    }
}