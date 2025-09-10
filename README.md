# SIMS — Sistem Informasi Manajemen Sekolah (Laravel 12 + Inertia React + Tailwind + shadcn/ui)

Dokumen ini menjelaskan **struktur folder**, **fitur per role (siswa, guru, admin)**, **skema database inti**, serta **konsep alur aplikasi**.

---

## Ringkasan Teknologi

- **Backend**: Laravel 12, Spatie Permission (RBAC), Notifications, Queue (database/Redis).
- **Frontend**: Inertia + **React (TypeScript/TSX)**, TailwindCSS, **shadcn/ui**.
- **Database**: MySQL (`utf8mb4_unicode_ci`).
- **Chatbot**: Widget terintegrasi API **Gemini** (via endpoint server-side `/api/chat`).

---

## Roles & Akses (RBAC)

- **siswa**: akses materi, tugas, nilai, absensi, pengumuman; Chatbot kontekstual (siswa).
- **guru**: kelola kelas/section, materi, tugas, penilaian, absensi, pengumuman; Chatbot kontekstual (guru).
- **admin**: master data, manajemen pengguna & jadwal, pengumuman, laporan, konfigurasi Chatbot; Chatbot kontekstual (admin).

---

## Konsep Aplikasi (User Journeys)

### 1) Siswa

- **Tujuan**: belajar, kumpul tugas, lihat nilai & absensi, pantau pengumuman.
- **Alur**:
    1. Login → Dashboard Siswa (widget jadwal/tugas/absensi/nilai).
    2. Buka **Materi** & **Tugas** kelas yang diikuti → submit tugas (teks/file/link).
    3. Cek **Nilai** dan **Absensi** (rekap bulanan).
    4. Gunakan **Chatbot** untuk tanya hal teknis/akademik (deadline terdekat, jadwal hari ini, dsb).

### 2) Guru

- **Tujuan**: mengelola pembelajaran, menilai tugas, mencatat kehadiran, menyampaikan pengumuman.
- **Alur**:
    1. Login → Dashboard Guru (jadwal mengajar, tugas perlu dinilai, absensi terbaru).
    2. Kelola **Kelas/Section**: unggah **Materi**, buat **Tugas** (deadline, rubrik).
    3. Input **Nilai** (per tugas/kuis/ujian) dan **Absensi** per pertemuan.
    4. Kirim **Pengumuman** ke kelas.
    5. Gunakan **Chatbot** (mis. generate rubrik 4 level, draft pengumuman, ringkas materi).

### 3) Admin

- **Tujuan**: mengatur master data & operasional akademik.
- **Alur**:
    1. Login → Dashboard Admin (statistik pengguna/ruang/keterlambatan tugas).
    2. Kelola **Master Data** (tahun ajaran, mapel, section, ruangan, slot jam).
    3. **Manajemen Pengguna** (import CSV, assign role/kelas).
    4. **Penjadwalan** (buat/ubah jadwal; deteksi bentrok guru/ruang).
    5. **Pengumuman** global/role/section.
    6. **Laporan** (kehadiran, nilai agregat, beban mengajar).
    7. **Konfigurasi Chatbot** (API key, prompt template, grounding FAQ).

---

## Fitur Per Role

### Siswa

- Dashboard: ringkasan **Jadwal Hari Ini**, **Tugas Mendekati Deadline**, **Absensi Bulan Ini**, **Nilai Terbaru**, **Pengumuman**.
- **Kelas & Jadwal**: timetable mingguan, detail guru/ruang.
- **Materi**: unduh materi per pertemuan.
- **Tugas**: daftar & detail tugas, **submit** (teks/file/link), riwayat.
- **Penilaian**: nilai per tugas/ujian; rekap per mapel; unduh rapor PDF (opsional).
- **Absensi**: grafik & rekap hadir/izin/sakit/alpha.
- **Chatbot (Gemini)**: tanya jadwal, deadline, panduan, dsb.

### Guru

- Dashboard: **Jadwal Mengajar**, **Tugas Perlu Dinilai**, **Kehadiran Terbaru**, **Pengumuman Staf**.
- **Kelas/Section**: roster siswa, ekspor daftar.
- **Materi**: unggah file/link per pertemuan.
- **Tugas/Kuis**: buat & publikasikan; deadline; rubrik; lampiran; kunci nilai.
- **Penilaian**: input/bulk grade + feedback; ekspor CSV.
- **Absensi**: input per pertemuan; rekap kelas.
- **Pengumuman**: broadcast ke section.
- **Chatbot (Gemini)**: bantu rubrik, rangkum materi, template pengumuman.

### Admin

- Dashboard: metrik operasional (pengguna aktif, keterlambatan tugas, penggunaan ruang).
- **Master Data**: tahun ajaran/semester, kalender, mapel, section, ruangan, slot jam.
- **Pengguna & Role**: import CSV, aktivasi/reset, mapping kelas/mapel.
- **Penjadwalan**: set jadwal; validasi bentrok.
- **Pengumuman**: global/role/section.
- **Pelaporan**: kehadiran, nilai agregat, beban mengajar, ruang; ekspor Excel/PDF.
- **Konfigurasi Chatbot**: API key, template prompt, grounding docs/FAQ.

> Catatan: Fitur **Bimbingan & Ekstrakurikuler** dan **Pembayaran** **Dihilangkan** sesuai keputusan.

---

## Struktur Folder (Frontend: TSX)

```bash
resources/
└─ js/
   ├─ app.tsx
   ├─ types/
   │  └─ inertia.d.ts
   ├─ lib/
   │  └─ api.ts
   ├─ Components/
   │  ├─ ui/                     # komponen shadcn/ui yang di-generate CLI
   │  └─ Chatbot/
   │     └─ ChatWidget.tsx
   └─ Pages/
      ├─ Landing.tsx
      ├─ Dashboard.tsx
      ├─ Siswa/
      │  ├─ Dashboard.tsx
      │  ├─ Jadwal.tsx
      │  ├─ Tugas/
      │  │  ├─ Index.tsx
      │  │  └─ Show.tsx
      │  ├─ Nilai.tsx
      │  └─ Absensi.tsx
      ├─ Guru/
      │  ├─ Dashboard.tsx
      │  ├─ Kelas/
      │  │  ├─ Index.tsx
      │  │  └─ Show.tsx
      │  ├─ Materi/Index.tsx
      │  ├─ Tugas/Index.tsx
      │  ├─ Penilaian/Index.tsx
      │  └─ Absensi/Index.tsx
      └─ Admin/
         ├─ Dashboard.tsx
         ├─ MasterData.tsx
         ├─ Users.tsx
         ├─ Jadwal.tsx
         ├─ Laporan.tsx
         └─ ChatbotConfig.tsx
```

**Backend ringkas**:

```
app/
├─ Models/ (User, SiswaProfile, GuruProfile, Term, Subject, Section, Material, Assignment, Submission, Attendance, AttendanceDetail, Grade, Announcement, ChatSession, ChatMessage, ChatConfig)
├─ Http/Controllers/
│  ├─ LandingController.php
│  ├─ DashboardController.php
│  ├─ Shared/AnnouncementController.php
│  ├─ Siswa/...
│  ├─ Guru/...
│  ├─ Admin/...
│  └─ Chat/ChatController.php
└─ Services/Chat/GeminiClient.php
```

---

## Skema Database Inti

> Seluruh tabel menggunakan `utf8mb4_unicode_ci`. Tambahkan `cascadeOnDelete()` pada FK yang relevan.

### Tabel & Kolom Utama

- **users** (bawaan Laravel)
  `id, name, email, password, ...`
  Relasi RBAC via **Spatie**: `roles`, `permissions`, `model_has_roles`, `model_has_permissions`.

- **siswa_profiles**
  `id, user_id(FK, unique), nis(unique), angkatan(SMALLINT), kelas(VARCHAR50, nullable), wali_kelas_id(FK users, nullable), timestamps`

- **guru_profiles**
  `id, user_id(FK, unique), nidn/nuptk(VARCHAR, nullable unique), mapel_keahlian(VARCHAR100), telepon(nullable), timestamps`

- **terms**
  `id, tahun(VARCHAR9, ex: "2025/2026"), semester(ENUM: ganjil|genap), aktif(BOOLEAN), UNIQUE(tahun, semester)`

- **subjects**
  `id, kode(unique), nama, deskripsi(nullable), timestamps`

- **sections** _(rombongan belajar untuk mapel per term)_
  `id, subject_id(FK), guru_id(FK users), term_id(FK), kapasitas(SMALLINT, nullable), jadwal_json(JSON, {hari, jam_mulai, jam_selesai, ruangan}), timestamps`
  Index: `(subject_id, term_id)`, `(guru_id, term_id)`

- **section_students** _(pivot siswa↔section)_
  `id, section_id(FK), user_id(FK users), UNIQUE(section_id, user_id)`

- **materials**
  `id, section_id(FK), judul, deskripsi(TEXT nullable), file_path(nullable), link_url(nullable), timestamps`

- **assignments**
  `id, section_id(FK), judul, deskripsi(TEXT), tipe(ENUM: file|teks|link|campuran), deadline(DATETIME), rubrik_json(JSON nullable), published_at(nullable), timestamps`

- **submissions**
  `id, assignment_id(FK), user_id(FK siswa), konten_teks(LONGTEXT nullable), file_path(nullable), link_url(nullable), submitted_at(DATETIME), score(DECIMAL(5,2) nullable), feedback(TEXT nullable), timestamps`
  Unique: `(assignment_id, user_id)`

- **attendances** _(per pertemuan)_
  `id, section_id(FK), pertemuan_ke(SMALLINT), tanggal(DATE), UNIQUE(section_id, pertemuan_ke)`

- **attendance_details** _(detail kehadiran siswa)_
  `id, attendance_id(FK), user_id(FK siswa), status(ENUM: hadir|izin|sakit|alpha), note(nullable), UNIQUE(attendance_id, user_id)`

- **grades** _(opsional jika rekap komponen terpisah dari submissions)_
  `id, section_id(FK), user_id(FK siswa), komponen(VARCHAR50), skor(DECIMAL(5,2)), bobot(DECIMAL(5,2)), UNIQUE(section_id, user_id, komponen)`

- **announcements**
  `id, title, content(LONGTEXT), scope_type(ENUM: global|section|role), scope_id(nullable), role_name(nullable), published_at, created_by(FK users), timestamps`

- **chat_sessions**
  `id, user_id(nullable untuk landing), role(nullable), source(ENUM: landing|siswa|guru|admin), timestamps`

- **chat_messages**
  `id, session_id(FK), sender(ENUM: user|bot), content(LONGTEXT), meta_json(JSON nullable), timestamps`

- **chat_configs**
  `id, key(unique), value_json(JSON), timestamps`
  (mis. `gemini.prompt_template`, `gemini.system_faq`, `gemini.limits`)

- **notifications / jobs / sessions / cache** _(tabel bawaan artisan)_

### Relasi Utama (ringkas)

- `User (siswa)` 1—1 `SiswaProfile`
- `User (guru)` 1—1 `GuruProfile`
- `Term` 1—n `Section`
- `Subject` 1—n `Section`
- `User (guru)` 1—n `Section`
- `Section` 1—n `Material` / `Assignment` / `Attendance`
- `Section` n—m `User (siswa)` melalui `section_students`
- `Assignment` 1—n `Submission`
- `Attendance` 1—n `AttendanceDetail`
- `Section` 1—n `Grade`
- `User` 1—n `Announcement` (via `created_by`)
- `ChatSession` 1—n `ChatMessage`

> **Indeks penting**: kombinasi unik untuk mencegah duplikasi (pivot, submissions), serta indeks gabungan di `sections` untuk query per term/guru.

---

## Catatan Chatbot (Gemini)

- Endpoint: `POST /api/chat` (server-side proxy; **jangan expose API key di FE**).
- Menyimpan: `chat_sessions`, `chat_messages`.
- Konteks role disisipkan di server (role, term aktif, dsb.).
- Admin dapat mengatur prompt/FAQ lewat **ChatbotConfig** UI.

---

## Catatan Implementasi (singkat)

- **Storage**: gunakan `FILESYSTEM_DISK=public` dan `php artisan storage:link` untuk akses materi/submission.
- **Queue**: `QUEUE_CONNECTION=database` (dev) dengan `php artisan queue:work` untuk notifikasi & proses berat.
- **Policies**: rekomendasi menambah policy pada `Section`, `Assignment`, `Submission` untuk kontrol akses granular.

---

## Status MVP

- ✅ Auth + RBAC (Spatie).
- ✅ Landing + Dashboard per role + **Chatbot** (stub).
- ✅ Materi, Tugas → **Submission** → **Penilaian** dasar.
- ✅ Absensi per pertemuan.
- ✅ Pengumuman (global/role/section).
- ✅ Skema DB inti (lihat di atas).
