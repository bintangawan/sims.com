<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject_id',
        'guru_id',
        'term_id',
        'kapasitas',
        'jadwal_json',
    ];

    protected $casts = [
        'jadwal_json' => 'array',
        'kapasitas' => 'integer',
    ];

    // Relationships
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function guru()
    {
        return $this->belongsTo(User::class, 'guru_id');
    }

    public function term()
    {
        return $this->belongsTo(Term::class);
    }

    public function sectionStudents()
    {
        return $this->hasMany(SectionStudent::class);
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'section_students', 'section_id', 'user_id')
                    ->withTimestamps();
    }

    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }

    public function materials()
    {
        return $this->hasMany(Material::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function grades()
    {
        return $this->hasMany(Grade::class);
    }
}