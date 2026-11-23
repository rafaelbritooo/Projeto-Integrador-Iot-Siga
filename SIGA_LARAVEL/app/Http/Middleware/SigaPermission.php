<?php

namespace App\Http\Middleware;

use App\Models\Usuario;
use Closure;
use Illuminate\Http\Request;

class SigaPermission
{
    public function handle(Request $request, Closure $next, string $permission)
    {
        $usuario = Usuario::query()
            ->with('perfil')
            ->find($request->session()->get('siga_usuario_id'));

        if (! $usuario?->hasPermission($permission)) {
            abort(403, 'Seu perfil não possui permissão para esta operação.');
        }

        return $next($request);
    }
}
