<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'section_id',
        'pertemuan_ke',
        'tanggal',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'pertemuan_ke' => 'integer',
    ];

    // Relationships
    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function attendanceDetails()
    {
        return $this->hasMany(AttendanceDetail::class);
    }
}