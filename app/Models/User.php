<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // =====================
    // Relationships
    // =====================

    public function siswaProfile()
    {
        return $this->hasOne(SiswaProfile::class);
    }

    public function guruProfile()
    {
        return $this->hasOne(GuruProfile::class);
    }

    public function chatSessions()
    {
        return $this->hasMany(ChatSession::class);
    }

    public function sectionStudents()
    {
        return $this->hasMany(SectionStudent::class);
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class);
    }

    public function attendanceDetails()
    {
        return $this->hasMany(AttendanceDetail::class);
    }

    public function grades()
    {
        return $this->hasMany(Grade::class);
    }

    public function announcements()
    {
        return $this->hasMany(Announcement::class, 'created_by');
    }

    // 🔹 Relasi ke Section lewat pivot section_students
    public function sections()
    {
        return $this->belongsToMany(
            Section::class,
            'section_students',
            'user_id',   // FK di pivot mengarah ke users.id
            'section_id' // FK di pivot mengarah ke sections.id
        )->withTimestamps();
    }

    // =====================
    // Helper methods
    // =====================

    public function isSiswa()
    {
        return $this->hasRole('siswa');
    }

    public function isGuru()
    {
        return $this->hasRole('guru');
    }

    public function isAdmin()
    {
        return $this->hasRole('admin');
    }
}
