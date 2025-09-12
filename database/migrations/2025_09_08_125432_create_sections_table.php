<?php
// database/migrations/2025_09_08_000005_create_sections_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('guru_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('term_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('kapasitas')->nullable();
            $table->json('jadwal_json')->nullable(); // {hari, jam_mulai, jam_selesai, ruangan}
            $table->timestamps();

            $table->index(['subject_id','term_id']);
            $table->index(['guru_id','term_id']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('sections');
    }
};
