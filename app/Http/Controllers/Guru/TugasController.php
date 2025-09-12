<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Section;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class TugasController extends Controller
{
    /**
     * Display assignments for a specific section.
     */
    public function index(Section $section)
    {
        $this->authorize('view', $section);
        
        $assignments = Assignment::where('section_id', $section->id)
            ->withCount('submissions')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($assignment) {
                return [
                    'id' => $assignment->id,
                    'judul' => $assignment->judul,
                    'deskripsi' => $assignment->deskripsi,
                    'tipe' => $assignment->tipe,
                    'deadline' => $assignment->deadline,
                    'published_at' => $assignment->published_at,
                    'submissions_count' => $assignment->submissions_count,
                    'is_published' => !is_null($assignment->published_at),
                    'is_overdue' => Carbon::parse($assignment->deadline)->isPast(),
                    'created_at' => $assignment->created_at,
                ];
            });

        return Inertia::render('Guru/Tugas/Index', [
            'section' => $section->load('subject'),
            'assignments' => $assignments,
        ]);
    }

    /**
     * Show the form for creating a new assignment.
     */
    public function create(Request $request)
    {
        $sectionId = $request->query('section_id');
        $section = Section::with('subject')->findOrFail($sectionId);
        
        $this->authorize('view', $section);

        return Inertia::render('Guru/Tugas/Create', [
            'section' => $section,
        ]);
    }

    /**
     * Store a newly created assignment.
     */
    public function store(Request $request)
    {
        $request->validate([
            'section_id' => 'required|exists:sections,id',
            'judul' => 'required|string|max:200',
            'deskripsi' => 'required|string',
            'tipe' => 'required|in:file,teks,link,campuran',
            'deadline' => 'required|date|after:now',
            'rubrik_json' => 'nullable|array',
            'publish_now' => 'boolean',
        ]);

        $section = Section::findOrFail($request->section_id);
        $this->authorize('view', $section);

        $assignment = Assignment::create([
            'section_id' => $request->section_id,
            'judul' => $request->judul,
            'deskripsi' => $request->deskripsi,
            'tipe' => $request->tipe,
            'deadline' => $request->deadline,
            'rubrik_json' => $request->rubrik_json,
            'published_at' => $request->publish_now ? now() : null,
        ]);

        return redirect()->route('guru.tugas.index', $section)
            ->with('success', 'Tugas berhasil dibuat.');
    }

    /**
     * Display the specified assignment.
     */
    public function show(Assignment $assignment)
    {
        $this->authorize('view', $assignment->section);
        
        $assignment->load(['section.subject', 'submissions.user.siswaProfile']);
        
        return Inertia::render('Guru/Tugas/Show', [
            'assignment' => [
                'id' => $assignment->id,
                'judul' => $assignment->judul,
                'deskripsi' => $assignment->deskripsi,
                'tipe' => $assignment->tipe,
                'deadline' => $assignment->deadline,
                'rubrik_json' => $assignment->rubrik_json,
                'published_at' => $assignment->published_at,
                'section' => $assignment->section,
                'submissions' => $assignment->submissions->map(function ($submission) {
                    return [
                        'id' => $submission->id,
                        'user' => [
                            'id' => $submission->user->id,
                            'name' => $submission->user->name,
                            'nis' => $submission->user->siswaProfile->nis ?? null,
                        ],
                        'submitted_at' => $submission->submitted_at,
                        'score' => $submission->score,
                        'feedback' => $submission->feedback,
                        'is_late' => Carbon::parse($submission->submitted_at)->isAfter($assignment->deadline),
                    ];
                }),
                'created_at' => $assignment->created_at,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified assignment.
     */
    public function edit(Assignment $assignment)
    {
        $this->authorize('view', $assignment->section);
        
        return Inertia::render('Guru/Tugas/Edit', [
            'assignment' => $assignment->load('section.subject'),
        ]);
    }

    /**
     * Update the specified assignment.
     */
    public function update(Request $request, Assignment $assignment)
    {
        $this->authorize('view', $assignment->section);
        
        $request->validate([
            'judul' => 'required|string|max:200',
            'deskripsi' => 'required|string',
            'tipe' => 'required|in:file,teks,link,campuran',
            'deadline' => 'required|date',
            'rubrik_json' => 'nullable|array',
        ]);

        $assignment->update([
            'judul' => $request->judul,
            'deskripsi' => $request->deskripsi,
            'tipe' => $request->tipe,
            'deadline' => $request->deadline,
            'rubrik_json' => $request->rubrik_json,
        ]);

        return redirect()->route('guru.tugas.show', $assignment)
            ->with('success', 'Tugas berhasil diperbarui.');
    }

    /**
     * Publish or unpublish the assignment.
     */
    public function publish(Assignment $assignment)
    {
        $this->authorize('view', $assignment->section);
        
        $assignment->update([
            'published_at' => $assignment->published_at ? null : now(),
        ]);

        $status = $assignment->published_at ? 'dipublikasikan' : 'disembunyikan';
        
        return redirect()->back()
            ->with('success', "Tugas berhasil {$status}.");
    }

    /**
     * Remove the specified assignment.
     */
    public function destroy(Assignment $assignment)
    {
        $this->authorize('view', $assignment->section);
        
        $section = $assignment->section;
        $assignment->delete();

        return redirect()->route('guru.tugas.index', $section)
            ->with('success', 'Tugas berhasil dihapus.');
    }
}