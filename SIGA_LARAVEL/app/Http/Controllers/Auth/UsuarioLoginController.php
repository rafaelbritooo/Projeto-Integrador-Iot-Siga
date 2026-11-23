<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\View\View;

class UsuarioLoginController extends Controller
{
    public function create(): View
    {
        return view('auth.login');
    }

    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'senha' => ['required', 'string'],
        ]);

        $usuario = Usuario::query()
            ->with(['orgao', 'perfil'])
            ->where('email', $credentials['email'])
            ->first();

        if (! $usuario
            || $usuario->status !== 'ativo'
            || ! Hash::check($credentials['senha'], $usuario->senha)
        ) {
            return back()
                ->withInput($request->only('email'))
                ->withErrors(['email' => 'E-mail, senha ou status de usuário inválidos.']);
        }

        $request->session()->regenerate();
        $request->session()->put('siga_usuario_id', $usuario->id_usuarios);

        return redirect()->intended(route('siga.dashboard'));
    }

    public function destroy(Request $request)
    {
        $request->session()->forget('siga_usuario_id');
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
