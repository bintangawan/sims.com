<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    use HasFactory;

    protected $fillable = [
        'section_id',
        'judul',
        'deskripsi',
        'file_path',
        'link_url',
    ];

    // Relationships
    public function section()
    {
        return $this->belongsTo(Section::class);
    }
}