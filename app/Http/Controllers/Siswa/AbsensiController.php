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
use Illuminate\Support\Facades\DB;
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

        // Get current term or filter by term
        $currentTerm = Term::where('is_active', true)->first();
        $termId = $request->get('term_id', $currentTerm?->id);

        // Get sections where student is enrolled
        $sectionIds = $siswa->sections()->pluck('sections.id');

        // Get attendance details for this student
        $attendanceQuery = AttendanceDetail::where('siswa_id', $siswa->id)
            ->whereHas('attendance.section', function ($query) use ($sectionIds, $termId) {
                $query->whereIn('id', $sectionIds);
                if ($termId) {
                    $query->where('term_id', $termId);
                }
            })
            ->with(['attendance.section.subject', 'attendance.section.guru.user']);

        // Filter by date range if provided
        if ($request->has('start_date') && $request->has('end_date')) {
            $attendanceQuery->whereHas('attendance', function ($query) use ($request) {
                $query->whereBetween('date', [$request->start_date, $request->end_date]);
            });
        }

        $attendanceDetails = $attendanceQuery->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Calculate attendance statistics
        $allAttendance = AttendanceDetail::where('siswa_id', $siswa->id)
            ->whereHas('attendance.section', function ($query) use ($sectionIds, $termId) {
                $query->whereIn('id', $sectionIds);
                if ($termId) {
                    $query->where('term_id', $termId);
                }
            })
            ->get();

        $statistics = [
            'total_sessions' => $allAttendance->count(),
            'present' => $allAttendance->where('status', 'present')->count(),
            'absent' => $allAttendance->where('status', 'absent')->count(),
            'late' => $allAttendance->where('status', 'late')->count(),
            'excused' => $allAttendance->where('status', 'excused')->count(),
        ];

        $statistics['attendance_percentage'] = $statistics['total_sessions'] > 0 
            ? round(($statistics['present'] + $statistics['late']) / $statistics['total_sessions'] * 100, 2)
            : 0;

        // Get attendance by subject
        $attendanceBySubject = $allAttendance->groupBy('attendance.section.subject.name')
            ->map(function ($subjectAttendance, $subjectName) {
                $total = $subjectAttendance->count();
                $present = $subjectAttendance->where('status', 'present')->count();
                $late = $subjectAttendance->where('status', 'late')->count();
                
                return [
                    'subject_name' => $subjectName,
                    'total_sessions' => $total,
                    'present' => $present,
                    'late' => $late,
                    'absent' => $subjectAttendance->where('status', 'absent')->count(),
                    'excused' => $subjectAttendance->where('status', 'excused')->count(),
                    'percentage' => $total > 0 ? round(($present + $late) / $total * 100, 2) : 0,
                ];
            });

        // Get available terms
        $terms = Term::orderBy('start_date', 'desc')->get();

        // Get subjects for filter
        $subjects = Section::whereIn('id', $sectionIds)
            ->with('subject')
            ->get()
            ->pluck('subject')
            ->unique('id')
            ->values();

        return Inertia::render('Siswa/Absensi/Index', [
            'attendanceDetails' => $attendanceDetails,
            'statistics' => $statistics,
            'attendanceBySubject' => $attendanceBySubject,
            'terms' => $terms,
            'currentTerm' => $currentTerm,
            'selectedTermId' => $termId,
            'subjects' => $subjects,
            'filters' => $request->only(['start_date', 'end_date', 'term_id']),
        ]);
    }

    /**
     * Display attendance summary
     */
    public function summary(Request $request)
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

        // Get monthly attendance summary
        $monthlyAttendance = AttendanceDetail::where('siswa_id', $siswa->id)
            ->whereHas('attendance.section', function ($query) use ($sectionIds, $termId) {
                $query->whereIn('id', $sectionIds);
                if ($termId) {
                    $query->where('term_id', $termId);
                }
            })
            ->whereHas('attendance', function ($query) {
                $query->where('date', '>=', Carbon::now()->subMonths(6));
            })
            ->with('attendance')
            ->get()
            ->groupBy(function ($item) {
                return Carbon::parse($item->attendance->date)->format('Y-m');
            })
            ->map(function ($monthData, $month) {
                $total = $monthData->count();
                $present = $monthData->where('status', 'present')->count();
                $late = $monthData->where('status', 'late')->count();
                
                return [
                    'month' => $month,
                    'month_name' => Carbon::parse($month . '-01')->locale('id')->monthName,
                    'total' => $total,
                    'present' => $present,
                    'late' => $late,
                    'absent' => $monthData->where('status', 'absent')->count(),
                    'excused' => $monthData->where('status', 'excused')->count(),
                    'percentage' => $total > 0 ? round(($present + $late) / $total * 100, 2) : 0,
                ];
            })
            ->sortKeys();

        // Get weekly attendance for current month
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();
        
        $weeklyAttendance = AttendanceDetail::where('siswa_id', $siswa->id)
            ->whereHas('attendance.section', function ($query) use ($sectionIds, $termId) {
                $query->whereIn('id', $sectionIds);
                if ($termId) {
                    $query->where('term_id', $termId);
                }
            })
            ->whereHas('attendance', function ($query) use ($startOfMonth, $endOfMonth) {
                $query->whereBetween('date', [$startOfMonth, $endOfMonth]);
            })
            ->with('attendance')
            ->get()
            ->groupBy(function ($item) {
                return Carbon::parse($item->attendance->date)->weekOfYear;
            })
            ->map(function ($weekData, $week) {
                $total = $weekData->count();
                $present = $weekData->where('status', 'present')->count();
                $late = $weekData->where('status', 'late')->count();
                
                return [
                    'week' => $week,
                    'total' => $total,
                    'present' => $present,
                    'late' => $late,
                    'absent' => $weekData->where('status', 'absent')->count(),
                    'percentage' => $total > 0 ? round(($present + $late) / $total * 100, 2) : 0,
                ];
            });

        // Get available terms
        $terms = Term::orderBy('start_date', 'desc')->get();

        return Inertia::render('Siswa/Absensi/Summary', [
            'monthlyAttendance' => $monthlyAttendance,
            'weeklyAttendance' => $weeklyAttendance,
            'terms' => $terms,
            'currentTerm' => $currentTerm,
            'selectedTermId' => $termId,
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

        // Get attendance details for this subject
        $attendanceDetails = AttendanceDetail::where('siswa_id', $siswa->id)
            ->whereHas('attendance.section', function ($query) use ($sectionIds, $termId) {
                $query->whereIn('id', $sectionIds);
                if ($termId) {
                    $query->where('term_id', $termId);
                }
            })
            ->with(['attendance.section.guru.user', 'attendance'])
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Calculate statistics for this subject
        $allAttendance = AttendanceDetail::where('siswa_id', $siswa->id)
            ->whereHas('attendance.section', function ($query) use ($sectionIds, $termId) {
                $query->whereIn('id', $sectionIds);
                if ($termId) {
                    $query->where('term_id', $termId);
                }
            })
            ->get();

        $statistics = [
            'total_sessions' => $allAttendance->count(),
            'present' => $allAttendance->where('status', 'present')->count(),
            'absent' => $allAttendance->where('status', 'absent')->count(),
            'late' => $allAttendance->where('status', 'late')->count(),
            'excused' => $allAttendance->where('status', 'excused')->count(),
        ];

        $statistics['attendance_percentage'] = $statistics['total_sessions'] > 0 
            ? round(($statistics['present'] + $statistics['late']) / $statistics['total_sessions'] * 100, 2)
            : 0;

        // Get available terms
        $terms = Term::orderBy('start_date', 'desc')->get();

        return Inertia::render('Siswa/Absensi/BySubject', [
            'subject' => $subject,
            'attendanceDetails' => $attendanceDetails,
            'statistics' => $statistics,
            'terms' => $terms,
            'currentTerm' => $currentTerm,
            'selectedTermId' => $termId,
        ]);
    }
}