<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Section;
use App\Models\Assignment;
use App\Models\Submission;
use App\Models\Attendance;
use App\Models\AttendanceDetail;
use App\Models\Grade;
use App\Models\Announcement;
use App\Models\Term;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display dashboard based on user role
     */
    public function index($role = null)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (request()->routeIs('admin.dashboard')) {
            abort_unless($user->hasRole('admin'), 403, 'Anda tidak memiliki akses ke dashboard ini.');
            return $this->adminDashboard($user);
        }

        if (!$role) {
            $preferredRole = collect(['admin','guru','siswa'])
                ->first(fn($r) => $user->hasRole($r))
                ?? ($user->roles->first()->name ?? 'siswa');

            return redirect()->route('role.dashboard', ['role' => $preferredRole]);
        }

        abort_unless($user->hasRole($role), 403, 'Anda tidak memiliki akses ke dashboard ini.');

        return match ($role) {
            'siswa' => $this->siswaDashboard($user),
            'guru'  => $this->guruDashboard($user),
            'admin' => $this->adminDashboard($user),
            default => $this->defaultDashboard($user),
        };
    }



    /**
     * Siswa Dashboard
     */
    private function siswaDashboard($user)
    {
        $siswa = $user->siswaProfile;
        
        if (!$siswa) {
            return redirect()->route('profile.edit')
                ->with('error', 'Silakan lengkapi profil siswa Anda terlebih dahulu.');
        }

        $currentTerm = Term::where('aktif', true)->first();
        $sectionIds = $siswa->sections()->pluck('sections.id');

        // Today's schedule
        $today = Carbon::now()->dayOfWeek;
        if ($today == 0) $today = 7; // Sunday = 7
        
        $todaySchedule = Section::whereIn('id', $sectionIds)
            ->whereJsonContains('jadwal_json->hari', $today)
            ->with(['subject', 'guru.user'])
            ->orderByRaw("JSON_EXTRACT(jadwal_json, '$.jam_mulai')")
            ->take(5)
            ->get();

        // Upcoming assignments
        $upcomingAssignments = Assignment::whereIn('section_id', $sectionIds)
            ->where('deadline', '>=', now())
            ->where('deadline', '<=', now()->addDays(7))
            ->whereDoesntHave('submissions', function($query) use ($siswa) {
                $query->where('user_id', $siswa->user_id);
            })
            ->with(['section.subject'])
            ->orderBy('deadline')
            ->take(5)
            ->get();

        // Recent grades
        $recentGrades = Grade::where('user_id', $user->id)
            ->whereHas('section', function($query) use ($sectionIds) {
                $query->whereIn('id', $sectionIds);
            })
            ->with(['section.subject'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Attendance summary for current month
        $attendanceSummary = AttendanceDetail::where('user_id', $user->id)
            ->whereHas('attendance.section', function($query) use ($sectionIds) {
                $query->whereIn('id', $sectionIds);
            })
            ->whereHas('attendance', function($query) {
                $query->where('tanggal', '>=', Carbon::now()->startOfMonth());
            })
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Recent announcements
        $announcements = Announcement::published()
            ->where(function($query) use ($sectionIds) {
                $query->where('scope_type', 'global')
                      ->orWhere(function($q) {
                          $q->where('scope_type', 'role')
                            ->where('role_name', 'siswa');
                      })
                      ->orWhere(function($q) use ($sectionIds) {
                          $q->where('scope_type', 'section')
                            ->whereIn('scope_id', $sectionIds);
                      });
            })
            ->orderBy('published_at', 'desc')
            ->take(3)
            ->get();

        return Inertia::render('Siswa/Dashboard', [
            'siswa' => $siswa,
            'currentTerm' => $currentTerm,
            'todaySchedule' => $todaySchedule,
            'upcomingAssignments' => $upcomingAssignments,
            'recentGrades' => $recentGrades,
            'attendanceSummary' => $attendanceSummary,
            'announcements' => $announcements,
        ]);
    }

    /**
     * Guru Dashboard
     */
    private function guruDashboard($user)
    {
        $guru = $user->guruProfile;
        
        if (!$guru) {
            return redirect()->route('profile.edit')
                ->with('error', 'Silakan lengkapi profil guru Anda terlebih dahulu.');
        }

        $currentTerm = Term::where('aktif', true)->first();
        
        // Today's teaching schedule
        $today = Carbon::now()->dayOfWeek;
        if ($today == 0) $today = 7; // Sunday = 7
        
        $todaySchedule = Section::where('guru_id', $user->id)
            ->where('term_id', $currentTerm?->id)
            ->whereJsonContains('jadwal_json->hari', $today)
            ->with(['subject', 'term'])
            ->orderByRaw("JSON_EXTRACT(jadwal_json, '$.jam_mulai')")
            ->get();

        // Assignments needing grading
        $assignmentsToGrade = Assignment::whereHas('section', function($query) use ($user, $currentTerm) {
                $query->where('guru_id', $user->id)
                      ->where('term_id', $currentTerm?->id);
            })
            ->whereHas('submissions', function($query) {
                $query->whereNull('score');
            })
            ->withCount(['submissions as ungraded_count' => function($query) {
                $query->whereNull('score');
            }])
            ->with(['section.subject'])
            ->orderBy('deadline')
            ->take(5)
            ->get();

        // Recent attendance sessions
        $recentAttendance = Attendance::whereHas('section', function($query) use ($user, $currentTerm) {
                $query->where('guru_id', $user->id)
                      ->where('term_id', $currentTerm?->id);
            })
            ->with(['section.subject'])
            ->orderBy('tanggal', 'desc')
            ->take(5)
            ->get();

        // Teaching sections summary
        $sectionsCount = Section::where('guru_id', $user->id)
            ->where('term_id', $currentTerm?->id)
            ->count();

        $totalStudents = Section::where('guru_id', $user->id)
            ->where('term_id', $currentTerm?->id)
            ->withCount('students')
            ->get()
            ->sum('students_count');

        // Recent announcements for guru
        $announcements = Announcement::published()
            ->where(function($query) {
                $query->where('scope_type', 'global')
                      ->orWhere(function($q) {
                          $q->where('scope_type', 'role')
                            ->where('role_name', 'guru');
                      });
            })
            ->orderBy('published_at', 'desc')
            ->take(3)
            ->get();

        return Inertia::render('Guru/Dashboard', [
            'guru' => $guru,
            'currentTerm' => $currentTerm,
            'todaySchedule' => $todaySchedule,
            'assignmentsToGrade' => $assignmentsToGrade,
            'recentAttendance' => $recentAttendance,
            'sectionsCount' => $sectionsCount,
            'totalStudents' => $totalStudents,
            'announcements' => $announcements,
        ]);
    }

    /**
     * Admin Dashboard
     */
    private function adminDashboard($user)
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
            'total_subjects' => \App\Models\Subject::count(), // Add missing total_subjects
            'total_assignments' => Assignment::whereHas('section', function($query) use ($currentTerm) {
                $query->where('term_id', $currentTerm?->id);
            })->count(),
            'pending_submissions' => Submission::whereHas('assignment.section', function($query) use ($currentTerm) {
                $query->where('term_id', $currentTerm?->id);
            })->whereNull('score')->count(),
            'total_announcements' => Announcement::count(),
        ];
    
        // Add attendance statistics for today
        $today = now()->format('Y-m-d');
        $attendanceStats = [
            'present_today' => AttendanceDetail::whereHas('attendance', function($query) use ($today) {
                $query->whereDate('tanggal', $today);
            })->where('status', 'hadir')->count(),
            'absent_today' => AttendanceDetail::whereHas('attendance', function($query) use ($today) {
                $query->whereDate('tanggal', $today);
            })->where('status', 'tidak_hadir')->count(),
            'late_today' => AttendanceDetail::whereHas('attendance', function($query) use ($today) {
                $query->whereDate('tanggal', $today);
            })->where('status', 'terlambat')->count(),
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

        return Inertia::render('Admin/Dashboard', [
            'currentTerm' => $currentTerm,
            'userStats' => $userStats,
            'academicStats' => $academicStats,
            'attendanceStats' => $attendanceStats, // Add missing attendanceStats
            'recentUsers' => $recentUsers,
            'recentAssignments' => $recentAssignments,
            'overdueAssignments' => $overdueAssignments,
            'announcements' => $announcements,
        ]);
    }

    /**
     * Default dashboard for users without specific roles
     */
    private function defaultDashboard($user)
    {
        return Inertia::render('Dashboard', [
            'user' => $user,
            'message' => 'Selamat datang! Silakan hubungi administrator untuk mengatur role Anda.',
        ]);
    }
}