<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'SIGA - Monitoramento')</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root{--blue:#0b63d8;--navy:#0f2747;--green:#13b866;--red:#ff3838;--amber:#f5a900;--bg:#f8fafc;--card:#fff;--border:#e2e8f0;--muted:#64748b}
        *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--navy);font-family:Inter,Arial,sans-serif}
        .siga-shell{min-height:100vh;display:flex}.siga-sidebar{width:272px;flex:0 0 272px;background:#fff;border-right:1px solid var(--border);padding:30px 20px;display:flex;flex-direction:column}
        .siga-brand{display:block;padding:0 8px 35px;text-decoration:none}.siga-brand-logo{display:block;width:100%;height:auto;max-height:70px;object-fit:contain;object-position:left center}
        .siga-nav{display:grid;gap:8px}.siga-nav a{display:flex;align-items:center;gap:14px;padding:15px 14px;border-radius:11px;color:var(--navy);font-size:14px;text-decoration:none;font-weight:500}.siga-nav a:hover{background:#eef5ff}.siga-nav a.active{background:var(--blue);color:#fff;box-shadow:0 5px 14px #0b63d82b}.siga-nav .icon{width:20px;text-align:center;font-size:18px}
        .siga-user{margin-top:auto;border:1px solid var(--border);border-radius:14px;padding:14px;display:flex;gap:10px;align-items:center}.siga-avatar{width:42px;height:42px;border-radius:50%;background:var(--navy);color:#fff;display:grid;place-items:center;font-weight:700}.siga-user strong{display:block;font-size:13px}.siga-user small{display:block;color:var(--muted);font-size:11px;margin-top:3px}.siga-online{color:var(--green)!important}
        .siga-main{min-width:0;flex:1}.siga-header{height:92px;background:#fff;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 32px}.siga-header h1{font-size:22px;margin:0}.siga-header p{font-size:12px;color:var(--muted);margin:5px 0 0}.siga-status{color:var(--green);font-size:12px;font-weight:600}.siga-content{padding:28px;max-width:1600px;margin:auto}.siga-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}.siga-card{background:var(--card);border:1px solid var(--border);border-radius:16px;box-shadow:0 2px 8px #0f27470d}.siga-kpi{padding:20px;display:flex;align-items:center;gap:16px}.siga-kpi .circle{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;font-size:22px;background:#ebf3ff}.siga-kpi label{display:block;font-size:12px;color:var(--muted)}.siga-kpi strong{display:block;font-size:28px;margin:3px 0}.siga-kpi small{color:var(--green);font-size:11px;font-weight:600}.siga-columns{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(300px,.8fr);gap:20px;margin-top:20px}.siga-card-head{padding:18px 20px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}.siga-card-head h2{font-size:16px;margin:0}.siga-card-body{padding:20px}.siga-table{width:100%;border-collapse:collapse;font-size:12px}.siga-table th{text-align:left;color:var(--muted);font-size:10px;letter-spacing:.05em;padding:12px;border-bottom:1px solid var(--border)}.siga-table td{padding:14px 12px;border-bottom:1px solid #f1f5f9}.siga-badge{display:inline-block;border-radius:20px;padding:4px 9px;font-size:10px;font-weight:700}.siga-badge.green{background:#e8f8ef;color:var(--green)}.siga-badge.red{background:#fff4f4;color:var(--red)}.siga-alert{padding:15px;border-bottom:1px solid var(--border)}.siga-alert:last-child{border-bottom:0}.siga-alert strong{display:block;font-size:13px}.siga-alert p{color:var(--muted);font-size:11px;line-height:1.5;margin:6px 0}.siga-link{color:var(--blue);font-size:12px;text-decoration:none;font-weight:600}.siga-responsive{overflow-x:auto}@media(max-width:1050px){.siga-sidebar{width:220px;flex-basis:220px}.siga-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:720px){.siga-sidebar{display:none}.siga-header{padding:0 18px}.siga-content{padding:18px}.siga-grid,.siga-columns{grid-template-columns:1fr}}
        .container{width:100%;max-width:1200px;margin:0 auto}.row{display:flex;flex-wrap:wrap;gap:20px}.row>[class*="col-"]{flex:1 1 280px}.card{background:var(--card);border:1px solid var(--border);border-radius:16px;box-shadow:0 2px 8px #0f27470d}.table{width:100%;border-collapse:collapse}.table th,.table td{padding:12px;border-bottom:1px solid var(--border);text-align:left}.text-center{text-align:center}.text-primary{color:var(--blue)!important}.form-control{width:100%;border:1px solid var(--border);border-radius:8px;padding:10px;font:inherit}.btn{border:0;border-radius:8px;padding:10px 16px;background:var(--blue);color:#fff;font-weight:600;cursor:pointer}.shadow-sm,.shadow-lg{box-shadow:0 2px 8px #0f27470d!important}
    </style>
</head>
<body>
<div class="siga-shell">
    <aside class="siga-sidebar">
        <a class="siga-brand" href="{{ route('sensor.dashboard') }}" aria-label="SIGA - início">
            <img class="siga-brand-logo" src="{{ asset('images/siga-logo.png') }}" alt="SIGA - Sistema Inteligente de Gestão de Alagamentos">
        </a>
        <nav class="siga-nav" aria-label="Navegação principal">
            <a class="{{ request()->routeIs('sensor.dashboard') ? 'active' : '' }}" href="{{ route('sensor.dashboard') }}"><span class="icon">⌂</span>Início</a>
            <a href="{{ route('weather.map') }}"><span class="icon">⌖</span>Mapa</a>
            <a href="{{ route('sensor.historico') }}"><span class="icon">♢</span>Notificações</a>
            <a href="{{ route('sensor.tabela') }}"><span class="icon">▣</span>Dispositivos</a>
        </nav>
        <div class="siga-user">
            <div class="siga-avatar">{{ strtoupper(substr(auth()->user()->name, 0, 2)) }}</div>
            <div><strong>{{ auth()->user()->name }}</strong><small>{{ auth()->user()->email }}</small><small class="siga-online">● Online</small></div>
            <form method="POST" action="{{ route('logout') }}" style="margin-left:auto">
                @csrf
                <button type="submit" aria-label="Sair" title="Sair" style="border:0;background:transparent;color:var(--muted);cursor:pointer;font-size:16px">↪</button>
            </form>
        </div>
    </aside>
    <section class="siga-main">
        <header class="siga-header">
            <div><h1>@yield('heading', 'Visão Geral')</h1><p>@yield('subtitle', 'Monitoramento em tempo real das condições de alagamento.')</p></div>
            <span class="siga-status">● Monitoramento ativo</span>
        </header>
        <main class="siga-content">@yield('content')</main>
    </section>
</div>
@yield('scripts')
</body>
</html>
