<?php
// database/migrations/2025_09_08_000006_create_section_students_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('section_students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // siswa
            $table->timestamps();

            $table->unique(['section_id','user_id']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('section_students');
    }
};
