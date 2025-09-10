<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'section_id',
        'judul',
        'deskripsi',
        'tipe',
        'deadline',
        'rubrik_json',
        'published_at',
    ];

    protected $casts = [
        'deadline' => 'datetime',
        'published_at' => 'datetime',
        'rubrik_json' => 'array',
    ];

    // Relationships
    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class);
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->whereNotNull('published_at')
                    ->where('published_at', '<=', now());
    }
}