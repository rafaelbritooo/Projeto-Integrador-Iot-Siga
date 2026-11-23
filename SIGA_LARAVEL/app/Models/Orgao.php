<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Orgao extends Model
{
    protected $table = 'orgaos';
    protected $primaryKey = 'id_orgaos';
    public $timestamps = false;

    protected $fillable = [
        'nome',
        'email_institucional',
        'telefone',
        'endereco',
    ];

    public function usuarios(): HasMany
    {
        return $this->hasMany(Usuario::class, 'orgao_id', 'id_orgaos');
    }
}
