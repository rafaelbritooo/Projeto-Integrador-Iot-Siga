<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Entrar · SIGA</title>
    @vite('resources/js/siga/main.tsx')
    <style>
        body { margin:0; min-height:100vh; display:grid; place-items:center; background:#eff6ff; font-family:Inter,Segoe UI,sans-serif; }
        .login-card { width:min(420px,calc(100vw - 32px)); background:#fff; border:1px solid #dbeafe; border-radius:16px; padding:32px; box-shadow:0 18px 48px rgba(30,64,175,.12); }
        .login-card h1 { margin:0 0 8px; color:#0f172a; }
        .login-card p { margin:0 0 24px; color:#64748b; }
        .login-field { display:flex; flex-direction:column; gap:7px; margin-bottom:15px; }
        .login-field label { color:#334155; font-size:13px; font-weight:700; }
        .login-field input { height:44px; border:1px solid #cbd5e1; border-radius:8px; padding:0 12px; }
        .login-button { width:100%; height:46px; border:none; border-radius:8px; background:#0b63d8; color:#fff; font-weight:700; cursor:pointer; }
        .login-error { background:#fef2f2; color:#991b1b; border:1px solid #fecaca; border-radius:8px; padding:10px 12px; margin-bottom:14px; }
    </style>
</head>
<body>
    <main class="login-card">
        <h1>Entrar no SIGA</h1>
        <p>Acesso vinculado ao órgão e ao perfil do usuário.</p>

        @if (session('error'))
            <div class="login-error">{{ session('error') }}</div>
        @endif
        @if ($errors->any())
            <div class="login-error">{{ $errors->first() }}</div>
        @endif

        <form method="POST" action="{{ route('login.store') }}">
            @csrf
            <div class="login-field">
                <label for="email">E-mail</label>
                <input id="email" name="email" type="email" value="{{ old('email') }}" required autofocus>
            </div>
            <div class="login-field">
                <label for="senha">Senha</label>
                <input id="senha" name="senha" type="password" required>
            </div>
            <button class="login-button" type="submit">Acessar sistema</button>
        </form>
    </main>
</body>
</html>
