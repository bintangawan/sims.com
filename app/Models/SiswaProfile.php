<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiswaProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nis',
        'angkatan',
        'kelas',
        'wali_kelas_id',
    ];

    protected $casts = [
        'angkatan' => 'integer',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function waliKelas()
    {
        return $this->belongsTo(User::class, 'wali_kelas_id');
    }

    public function sections()
    {
        return $this->user->belongsToMany(Section::class, 'section_students', 'user_id', 'section_id')
                    ->select('sections.*')
                    ->withTimestamps();
    }
}