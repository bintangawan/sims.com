<?php
// database/migrations/2025_09_08_000014_create_chat_sessions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('chat_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('role', 20)->nullable(); // snapshot role saat sesi dibuat
            $table->enum('source', ['landing','siswa','guru','admin'])->default('landing');
            $table->timestamps();

            $table->index(['user_id','source']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('chat_sessions');
    }
};
