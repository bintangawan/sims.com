<?php

use App\Http\Controllers\Chat\ChatController;
use Illuminate\Support\Facades\Route;

// Ping (tes cepat)
Route::get('/ping', fn() => response()->json(['ok' => true]));

// Semua endpoint dibuat publik (tanpa auth), tapi dibatasi rate limit.
// Silakan sesuaikan angka throttle sesuai kebutuhan produksi.

// Kirim pesan (guest & login sama saja)
Route::middleware('throttle:30,1')->post('/chat/public', [ChatController::class, 'publicChat'])
    ->name('chat.public');

// ... existing code ...
// Endpoint test untuk Gemini API
Route::get('/test-gemini', function() {
    $client = new \App\Services\Chat\GeminiClient();
    return response()->json($client->testConnection());
});
// ... existing code ...

// Opsi: endpoint /chat yang sama persis (kalau FE kamu sudah memanggil /api/chat)
Route::middleware('throttle:30,1')->post('/chat', [ChatController::class, 'publicChat'])
    ->name('chat.send');

// Ambil daftar sesi (tanpa auth) — jika kamu ingin tampilkan riwayat ke publik.
// Catatan: Ini akan mengembalikan sesi berdasarkan user_id kalau login.
// Untuk guest (user_id null), biasanya tidak ada daftar sesi, karena tidak terikat akun.
// Biasanya di FE kamu pegang session_id per chat utk riwayat.
Route::middleware('throttle:60,1')->get('/chat/sessions', [ChatController::class, 'sessions'])
    ->name('chat.sessions');

// Ambil satu sesi berdasar ID (guest boleh)
Route::middleware('throttle:60,1')->get('/chat/sessions/{session}', [ChatController::class, 'getSession'])
    ->name('chat.session');

// Hapus sesi (guest boleh asal tahu session_id)
Route::middleware('throttle:60,1')->delete('/chat/sessions/{session}', [ChatController::class, 'deleteSession'])
    ->name('chat.delete-session');
