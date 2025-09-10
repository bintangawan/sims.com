<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Section;
use App\Models\Attendance;
use App\Models\AttendanceDetail;
use App\Models\Grade;
use App\Models\User;
use App\Models\Term;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LaporanController extends Controller
{
    public function index()
    {
        $activeTerm = Term::where('aktif', true)->first();
        
        // Summary statistics
        $stats = [
            'total_siswa' => User::role('siswa')->count(),
            'total_guru' => User::role('guru')->count(),
            'total_sections' => Section::where('term_id', $activeTerm?->id)->count(),
            'attendance_rate' => $this->getAttendanceRate($activeTerm?->id),
        ];

        return Inertia::render('Admin/Laporan', [
            'stats' => $stats,
            'activeTerm' => $activeTerm,
        ]);
    }

    public function attendance(Request $request)
    {
        $termId = $request->term_id ?? Term::where('aktif', true)->first()?->id;
        $startDate = $request->start_date ? Carbon::parse($request->start_date) : Carbon::now()->startOfMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : Carbon::now()->endOfMonth();

        $attendanceData = AttendanceDetail::select(
                'attendance_details.status',
                DB::raw('COUNT(*) as count'),
                'users.name as student_name',
                'subjects.nama as subject_name'
            )
            ->join('attendances', 'attendance_details.attendance_id', '=', 'attendances.id')
            ->join('sections', 'attendances.section_id', '=', 'sections.id')
            ->join('subjects', 'sections.subject_id', '=', 'subjects.id')
            ->join('users', 'attendance_details.user_id', '=', 'users.id')
            ->where('sections.term_id', $termId)
            ->whereBetween('attendances.tanggal', [$startDate, $endDate])
            ->when($request->section_id, function($q, $sectionId) {
                return $q->where('sections.id', $sectionId);
            })
            ->groupBy('attendance_details.user_id', 'sections.id', 'attendance_details.status')
            ->orderBy('users.name')
            ->get();

        $sections = Section::with('subject')
            ->where('term_id', $termId)
            ->orderBy('id')
            ->get();

        $terms = Term::orderBy('tahun', 'desc')->get();

        return Inertia::render('Admin/Laporan/Attendance', [
            'attendanceData' => $attendanceData,
            'sections' => $sections,
            'terms' => $terms,
            'filters' => $request->only(['term_id', 'section_id', 'start_date', 'end_date']),
        ]);
    }

    public function grades(Request $request)
    {
        $termId = $request->term_id ?? Term::where('aktif', true)->first()?->id;
        
        $gradesData = Grade::select(
                'users.name as student_name',
                'subjects.nama as subject_name',
                'assignments.judul as assignment_title',
                'grades.score',
                'grades.created_at'
            )
            ->join('assignments', 'grades.assignment_id', '=', 'assignments.id')
            ->join('sections', 'assignments.section_id', '=', 'sections.id')
            ->join('subjects', 'sections.subject_id', '=', 'subjects.id')
            ->join('users', 'grades.user_id', '=', 'users.id')
            ->where('sections.term_id', $termId)
            ->when($request->section_id, function($q, $sectionId) {
                return $q->where('sections.id', $sectionId);
            })
            ->when($request->min_score, function($q, $minScore) {
                return $q->where('grades.score', '>=', $minScore);
            })
            ->when($request->max_score, function($q, $maxScore) {
                return $q->where('grades.score', '<=', $maxScore);
            })
            ->orderBy('subjects.nama')
            ->orderBy('users.name')
            ->paginate(20);

        $sections = Section::with('subject')
            ->where('term_id', $termId)
            ->orderBy('id')
            ->get();

        $terms = Term::orderBy('tahun', 'desc')->get();

        // Grade statistics
        $gradeStats = Grade::join('assignments', 'grades.assignment_id', '=', 'assignments.id')
            ->join('sections', 'assignments.section_id', '=', 'sections.id')
            ->where('sections.term_id', $termId)
            ->selectRaw('AVG(score) as avg_score, MIN(score) as min_score, MAX(score) as max_score')
            ->first();

        return Inertia::render('Admin/Laporan/Grades', [
            'gradesData' => $gradesData,
            'gradeStats' => $gradeStats,
            'sections' => $sections,
            'terms' => $terms,
            'filters' => $request->only(['term_id', 'section_id', 'min_score', 'max_score']),
        ]);
    }

    public function workload(Request $request)
    {
        $termId = $request->term_id ?? Term::where('aktif', true)->first()?->id;
        
        $workloadData = User::role('guru')
            ->select(
                'users.id',
                'users.name',
                'users.email',
                DB::raw('COUNT(sections.id) as total_sections'),
                DB::raw('SUM(COALESCE(sections.kapasitas, 0)) as total_students'),
                DB::raw('COUNT(DISTINCT subjects.id) as total_subjects')
            )
            ->leftJoin('sections', function($join) use ($termId) {
                $join->on('users.id', '=', 'sections.guru_id')
                     ->where('sections.term_id', $termId);
            })
            ->leftJoin('subjects', 'sections.subject_id', '=', 'subjects.id')
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderBy('total_sections', 'desc')
            ->get();

        $terms = Term::orderBy('tahun', 'desc')->get();

        return Inertia::render('Admin/Laporan/Workload', [
            'workloadData' => $workloadData,
            'terms' => $terms,
            'filters' => $request->only(['term_id']),
        ]);
    }

    public function export(Request $request, $type)
    {
        $termId = $request->term_id ?? Term::where('aktif', true)->first()?->id;
        
        switch ($type) {
            case 'attendance':
                return $this->exportAttendance($termId, $request);
            case 'grades':
                return $this->exportGrades($termId, $request);
            case 'workload':
                return $this->exportWorkload($termId, $request);
            default:
                return back()->withErrors(['error' => 'Tipe laporan tidak valid.']);
        }
    }

    private function exportAttendance($termId, $request)
    {
        $startDate = $request->start_date ? Carbon::parse($request->start_date) : Carbon::now()->startOfMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : Carbon::now()->endOfMonth();

        $data = AttendanceDetail::select(
                'users.name as Nama_Siswa',
                'subjects.nama as Mata_Pelajaran',
                'attendances.tanggal as Tanggal',
                'attendance_details.status as Status',
                'attendance_details.note as Catatan'
            )
            ->join('attendances', 'attendance_details.attendance_id', '=', 'attendances.id')
            ->join('sections', 'attendances.section_id', '=', 'sections.id')
            ->join('subjects', 'sections.subject_id', '=', 'subjects.id')
            ->join('users', 'attendance_details.user_id', '=', 'users.id')
            ->where('sections.term_id', $termId)
            ->whereBetween('attendances.tanggal', [$startDate, $endDate])
            ->orderBy('users.name')
            ->orderBy('attendances.tanggal')
            ->get();

        $filename = 'laporan_absensi_' . date('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($data) {
            $file = fopen('php://output', 'w');
            
            // Add BOM for UTF-8
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            // Headers
            fputcsv($file, ['Nama Siswa', 'Mata Pelajaran', 'Tanggal', 'Status', 'Catatan']);
            
            foreach ($data as $row) {
                fputcsv($file, [
                    $row->Nama_Siswa,
                    $row->Mata_Pelajaran,
                    $row->Tanggal,
                    ucfirst($row->Status),
                    $row->Catatan ?? '-'
                ]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportGrades($termId, $request)
    {
        $data = Grade::select(
                'users.name as Nama_Siswa',
                'subjects.nama as Mata_Pelajaran',
                'assignments.judul as Tugas',
                'grades.score as Nilai',
                'grades.created_at as Tanggal_Input'
            )
            ->join('assignments', 'grades.assignment_id', '=', 'assignments.id')
            ->join('sections', 'assignments.section_id', '=', 'sections.id')
            ->join('subjects', 'sections.subject_id', '=', 'subjects.id')
            ->join('users', 'grades.user_id', '=', 'users.id')
            ->where('sections.term_id', $termId)
            ->orderBy('subjects.nama')
            ->orderBy('users.name')
            ->get();

        $filename = 'laporan_nilai_' . date('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($data) {
            $file = fopen('php://output', 'w');
            
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($file, ['Nama Siswa', 'Mata Pelajaran', 'Tugas', 'Nilai', 'Tanggal Input']);
            
            foreach ($data as $row) {
                fputcsv($file, [
                    $row->Nama_Siswa,
                    $row->Mata_Pelajaran,
                    $row->Tugas,
                    $row->Nilai,
                    $row->Tanggal_Input
                ]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportWorkload($termId, $request)
    {
        $data = User::role('guru')
            ->select(
                'users.name as Nama_Guru',
                'users.email as Email',
                DB::raw('COUNT(sections.id) as Total_Kelas'),
                DB::raw('SUM(COALESCE(sections.kapasitas, 0)) as Total_Siswa'),
                DB::raw('COUNT(DISTINCT subjects.id) as Total_Mapel')
            )
            ->leftJoin('sections', function($join) use ($termId) {
                $join->on('users.id', '=', 'sections.guru_id')
                     ->where('sections.term_id', $termId);
            })
            ->leftJoin('subjects', 'sections.subject_id', '=', 'subjects.id')
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderBy('users.name')
            ->get();

        $filename = 'laporan_beban_mengajar_' . date('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($data) {
            $file = fopen('php://output', 'w');
            
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($file, ['Nama Guru', 'Email', 'Total Kelas', 'Total Siswa', 'Total Mata Pelajaran']);
            
            foreach ($data as $row) {
                fputcsv($file, [
                    $row->Nama_Guru,
                    $row->Email,
                    $row->Total_Kelas,
                    $row->Total_Siswa,
                    $row->Total_Mapel
                ]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function getAttendanceRate($termId)
    {
        if (!$termId) return 0;

        $totalAttendance = AttendanceDetail::join('attendances', 'attendance_details.attendance_id', '=', 'attendances.id')
            ->join('sections', 'attendances.section_id', '=', 'sections.id')
            ->where('sections.term_id', $termId)
            ->count();

        if ($totalAttendance == 0) return 0;

        $presentAttendance = AttendanceDetail::join('attendances', 'attendance_details.attendance_id', '=', 'attendances.id')
            ->join('sections', 'attendances.section_id', '=', 'sections.id')
            ->where('sections.term_id', $termId)
            ->where('attendance_details.status', 'hadir')
            ->count();

        return round(($presentAttendance / $totalAttendance) * 100, 2);
    }
}