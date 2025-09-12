<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Section;
use App\Models\SectionStudent;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class JadwalController extends Controller
{
    /**
     * Display the student's schedule
     */
    public function index()
    {
        $siswa = Auth::user()->siswaProfile;
        
        if (!$siswa) {
            return redirect()->route('siswa.dashboard')
                ->with('error', 'Profile siswa tidak ditemukan.');
        }

        // Get all sections where student is enrolled
        $sections = Section::whereHas('students', function ($query) use ($siswa) {
            $query->where('siswa_id', $siswa->id);
        })
        ->with(['subject', 'guru.user', 'term'])
        ->orderBy('day_of_week')
        ->orderBy('start_time')
        ->get();

        // Group by day of week
        $schedule = $sections->groupBy('day_of_week')->map(function ($daySections) {
            return $daySections->sortBy('start_time');
        });

        $dayNames = [
            1 => 'Senin',
            2 => 'Selasa', 
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            6 => 'Sabtu',
            7 => 'Minggu'
        ];

        return Inertia::render('Siswa/Jadwal/Index', [
            'schedule' => $schedule,
            'dayNames' => $dayNames,
            'currentWeek' => Carbon::now()->startOfWeek()->format('Y-m-d'),
        ]);
    }

    /**
     * Display today's schedule
     */
    public function today()
    {
        $siswa = Auth::user()->siswaProfile;
        
        if (!$siswa) {
            return redirect()->route('siswa.dashboard')
                ->with('error', 'Profile siswa tidak ditemukan.');
        }

        $today = Carbon::now()->dayOfWeek;
        if ($today == 0) $today = 7; // Sunday = 7

        $todaySchedule = Section::whereHas('students', function ($query) use ($siswa) {
            $query->where('siswa_id', $siswa->id);
        })
        ->where('day_of_week', $today)
        ->with(['subject', 'guru.user', 'term'])
        ->orderBy('start_time')
        ->get();

        return Inertia::render('Siswa/Jadwal/Today', [
            'todaySchedule' => $todaySchedule,
            'currentDate' => Carbon::now()->format('Y-m-d'),
            'dayName' => Carbon::now()->locale('id')->dayName,
        ]);
    }

    /**
     * Display weekly schedule
     */
    public function week(Request $request)
    {
        $siswa = Auth::user()->siswaProfile;
        
        if (!$siswa) {
            return redirect()->route('siswa.dashboard')
                ->with('error', 'Profile siswa tidak ditemukan.');
        }

        $weekStart = $request->get('week', Carbon::now()->startOfWeek()->format('Y-m-d'));
        $startDate = Carbon::parse($weekStart);
        $endDate = $startDate->copy()->endOfWeek();

        $sections = Section::whereHas('students', function ($query) use ($siswa) {
            $query->where('siswa_id', $siswa->id);
        })
        ->with(['subject', 'guru.user', 'term'])
        ->orderBy('day_of_week')
        ->orderBy('start_time')
        ->get();

        // Create week view with dates
        $weekSchedule = [];
        for ($i = 1; $i <= 7; $i++) {
            $date = $startDate->copy()->addDays($i - 1);
            $weekSchedule[$i] = [
                'date' => $date->format('Y-m-d'),
                'dayName' => $date->locale('id')->dayName,
                'sections' => $sections->where('day_of_week', $i)->values()
            ];
        }

        return Inertia::render('Siswa/Jadwal/Week', [
            'weekSchedule' => $weekSchedule,
            'weekStart' => $weekStart,
            'weekEnd' => $endDate->format('Y-m-d'),
        ]);
    }
}