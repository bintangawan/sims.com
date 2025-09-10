<?php
// database/migrations/2025_09_08_000002_create_guru_profiles_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('guru_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('nidn', 30)->nullable()->unique();
            $table->string('nuptk', 30)->nullable()->unique();
            $table->string('mapel_keahlian', 100)->nullable();
            $table->string('telepon', 30)->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('guru_profiles');
    }
};
