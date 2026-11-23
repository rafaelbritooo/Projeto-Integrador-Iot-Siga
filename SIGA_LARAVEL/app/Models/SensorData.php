<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SensorData extends Model
{
    protected $hidden = [
        'device_id',
    ];

    protected $fillable = [
        'water_level_cm',
        'rain_sensor_raw',
        'water_status',
        'pump_on',
        'simulation',
        'device_id',
        'sensor_id',
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

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    public function sensor(): BelongsTo
    {
        return $this->belongsTo(Sensor::class, 'sensor_id', 'id_sensores');
    }
}
