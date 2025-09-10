<?php

use App\Http\Controllers\LandingController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

// Landing page
Route::get('/', [LandingController::class, 'index'])->name('home');

// Authenticated routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Main dashboard - redirects based on role
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

// Include other route files
require __DIR__.'/auth.php';
require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
require __DIR__.'/guru.php';
require __DIR__.'/siswa.php';

// Include API routes if not using separate api.php
require __DIR__.'/api.php';
