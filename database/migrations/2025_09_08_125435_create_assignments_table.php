<?php
// database/migrations/2025_09_08_000008_create_assignments_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            $table->string('judul', 200);
            $table->text('deskripsi');
            $table->enum('tipe', ['file','teks','link','campuran'])->default('file');
            $table->dateTime('deadline');
            $table->json('rubrik_json')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['section_id','deadline']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('assignments');
    }
};
