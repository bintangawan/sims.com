<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\SiswaProfile;
use App\Models\GuruProfile;
use App\Models\Term;
use App\Models\Subject;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DevUserSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin User
        $admin = User::create([
            'name' => 'Administrator',
            'email' => 'admin@sims.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('admin');

        // Create sample term
        $term = Term::create([
            'tahun' => '2024/2025',
            'semester' => 'ganjil',
            'aktif' => true,
        ]);

        // Create sample subjects
        $subjects = [
            ['kode' => 'MTK', 'nama' => 'Matematika', 'deskripsi' => 'Mata pelajaran Matematika'],
            ['kode' => 'IPA', 'nama' => 'Ilmu Pengetahuan Alam', 'deskripsi' => 'Mata pelajaran IPA'],
            ['kode' => 'IPS', 'nama' => 'Ilmu Pengetahuan Sosial', 'deskripsi' => 'Mata pelajaran IPS'],
            ['kode' => 'BIN', 'nama' => 'Bahasa Indonesia', 'deskripsi' => 'Mata pelajaran Bahasa Indonesia'],
            ['kode' => 'ENG', 'nama' => 'Bahasa Inggris', 'deskripsi' => 'Mata pelajaran Bahasa Inggris'],
        ];

        foreach ($subjects as $subject) {
            Subject::create($subject);
        }

        // Create Guru Users
        $gurus = [
            [
                'name' => 'Budi Santoso',
                'email' => 'budi.guru@sims.com',
                'nidn' => '1234567890',
                'mapel_keahlian' => 'Matematika',
                'telepon' => '081234567890',
            ],
            [
                'name' => 'Siti Nurhaliza',
                'email' => 'siti.guru@sims.com',
                'nidn' => '1234567891',
                'mapel_keahlian' => 'Bahasa Indonesia',
                'telepon' => '081234567891',
            ],
            [
                'name' => 'Ahmad Wijaya',
                'email' => 'ahmad.guru@sims.com',
                'nidn' => '1234567892',
                'mapel_keahlian' => 'IPA',
                'telepon' => '081234567892',
            ],
        ];

        foreach ($gurus as $guruData) {
            $guru = User::create([
                'name' => $guruData['name'],
                'email' => $guruData['email'],
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]);
            $guru->assignRole('guru');

            GuruProfile::create([
                'user_id' => $guru->id,
                'nidn' => $guruData['nidn'],
                'mapel_keahlian' => $guruData['mapel_keahlian'],
                'telepon' => $guruData['telepon'],
            ]);
        }

        // Create Siswa Users
        $siswas = [
            [
                'name' => 'Andi Pratama',
                'email' => 'andi.siswa@sims.com',
                'nis' => '2024001',
                'angkatan' => 2024,
                'kelas' => 'X-1',
            ],
            [
                'name' => 'Dewi Sartika',
                'email' => 'dewi.siswa@sims.com',
                'nis' => '2024002',
                'angkatan' => 2024,
                'kelas' => 'X-1',
            ],
            [
                'name' => 'Rudi Hermawan',
                'email' => 'rudi.siswa@sims.com',
                'nis' => '2024003',
                'angkatan' => 2024,
                'kelas' => 'X-2',
            ],
            [
                'name' => 'Maya Sari',
                'email' => 'maya.siswa@sims.com',
                'nis' => '2024004',
                'angkatan' => 2024,
                'kelas' => 'X-2',
            ],
        ];

        foreach ($siswas as $siswaData) {
            $siswa = User::create([
                'name' => $siswaData['name'],
                'email' => $siswaData['email'],
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]);
            $siswa->assignRole('siswa');

            SiswaProfile::create([
                'user_id' => $siswa->id,
                'nis' => $siswaData['nis'],
                'angkatan' => $siswaData['angkatan'],
                'kelas' => $siswaData['kelas'],
            ]);
        }
    }
}