<?php
// database/migrations/2025_09_08_000003_create_terms_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('terms', function (Blueprint $table) {
            $table->id();
            $table->string('tahun', 9); // ex: 2025/2026
            $table->enum('semester', ['ganjil','genap']);
            $table->boolean('aktif')->default(false);
            $table->timestamps();

            $table->unique(['tahun','semester']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('terms');
    }
};
