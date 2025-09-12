<?php
// database/migrations/2025_09_08_000015_create_chat_messages_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('chat_sessions')->cascadeOnDelete();
            $table->enum('sender', ['user','bot']);
            $table->longText('content');
            $table->json('meta_json')->nullable(); // token usage, model, dll.
            $table->timestamps();

            $table->index('session_id');
        });
    }
    public function down(): void {
        Schema::dropIfExists('chat_messages');
    }
};
