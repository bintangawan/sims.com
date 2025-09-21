<?php

use App\Http\Controllers\Guru\GuruDashboardController;
use App\Http\Controllers\Guru\KelasController;
use App\Http\Controllers\Guru\MateriController;
use App\Http\Controllers\Guru\TugasController;
use App\Http\Controllers\Guru\PenilaianController;
use App\Http\Controllers\Guru\AbsensiController;
use App\Http\Controllers\Shared\AnnouncementController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:guru'])->prefix('guru')->name('guru.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [GuruDashboardController::class, 'index'])->name('dashboard');
    
    // Kelas/Sections
    Route::get('/kelas', [KelasController::class, 'index'])->name('kelas.index');
    Route::get('/kelas/{section}', [KelasController::class, 'show'])->name('kelas.show');
    Route::get('/kelas/{section}/students', [KelasController::class, 'students'])->name('kelas.students');
    Route::get('/kelas/{section}/export', [KelasController::class, 'exportStudents'])->name('kelas.export');
    Route::get('/kelas/{section}/create', [KelasController::class, 'create'])->name('kelas.create');
    Route::post('/kelas/{section}/store', [KelasController::class, 'store'])->name('kelas.store');
    
    // Materi - Fixed routes with proper section context
    Route::get('/kelas/{section}/materi', [MateriController::class, 'index'])->name('materi.index');
    Route::get('/kelas/{section}/materi/create', [MateriController::class, 'create'])->name('materi.create');
    Route::post('/materi', [MateriController::class, 'store'])->name('materi.store');
    Route::get('/materi/{material}', [MateriController::class, 'show'])->name('materi.show');
    Route::get('/materi/{material}/download', [MateriController::class, 'download'])->name('materi.download');
    Route::get('/materi/{material}/preview', [MateriController::class, 'preview'])->name('materi.preview');
    Route::get('/materi/{material}/edit', [MateriController::class, 'edit'])->name('materi.edit');
    Route::put('/materi/{material}', [MateriController::class, 'update'])->name('materi.update');
    Route::delete('/materi/{material}', [MateriController::class, 'destroy'])->name('materi.destroy');
    
    // Tugas
    Route::get('/kelas/{section}/tugas', [TugasController::class, 'index'])->name('tugas.index');
    Route::get('/tugas/create', [TugasController::class, 'create'])->name('tugas.create');
    Route::post('/tugas', [TugasController::class, 'store'])->name('tugas.store');
    Route::get('/tugas/{assignment}', [TugasController::class, 'show'])->name('tugas.show');
    Route::get('/tugas/{assignment}/edit', [TugasController::class, 'edit'])->name('tugas.edit');
    Route::put('/tugas/{assignment}', [TugasController::class, 'update'])->name('tugas.update');
    Route::delete('/tugas/{assignment}', [TugasController::class, 'destroy'])->name('tugas.destroy');
    Route::patch('/tugas/{assignment}/publish', [TugasController::class, 'publish'])->name('tugas.publish');
    
    // Penilaian
    Route::get('/tugas/{assignment}/submissions', [PenilaianController::class, 'submissions'])->name('penilaian.submissions');
    Route::get('/submissions/{submission}/grade', [PenilaianController::class, 'show'])->name('penilaian.show');
    Route::put('/submissions/{submission}/grade', [PenilaianController::class, 'update'])->name('penilaian.update');
    Route::post('/tugas/{assignment}/bulk-grade', [PenilaianController::class, 'bulkGrade'])->name('penilaian.bulk');
    Route::get('/kelas/{section}/grades/export', [PenilaianController::class, 'export'])->name('penilaian.export');
    
    // Absensi
    Route::get('/kelas/{section}/absensi', [AbsensiController::class, 'index'])->name('absensi.index');
    Route::get('/kelas/{section}/absensi/create', [AbsensiController::class, 'create'])->name('absensi.create');
    Route::post('/kelas/{section}/absensi', [AbsensiController::class, 'store'])->name('absensi.store');
    Route::get('/absensi/{attendance}', [AbsensiController::class, 'show'])->name('absensi.show');
    Route::get('/absensi/{attendance}/edit', [AbsensiController::class, 'edit'])->name('absensi.edit');
    Route::put('/absensi/{attendance}', [AbsensiController::class, 'update'])->name('absensi.update');
    Route::get('/kelas/{section}/absensi/summary', [AbsensiController::class, 'summary'])->name('absensi.summary');
    
    // Announcements
    Route::get('/announcements', [AnnouncementController::class, 'index'])->name('announcements.index');
    Route::get('/announcements/create', [AnnouncementController::class, 'create'])->name('announcements.create');
    Route::post('/announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
    Route::get('/announcements/{announcement}', [AnnouncementController::class, 'show'])->name('announcements.show');
    Route::get('/announcements/{announcement}/edit', [AnnouncementController::class, 'edit'])->name('announcements.edit');
    Route::put('/announcements/{announcement}', [AnnouncementController::class, 'update'])->name('announcements.update');
    Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');
});