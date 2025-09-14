<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Term;
use App\Models\Subject;
use App\Models\Section;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class MasterDataController extends Controller
{
    public function index()
    {
        $terms = Term::orderBy('tahun', 'desc')->get();
        $subjects = Subject::orderBy('nama')->get();
        $sections = Section::with(['subject', 'guru', 'term'])
            ->orderBy('id', 'desc')
            ->paginate(10);
        
        // Tambahkan data guru untuk dropdown
        $gurus = User::whereHas('roles', function($q) {
            $q->where('name', 'guru');
        })->with('guruProfile')->get()->map(function($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'nidn' => $user->guruProfile?->nidn,
                'mapel_keahlian' => $user->guruProfile?->mapel_keahlian
            ];
        });
    
        return Inertia::render('Admin/MasterData', [
            'terms' => $terms,
            'subjects' => $subjects,
            'sections' => $sections,
            'gurus' => $gurus,
        ]);
    }

    // Term Management
    public function storeTerm(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tahun' => 'required|string|regex:/^\d{4}\/\d{4}$/|unique:terms,tahun',
            'semester' => 'required|in:ganjil,genap',
            'aktif' => 'boolean',
        ], [
            'tahun.regex' => 'Format tahun harus YYYY/YYYY (contoh: 2024/2025)',
            'tahun.unique' => 'Tahun ajaran sudah ada.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check unique combination
        $exists = Term::where('tahun', $request->tahun)
            ->where('semester', $request->semester)
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'semester' => 'Kombinasi tahun dan semester sudah ada.'
            ])->withInput();
        }

        try {
            DB::transaction(function() use ($request) {
                // If this term is set as active, deactivate others
                if ($request->aktif) {
                    Term::where('aktif', true)->update(['aktif' => false]);
                }

                Term::create([
                    'tahun' => $request->tahun,
                    'semester' => $request->semester,
                    'aktif' => $request->aktif ?? false,
                ]);
            });

            return back()->with('status', 'Tahun ajaran berhasil ditambahkan.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal menambahkan tahun ajaran.']);
        }
    }

    public function updateTerm(Request $request, Term $term)
    {
        $validator = Validator::make($request->all(), [
            'tahun' => 'required|string|regex:/^\d{4}\/\d{4}$/|unique:terms,tahun,' . $term->id,
            'semester' => 'required|in:ganjil,genap',
            'aktif' => 'boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check unique combination (exclude current term)
        $exists = Term::where('tahun', $request->tahun)
            ->where('semester', $request->semester)
            ->where('id', '!=', $term->id)
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'semester' => 'Kombinasi tahun dan semester sudah ada.'
            ])->withInput();
        }

        try {
            DB::transaction(function() use ($request, $term) {
                // If this term is set as active, deactivate others
                if ($request->aktif) {
                    Term::where('id', '!=', $term->id)
                        ->where('aktif', true)
                        ->update(['aktif' => false]);
                }

                $term->update([
                    'tahun' => $request->tahun,
                    'semester' => $request->semester,
                    'aktif' => $request->aktif ?? false,
                ]);
            });

            return back()->with('status', 'Tahun ajaran berhasil diperbarui.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal memperbarui tahun ajaran.']);
        }
    }

    public function destroyTerm(Term $term)
    {
        try {
            // Check if term has sections
            if ($term->sections()->count() > 0) {
                return back()->withErrors([
                    'error' => 'Tidak dapat menghapus tahun ajaran yang sudah memiliki kelas.'
                ]);
            }

            $term->delete();
            return back()->with('status', 'Tahun ajaran berhasil dihapus.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal menghapus tahun ajaran.']);
        }
    }

    public function activateTerm(Term $term)
    {
        try {
            DB::transaction(function() use ($term) {
                // Deactivate all terms
                Term::where('aktif', true)->update(['aktif' => false]);
                
                // Activate selected term
                $term->update(['aktif' => true]);
            });

            return back()->with('status', 'Tahun ajaran berhasil diaktifkan.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal mengaktifkan tahun ajaran.']);
        }
    }

    // Subject Management
    public function storeSubject(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'kode' => 'required|string|max:10|unique:subjects,kode',
            'nama' => 'required|string|max:100',
            'deskripsi' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            Subject::create([
                'kode' => strtoupper($request->kode),
                'nama' => $request->nama,
                'deskripsi' => $request->deskripsi,
            ]);

            return back()->with('status', 'Mata pelajaran berhasil ditambahkan.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal menambahkan mata pelajaran.']);
        }
    }

    public function updateSubject(Request $request, Subject $subject)
    {
        $validator = Validator::make($request->all(), [
            'kode' => 'required|string|max:10|unique:subjects,kode,' . $subject->id,
            'nama' => 'required|string|max:100',
            'deskripsi' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $subject->update([
                'kode' => strtoupper($request->kode),
                'nama' => $request->nama,
                'deskripsi' => $request->deskripsi,
            ]);

            return back()->with('status', 'Mata pelajaran berhasil diperbarui.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal memperbarui mata pelajaran.']);
        }
    }

    public function destroySubject(Subject $subject)
    {
        try {
            // Check if subject has sections
            if ($subject->sections()->count() > 0) {
                return back()->withErrors([
                    'error' => 'Tidak dapat menghapus mata pelajaran yang sudah memiliki kelas.'
                ]);
            }

            $subject->delete();
            return back()->with('status', 'Mata pelajaran berhasil dihapus.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal menghapus mata pelajaran.']);
        }
    }

    // Section Management
    public function storeSection(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'subject_id' => 'required|exists:subjects,id',
            'guru_id' => 'required|exists:users,id',
            'term_id' => 'required|exists:terms,id',
            'kapasitas' => 'nullable|integer|min:1|max:50',
            'jadwal' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            Section::create([
                'subject_id' => $request->subject_id,
                'guru_id' => $request->guru_id,
                'term_id' => $request->term_id,
                'kapasitas' => $request->kapasitas,
                'jadwal_json' => $request->jadwal ?? [],
            ]);

            return back()->with('status', 'Kelas berhasil ditambahkan.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal menambahkan kelas.']);
        }
    }

    public function updateSection(Request $request, Section $section)
    {
        $validator = Validator::make($request->all(), [
            'subject_id' => 'required|exists:subjects,id',
            'guru_id' => 'required|exists:users,id',
            'term_id' => 'required|exists:terms,id',
            'kapasitas' => 'nullable|integer|min:1|max:50',
            'jadwal' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $section->update([
                'subject_id' => $request->subject_id,
                'guru_id' => $request->guru_id,
                'term_id' => $request->term_id,
                'kapasitas' => $request->kapasitas,
                'jadwal_json' => $request->jadwal ?? [],
            ]);

            return back()->with('status', 'Kelas berhasil diperbarui.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal memperbarui kelas.']);
        }
    }

    public function destroySection(Section $section)
    {
        try {
            // Check if section has students, materials, or assignments
            if ($section->students()->count() > 0) {
                return back()->withErrors([
                    'error' => 'Tidak dapat menghapus kelas yang sudah memiliki siswa.'
                ]);
            }

            if ($section->materials()->count() > 0 || $section->assignments()->count() > 0) {
                return back()->withErrors([
                    'error' => 'Tidak dapat menghapus kelas yang sudah memiliki materi atau tugas.'
                ]);
            }

            $section->delete();
            return back()->with('status', 'Kelas berhasil dihapus.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal menghapus kelas.']);
        }
    }
}