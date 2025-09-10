<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'scope_type',
        'scope_id',
        'role_name',
        'published_at',
        'created_by',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    // Relationships
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeSection()
    {
        return $this->belongsTo(Section::class, 'scope_id');
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->whereNotNull('published_at')
                    ->where('published_at', '<=', now());
    }

    public function scopeForRole($query, $role)
    {
        return $query->where(function($q) use ($role) {
            $q->where('scope_type', 'global')
              ->orWhere(function($q2) use ($role) {
                  $q2->where('scope_type', 'role')
                     ->where('role_name', $role);
              });
        });
    }
}