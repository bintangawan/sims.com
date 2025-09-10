<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    use HasFactory;

    protected $fillable = [
        'section_id',
        'user_id',
        'komponen',
        'skor',
        'bobot',
    ];

    protected $casts = [
        'skor' => 'decimal:2',
        'bobot' => 'decimal:2',
    ];

    // Relationships
    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}