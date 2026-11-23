<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Manutencao extends Model
{
    protected $table = 'manutencoes';
    protected $primaryKey = 'id_manutencoes';
    public $timestamps = false;

    protected $fillable = ['data_manutencao', 'descricao', 'resposta', 'sensor_id'];

    protected function casts(): array
    {
        return ['data_manutencao' => 'date'];
    }

    public function sensor(): BelongsTo
    {
        return $this->belongsTo(Sensor::class, 'sensor_id', 'id_sensores');
    }
}
