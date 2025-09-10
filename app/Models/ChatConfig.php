<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatConfig extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value_json',
    ];

    protected $casts = [
        'value_json' => 'array',
    ];

    // Helper methods
    public static function getValue($key, $default = null)
    {
        $config = static::where('key', $key)->first();
        return $config ? $config->value_json : $default;
    }

    public static function setValue($key, $value)
    {
        return static::updateOrCreate(
            ['key' => $key],
            ['value_json' => $value]
        );
    }
}