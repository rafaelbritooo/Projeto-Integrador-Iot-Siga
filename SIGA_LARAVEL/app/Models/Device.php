<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasOne as SensorHasOne;

class Device extends Model
{
    protected $fillable = [
        'code',
        'name',
        'latitude',
        'longitude',
        'location_accuracy',
        'location_status',
        'location_updated_at',
        'last_wifi_scan_at',
        'last_wifi_fingerprint',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'location_accuracy' => 'float',
            'location_updated_at' => 'datetime',
            'last_wifi_scan_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function sensorData(): HasMany
    {
        return $this->hasMany(SensorData::class);
    }

    public function latestSensorData(): HasOne
    {
        return $this->hasOne(SensorData::class)->latestOfMany('created_at');
    }

    public function sensor(): SensorHasOne
    {
        return $this->hasOne(Sensor::class);
    }
}
