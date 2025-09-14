<?php

use App\Http\Controllers\Admin\MasterDataController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\JadwalController;
use App\Http\Controllers\Admin\LaporanController;
use App\Http\Controllers\Admin\ChatbotConfigController;
use App\Http\Controllers\Shared\AnnouncementController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard - menggunakan DashboardController utama dengan parameter role
    Route::get('/dashboard', function() {
        return app(\App\Http\Controllers\DashboardController::class)->index('admin');
    })->name('dashboard');
    
    // Master Data
    Route::get('/master-data', [MasterDataController::class, 'index'])->name('master-data.index');
    Route::post('/master-data/terms', [MasterDataController::class, 'storeTerm'])->name('master-data.store-term');
    Route::put('/master-data/terms/{term}', [MasterDataController::class, 'updateTerm'])->name('master-data.update-term');
    Route::delete('/master-data/terms/{term}', [MasterDataController::class, 'destroyTerm'])->name('master-data.destroy-term');
    Route::patch('/master-data/terms/{term}/activate', [MasterDataController::class, 'activateTerm'])->name('master-data.activate-term');
    
    Route::post('/master-data/subjects', [MasterDataController::class, 'storeSubject'])->name('master-data.store-subject');
    Route::put('/master-data/subjects/{subject}', [MasterDataController::class, 'updateSubject'])->name('master-data.update-subject');
    Route::delete('/master-data/subjects/{subject}', [MasterDataController::class, 'destroySubject'])->name('master-data.destroy-subject');
    
    Route::post('/master-data/sections', [MasterDataController::class, 'storeSection'])->name('master-data.store-section');
    Route::put('/master-data/sections/{section}', [MasterDataController::class, 'updateSection'])->name('master-data.update-section');
    Route::delete('/master-data/sections/{section}', [MasterDataController::class, 'destroySection'])->name('master-data.destroy-section');
    
    // Users Management
    Route::post('users/import', [UserController::class, 'import'])->name('users.import');
    Route::get('users/export', [UserController::class, 'export'])->name('users.export');
    Route::patch('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
    Route::post('users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');
    Route::resource('users', UserController::class);
    
    // Jadwal Management
    Route::get('/jadwal', [JadwalController::class, 'index'])->name('jadwal.index');
    Route::post('/jadwal', [JadwalController::class, 'store'])->name('jadwal.store');
    Route::put('/jadwal/{section}', [JadwalController::class, 'update'])->name('jadwal.update');
    Route::delete('/jadwal/{section}', [JadwalController::class, 'destroy'])->name('jadwal.destroy');
    Route::get('/jadwal/conflicts', [JadwalController::class, 'checkConflicts'])->name('jadwal.conflicts');
    
    // Laporan
    Route::get('/laporan', [LaporanController::class, 'index'])->name('laporan.index');
    Route::get('/laporan/attendance', [LaporanController::class, 'attendance'])->name('laporan.attendance');
    Route::get('/laporan/grades', [LaporanController::class, 'grades'])->name('laporan.grades');
    Route::get('/laporan/workload', [LaporanController::class, 'workload'])->name('laporan.workload');
    Route::get('/laporan/export/{type}', [LaporanController::class, 'export'])->name('laporan.export');
    
    // Announcements
    Route::resource('announcements', AnnouncementController::class);
    
    // Chatbot Configuration
    Route::get('/chatbot-config', [ChatbotConfigController::class, 'index'])->name('chatbot-config.index');
    Route::put('/chatbot-config', [ChatbotConfigController::class, 'update'])->name('chatbot-config.update');
    Route::post('/chatbot-config/test', [ChatbotConfigController::class, 'test'])->name('chatbot-config.test');
});