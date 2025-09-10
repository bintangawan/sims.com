<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Section;
use App\Models\Subject;
use App\Models\User;
use App\Models\Term;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class JadwalController extends Controller
{
    public function index(Request $request)
    {
        $activeTerm = Term::where('aktif', true)->first();
        
        $query = Section::with(['subject', 'guru', 'term'])
            ->when($request->term_id, function($q, $termId) {
                return $q->where('term_id', $termId);
            }, function($q) use ($activeTerm) {
                return $q->where('term_id', $activeTerm?->id);
            })
            ->when($request->search, function($q, $search) {
                return $q->whereHas('subject', function($sq) use ($search) {
                    $sq->where('nama', 'like', "%{$search}%")
                      ->orWhere('kode', 'like', "%{$search}%");
                })->orWhereHas('guru', function($gq) use ($search) {
                    $gq->where('name', 'like', "%{$search}%");
                });
            });

        $sections = $query->paginate(15);
        
        $terms = Term::orderBy('tahun', 'desc')->get();
        $subjects = Subject::orderBy('nama')->get();
        $gurus = User::role('guru')->orderBy('name')->get();

        return Inertia::render('Admin/Jadwal', [
            'sections' => $sections,
            'terms' => $terms,
            'subjects' => $subjects,
            'gurus' => $gurus,
            'activeTerm' => $activeTerm,
            'filters' => $request->only(['search', 'term_id']),
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'subject_id' => 'required|exists:subjects,id',
            'guru_id' => 'required|exists:users,id',
            'term_id' => 'required|exists:terms,id',
            'kapasitas' => 'nullable|integer|min:1|max:50',
            'jadwal' => 'required|array|min:1',
            'jadwal.*.hari' => 'required|in:senin,selasa,rabu,kamis,jumat,sabtu',
            'jadwal.*.jam_mulai' => 'required|date_format:H:i',
            'jadwal.*.jam_selesai' => 'required|date_format:H:i|after:jadwal.*.jam_mulai',
            'jadwal.*.ruangan' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check for conflicts
        $conflicts = $this->checkScheduleConflicts(
            $request->guru_id,
            $request->term_id,
            $request->jadwal
        );

        if (!empty($conflicts)) {
            return back()->withErrors([
                'jadwal' => 'Terdapat bentrok jadwal: ' . implode(', ', $conflicts)
            ])->withInput();
        }

        try {
            Section::create([
                'subject_id' => $request->subject_id,
                'guru_id' => $request->guru_id,
                'term_id' => $request->term_id,
                'kapasitas' => $request->kapasitas,
                'jadwal_json' => $request->jadwal,
            ]);

            return back()->with('status', 'Jadwal berhasil ditambahkan.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal menambahkan jadwal.']);
        }
    }

    public function update(Request $request, Section $section)
    {
        $validator = Validator::make($request->all(), [
            'subject_id' => 'required|exists:subjects,id',
            'guru_id' => 'required|exists:users,id',
            'term_id' => 'required|exists:terms,id',
            'kapasitas' => 'nullable|integer|min:1|max:50',
            'jadwal' => 'required|array|min:1',
            'jadwal.*.hari' => 'required|in:senin,selasa,rabu,kamis,jumat,sabtu',
            'jadwal.*.jam_mulai' => 'required|date_format:H:i',
            'jadwal.*.jam_selesai' => 'required|date_format:H:i|after:jadwal.*.jam_mulai',
            'jadwal.*.ruangan' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check for conflicts (exclude current section)
        $conflicts = $this->checkScheduleConflicts(
            $request->guru_id,
            $request->term_id,
            $request->jadwal,
            $section->id
        );

        if (!empty($conflicts)) {
            return back()->withErrors([
                'jadwal' => 'Terdapat bentrok jadwal: ' . implode(', ', $conflicts)
            ])->withInput();
        }

        try {
            $section->update([
                'subject_id' => $request->subject_id,
                'guru_id' => $request->guru_id,
                'term_id' => $request->term_id,
                'kapasitas' => $request->kapasitas,
                'jadwal_json' => $request->jadwal,
            ]);

            return back()->with('status', 'Jadwal berhasil diperbarui.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal memperbarui jadwal.']);
        }
    }

    public function destroy(Section $section)
    {
        try {
            // Check if section has students or materials
            if ($section->students()->count() > 0) {
                return back()->withErrors(['error' => 'Tidak dapat menghapus section yang sudah memiliki siswa.']);
            }

            if ($section->materials()->count() > 0 || $section->assignments()->count() > 0) {
                return back()->withErrors(['error' => 'Tidak dapat menghapus section yang sudah memiliki materi atau tugas.']);
            }

            $section->delete();
            return back()->with('status', 'Jadwal berhasil dihapus.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal menghapus jadwal.']);
        }
    }

    public function checkConflicts(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'guru_id' => 'required|exists:users,id',
            'term_id' => 'required|exists:terms,id',
            'jadwal' => 'required|array',
            'exclude_section_id' => 'nullable|exists:sections,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $conflicts = $this->checkScheduleConflicts(
            $request->guru_id,
            $request->term_id,
            $request->jadwal,
            $request->exclude_section_id
        );

        return response()->json([
            'has_conflicts' => !empty($conflicts),
            'conflicts' => $conflicts,
        ]);
    }

    private function checkScheduleConflicts($guruId, $termId, $jadwal, $excludeSectionId = null)
    {
        $conflicts = [];
        
        $existingSections = Section::where('guru_id', $guruId)
            ->where('term_id', $termId)
            ->when($excludeSectionId, function($q, $excludeId) {
                return $q->where('id', '!=', $excludeId);
            })
            ->get();

        foreach ($jadwal as $newSchedule) {
            foreach ($existingSections as $section) {
                $existingSchedules = $section->jadwal_json ?? [];
                
                foreach ($existingSchedules as $existingSchedule) {
                    if ($this->isTimeConflict($newSchedule, $existingSchedule)) {
                        $conflicts[] = "{$newSchedule['hari']} {$newSchedule['jam_mulai']}-{$newSchedule['jam_selesai']} bentrok dengan {$section->subject->nama}";
                    }
                }
            }
        }

        return array_unique($conflicts);
    }

    private function isTimeConflict($schedule1, $schedule2)
    {
        if ($schedule1['hari'] !== $schedule2['hari']) {
            return false;
        }

        $start1 = strtotime($schedule1['jam_mulai']);
        $end1 = strtotime($schedule1['jam_selesai']);
        $start2 = strtotime($schedule2['jam_mulai']);
        $end2 = strtotime($schedule2['jam_selesai']);

        return ($start1 < $end2) && ($end1 > $start2);
    }
}