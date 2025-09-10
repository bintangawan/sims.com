<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuruProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nidn',
        'nuptk',
        'mapel_keahlian',
        'telepon',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function sections()
    {
        return $this->hasMany(Section::class, 'guru_id', 'user_id');
    }
}