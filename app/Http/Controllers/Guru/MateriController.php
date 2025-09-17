<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\Material;
use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\Support\Facades\File; 
use Inertia\Inertia;

class MateriController extends Controller
{
    /**
     * Display materials for a specific section.
     */
    public function index(Section $section)
    {
        if (!Gate::allows('access-section', $section)) {
            abort(403, 'Unauthorized access to this section.');
        }
        
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
        
        if (!Gate::allows('access-section', $section)) {
            abort(403, 'Unauthorized access to this section.');
        }

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
        if (!Gate::allows('access-section', $section)) {
            abort(403, 'Unauthorized access to this section.');
        }

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
        if (!Gate::allows('access-section', $material->section)) {
            abort(403, 'Unauthorized access to this section.');
        }
        
        return Inertia::render('Guru/Materi/Show', [
            'material' => $material->load('section.subject'),
        ]);
    }

    /**
     * Show the form for editing the specified material.
     */
    public function edit(Material $material)
    {
        if (!Gate::allows('access-section', $material->section)) {
            abort(403, 'Unauthorized access to this section.');
        }
        
        return Inertia::render('Guru/Materi/Edit', [
            'material' => $material->load('section.subject'),
        ]);
    }

    /**
     * Update the specified material.
     */
    public function update(Request $request, Material $material)
    {
        if (!Gate::allows('access-section', $material->section)) {
            abort(403, 'Unauthorized access to this section.');
        }
        
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
        if (!Gate::allows('access-section', $material->section)) {
            abort(403, 'Unauthorized access to this section.');
        }
        
        $section = $material->section;
        
        if ($material->file_path) {
            Storage::disk('public')->delete($material->file_path);
        }
        
        $material->delete();

        return redirect()->route('guru.materi.index', $section)
            ->with('success', 'Materi berhasil dihapus.');
    }

    /**
     * Download the specified material file.
     */
    public function download(Material $material): BinaryFileResponse
{
    if (!Gate::allows('access-section', $material->section)) {
        abort(403, 'Unauthorized access to this section.');
    }

    if (!$material->file_path || !Storage::disk('public')->exists($material->file_path)) {
        abort(404, 'File not found.');
    }

    $fullPath = Storage::disk('public')->path($material->file_path);
    $filename = $material->judul.'.'.pathinfo($material->file_path, PATHINFO_EXTENSION);

    return response()->download($fullPath, $filename);
}

    /**
     * Preview the specified material file.
     */
    public function preview(Material $material): BinaryFileResponse   // ⬅️ optional: beri tipe
    {
        if (!Gate::allows('access-section', $material->section)) {
            abort(403, 'Unauthorized access to this section.');
        }

        if (!$material->file_path || !Storage::disk('public')->exists($material->file_path)) {
            abort(404, 'File not found.');
        }

        $fullPath  = Storage::disk('public')->path($material->file_path);
        $mimeType  = File::mimeType($fullPath) ?: 'application/octet-stream';  // ⬅️ ganti cara ambil MIME

        return response()->file($fullPath, [
            'Content-Type'        => $mimeType,
            'Content-Disposition' => 'inline',
        ]);
    }
}