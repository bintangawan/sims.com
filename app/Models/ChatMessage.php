<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'sender',
        'content',
        'meta_json',
    ];

    protected $casts = [
        'meta_json' => 'array',
    ];

    // Relationships
    public function session()
    {
        return $this->belongsTo(ChatSession::class, 'session_id');
    }
}