<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\Material;
use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MateriController extends Controller
{
    /**
     * Display materials for a specific section.
     */
    public function index(Section $section)
    {
        $this->authorize('view', $section);
        
        $materials = Material::where('section_id', $section->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($material) {
                return [
                    'id' => $material->id,
                    'judul' => $material->judul,
                    'deskripsi' => $material->deskripsi,
                    'file_path' => $material->file_path,
                    'link_url' => $material->link_url,
                    'created_at' => $material->created_at,
                    'updated_at' => $material->updated_at,
                ];
            });

        return Inertia::render('Guru/Materi/Index', [
            'section' => $section->load('subject'),
            'materials' => $materials,
        ]);
    }

    /**
     * Show the form for creating a new material.
     */
    public function create(Request $request)
    {
        $sectionId = $request->query('section_id');
        $section = Section::with('subject')->findOrFail($sectionId);
        
        $this->authorize('view', $section);

        return Inertia::render('Guru/Materi/Create', [
            'section' => $section,
        ]);
    }

    /**
     * Store a newly created material.
     */
    public function store(Request $request)
    {
        $request->validate([
            'section_id' => 'required|exists:sections,id',
            'judul' => 'required|string|max:200',
            'deskripsi' => 'nullable|string',
            'file' => 'nullable|file|max:10240', // 10MB max
            'link_url' => 'nullable|url|max:255',
        ]);

        $section = Section::findOrFail($request->section_id);
        $this->authorize('view', $section);

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('materials', 'public');
        }

        $material = Material::create([
            'section_id' => $request->section_id,
            'judul' => $request->judul,
            'deskripsi' => $request->deskripsi,
            'file_path' => $filePath,
            'link_url' => $request->link_url,
        ]);

        return redirect()->route('guru.materi.index', $section)
            ->with('success', 'Materi berhasil ditambahkan.');
    }

    /**
     * Display the specified material.
     */
    public function show(Material $material)
    {
        $this->authorize('view', $material->section);
        
        return Inertia::render('Guru/Materi/Show', [
            'material' => $material->load('section.subject'),
        ]);
    }

    /**
     * Show the form for editing the specified material.
     */
    public function edit(Material $material)
    {
        $this->authorize('view', $material->section);
        
        return Inertia::render('Guru/Materi/Edit', [
            'material' => $material->load('section.subject'),
        ]);
    }

    /**
     * Update the specified material.
     */
    public function update(Request $request, Material $material)
    {
        $this->authorize('view', $material->section);
        
        $request->validate([
            'judul' => 'required|string|max:200',
            'deskripsi' => 'nullable|string',
            'file' => 'nullable|file|max:10240',
            'link_url' => 'nullable|url|max:255',
            'remove_file' => 'boolean',
        ]);

        $filePath = $material->file_path;
        
        // Handle file removal
        if ($request->remove_file && $filePath) {
            Storage::disk('public')->delete($filePath);
            $filePath = null;
        }
        
        // Handle new file upload
        if ($request->hasFile('file')) {
            if ($filePath) {
                Storage::disk('public')->delete($filePath);
            }
            $filePath = $request->file('file')->store('materials', 'public');
        }

        $material->update([
            'judul' => $request->judul,
            'deskripsi' => $request->deskripsi,
            'file_path' => $filePath,
            'link_url' => $request->link_url,
        ]);

        return redirect()->route('guru.materi.index', $material->section)
            ->with('success', 'Materi berhasil diperbarui.');
    }

    /**
     * Remove the specified material.
     */
    public function destroy(Material $material)
    {
        $this->authorize('view', $material->section);
        
        $section = $material->section;
        
        if ($material->file_path) {
            Storage::disk('public')->delete($material->file_path);
        }
        
        $material->delete();

        return redirect()->route('guru.materi.index', $section)
            ->with('success', 'Materi berhasil dihapus.');
    }
}