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
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Concerns\FromArray;

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

        return Inertia::render('Admin/Laporan/Index', [
            'stats' => $stats,
            'activeTerm' => $activeTerm,
        ]);
    }

    public function attendance(Request $request)
    {
        $termId = $request->term_id ?? Term::where('aktif', true)->first()?->id;
        $sectionId = $request->section_id;
        $startDate = $request->start_date;
        $endDate = $request->end_date;

        $query = AttendanceDetail::select(
                'attendance_details.status',
                DB::raw('COUNT(*) as count'),
                'users.name as student_name',
                'subjects.nama as subject_name'
            )
            ->join('attendances', 'attendance_details.attendance_id', '=', 'attendances.id')
            ->join('sections', 'attendances.section_id', '=', 'sections.id')
            ->join('subjects', 'sections.subject_id', '=', 'subjects.id')
            ->join('users', 'attendance_details.user_id', '=', 'users.id')
            ->where('sections.term_id', $termId);

        if ($sectionId) {
            $query->where('sections.id', $sectionId);
        }

        if ($startDate) {
            $query->where('attendances.tanggal', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('attendances.tanggal', '<=', $endDate);
        }

        $attendanceData = $query
            ->groupBy('attendance_details.status', 'users.name', 'subjects.nama')
            ->orderBy('users.name')
            ->paginate(15);

        $sections = Section::with('subject')
            ->where('term_id', $termId)
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
        $sectionId = $request->section_id;
        $minScore = $request->min_score;
        $maxScore = $request->max_score;

        $query = Grade::select(
                'users.name as student_name',
                'subjects.nama as subject_name',
                'grades.komponen as assignment_title',
                'grades.skor as score',
                'grades.created_at'
            )
            ->join('sections', 'grades.section_id', '=', 'sections.id')
            ->join('subjects', 'sections.subject_id', '=', 'subjects.id')
            ->join('users', 'grades.user_id', '=', 'users.id')
            ->where('sections.term_id', $termId);

        if ($sectionId) {
            $query->where('sections.id', $sectionId);
        }

        if ($minScore !== null) {
            $query->where('grades.skor', '>=', $minScore);
        }

        if ($maxScore !== null) {
            $query->where('grades.skor', '<=', $maxScore);
        }

        $gradesData = $query
            ->orderBy('grades.created_at', 'desc')
            ->paginate(15);

        $gradeStats = Grade::join('sections', 'grades.section_id', '=', 'sections.id')
            ->where('sections.term_id', $termId)
            ->selectRaw('AVG(grades.skor) as avg_score, MIN(grades.skor) as min_score, MAX(grades.skor) as max_score')
            ->first();

        $sections = Section::with('subject')
            ->where('term_id', $termId)
            ->get();
        
        $terms = Term::orderBy('tahun', 'desc')->get();

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
                DB::raw('COUNT(DISTINCT section_students.user_id) as total_students'),
                DB::raw('COUNT(DISTINCT subjects.id) as total_subjects')
            )
            ->leftJoin('sections', function($join) use ($termId) {
                $join->on('users.id', '=', 'sections.guru_id')
                    ->where('sections.term_id', $termId);
            })
            ->leftJoin('subjects', 'sections.subject_id', '=', 'subjects.id')
            ->leftJoin('section_students', 'sections.id', '=', 'section_students.section_id')
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderBy('total_sections', 'desc')
            ->paginate(10);

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
    $sectionId = $request->section_id; // ← ambil section_id

    $attendanceData = AttendanceDetail::select(
            'users.name',
            'subjects.nama as subject_name',
            'attendances.tanggal',
            'attendance_details.status',
            'attendance_details.note'
        )
        ->join('attendances', 'attendance_details.attendance_id', '=', 'attendances.id')
        ->join('sections', 'attendances.section_id', '=', 'sections.id')
        ->join('subjects', 'sections.subject_id', '=', 'subjects.id')
        ->join('users', 'attendance_details.user_id', '=', 'users.id')
        ->where('sections.term_id', $termId)
        ->when($sectionId, fn($q) => $q->where('sections.id', $sectionId)) // ← filter kelas
        ->whereBetween('attendances.tanggal', [$startDate, $endDate])
        ->orderBy('users.name')
        ->orderBy('attendances.tanggal')
        ->get();

        $data = [];
        $data[] = ['Nama Siswa', 'Mata Pelajaran', 'Tanggal', 'Status', 'Catatan'];

        foreach ($attendanceData as $row) {
            $data[] = [
                $row->name,
                $row->subject_name,
                $row->tanggal,
                ucfirst($row->status),
                $row->note ?? '-'
            ];
        }

        $filename = 'laporan_absensi_' . date('Y-m-d_H-i-s') . '.xlsx';
        
        return Excel::download(new class($data) implements FromArray {
            private $data;
            
            public function __construct($data) {
                $this->data = $data;
            }
            
            public function array(): array {
                return $this->data;
            }
        }, $filename);
    }

    // ⬇️ Export Grades (Excel) — sesuai permintaan + mendukung filter section/min/max score
    private function exportGrades($termId, Request $request)
    {
        $sectionId = $request->section_id;
        $minScore  = $request->min_score;
        $maxScore  = $request->max_score;

        $gradesData = Grade::select(
                'users.name',
                'subjects.nama as subject_name',
                'subjects.kode as subject_code',
                'sections.id as section_id',
                'guru.name as guru_name',
                'grades.komponen',
                'grades.skor',
                'grades.bobot',
                'grades.created_at'
            )
            ->join('sections', 'grades.section_id', '=', 'sections.id')
            ->join('subjects', 'sections.subject_id', '=', 'subjects.id')
            ->join('users', 'grades.user_id', '=', 'users.id')
            ->join('users as guru', 'sections.guru_id', '=', 'guru.id')
            ->where('sections.term_id', $termId)
            ->when($sectionId, function ($q) use ($sectionId) {
                $q->where('sections.id', $sectionId);
            })
            ->when($minScore !== null && $minScore !== '', function ($q) use ($minScore) {
                $q->where('grades.skor', '>=', $minScore);
            })
            ->when($maxScore !== null && $maxScore !== '', function ($q) use ($maxScore) {
                $q->where('grades.skor', '<=', $maxScore);
            })
            ->orderBy('subjects.nama')
            ->orderBy('users.name')
            ->get();

        $data   = [];
        $data[] = ['Nama Siswa', 'Mata Pelajaran', 'Kelas', 'Guru', 'Komponen', 'Skor', 'Bobot', 'Tanggal Input'];

        foreach ($gradesData as $row) {
            // Kelas: gabungan subject_code-section_id (misal: MAT-12)
            $sectionName = $row->subject_code . '-' . $row->section_id;

            $data[] = [
                $row->name,
                $row->subject_name,
                $sectionName,
                $row->guru_name,
                $row->komponen,
                $row->skor,
                $row->bobot,
                $row->created_at->format('Y-m-d H:i:s'),
            ];
        }

        $filename = 'laporan_nilai_' . date('Y-m-d_H-i-s') . '.xlsx';

        return Excel::download(new class($data) implements FromArray {
            private $data;
            public function __construct($data) { $this->data = $data; }
            public function array(): array { return $this->data; }
        }, $filename);
    }



    // ⬇️ Export Workload (Excel) — sudah pakai term_id dari export dialog
    private function exportWorkload($termId, Request $request)
    {
        $workloadData = Section::select(
                'users.name as guru_name',
                'subjects.nama as subject_name',
                'subjects.kode as subject_code',
                'sections.id as section_id',
                'sections.kapasitas',
                DB::raw('COUNT(DISTINCT section_students.user_id) as registered_students')
            )
            ->join('subjects', 'sections.subject_id', '=', 'subjects.id')
            ->join('users', 'sections.guru_id', '=', 'users.id')
            ->leftJoin('section_students', 'sections.id', '=', 'section_students.section_id')
            ->where('sections.term_id', $termId)
            ->groupBy('sections.id', 'users.name', 'subjects.nama', 'subjects.kode', 'sections.kapasitas')
            ->orderBy('users.name')
            ->orderBy('subjects.nama')
            ->get();

        $data   = [];
        $data[] = ['Nama Guru', 'Mata Pelajaran', 'Kode Mapel', 'Kelas', 'Kapasitas', 'Siswa Terdaftar'];

        foreach ($workloadData as $row) {
            // Buat nama kelas dari kombinasi subject_code dan section_id
            $sectionName = $row->subject_code . '-' . $row->section_id;
            
            $data[] = [
                $row->guru_name,
                $row->subject_name,
                $row->subject_code,
                $sectionName,
                $row->kapasitas ?? 0,
                $row->registered_students,
            ];
        }

        $filename = 'laporan_beban_kerja_' . date('Y-m-d_H-i-s') . '.xlsx';

        return Excel::download(new class($data) implements FromArray {
            private $data;
            public function __construct($data) { $this->data = $data; }
            public function array(): array { return $this->data; }
        }, $filename);
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