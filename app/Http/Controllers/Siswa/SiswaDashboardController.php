<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AttendanceDetail;
use App\Models\Grade;
use App\Models\Section;
use App\Models\Term;
use App\Models\Announcement;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SiswaDashboardController extends Controller
{
    public function index(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $siswa = $user->siswaProfile;
        
        if (!$siswa) {
            return redirect()->route('profile.edit')
                ->with('error', 'Silakan lengkapi profil siswa Anda terlebih dahulu.');
        }

        $currentTerm = Term::where('aktif', true)->first() ?? Term::latest()->first();
        $sectionIds = $siswa->sections()->pluck('id');

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

        // Academic performance summary
        $academicSummary = Grade::where('user_id', $user->id)
            ->whereHas('section', function($query) use ($sectionIds) {
                $query->whereIn('id', $sectionIds);
            })
            ->selectRaw('AVG(skor) as rata_rata, COUNT(*) as total_nilai')
            ->first();

        return Inertia::render('Siswa/Dashboard', [
            'siswa' => $siswa,
            'currentTerm' => $currentTerm,
            'todaySchedule' => $todaySchedule,
            'upcomingAssignments' => $upcomingAssignments,
            'recentGrades' => $recentGrades,
            'attendanceSummary' => $attendanceSummary,
            'announcements' => $announcements,
            'academicSummary' => $academicSummary,
        ]);
    }
}