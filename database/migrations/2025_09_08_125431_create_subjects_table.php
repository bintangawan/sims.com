<?php
// database/migrations/2025_09_08_000004_create_subjects_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 30)->unique();
            $table->string('nama', 150);
            $table->text('deskripsi')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('subjects');
    }
};
