<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Perfil extends Model
{
    protected $table = 'perfis';
    protected $primaryKey = 'id_perfis';
    public $timestamps = false;

    protected $fillable = ['nome', 'slug', 'descricao', 'permissoes'];

    protected function casts(): array
    {
        return ['permissoes' => 'array'];
    }

    public function usuarios(): HasMany
    {
        return $this->hasMany(Usuario::class, 'perfil_id', 'id_perfis');
    }
}
