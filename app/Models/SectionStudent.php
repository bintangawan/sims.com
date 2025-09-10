<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SectionStudent extends Model
{
    use HasFactory;

    protected $fillable = [
        'section_id',
        'user_id',
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