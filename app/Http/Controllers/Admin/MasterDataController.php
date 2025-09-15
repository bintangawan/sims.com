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
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithValidation;
use Illuminate\Support\Collection;

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

    // Subject Import
    public function importSubjects(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:2048'
        ]);

        try {
            Excel::import(new SubjectImport, $request->file('file'));
            return back()->with('status', 'Data mata pelajaran berhasil diimport.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal mengimport data: ' . $e->getMessage()]);
        }
    }

    public function exportSubjectsTemplate()
    {
        $headers = ['kode', 'nama', 'deskripsi'];
        $data = [
            ['MTK001', 'Matematika', 'Mata pelajaran matematika dasar'],
            ['IPA001', 'IPA', 'Ilmu Pengetahuan Alam'],
        ];

        return Excel::download(new class($headers, $data) implements FromArray, WithHeadings {
            private $headers;
            private $data;

            public function __construct($headers, $data) {
                $this->headers = $headers;
                $this->data = $data;
            }

            public function array(): array {
                return $this->data;
            }

            public function headings(): array {
                return $this->headers;
            }
        }, 'template_subjects.xlsx');
    }

    // Section Import
    public function importSections(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:2048'
        ]);

        try {
            Excel::import(new SectionImport, $request->file('file'));
            return back()->with('status', 'Data kelas berhasil diimport.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal mengimport data: ' . $e->getMessage()]);
        }
    }

    public function exportSectionsTemplate()
    {
        $headers = ['subject_kode', 'guru_email', 'term_tahun', 'term_semester', 'kapasitas'];
        $data = [
            ['MTK001', 'guru1@sims.com', '2024/2025', 'ganjil', 30],
            ['IPA001', 'guru2@sims.com', '2024/2025', 'ganjil', 25],
        ];

        return Excel::download(new class($headers, $data) implements FromArray, WithHeadings {
            private $headers;
            private $data;

            public function __construct($headers, $data) {
                $this->headers = $headers;
                $this->data = $data;
            }

            public function array(): array {
                return $this->data;
            }

            public function headings(): array {
                return $this->headers;
            }
        }, 'template_sections.xlsx');
    }
}

// Import Classes
class SubjectImport implements ToModel, WithBatchInserts, WithChunkReading, WithValidation
{
    public function model(array $row)
    {
        return new Subject([
            'kode' => strtoupper($row[0]),
            'nama' => $row[1],
            'deskripsi' => $row[2] ?? null,
        ]);
    }

    public function batchSize(): int
    {
        return 100;
    }

    public function chunkSize(): int
    {
        return 100;
    }

    public function rules(): array
    {
        return [
            '0' => 'required|string|max:10|unique:subjects,kode',
            '1' => 'required|string|max:100',
            '2' => 'nullable|string|max:500',
        ];
    }
}

class SectionImport implements ToModel, WithBatchInserts, WithChunkReading, WithValidation
{
    public function model(array $row)
    {
        $subject = Subject::where('kode', strtoupper($row[0]))->first();
        $guru = User::where('email', $row[1])->first();
        $term = Term::where('tahun', $row[2])->where('semester', $row[3])->first();

        if (!$subject || !$guru || !$term) {
            throw new \Exception('Data referensi tidak ditemukan untuk baris: ' . implode(', ', $row));
        }

        return new Section([
            'subject_id' => $subject->id,
            'guru_id' => $guru->id,
            'term_id' => $term->id,
            'kapasitas' => $row[4] ?? 30,
            'jadwal_json' => [],
        ]);
    }

    public function batchSize(): int
    {
        return 50;
    }

    public function chunkSize(): int
    {
        return 50;
    }

    public function rules(): array
    {
        return [
            '0' => 'required|string|exists:subjects,kode',
            '1' => 'required|email|exists:users,email',
            '2' => 'required|string',
            '3' => 'required|in:ganjil,genap',
            '4' => 'nullable|integer|min:1|max:50',
        ];
    }
}