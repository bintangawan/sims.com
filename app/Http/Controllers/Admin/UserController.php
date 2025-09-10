<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\SiswaProfile;
use App\Models\GuruProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;
use Maatwebsite\Excel\Facades\Excel;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['roles', 'siswaProfile', 'guruProfile'])
            ->when($request->search, function ($q, $search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($request->role, function ($q, $role) {
                $q->whereHas('roles', function ($roleQuery) use ($role) {
                    $roleQuery->where('name', $role);
                });
            })
            ->when($request->status !== null, function ($q) use ($request) {
                $q->where('email_verified_at', $request->status ? '!=' : '=', null);
            });

        $users = $query->paginate(15)->withQueryString();

        $roles = Role::all();

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $request->only(['search', 'role', 'status'])
        ]);
    }

    public function create()
    {
        $roles = Role::all();
        return Inertia::render('Admin/Users/Create', [
            'roles' => $roles
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|exists:roles,name',
            // Siswa fields
            'nis' => 'nullable|string|max:30|unique:siswa_profiles',
            'angkatan' => 'nullable|integer|min:2020|max:2030',
            'kelas' => 'nullable|string|max:50',
            'wali_kelas_id' => 'nullable|exists:users,id',
            // Guru fields
            'nidn' => 'nullable|string|max:30|unique:guru_profiles',
            'nuptk' => 'nullable|string|max:30|unique:guru_profiles',
            'mapel_keahlian' => 'nullable|string|max:100',
            'telepon' => 'nullable|string|max:30'
        ]);

        DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'email_verified_at' => now()
            ]);

            $user->assignRole($validated['role']);

            // Create profile based on role
            if ($validated['role'] === 'siswa') {
                SiswaProfile::create([
                    'user_id' => $user->id,
                    'nis' => $validated['nis'] ?? 'SIS' . str_pad($user->id, 6, '0', STR_PAD_LEFT),
                    'angkatan' => $validated['angkatan'] ?? date('Y'),
                    'kelas' => $validated['kelas'],
                    'wali_kelas_id' => $validated['wali_kelas_id']
                ]);
            } elseif ($validated['role'] === 'guru') {
                GuruProfile::create([
                    'user_id' => $user->id,
                    'nidn' => $validated['nidn'],
                    'nuptk' => $validated['nuptk'],
                    'mapel_keahlian' => $validated['mapel_keahlian'],
                    'telepon' => $validated['telepon']
                ]);
            }
        });

        return redirect()->route('admin.users.index')
            ->with('success', 'User berhasil dibuat.');
    }

    public function show(User $user)
    {
        $user->load(['roles', 'siswaProfile', 'guruProfile']);
        
        return Inertia::render('Admin/Users/Show', [
            'user' => $user
        ]);
    }

    public function edit(User $user)
    {
        $user->load(['roles', 'siswaProfile', 'guruProfile']);
        $roles = Role::all();
        
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
            'roles' => $roles
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'required|exists:roles,name',
            // Siswa fields
            'nis' => ['nullable', 'string', 'max:30', Rule::unique('siswa_profiles')->ignore($user->siswaProfile?->id)],
            'angkatan' => 'nullable|integer|min:2020|max:2030',
            'kelas' => 'nullable|string|max:50',
            'wali_kelas_id' => 'nullable|exists:users,id',
            // Guru fields
            'nidn' => ['nullable', 'string', 'max:30', Rule::unique('guru_profiles')->ignore($user->guruProfile?->id)],
            'nuptk' => ['nullable', 'string', 'max:30', Rule::unique('guru_profiles')->ignore($user->guruProfile?->id)],
            'mapel_keahlian' => 'nullable|string|max:100',
            'telepon' => 'nullable|string|max:30'
        ]);

        DB::transaction(function () use ($validated, $user) {
            $user->update([
                'name' => $validated['name'],
                'email' => $validated['email']
            ]);

            if (!empty($validated['password'])) {
                $user->update(['password' => Hash::make($validated['password'])]);
            }

            // Update role
            $user->syncRoles([$validated['role']]);

            // Update or create profile based on role
            if ($validated['role'] === 'siswa') {
                $user->siswaProfile()->updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'nis' => $validated['nis'] ?? 'SIS' . str_pad($user->id, 6, '0', STR_PAD_LEFT),
                        'angkatan' => $validated['angkatan'] ?? date('Y'),
                        'kelas' => $validated['kelas'],
                        'wali_kelas_id' => $validated['wali_kelas_id']
                    ]
                );
                // Remove guru profile if exists
                $user->guruProfile()?->delete();
            } elseif ($validated['role'] === 'guru') {
                $user->guruProfile()->updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'nidn' => $validated['nidn'],
                        'nuptk' => $validated['nuptk'],
                        'mapel_keahlian' => $validated['mapel_keahlian'],
                        'telepon' => $validated['telepon']
                    ]
                );
                // Remove siswa profile if exists
                $user->siswaProfile()?->delete();
            } else {
                // Admin role - remove both profiles
                $user->siswaProfile()?->delete();
                $user->guruProfile()?->delete();
            }
        });

        return redirect()->route('admin.users.index')
            ->with('success', 'User berhasil diupdate.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Tidak dapat menghapus akun sendiri.');
        }

        DB::transaction(function () use ($user) {
            $user->siswaProfile()?->delete();
            $user->guruProfile()?->delete();
            $user->delete();
        });

        return redirect()->route('admin.users.index')
            ->with('success', 'User berhasil dihapus.');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls|max:2048'
        ]);

        try {
            $file = $request->file('file');
            $data = Excel::toArray([], $file)[0];
            
            // Skip header row
            array_shift($data);
            
            $imported = 0;
            $errors = [];

            DB::transaction(function () use ($data, &$imported, &$errors) {
                foreach ($data as $index => $row) {
                    try {
                        if (empty($row[0]) || empty($row[1]) || empty($row[2])) {
                            continue; // Skip empty rows
                        }

                        // Check if email already exists
                        if (User::where('email', $row[1])->exists()) {
                            $errors[] = "Baris " . ($index + 2) . ": Email {$row[1]} sudah terdaftar.";
                            continue;
                        }

                        $user = User::create([
                            'name' => $row[0],
                            'email' => $row[1],
                            'password' => Hash::make($row[2] ?? 'password123'),
                            'email_verified_at' => now()
                        ]);

                        $role = $row[3] ?? 'siswa';
                        $user->assignRole($role);

                        if ($role === 'siswa') {
                            // Check if NIS already exists
                            if (!empty($row[4]) && SiswaProfile::where('nis', $row[4])->exists()) {
                                $errors[] = "Baris " . ($index + 2) . ": NIS {$row[4]} sudah terdaftar.";
                                $user->delete();
                                continue;
                            }

                            SiswaProfile::create([
                                'user_id' => $user->id,
                                'nis' => $row[4] ?? 'SIS' . str_pad($user->id, 6, '0', STR_PAD_LEFT),
                                'angkatan' => $row[5] ?? date('Y'),
                                'kelas' => $row[6] ?? null
                            ]);
                        } elseif ($role === 'guru') {
                            // Check if NIDN already exists
                            if (!empty($row[4]) && GuruProfile::where('nidn', $row[4])->exists()) {
                                $errors[] = "Baris " . ($index + 2) . ": NIDN {$row[4]} sudah terdaftar.";
                                $user->delete();
                                continue;
                            }

                            // Check if NUPTK already exists
                            if (!empty($row[5]) && GuruProfile::where('nuptk', $row[5])->exists()) {
                                $errors[] = "Baris " . ($index + 2) . ": NUPTK {$row[5]} sudah terdaftar.";
                                $user->delete();
                                continue;
                            }

                            GuruProfile::create([
                                'user_id' => $user->id,
                                'nidn' => $row[4] ?? null,
                                'nuptk' => $row[5] ?? null,
                                'mapel_keahlian' => $row[6] ?? null,
                                'telepon' => $row[7] ?? null
                            ]);
                        }

                        $imported++;
                    } catch (\Exception $e) {
                        $errors[] = "Baris " . ($index + 2) . ": " . $e->getMessage();
                    }
                }
            });

            $message = "Berhasil import {$imported} user.";
            if (!empty($errors)) {
                $message .= " Dengan " . count($errors) . " error.";
            }

            return back()->with('success', $message)->with('import_errors', $errors);
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal import: ' . $e->getMessage());
        }
    }

    public function export(Request $request)
    {
        $users = User::with(['roles', 'siswaProfile', 'guruProfile'])
            ->when($request->role, function ($q, $role) {
                $q->whereHas('roles', function ($roleQuery) use ($role) {
                    $roleQuery->where('name', $role);
                });
            })
            ->get();

        $data = [];
        $data[] = ['Name', 'Email', 'Role', 'NIS/NIDN', 'Angkatan/NUPTK', 'Kelas/Mapel', 'Telepon', 'Status'];

        foreach ($users as $user) {
            $role = $user->roles->first()?->name ?? 'N/A';
            $identifier = '';
            $secondary = '';
            $tertiary = '';
            $phone = '';

            if ($role === 'siswa' && $user->siswaProfile) {
                $identifier = $user->siswaProfile->nis;
                $secondary = $user->siswaProfile->angkatan;
                $tertiary = $user->siswaProfile->kelas;
            } elseif ($role === 'guru' && $user->guruProfile) {
                $identifier = $user->guruProfile->nidn;
                $secondary = $user->guruProfile->nuptk;
                $tertiary = $user->guruProfile->mapel_keahlian;
                $phone = $user->guruProfile->telepon;
            }

            $data[] = [
                $user->name,
                $user->email,
                $role,
                $identifier,
                $secondary,
                $tertiary,
                $phone,
                $user->email_verified_at ? 'Active' : 'Inactive'
            ];
        }

        $filename = 'users_export_' . date('Y-m-d_H-i-s') . '.xlsx';
        
        return Excel::download(new class($data) implements \Maatwebsite\Excel\Concerns\FromArray {
            private $data;
            
            public function __construct($data) {
                $this->data = $data;
            }
            
            public function array(): array {
                return $this->data;
            }
        }, $filename);
    }

    public function toggleStatus(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Tidak dapat mengubah status akun sendiri.');
        }

        $user->update([
            'email_verified_at' => $user->email_verified_at ? null : now()
        ]);

        $status = $user->email_verified_at ? 'diaktifkan' : 'dinonaktifkan';
        
        return back()->with('success', "User berhasil {$status}.");
    }

    public function resetPassword(User $user)
    {
        $newPassword = 'password123';
        
        $user->update([
            'password' => Hash::make($newPassword)
        ]);

        return back()->with('success', "Password user berhasil direset ke: {$newPassword}");
    }
}