<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Section;
use App\Models\Assignment;
use App\Models\Submission;
use App\Models\Attendance;
use App\Models\Announcement;
use App\Models\Term;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class GuruDashboardController extends Controller
{
    /**
     * Display the guru dashboard
     */
    public function index()
    {
        $user = Auth::user();
        $guru = $user->guruProfile;
        
        if (!$guru) {
            return redirect()->route('profile.edit')
                ->with('error', 'Silakan lengkapi profil guru Anda terlebih dahulu.');
        }

        $currentTerm = Term::where('aktif', true)->first();
        
        // Jika tidak ada term aktif, ambil term terbaru
        if (!$currentTerm) {
            $currentTerm = Term::orderBy('created_at', 'desc')->first();
        }
        
        // Today's teaching schedule - PERBAIKAN QUERY
        $today = Carbon::now()->dayOfWeek;
        if ($today == 0) $today = 7; // Sunday = 7
        
        $todaySchedule = Section::where('guru_id', $user->id)
            ->where('term_id', $currentTerm?->id ?? 0)
            ->whereJsonContains('jadwal_json->hari', $today)
            ->with(['subject', 'term'])
            ->orderByRaw("JSON_EXTRACT(jadwal_json, '$.jam_mulai')")
            ->get();

        // Assignments needing grading - PERBAIKAN QUERY
        $assignmentsToGrade = Assignment::whereHas('section', function($query) use ($user, $currentTerm) {
                $query->where('guru_id', $user->id)
                      ->where('term_id', $currentTerm?->id ?? 0);
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

        // Recent attendance sessions - PERBAIKAN QUERY
        $recentAttendance = Attendance::whereHas('section', function($query) use ($user, $currentTerm) {
                $query->where('guru_id', $user->id)
                      ->where('term_id', $currentTerm?->id ?? 0);
            })
            ->with(['section.subject'])
            ->orderBy('tanggal', 'desc')
            ->take(5)
            ->get();

        // Teaching sections summary - PERBAIKAN QUERY
        $sectionsCount = Section::where('guru_id', $user->id)
            ->where('term_id', $currentTerm?->id ?? 0)
            ->count();

        $totalStudents = Section::where('guru_id', $user->id)
            ->where('term_id', $currentTerm?->id ?? 0)
            ->withCount('students')
            ->get()
            ->sum('students_count');

        // Teaching statistics
        $teachingStats = [
            'total_sections' => $sectionsCount,
            'total_students' => $totalStudents,
            'total_assignments' => Assignment::whereHas('section', function($query) use ($user, $currentTerm) {
                $query->where('guru_id', $user->id)
                      ->where('term_id', $currentTerm?->id ?? 0);
            })->count(),
            'pending_grading' => Assignment::whereHas('section', function($query) use ($user, $currentTerm) {
                $query->where('guru_id', $user->id)
                      ->where('term_id', $currentTerm?->id ?? 0);
            })
            ->whereHas('submissions', function($query) {
                $query->whereNull('score');
            })->count(),
        ];

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

        // Recent submissions
        $recentSubmissions = Submission::whereHas('assignment.section', function($query) use ($user, $currentTerm) {
                $query->where('guru_id', $user->id)
                      ->where('term_id', $currentTerm?->id ?? 0);
            })
            ->with(['assignment.section.subject', 'user'])
            ->orderBy('submitted_at', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('Guru/Dashboard', [
            'guru' => $guru,
            'currentTerm' => $currentTerm,
            'todaySchedule' => $todaySchedule,
            'assignmentsToGrade' => $assignmentsToGrade,
            'recentAttendance' => $recentAttendance,
            'teachingStats' => $teachingStats,
            'announcements' => $announcements,
            'recentSubmissions' => $recentSubmissions,
        ]);
    }
}