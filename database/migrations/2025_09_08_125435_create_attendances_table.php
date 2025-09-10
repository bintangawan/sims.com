<?php
// database/migrations/2025_09_08_000010_create_attendances_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('pertemuan_ke');
            $table->date('tanggal');
            $table->timestamps();

            $table->unique(['section_id','pertemuan_ke']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('attendances');
    }
};
