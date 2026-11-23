<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Leitura extends Model
{
    protected $table = 'leituras';
    protected $primaryKey = 'id_leituras';
    public $timestamps = false;

    protected $fillable = ['data_leitura', 'valor', 'status', 'sensor_id'];

    protected function casts(): array
    {
        return [
            'data_leitura' => 'datetime',
            'valor' => 'decimal:2',
        ];
    }

    public function sensor(): BelongsTo
    {
        return $this->belongsTo(Sensor::class, 'sensor_id', 'id_sensores');
    }
}
