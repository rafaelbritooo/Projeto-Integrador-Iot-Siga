<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Camera extends Model
{
    protected $table = 'cameras';
    protected $primaryKey = 'id_cameras';
    public $timestamps = false;

    protected $fillable = ['data_instalacao', 'status', 'localizacao', 'nome_camara', 'area_id'];

    protected function casts(): array
    {
        return ['data_instalacao' => 'datetime'];
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'area_id', 'id_areas');
    }
}
