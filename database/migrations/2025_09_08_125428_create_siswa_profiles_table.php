<?php
// database/migrations/2025_09_08_000001_create_siswa_profiles_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('siswa_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('nis', 30)->unique();
            $table->unsignedSmallInteger('angkatan');
            $table->string('kelas', 50)->nullable();
            $table->foreignId('wali_kelas_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('siswa_profiles');
    }
};
