<?php

use App\Http\Controllers\Chat\ChatController;
use Illuminate\Support\Facades\Route;

// Chat API routes
Route::prefix('api')->group(function () {
    // Public chat for landing page
    Route::post('/chat/public', [ChatController::class, 'publicChat'])->name('chat.public');
    
    // Authenticated chat
    Route::middleware('auth')->group(function () {
        Route::post('/chat', [ChatController::class, 'chat'])->name('chat.send');
        Route::get('/chat/sessions', [ChatController::class, 'sessions'])->name('chat.sessions');
        Route::get('/chat/sessions/{session}', [ChatController::class, 'getSession'])->name('chat.session');
        Route::delete('/chat/sessions/{session}', [ChatController::class, 'deleteSession'])->name('chat.delete-session');
    });
});