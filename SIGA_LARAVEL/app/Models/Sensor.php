<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sensor extends Model
{
    protected $table = 'sensores';
    protected $primaryKey = 'id_sensores';
    public $timestamps = false;

    protected $fillable = ['nome_tipo', 'descricao', 'status', 'tipo_sensor_id', 'area_id', 'device_id'];

    public function tipoSensor(): BelongsTo
    {
        return $this->belongsTo(TipoSensor::class, 'tipo_sensor_id', 'id_tipos_sensores');
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'area_id', 'id_areas');
    }

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    public function leituras(): HasMany
    {
        return $this->hasMany(Leitura::class, 'sensor_id', 'id_sensores');
    }

    public function alertas(): HasMany
    {
        return $this->hasMany(Alerta::class, 'sensor_id', 'id_sensores');
    }

    public function manutencoes(): HasMany
    {
        return $this->hasMany(Manutencao::class, 'sensor_id', 'id_sensores');
    }
}
