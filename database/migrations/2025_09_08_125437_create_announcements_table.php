<?php
// database/migrations/2025_09_08_000013_create_announcements_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->longText('content');
            $table->enum('scope_type', ['global','section','role'])->default('global');
            $table->unsignedBigInteger('scope_id')->nullable(); // section_id jika scope=section
            $table->string('role_name', 50)->nullable();        // jika scope=role
            $table->timestamp('published_at')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->index(['scope_type','scope_id']);
            $table->index(['role_name']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('announcements');
    }
};
