<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Assignment;
use App\Models\Attendance;
use App\Models\AttendanceDetail;
use App\Models\Section;
use App\Models\SectionStudent;
use App\Models\Submission;
use App\Models\Term;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class GuruDashboardController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $guru = $user->guruProfile;

        if (!$guru) {
            return redirect()->route('profile.edit')
                ->with('error', 'Silakan lengkapi profil guru Anda terlebih dahulu.');
        }

        $currentTerm = $this->getActiveTerm();

        return Inertia::render('Guru/Dashboard', [
            'guru' => $guru,
            'currentTerm' => $currentTerm,
            'teachingStats' => $this->getTeachingStats($user->id, $currentTerm?->id),
            'todaySchedule' => $this->getTodaySchedule($user->id, $currentTerm?->id),
            'assignmentsToGrade' => $this->getAssignmentsToGrade($user->id, $currentTerm?->id),
            'recentAttendance' => $this->getRecentAttendance($user->id, $currentTerm?->id),
            'recentSubmissions' => $this->getRecentSubmissions($user->id, $currentTerm?->id),
            'announcements' => $this->getAnnouncements(),
            'upcomingDeadlines' => $this->getUpcomingDeadlines($user->id, $currentTerm?->id),
            'classDetails' => $this->getClassDetails($user->id, $currentTerm?->id),
            'attendanceStats' => $this->getAttendanceStats($user->id, $currentTerm?->id),
        ]);
    }

    private function getActiveTerm(): ?Term
    {
        return Term::where('aktif', true)->first() 
            ?? Term::orderBy('created_at', 'desc')->first();
    }

    private function getTeachingStats(int $guruId, ?int $termId): array
    {
        $totalSections = Section::where('guru_id', $guruId)
            ->where('term_id', $termId ?? 0)
            ->count();

        $totalStudents = SectionStudent::whereHas('section', function ($query) use ($guruId, $termId) {
            $query->where('guru_id', $guruId)->where('term_id', $termId ?? 0);
        })->count();

        $totalAssignments = Assignment::whereHas('section', function ($query) use ($guruId, $termId) {
            $query->where('guru_id', $guruId)->where('term_id', $termId ?? 0);
        })->count();

        $pendingGrading = Submission::whereHas('assignment.section', function ($query) use ($guruId, $termId) {
            $query->where('guru_id', $guruId)->where('term_id', $termId ?? 0);
        })->whereNull('score')->count();

        $totalMaterials = Material::whereHas('section', function ($query) use ($guruId, $termId) {
            $query->where('guru_id', $guruId)->where('term_id', $termId ?? 0);
        })->count();

        return [
            'total_sections' => $totalSections,
            'total_students' => $totalStudents,
            'total_assignments' => $totalAssignments,
            'pending_grading' => $pendingGrading,
            'total_materials' => $totalMaterials,
        ];
    }

    private function getTodaySchedule(int $guruId, ?int $termId)
    {
        $today = Carbon::now();
        $dayNames = [
            0 => 'minggu', 1 => 'senin', 2 => 'selasa', 3 => 'rabu',
            4 => 'kamis', 5 => 'jumat', 6 => 'sabtu'
        ];
        $todayName = $dayNames[$today->dayOfWeek];

        $sections = Section::where('guru_id', $guruId)
            ->where('term_id', $termId ?? 0)
            ->with(['subject', 'term'])
            ->withCount('sectionStudents as student_count')
            ->get();

        return $sections->map(function ($section) use ($todayName) {
            $jadwalToday = collect($section->jadwal_json ?? [])
                ->filter(function ($jadwal) use ($todayName) {
                    return isset($jadwal['hari']) && 
                           strtolower($jadwal['hari']) === strtolower($todayName);
                })
                ->sortBy('jam_mulai')
                ->values();

            if ($jadwalToday->isNotEmpty()) {
                $section->jadwal_today = $jadwalToday->toArray();
                return $section;
            }
            return null;
        })->filter()->values();
    }

    private function getAssignmentsToGrade(int $guruId, ?int $termId)
    {
        return Assignment::whereHas('section', function ($query) use ($guruId, $termId) {
                $query->where('guru_id', $guruId)->where('term_id', $termId ?? 0);
            })
            ->whereHas('submissions', function ($query) {
                $query->whereNull('score');
            })
            ->withCount(['submissions as ungraded_count' => function ($query) {
                $query->whereNull('score');
            }])
            ->with(['section.subject'])
            ->orderBy('deadline')
            ->take(5)
            ->get();
    }

    private function getRecentAttendance(int $guruId, ?int $termId)
    {
        return Attendance::whereHas('section', function ($query) use ($guruId, $termId) {
                $query->where('guru_id', $guruId)->where('term_id', $termId ?? 0);
            })
            ->with(['section.subject'])
            ->withCount('attendanceDetails as students_count')
            ->orderBy('tanggal', 'desc')
            ->take(5)
            ->get();
    }

    private function getRecentSubmissions(int $guruId, ?int $termId)
    {
        return Submission::whereHas('assignment.section', function ($query) use ($guruId, $termId) {
                $query->where('guru_id', $guruId)->where('term_id', $termId ?? 0);
            })
            ->with(['assignment.section.subject', 'user'])
            ->orderBy('submitted_at', 'desc')
            ->take(5)
            ->get();
    }

    private function getAnnouncements()
    {
        return Announcement::where(function ($query) {
                $query->where('scope_type', 'global')
                    ->orWhere(function ($subQuery) {
                        $subQuery->where('scope_type', 'role')
                                ->where('role_name', 'guru');
                    });
            })
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->orderBy('published_at', 'desc')
            ->take(3)
            ->get();
    }

    private function getUpcomingDeadlines(int $guruId, ?int $termId)
    {
        return Assignment::whereHas('section', function ($query) use ($guruId, $termId) {
                $query->where('guru_id', $guruId)->where('term_id', $termId ?? 0);
            })
            ->where('deadline', '>=', now())
            ->where('deadline', '<=', now()->addDays(7))
            ->with(['section.subject'])
            ->orderBy('deadline')
            ->take(5)
            ->get();
    }

    private function getClassDetails(int $guruId, ?int $termId)
    {
        return Section::where('guru_id', $guruId)
            ->where('term_id', $termId ?? 0)
            ->with(['subject', 'term'])
            ->withCount([
                'sectionStudents as student_count',
                'assignments as assignment_count',
                'materials as material_count'
            ])
            ->get()
            ->map(function ($section) {
                // Calculate attendance rate for this section
                $totalAttendances = Attendance::where('section_id', $section->id)->count();
                $totalPossibleAttendances = $totalAttendances * $section->student_count;
                
                $presentCount = AttendanceDetail::whereHas('attendance', function ($query) use ($section) {
                    $query->where('section_id', $section->id);
                })->where('status', 'hadir')->count();

                $section->attendance_rate = $totalPossibleAttendances > 0 
                    ? round(($presentCount / $totalPossibleAttendances) * 100, 1)
                    : 0;

                return $section;
            });
    }

    private function getAttendanceStats(int $guruId, ?int $termId): array
    {
        $today = now()->format('Y-m-d');
        
        $todayAttendances = AttendanceDetail::whereHas('attendance', function ($query) use ($today, $guruId, $termId) {
            $query->whereDate('tanggal', $today)
                  ->whereHas('section', function ($subQuery) use ($guruId, $termId) {
                      $subQuery->where('guru_id', $guruId)->where('term_id', $termId ?? 0);
                  });
        });

        return [
            'present_today' => (clone $todayAttendances)->where('status', 'hadir')->count(),
            'absent_today' => (clone $todayAttendances)->where('status', 'alpha')->count(),
            'sick_today' => (clone $todayAttendances)->where('status', 'sakit')->count(),
            'permission_today' => (clone $todayAttendances)->where('status', 'izin')->count(),
        ];
    }
}
