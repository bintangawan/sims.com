<?php

use App\Http\Controllers\Siswa\SiswaDashboardController;
use App\Http\Controllers\Siswa\JadwalController;
use App\Http\Controllers\Siswa\TugasController;
use App\Http\Controllers\Siswa\NilaiController;
use App\Http\Controllers\Siswa\AbsensiController;
use App\Http\Controllers\Shared\AnnouncementController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:siswa'])->prefix('siswa')->name('siswa.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [SiswaDashboardController::class, 'index'])->name('dashboard');
    
    // Jadwal
    Route::get('/jadwal', [JadwalController::class, 'index'])->name('jadwal.index');
    Route::get('/jadwal/today', [JadwalController::class, 'today'])->name('jadwal.today');
    Route::get('/jadwal/week', [JadwalController::class, 'week'])->name('jadwal.week');
    
    // Tugas
    Route::get('/tugas', [TugasController::class, 'index'])->name('tugas.index');
    Route::get('/tugas/{assignment}', [TugasController::class, 'show'])->name('tugas.show');
    Route::get('/tugas/{assignment}/submit', [TugasController::class, 'submit'])->name('tugas.submit');
    Route::post('/tugas/{assignment}/submit', [TugasController::class, 'storeSubmission'])->name('tugas.store-submission');
    Route::get('/tugas/{assignment}/submission', [TugasController::class, 'viewSubmission'])->name('tugas.view-submission');
    Route::put('/tugas/{assignment}/submission', [TugasController::class, 'updateSubmission'])->name('tugas.update-submission');
    
    // Nilai
    Route::get('/nilai', [NilaiController::class, 'index'])->name('nilai.index');
    Route::get('/nilai/subject/{subject}', [NilaiController::class, 'bySubject'])->name('nilai.by-subject');
    Route::get('/nilai/export', [NilaiController::class, 'export'])->name('nilai.export');
    
    // Absensi
    Route::get('/absensi', [AbsensiController::class, 'index'])->name('absensi.index');
    Route::get('/absensi/summary', [AbsensiController::class, 'summary'])->name('absensi.summary');
    Route::get('/absensi/subject/{subject}', [AbsensiController::class, 'bySubject'])->name('absensi.by-subject');
    
    // Announcements
    Route::get('/announcements', [AnnouncementController::class, 'index'])->name('announcements.index');
    Route::get('/announcements/{announcement}', [AnnouncementController::class, 'show'])->name('announcements.show');
});