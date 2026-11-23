<?php

namespace App\Http\Middleware;

use App\Models\Usuario;
use Closure;
use Illuminate\Http\Request;

class SigaAuth
{
    public function handle(Request $request, Closure $next)
    {
        $usuarioId = $request->session()->get('siga_usuario_id');
        $usuario = $usuarioId
            ? Usuario::query()->with(['orgao', 'perfil'])->find($usuarioId)
            : null;

        if (! $usuario || $usuario->status !== 'ativo') {
            $request->session()->forget('siga_usuario_id');

            return redirect()
                ->guest(route('login'))
                ->with('error', 'Faça login para continuar.');
        }

        $request->attributes->set('siga_usuario', $usuario);

        return $next($request);
    }
}
