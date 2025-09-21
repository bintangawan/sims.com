<?php

use App\Http\Controllers\LandingController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/', [LandingController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard utama: pilih role otomatis → redirect ke /dashboard/{role}
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Dashboard spesifik role (general), BUKAN admin.*
    Route::get('/dashboard/{role}', [DashboardController::class, 'index'])
        ->whereIn('role', ['admin','guru','siswa'])
        ->name('role.dashboard');
});

// File routes lainnya
require __DIR__.'/auth.php';
require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
require __DIR__.'/guru.php';
require __DIR__.'/siswa.php';
require __DIR__.'/api.php';
