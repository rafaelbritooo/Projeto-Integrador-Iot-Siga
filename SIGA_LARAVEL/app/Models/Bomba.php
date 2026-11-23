<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bomba extends Model
{
    protected $table = 'bombas';
    protected $primaryKey = 'id_bombas';
    public $timestamps = false;

    protected $fillable = ['data_instalacao', 'status', 'modelo', 'area_id'];

    protected function casts(): array
    {
        return ['data_instalacao' => 'datetime'];
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'area_id', 'id_areas');
    }

    public function acionamentos(): HasMany
    {
        return $this->hasMany(Acionamento::class, 'bomba_id', 'id_bombas');
    }

    public function alertas(): HasMany
    {
        return $this->hasMany(Alerta::class, 'bomba_id', 'id_bombas');
    }
}
