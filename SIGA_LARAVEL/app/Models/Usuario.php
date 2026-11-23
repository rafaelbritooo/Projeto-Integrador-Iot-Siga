<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Usuario extends Model
{
    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuarios';
    public $timestamps = false;

    protected $fillable = [
        'nome',
        'status',
        'email',
        'telefone',
        'senha',
        'orgao_id',
        'perfil_id',
    ];

    protected $hidden = ['senha'];

    public function orgao(): BelongsTo
    {
        return $this->belongsTo(Orgao::class, 'orgao_id', 'id_orgaos');
    }

    public function perfil(): BelongsTo
    {
        return $this->belongsTo(Perfil::class, 'perfil_id', 'id_perfis');
    }

    public function hasPermission(string $permission): bool
    {
        return $this->status === 'ativo'
            && in_array($permission, $this->perfil?->permissoes ?? [], true);
    }

    public function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }
}
