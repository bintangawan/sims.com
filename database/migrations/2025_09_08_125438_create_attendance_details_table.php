<?php
// database/migrations/2025_09_08_000011_create_attendance_details_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('attendance_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attendance_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // siswa
            $table->enum('status', ['hadir','izin','sakit','alpha'])->default('hadir');
            $table->string('note', 255)->nullable();
            $table->timestamps();

            $table->unique(['attendance_id','user_id']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('attendance_details');
    }
};
