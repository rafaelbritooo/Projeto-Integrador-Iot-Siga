<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Acionamento extends Model
{
    protected $table = 'acionamentos';
    protected $primaryKey = 'id_acionamentos';
    public $timestamps = false;

    protected $fillable = ['data_hora', 'status', 'bomba_id'];

    protected function casts(): array
    {
        return ['data_hora' => 'datetime'];
    }

    public function bomba(): BelongsTo
    {
        return $this->belongsTo(Bomba::class, 'bomba_id', 'id_bombas');
    }
}
