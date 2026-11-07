<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Entrar - SIGA</title>
    <style>
        :root{--blue:#0b63d8;--navy:#0f2747;--green:#13b866;--bg:#f4f8fc;--border:#dbe5f0;--muted:#64748b}
        *{box-sizing:border-box}body{margin:0;min-height:100vh;background:linear-gradient(135deg,#edf5ff,#f7fbf9);color:var(--navy);font-family:Inter,Arial,sans-serif;display:grid;place-items:center;padding:24px}
        .login-card{width:100%;max-width:430px;background:#fff;border:1px solid var(--border);border-radius:20px;padding:38px;box-shadow:0 18px 50px #0f27471a}
        .brand{display:block;text-decoration:none;margin-bottom:32px}.brand-logo{display:block;width:100%;height:auto;max-height:92px;object-fit:contain;object-position:left center}
        h1{font-size:25px;margin:0 0 8px} .intro{color:var(--muted);font-size:14px;margin:0 0 28px}
        label{display:block;font-size:13px;font-weight:600;margin:18px 0 8px}input[type=email],input[type=password]{width:100%;border:1px solid var(--border);border-radius:9px;padding:13px 14px;font:inherit;color:var(--navy);outline:none}input:focus{border-color:var(--blue);box-shadow:0 0 0 3px #0b63d81a}
        .remember{display:flex;align-items:center;gap:8px;color:var(--muted);font-size:13px;margin:17px 0 22px}.remember input{accent-color:var(--blue)}
        button{width:100%;border:0;border-radius:9px;padding:13px;background:var(--blue);color:#fff;font:inherit;font-weight:700;cursor:pointer}button:hover{background:#0955b8}
        .error{background:#fff2f2;color:#b42318;border-radius:8px;padding:11px 13px;font-size:13px;margin-bottom:16px}.field-error{display:block;color:#b42318;font-size:12px;margin-top:6px}
        @media(max-width:480px){.login-card{padding:28px 22px}}
    </style>
</head>
<body>
    <main class="login-card">
        <a class="brand" href="{{ route('login') }}" aria-label="SIGA - página de login">
            <img class="brand-logo" src="{{ asset('images/siga-logo.png') }}" alt="SIGA - Sistema Inteligente de Gestão de Alagamentos">
        </a>
        <h1>Bem-vindo de volta</h1>
        <p class="intro">Entre para acompanhar o monitoramento do SIGA.</p>

        @if ($errors->any())
            <div class="error" role="alert">{{ $errors->first() }}</div>
        @endif

        <form method="POST" action="{{ route('login.attempt') }}">
            @csrf
            <label for="email">E-mail</label>
            <input id="email" name="email" type="email" value="{{ old('email') }}" autocomplete="email" required autofocus>
            @error('email')<span class="field-error">{{ $message }}</span>@enderror

            <label for="password">Senha</label>
            <input id="password" name="password" type="password" autocomplete="current-password" required>
            @error('password')<span class="field-error">{{ $message }}</span>@enderror

            <label class="remember"><input type="checkbox" name="remember" value="1"> Lembrar de mim</label>
            <button type="submit">Entrar</button>
        </form>
    </main>
</body>
</html>
