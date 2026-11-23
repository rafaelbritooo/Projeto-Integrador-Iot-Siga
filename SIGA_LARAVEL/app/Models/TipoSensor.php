<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TipoSensor extends Model
{
    protected $table = 'tipos_sensores';
    protected $primaryKey = 'id_tipos_sensores';
    public $timestamps = false;

    protected $fillable = ['nome_tipo', 'descricao'];

    public function sensores(): HasMany
    {
        return $this->hasMany(Sensor::class, 'tipo_sensor_id', 'id_tipos_sensores');
    }
}
