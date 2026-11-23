<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Acesso não autorizado · SIGA</title>
    <style>
        body { margin:0; min-height:100vh; display:grid; place-items:center; background:#f8fafc; color:#0f172a; font-family:Inter,Segoe UI,sans-serif; }
        .card { width:min(520px,calc(100vw - 32px)); text-align:center; background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:36px; box-shadow:0 18px 48px rgba(15,23,42,.10); }
        .code { display:grid; place-items:center; width:64px; height:64px; margin:0 auto 18px; border-radius:50%; background:#fee2e2; color:#b91c1c; font-size:22px; font-weight:800; }
        h1 { margin:0 0 10px; font-size:24px; }
        p { margin:0 0 22px; color:#64748b; line-height:1.5; }
        a { display:inline-block; padding:12px 18px; border-radius:8px; background:#0b63d8; color:#fff; text-decoration:none; font-weight:700; }
    </style>
</head>
<body>
    <main class="card">
        <div class="code">403</div>
        <h1>Acesso não autorizado</h1>
        <p>Seu perfil não possui permissão para visualizar esta página ou executar esta operação. Solicite acesso a um administrador.</p>
        <a href="{{ route('siga.dashboard') }}">Voltar ao início</a>
    </main>
</body>
</html>
