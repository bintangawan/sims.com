<?php
// database/migrations/2025_09_08_000016_create_chat_configs_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('chat_configs', function (Blueprint $table) {
            $table->id();
            $table->string('key', 150)->unique();
            $table->json('value_json');
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('chat_configs');
    }
};
