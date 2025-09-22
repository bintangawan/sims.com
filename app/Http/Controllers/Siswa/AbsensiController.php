<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AttendanceDetail;
use App\Models\Subject;
use App\Models\Section;
use App\Models\Term;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class AbsensiController extends Controller
{
    /**
     * Display student attendance overview
     */
    public function index(Request $request)
    {
        $siswa = Auth::user()->siswaProfile;

        if (!$siswa) {
            return redirect()->route('siswa.dashboard')
                ->with('error', 'Profile siswa tidak ditemukan.');
        }

        // Term aktif (fallback)
        $currentTerm = Term::where('aktif', true)->first();
        $termId = $request->get('term_id', $currentTerm?->id);

        // Semua section tempat siswa terdaftar
        $sectionIds = $siswa->sections()->pluck('sections.id');

        // Attendance detail untuk user ini
        $attendanceQuery = AttendanceDetail::where('user_id', $siswa->user_id)
            ->whereHas('attendance.section', function ($query) use ($sectionIds, $termId) {
                $query->whereIn('id', $sectionIds);
                if ($termId) {
                    $query->where('term_id', $termId);
                }
            })
            ->with(['attendance.section.subject', 'attendance.section.guru', 'attendance']);

        // Filter rentang tanggal (opsional)
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $attendanceQuery->whereHas('attendance', function ($query) use ($request) {
                $query->whereBetween('tanggal', [$request->start_date, $request->end_date]);
            });
        }

        $attendanceDetails = $attendanceQuery->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Semua attendance untuk statistik
        $allAttendance = AttendanceDetail::where('user_id', $siswa->user_id)
            ->whereHas('attendance.section', function ($query) use ($sectionIds, $termId) {
                $query->whereIn('id', $sectionIds);
                if ($termId) {
                    $query->where('term_id', $termId);
                }
            })
            ->with(['attendance.section.subject'])
            ->get();

        // Mapping status DB -> statistik
        $present = $allAttendance->where('status', 'hadir')->count();
        $absent  = $allAttendance->where('status', 'alpha')->count();
        // DB tidak punya 'late', jadi 0
        $late    = 0;
        // excused = izin + sakit
        $excused = $allAttendance->whereIn('status', ['izin', 'sakit'])->count();

        $statistics = [
            'total_sessions'        => $allAttendance->count(),
            'present'               => $present,
            'absent'                => $absent,
            'late'                  => $late,
            'excused'               => $excused,
            // persentase kehadiran: hadir / total
            'attendance_percentage' => $allAttendance->count() > 0
                ? round(($present) / $allAttendance->count() * 100, 2)
                : 0,
        ];

        // Rekap per mata pelajaran (pakai 'nama', bukan 'name')
        $attendanceBySubject = $allAttendance
            ->groupBy(function ($detail) {
                return optional($detail->attendance->section->subject)->nama ?? 'Tanpa Nama';
            })
            ->map(function ($subjectAttendance, $subjectName) {
                $total   = $subjectAttendance->count();
                $present = $subjectAttendance->where('status', 'hadir')->count();
                $absent  = $subjectAttendance->where('status', 'alpha')->count();
                $late    = 0; // tidak ada 'late' di DB
                $excused = $subjectAttendance->whereIn('status', ['izin', 'sakit'])->count();

                return [
                    'subject_name'   => $subjectName,
                    'total_sessions' => $total,
                    'present'        => $present,
                    'late'           => $late,
                    'absent'         => $absent,
                    'excused'        => $excused,
                    'percentage'     => $total > 0 ? round(($present) / $total * 100, 2) : 0,
                ];
            });

        // Daftar term (urutkan berdasarkan tahun terbaru)
        $terms = Term::orderBy('tahun', 'desc')->get();

        // Daftar subject untuk filter (pakai 'nama')
        $subjects = Section::whereIn('id', $sectionIds)
            ->with('subject')
            ->get()
            ->pluck('subject')
            ->unique('id')
            ->values();

        return Inertia::render('Siswa/Absensi/Index', [
            'attendanceDetails' => $attendanceDetails,
            'statistics'        => $statistics,
            'attendanceBySubject' => $attendanceBySubject,
            'terms'            => $terms,
            'currentTerm'      => $currentTerm,
            'selectedTermId'   => $termId,
            'subjects'         => $subjects,
            'filters'          => $request->only(['start_date', 'end_date', 'term_id']),
        ]);
    }

    /**
     * Display attendance summary (monthly & weekly)
     */
    public function summary(Request $request)
    {
        $siswa = Auth::user()->siswaProfile;

        if (!$siswa) {
            return redirect()->route('siswa.dashboard')
                ->with('error', 'Profile siswa tidak ditemukan.');
        }

        $currentTerm = Term::where('aktif', true)->first();
        $termId = $request->get('term_id', $currentTerm?->id);

        $sectionIds = $siswa->sections()->pluck('sections.id');

        // 6 bulan terakhir
        $monthlyAttendance = AttendanceDetail::where('user_id', $siswa->user_id)
            ->whereHas('attendance.section', function ($query) use ($sectionIds, $termId) {
                $query->whereIn('id', $sectionIds);
                if ($termId) {
                    $query->where('term_id', $termId);
                }
            })
            ->whereHas('attendance', function ($query) {
                $query->where('tanggal', '>=', Carbon::now()->subMonths(6));
            })
            ->with('attendance')
            ->get()
            ->groupBy(function ($item) {
                return Carbon::parse($item->attendance->tanggal)->format('Y-m');
            })
            ->map(function ($monthData, $month) {
                $total   = $monthData->count();
                $present = $monthData->where('status', 'hadir')->count();
                $absent  = $monthData->where('status', 'alpha')->count();
                $late    = 0; // tidak ada 'late' di DB
                $excused = $monthData->whereIn('status', ['izin', 'sakit'])->count();

                return [
                    'month'       => $month,
                    'month_name'  => Carbon::parse($month . '-01')->locale('id')->monthName,
                    'total'       => $total,
                    'present'     => $present,
                    'late'        => $late,
                    'absent'      => $absent,
                    'excused'     => $excused,
                    'percentage'  => $total > 0 ? round(($present) / $total * 100, 2) : 0,
                ];
            })
            ->sortKeys();

        // Mingguan untuk bulan berjalan
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth   = Carbon::now()->endOfMonth();

        $weeklyAttendance = AttendanceDetail::where('user_id', $siswa->user_id)
            ->whereHas('attendance.section', function ($query) use ($sectionIds, $termId) {
                $query->whereIn('id', $sectionIds);
                if ($termId) {
                    $query->where('term_id', $termId);
                }
            })
            ->whereHas('attendance', function ($query) use ($startOfMonth, $endOfMonth) {
                $query->whereBetween('tanggal', [$startOfMonth, $endOfMonth]);
            })
            ->with('attendance')
            ->get()
            ->groupBy(function ($item) {
                return Carbon::parse($item->attendance->tanggal)->weekOfYear;
            })
            ->map(function ($weekData, $week) {
                $total   = $weekData->count();
                $present = $weekData->where('status', 'hadir')->count();
                $absent  = $weekData->where('status', 'alpha')->count();
                $late    = 0;
                $excused = $weekData->whereIn('status', ['izin', 'sakit'])->count();

                return [
                    'week'       => $week,
                    'total'      => $total,
                    'present'    => $present,
                    'late'       => $late,
                    'absent'     => $absent,
                    'excused'    => $excused,
                    'percentage' => $total > 0 ? round(($present) / $total * 100, 2) : 0,
                ];
            });

        $terms = Term::orderBy('tahun', 'desc')->get();

        return Inertia::render('Siswa/Absensi/Summary', [
            'monthlyAttendance' => $monthlyAttendance,
            'weeklyAttendance'  => $weeklyAttendance,
            'terms'             => $terms,
            'currentTerm'       => $currentTerm,
            'selectedTermId'    => $termId,
        ]);
    }

    /**
     * Display attendance for specific subject
     */
    public function bySubject(Subject $subject, Request $request)
    {
        $siswa = Auth::user()->siswaProfile;

        if (!$siswa) {
            return redirect()->route('siswa.dashboard')
                ->with('error', 'Profile siswa tidak ditemukan.');
        }

        // Pastikan siswa punya section untuk subject ini
        $sectionIds = $siswa->sections()
            ->where('subject_id', $subject->id)
            ->pluck('sections.id');

        if ($sectionIds->isEmpty()) {
            abort(403, 'Anda tidak memiliki akses ke mata pelajaran ini.');
        }

        $currentTerm = Term::where('aktif', true)->first();
        $termId = $request->get('term_id', $currentTerm?->id);

        // Detail absensi subject ini
        $attendanceDetails = AttendanceDetail::where('user_id', $siswa->user_id)
            ->whereHas('attendance.section', function ($query) use ($sectionIds, $termId) {
                $query->whereIn('id', $sectionIds);
                if ($termId) {
                    $query->where('term_id', $termId);
                }
            })
            ->with(['attendance.section.guru', 'attendance'])
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Statistik subject ini
        $allAttendance = AttendanceDetail::where('user_id', $siswa->user_id)
            ->whereHas('attendance.section', function ($query) use ($sectionIds, $termId) {
                $query->whereIn('id', $sectionIds);
                if ($termId) {
                    $query->where('term_id', $termId);
                }
            })
            ->get();

        $statistics = [
            'total_sessions' => $allAttendance->count(),
            'present'        => $allAttendance->where('status', 'hadir')->count(),
            'absent'         => $allAttendance->where('status', 'alpha')->count(),
            'late'           => 0, // tidak ada di DB
            'excused'        => $allAttendance->whereIn('status', ['izin', 'sakit'])->count(),
        ];

        $statistics['attendance_percentage'] = $statistics['total_sessions'] > 0
            ? round(($statistics['present']) / $statistics['total_sessions'] * 100, 2)
            : 0;

        $terms = Term::orderBy('tahun', 'desc')->get();

        return Inertia::render('Siswa/Absensi/BySubject', [
            'subject'           => $subject,
            'attendanceDetails' => $attendanceDetails,
            'statistics'        => $statistics,
            'terms'             => $terms,
            'currentTerm'       => $currentTerm,
            'selectedTermId'    => $termId,
        ]);
    }
}
