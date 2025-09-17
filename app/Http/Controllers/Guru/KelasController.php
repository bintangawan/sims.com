<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\Section;
use App\Models\SectionStudent;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class KelasController extends Controller
{
    /**
     * Display a listing of sections taught by the authenticated teacher.
     */
    public function index()
    {
        $guru = Auth::user();
        
        $sections = Section::with(['subject', 'term', 'sectionStudents'])
            ->where('guru_id', $guru->id)
            ->get()
            ->map(function ($section) {
                return [
                    'id' => $section->id,
                    'subject' => $section->subject,
                    'term' => $section->term,
                    'kapasitas' => $section->kapasitas,
                    'jadwal_json' => $section->jadwal_json,
                    'student_count' => $section->sectionStudents->count(),
                    'created_at' => $section->created_at,
                ];
            });

        return Inertia::render('Guru/Kelas/Index', [
            'sections' => $sections,
        ]);
    }

    /**
     * Display the specified section.
     */
    public function show(Section $section)
    {
        $this->authorize('access-section', $section);
        
        $section->load(['subject', 'term', 'sectionStudents.user.siswaProfile']);
        
        return Inertia::render('Guru/Kelas/Show', [
            'section' => [
                'id' => $section->id,
                'subject' => $section->subject,
                'term' => $section->term,
                'kapasitas' => $section->kapasitas,
                'jadwal_json' => $section->jadwal_json,
                'students' => $section->sectionStudents->map(function ($sectionStudent) {
                    return [
                        'id' => $sectionStudent->user->id,
                        'name' => $sectionStudent->user->name,
                        'email' => $sectionStudent->user->email,
                        'nis' => $sectionStudent->user->siswaProfile->nis ?? null,
                        'angkatan' => $sectionStudent->user->siswaProfile->angkatan ?? null,
                        'kelas' => $sectionStudent->user->siswaProfile->kelas ?? null,
                    ];
                }),
                'created_at' => $section->created_at,
            ],
        ]);
    }

    /**
     * Get students list for a specific section.
     */
    public function students(Section $section)
    {
        $this->authorize('access-section', $section);
        
        $students = SectionStudent::with('user.siswaProfile')
            ->where('section_id', $section->id)
            ->get()
            ->map(function ($sectionStudent) {
                return [
                    'id' => $sectionStudent->user->id,
                    'name' => $sectionStudent->user->name,
                    'email' => $sectionStudent->user->email,
                    'nis' => $sectionStudent->user->siswaProfile->nis ?? null,
                    'angkatan' => $sectionStudent->user->siswaProfile->angkatan ?? null,
                    'kelas' => $sectionStudent->user->siswaProfile->kelas ?? null,
                    'joined_at' => $sectionStudent->created_at,
                ];
            });

        return response()->json([
            'students' => $students,
        ]);
    }

    /**
     * Export students list to CSV.
     */
    public function exportStudents(Section $section)
    {
        $this->authorize('access-section', $section);
        
        $section->load(['subject', 'sectionStudents.user.siswaProfile']);
        
        $filename = 'daftar_siswa_' . str_replace(' ', '_', $section->subject->nama) . '_' . date('Y-m-d') . '.csv';
        
        return new StreamedResponse(function () use ($section) {
            $handle = fopen('php://output', 'w');
            
            // Add BOM for UTF-8
            fwrite($handle, "\xEF\xBB\xBF");
            
            // CSV headers
            fputcsv($handle, [
                'No',
                'NIS',
                'Nama Lengkap',
                'Email',
                'Angkatan',
                'Kelas',
                'Tanggal Bergabung'
            ]);
            
            // CSV data
            foreach ($section->sectionStudents as $index => $sectionStudent) {
                fputcsv($handle, [
                    $index + 1,
                    $sectionStudent->user->siswaProfile->nis ?? '-',
                    $sectionStudent->user->name,
                    $sectionStudent->user->email,
                    $sectionStudent->user->siswaProfile->angkatan ?? '-',
                    $sectionStudent->user->siswaProfile->kelas ?? '-',
                    $sectionStudent->created_at->format('d/m/Y'),
                ]);
            }
            
            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Show form to add student to section.
     */
    public function create(Section $section)
    {
        $this->authorize('access-section', $section);
        
        // Get all students who are not already enrolled in this section
        $enrolledStudentIds = SectionStudent::where('section_id', $section->id)
            ->pluck('user_id')
            ->toArray();
            
        $availableStudents = User::whereHas('roles', function ($query) {
                $query->where('name', 'siswa');
            })
            ->with('siswaProfile')
            ->whereNotIn('id', $enrolledStudentIds)
            ->orderBy('name')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'nis' => $user->siswaProfile->nis ?? null,
                    'angkatan' => $user->siswaProfile->angkatan ?? null,
                    'kelas' => $user->siswaProfile->kelas ?? null,
                ];
            });
        
        $section->load(['subject', 'term']);
        
        return Inertia::render('Guru/Kelas/Create', [
            'section' => [
                'id' => $section->id,
                'subject' => $section->subject,
                'term' => $section->term,
                'kapasitas' => $section->kapasitas,
                'current_student_count' => SectionStudent::where('section_id', $section->id)->count(),
            ],
            'availableStudents' => $availableStudents,
        ]);
    }

    /**
     * Store student enrollment to section.
     */
    public function store(Request $request, Section $section)
    {
        $this->authorize('access-section', $section);
        
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);
        
        // Check if user has siswa role
        $user = User::findOrFail($validated['user_id']);
        if (!$user->hasRole('siswa')) {
            throw ValidationException::withMessages([
                'user_id' => 'User yang dipilih bukan siswa.'
            ]);
        }
        
        // Check if student is already enrolled
        $existingEnrollment = SectionStudent::where('section_id', $section->id)
            ->where('user_id', $validated['user_id'])
            ->first();
            
        if ($existingEnrollment) {
            throw ValidationException::withMessages([
                'user_id' => 'Siswa sudah terdaftar di kelas ini.'
            ]);
        }
        
        // Check section capacity
        $currentStudentCount = SectionStudent::where('section_id', $section->id)->count();
        if ($currentStudentCount >= $section->kapasitas) {
            throw ValidationException::withMessages([
                'user_id' => 'Kelas sudah mencapai kapasitas maksimum.'
            ]);
        }
        
        // Create enrollment
        SectionStudent::create([
            'section_id' => $section->id,
            'user_id' => $validated['user_id'],
        ]);
        
        return redirect()->route('guru.kelas.show', $section)
            ->with('success', 'Siswa berhasil didaftarkan ke kelas.');
    }
}