<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alerta extends Model
{
    protected $table = 'alertas';
    protected $primaryKey = 'id_alertas';
    public $timestamps = false;

    protected $fillable = ['tipo', 'status', 'descricao', 'sensor_id', 'bomba_id'];

    public function sensor(): BelongsTo
    {
        return $this->belongsTo(Sensor::class, 'sensor_id', 'id_sensores');
    }

    public function bomba(): BelongsTo
    {
        return $this->belongsTo(Bomba::class, 'bomba_id', 'id_bombas');
    }
}
