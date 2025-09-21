<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class JadwalController extends Controller
{
    /**
     * Display the student's schedule (full weekly grouping)
     */
    public function index()
    {
        $siswa = Auth::user()->siswaProfile;

        if (!$siswa) {
            return redirect()->route('siswa.dashboard')
                ->with('error', 'Profile siswa tidak ditemukan.');
        }

        // Ambil semua sections di mana user terdaftar
        $sections = Section::whereHas('students', function ($query) use ($siswa) {
                $query->where('user_id', $siswa->user_id);
            })
            ->with(['subject', 'guru', 'term']) // guru langsung ke User
            ->get();

        // Pemetaan nama hari -> nomor hari 1..7
        $dayMapping = [
            'senin'  => 1,
            'selasa' => 2,
            'rabu'   => 3,
            'kamis'  => 4,
            'jumat'  => 5,
            'sabtu'  => 6,
            'minggu' => 7,
        ];

        // Siapkan struktur jadwal dengan key 1..7 agar konsisten dengan frontend
        $schedule = [
            1 => [], 2 => [], 3 => [], 4 => [], 5 => [], 6 => [], 7 => [],
        ];

        foreach ($sections as $section) {
            // jadwal_json sudah dicast ke array di model Section
            $jadwalArray = $section->jadwal_json ?? [];
            foreach ($jadwalArray as $jadwal) {
                $key = strtolower($jadwal['hari'] ?? '');
                $dayNumber = $dayMapping[$key] ?? null;
                if ($dayNumber) {
                    $schedule[$dayNumber][] = [
                        'section' => $section,
                        'jadwal'  => $jadwal,
                    ];
                }
            }
        }

        // Urutkan tiap hari berdasarkan jam_mulai
        foreach ($schedule as $dayNumber => &$items) {
            usort($items, function ($a, $b) {
                return strcmp($a['jadwal']['jam_mulai'], $b['jadwal']['jam_mulai']);
            });
        }
        unset($items);

        $dayNames = [
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            6 => 'Sabtu',
            7 => 'Minggu',
        ];

        return Inertia::render('Siswa/Jadwal/Index', [
            'schedule'    => $schedule,                                // key 1..7
            'dayNames'    => $dayNames,                                // key 1..7
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

        // Nama hari sekarang (id)
        $todayCarbon = Carbon::now();
        $todayName   = strtolower($todayCarbon->locale('id')->dayName); // 'senin', 'selasa', dst.

        $sections = Section::whereHas('students', function ($query) use ($siswa) {
                $query->where('user_id', $siswa->user_id);
            })
            ->with(['subject', 'guru', 'term'])
            ->get();

        $todaySchedule = [];
        foreach ($sections as $section) {
            $jadwalArray = $section->jadwal_json ?? [];
            foreach ($jadwalArray as $jadwal) {
                if (strtolower($jadwal['hari'] ?? '') === $todayName) {
                    $todaySchedule[] = [
                        'section' => $section,
                        'jadwal'  => $jadwal,
                    ];
                }
            }
        }

        // Sort by time
        usort($todaySchedule, function ($a, $b) {
            return strcmp($a['jadwal']['jam_mulai'], $b['jadwal']['jam_mulai']);
        });

        return Inertia::render('Siswa/Jadwal/Today', [
            'todaySchedule' => $todaySchedule,
            'currentDate'   => $todayCarbon->format('Y-m-d'),
            'dayName'       => ucfirst($todayCarbon->locale('id')->dayName),
        ]);
    }

    /**
     * Display weekly schedule (week view with dates)
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
        $endDate   = $startDate->copy()->endOfWeek();

        $sections = Section::whereHas('students', function ($query) use ($siswa) {
                $query->where('user_id', $siswa->user_id);
            })
            ->with(['subject', 'guru', 'term'])
            ->get();

        $dayMapping = [
            'senin'  => 1,
            'selasa' => 2,
            'rabu'   => 3,
            'kamis'  => 4,
            'jumat'  => 5,
            'sabtu'  => 6,
            'minggu' => 7,
        ];

        // Siapkan struktur minggu dengan key 1..7
        $weekSchedule = [];
        for ($i = 1; $i <= 7; $i++) {
            $date    = $startDate->copy()->addDays($i - 1);
            $dayName = strtolower($date->locale('id')->dayName);

            $daySections = [];
            foreach ($sections as $section) {
                $jadwalArray = $section->jadwal_json ?? [];
                foreach ($jadwalArray as $jadwal) {
                    if (strtolower($jadwal['hari'] ?? '') === $dayName) {
                        $daySections[] = [
                            'section' => $section,
                            'jadwal'  => $jadwal,
                        ];
                    }
                }
            }

            usort($daySections, function ($a, $b) {
                return strcmp($a['jadwal']['jam_mulai'], $b['jadwal']['jam_mulai']);
            });

            $weekSchedule[$i] = [
                'date'     => $date->format('Y-m-d'),
                'dayName'  => ucfirst($date->locale('id')->dayName),
                'sections' => $daySections,
            ];
        }

        return Inertia::render('Siswa/Jadwal/Week', [
            'weekSchedule' => $weekSchedule,                 // key 1..7
            'weekStart'    => $weekStart,
            'weekEnd'      => $endDate->format('Y-m-d'),
        ]);
    }
}
