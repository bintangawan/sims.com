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
        $this->authorize('view', $section);
        
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
        $this->authorize('view', $section);
        
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
        $this->authorize('view', $section);
        
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
}