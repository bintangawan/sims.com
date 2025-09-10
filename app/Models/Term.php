<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Term extends Model
{
    use HasFactory;

    protected $fillable = [
        'tahun',
        'semester',
        'aktif',
    ];

    protected $casts = [
        'aktif' => 'boolean',
    ];

    // Relationships
    public function sections()
    {
        return $this->hasMany(Section::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('aktif', true);
    }

    // Helper methods
    public function getFullNameAttribute()
    {
        return $this->tahun . ' - ' . ucfirst($this->semester);
    }
}