<aside class="siga-sidebar" id="siga-sidebar" aria-label="Navegação principal">
    <a class="brand" href="{{ route('siga.dashboard') }}" aria-label="SIGA, início">
        <img src="{{ Vite::asset('resources/js/siga/assets/siga-logo-1.png') }}" alt="SIGA">
    </a>

    <nav class="sidebar-nav">
        <a class="nav-link {{ request()->routeIs('siga.dashboard') ? 'is-active' : '' }}" href="{{ route('siga.dashboard') }}" @if (request()->routeIs('siga.dashboard')) aria-current="page" @endif>
            <span class="nav-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9h13v-9M9.5 19v-5h5v5"/></svg>
            </span><span>Início</span>
        </a>
        <a class="nav-link {{ request()->routeIs('siga.map') ? 'is-active' : '' }}" href="{{ route('siga.map') }}" @if (request()->routeIs('siga.map')) aria-current="page" @endif>
            <span class="nav-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="m3 6 5-2 8 3 5-2v13l-5 2-8-3-5 2Z"/><path d="M8 4v13M16 7v13"/></svg>
            </span><span>Mapa</span>
        </a>
        <a class="nav-link {{ request()->routeIs('siga.notifications') ? 'is-active' : '' }}" href="{{ route('siga.notifications') }}" @if (request()->routeIs('siga.notifications')) aria-current="page" @endif>
            <span class="nav-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/></svg>
            </span><span>Notificações</span>
        </a>
        <a class="nav-link {{ request()->routeIs('siga.readings') ? 'is-active' : '' }}" href="{{ route('siga.readings') }}" @if (request()->routeIs('siga.readings')) aria-current="page" @endif>
            <span class="nav-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/><path d="M4 9h2M10 5h2M16 12h2"/></svg>
            </span><span>Leituras</span>
        </a>
        @php($sigaUsuario = session('siga_usuario_id') ? \App\Models\Usuario::with('perfil')->find(session('siga_usuario_id')) : null)
        @if ($sigaUsuario?->hasPermission('domain.manage'))
            <a class="nav-link {{ request()->routeIs('siga.domain.*') ? 'is-active' : '' }}" href="{{ route('siga.domain.index') }}" @if (request()->routeIs('siga.domain.*')) aria-current="page" @endif>
                <span class="nav-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2H12V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L7.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 6 14H5.8v-2.5H6a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1A1.7 1.7 0 0 0 11 7.1a1.7 1.7 0 0 0 1-1.6v-.2h2.5v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2V14h-.2a1.7 1.7 0 0 0-1.1 1Z"/></svg>
                </span><span>Cadastro</span>
            </a>
        @endif
    </nav>

    <div class="sidebar-footer">
        <span class="avatar" aria-hidden="true">SG</span>
        <span class="sidebar-profile">
            @php($sigaUsuario = session('siga_usuario_id') ? \App\Models\Usuario::with(['orgao','perfil'])->find(session('siga_usuario_id')) : null)
            @if ($sigaUsuario)
                <strong>{{ $sigaUsuario->nome }}</strong>
                <small>{{ $sigaUsuario->perfil?->nome }} · {{ $sigaUsuario->orgao?->nome }}</small>
                <form method="POST" action="{{ route('logout') }}" style="margin-top:8px">
                    @csrf
                    <button type="submit" class="nav-link" style="width:100%;border:0;background:transparent;cursor:pointer">Sair</button>
                </form>
            @else
                <strong>Monitoramento</strong>
                <small>SIGA · Crajubar, CE</small>
                <a href="{{ route('login') }}" class="nav-link" style="margin-top:8px">Entrar</a>
            @endif
        </span>
    </div>
</aside>
