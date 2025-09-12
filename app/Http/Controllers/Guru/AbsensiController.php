<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AttendanceDetail;
use App\Models\Section;
use App\Models\SectionStudent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class AbsensiController extends Controller
{
    /**
     * Display attendance records for a specific section.
     */
    public function index(Section $section)
    {
        $this->authorize('view', $section);
        
        $attendances = Attendance::where('section_id', $section->id)
            ->withCount('attendanceDetails')
            ->orderBy('tanggal', 'desc')
            ->get()
            ->map(function ($attendance) {
                return [
                    'id' => $attendance->id,
                    'pertemuan_ke' => $attendance->pertemuan_ke,
                    'tanggal' => $attendance->tanggal,
                    'students_count' => $attendance->attendance_details_count,
                    'created_at' => $attendance->created_at,
                ];
            });

        return Inertia::render('Guru/Absensi/Index', [
            'section' => $section->load('subject'),
            'attendances' => $attendances,
        ]);
    }

    /**
     * Show the form for creating a new attendance record.
     */
    public function create(Section $section)
    {
        $this->authorize('view', $section);
        
        $students = SectionStudent::with('user.siswaProfile')
            ->where('section_id', $section->id)
            ->get()
            ->map(function ($sectionStudent) {
                return [
                    'id' => $sectionStudent->user->id,
                    'name' => $sectionStudent->user->name,
                    'nis' => $sectionStudent->user->siswaProfile->nis ?? null,
                ];
            });
        
        // Get next meeting number
        $lastAttendance = Attendance::where('section_id', $section->id)
            ->orderBy('pertemuan_ke', 'desc')
            ->first();
        
        $nextMeeting = $lastAttendance ? $lastAttendance->pertemuan_ke + 1 : 1;

        return Inertia::render('Guru/Absensi/Create', [
            'section' => $section->load('subject'),
            'students' => $students,
            'next_meeting' => $nextMeeting,
        ]);
    }

    /**
     * Store a newly created attendance record.
     */
    public function store(Request $request, Section $section)
    {
        $this->authorize('view', $section);
        
        $request->validate([
            'pertemuan_ke' => 'required|integer|min:1',
            'tanggal' => 'required|date|before_or_equal:today',
            'attendances' => 'required|array',
            'attendances.*.user_id' => 'required|exists:users,id',
            'attendances.*.status' => 'required|in:hadir,izin,sakit,alpha',
            'attendances.*.note' => 'nullable|string|max:255',
        ]);

        // Check if attendance for this meeting already exists
        $existingAttendance = Attendance::where('section_id', $section->id)
            ->where('pertemuan_ke', $request->pertemuan_ke)
            ->first();
        
        if ($existingAttendance) {
            return redirect()->back()
                ->withErrors(['pertemuan_ke' => 'Absensi untuk pertemuan ini sudah ada.']);
        }

        DB::transaction(function () use ($request, $section) {
            // Create attendance record
            $attendance = Attendance::create([
                'section_id' => $section->id,
                'pertemuan_ke' => $request->pertemuan_ke,
                'tanggal' => $request->tanggal,
            ]);

            // Create attendance details
            foreach ($request->attendances as $attendanceData) {
                AttendanceDetail::create([
                    'attendance_id' => $attendance->id,
                    'user_id' => $attendanceData['user_id'],
                    'status' => $attendanceData['status'],
                    'note' => $attendanceData['note'] ?? null,
                ]);
            }
        });

        return redirect()->route('guru.absensi.index', $section)
            ->with('success', 'Absensi berhasil disimpan.');
    }

    /**
     * Display the specified attendance record.
     */
    public function show(Attendance $attendance)
    {
        $this->authorize('view', $attendance->section);
        
        $attendance->load([
            'section.subject',
            'attendanceDetails.user.siswaProfile'
        ]);
        
        return Inertia::render('Guru/Absensi/Show', [
            'attendance' => [
                'id' => $attendance->id,
                'section' => $attendance->section,
                'pertemuan_ke' => $attendance->pertemuan_ke,
                'tanggal' => $attendance->tanggal,
                'details' => $attendance->attendanceDetails->map(function ($detail) {
                    return [
                        'id' => $detail->id,
                        'user' => [
                            'id' => $detail->user->id,
                            'name' => $detail->user->name,
                            'nis' => $detail->user->siswaProfile->nis ?? null,
                        ],
                        'status' => $detail->status,
                        'note' => $detail->note,
                    ];
                }),
                'created_at' => $attendance->created_at,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified attendance record.
     */
    public function edit(Attendance $attendance)
    {
        $this->authorize('view', $attendance->section);
        
        $attendance->load([
            'section.subject',
            'attendanceDetails.user.siswaProfile'
        ]);
        
        return Inertia::render('Guru/Absensi/Edit', [
            'attendance' => [
                'id' => $attendance->id,
                'section' => $attendance->section,
                'pertemuan_ke' => $attendance->pertemuan_ke,
                'tanggal' => $attendance->tanggal,
                'details' => $attendance->attendanceDetails->map(function ($detail) {
                    return [
                        'id' => $detail->id,
                        'user_id' => $detail->user_id,
                        'user' => [
                            'id' => $detail->user->id,
                            'name' => $detail->user->name,
                            'nis' => $detail->user->siswaProfile->nis ?? null,
                        ],
                        'status' => $detail->status,
                        'note' => $detail->note,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Update the specified attendance record.
     */
    public function update(Request $request, Attendance $attendance)
    {
        $this->authorize('view', $attendance->section);
        
        $request->validate([
            'tanggal' => 'required|date|before_or_equal:today',
            'attendances' => 'required|array',
            'attendances.*.detail_id' => 'required|exists:attendance_details,id',
            'attendances.*.status' => 'required|in:hadir,izin,sakit,alpha',
            'attendances.*.note' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($request, $attendance) {
            // Update attendance date
            $attendance->update([
                'tanggal' => $request->tanggal,
            ]);

            // Update attendance details
            foreach ($request->attendances as $attendanceData) {
                $detail = AttendanceDetail::findOrFail($attendanceData['detail_id']);
                
                // Verify detail belongs to this attendance
                if ($detail->attendance_id !== $attendance->id) {
                    continue;
                }
                
                $detail->update([
                    'status' => $attendanceData['status'],
                    'note' => $attendanceData['note'] ?? null,
                ]);
            }
        });

        return redirect()->route('guru.absensi.show', $attendance)
            ->with('success', 'Absensi berhasil diperbarui.');
    }

    /**
     * Display attendance summary for a section.
     */
    public function summary(Section $section)
    {
        $this->authorize('view', $section);
        
        $students = SectionStudent::with('user.siswaProfile')
            ->where('section_id', $section->id)
            ->get();
        
        $attendances = Attendance::where('section_id', $section->id)
            ->with('attendanceDetails')
            ->orderBy('tanggal', 'asc')
            ->get();
        
        $summary = $students->map(function ($sectionStudent) use ($attendances) {
            $studentAttendances = [];
            $statusCounts = ['hadir' => 0, 'izin' => 0, 'sakit' => 0, 'alpha' => 0];
            
            foreach ($attendances as $attendance) {
                $detail = $attendance->attendanceDetails
                    ->where('user_id', $sectionStudent->user_id)
                    ->first();
                
                $status = $detail ? $detail->status : 'alpha';
                $studentAttendances[] = [
                    'pertemuan_ke' => $attendance->pertemuan_ke,
                    'tanggal' => $attendance->tanggal,
                    'status' => $status,
                    'note' => $detail ? $detail->note : null,
                ];
                
                $statusCounts[$status]++;
            }
            
            $totalMeetings = $attendances->count();
            $attendancePercentage = $totalMeetings > 0 
                ? round(($statusCounts['hadir'] / $totalMeetings) * 100, 2) 
                : 0;
            
            return [
                'user' => [
                    'id' => $sectionStudent->user->id,
                    'name' => $sectionStudent->user->name,
                    'nis' => $sectionStudent->user->siswaProfile->nis ?? null,
                ],
                'attendances' => $studentAttendances,
                'summary' => $statusCounts,
                'attendance_percentage' => $attendancePercentage,
            ];
        });

        return Inertia::render('Guru/Absensi/Summary', [
            'section' => $section->load('subject'),
            'meetings' => $attendances->map(function ($attendance) {
                return [
                    'pertemuan_ke' => $attendance->pertemuan_ke,
                    'tanggal' => $attendance->tanggal,
                ];
            }),
            'summary' => $summary,
        ]);
    }
}