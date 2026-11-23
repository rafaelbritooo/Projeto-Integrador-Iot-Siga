<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Area extends Model
{
    protected $table = 'areas';
    protected $primaryKey = 'id_areas';
    public $timestamps = false;

    protected $fillable = ['orgao_id', 'localizacao', 'descricao', 'latitude', 'longitude'];

    public function sensores(): HasMany
    {
        return $this->hasMany(Sensor::class, 'area_id', 'id_areas');
    }

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    public function cameras(): HasMany
    {
        return $this->hasMany(Camera::class, 'area_id', 'id_areas');
    }

    public function bombas(): HasMany
    {
        return $this->hasMany(Bomba::class, 'area_id', 'id_areas');
    }

    public function orgao(): BelongsTo
    {
        return $this->belongsTo(Orgao::class, 'orgao_id', 'id_orgaos');
    }
}
