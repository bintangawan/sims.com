<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Term;
use App\Models\Section;
use App\Models\Assignment;
use App\Models\Submission;
use App\Models\Announcement;
use App\Models\Subject;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    /**
     * Display the admin dashboard
     */
    public function index()
    {
        $currentTerm = Term::where('aktif', true)->first();
        
        // User statistics
        $userStats = [
            'total_users' => User::count(),
            'siswa_count' => User::role('siswa')->count(),
            'guru_count' => User::role('guru')->count(),
            'admin_count' => User::role('admin')->count(),
        ];

        // Academic statistics for current term
        $academicStats = [
            'total_sections' => Section::where('term_id', $currentTerm?->id)->count(),
            'total_subjects' => Subject::count(),
            'total_assignments' => Assignment::whereHas('section', function($query) use ($currentTerm) {
                $query->where('term_id', $currentTerm?->id);
            })->count(),
            'pending_submissions' => Submission::whereHas('assignment.section', function($query) use ($currentTerm) {
                $query->where('term_id', $currentTerm?->id);
            })->whereNull('score')->count(),
            'total_announcements' => Announcement::count(),
        ];

        // Attendance statistics for current month
        $attendanceStats = [
            'present_today' => Attendance::whereDate('tanggal', today())
                ->where('status', 'hadir')
                ->count(),
            'absent_today' => Attendance::whereDate('tanggal', today())
                ->where('status', 'tidak_hadir')
                ->count(),
            'late_today' => Attendance::whereDate('tanggal', today())
                ->where('status', 'terlambat')
                ->count(),
        ];

        // Recent activities
        $recentUsers = User::orderBy('created_at', 'desc')
            ->with('roles')
            ->take(5)
            ->get();

        $recentAssignments = Assignment::whereHas('section', function($query) use ($currentTerm) {
                $query->where('term_id', $currentTerm?->id);
            })
            ->with(['section.subject', 'section.guru.user'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Overdue assignments
        $overdueAssignments = Assignment::whereHas('section', function($query) use ($currentTerm) {
                $query->where('term_id', $currentTerm?->id);
            })
            ->where('deadline', '<', now())
            ->whereHas('submissions', function($query) {
                $query->whereNull('score');
            })
            ->withCount(['submissions as ungraded_count' => function($query) {
                $query->whereNull('score');
            }])
            ->with(['section.subject', 'section.guru.user'])
            ->orderBy('deadline')
            ->take(5)
            ->get();

        // System announcements
        $announcements = Announcement::published()
            ->where(function($query) {
                $query->where('scope_type', 'global')
                      ->orWhere(function($q) {
                          $q->where('scope_type', 'role')
                            ->where('role_name', 'admin');
                      });
            })
            ->orderBy('published_at', 'desc')
            ->take(3)
            ->get();

        // Monthly statistics for charts
        $monthlyStats = [
            'assignments_created' => Assignment::whereHas('section', function($query) use ($currentTerm) {
                $query->where('term_id', $currentTerm?->id);
            })
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count(),
            
            'submissions_received' => Submission::whereHas('assignment.section', function($query) use ($currentTerm) {
                $query->where('term_id', $currentTerm?->id);
            })
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count(),
            
            'new_users' => User::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'currentTerm' => $currentTerm,
            'userStats' => $userStats,
            'academicStats' => $academicStats,
            'attendanceStats' => $attendanceStats,
            'recentUsers' => $recentUsers,
            'recentAssignments' => $recentAssignments,
            'overdueAssignments' => $overdueAssignments,
            'announcements' => $announcements,
            'monthlyStats' => $monthlyStats,
        ]);
    }
}