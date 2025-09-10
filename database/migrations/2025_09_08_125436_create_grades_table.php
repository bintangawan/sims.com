<?php
// database/migrations/2025_09_08_000012_create_grades_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // siswa
            $table->string('komponen', 50);
            $table->decimal('skor', 5, 2);
            $table->decimal('bobot', 5, 2)->default(0); // 0..100 (opsional)
            $table->timestamps();

            $table->unique(['section_id','user_id','komponen']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('grades');
    }
};
