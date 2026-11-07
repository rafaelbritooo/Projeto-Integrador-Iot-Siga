<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SensorData extends Model
{
    protected $fillable = [
        'water_level_cm',
        'rain_sensor_raw',
        'water_status',
        'pump_on',
        'simulation',
    ];

    protected function casts(): array
    {
        return [
            'water_level_cm' => 'float',
            'rain_sensor_raw' => 'integer',
            'pump_on' => 'boolean',
            'simulation' => 'boolean',
        ];
    }
}
