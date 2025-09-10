<?php
// database/migrations/2025_09_08_000009_create_submissions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // siswa
            $table->longText('konten_teks')->nullable();
            $table->string('file_path')->nullable();
            $table->string('link_url')->nullable();
            $table->dateTime('submitted_at');
            $table->decimal('score', 5, 2)->nullable();
            $table->text('feedback')->nullable();
            $table->timestamps();

            $table->unique(['assignment_id','user_id']);
            $table->index(['user_id','submitted_at']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('submissions');
    }
};
