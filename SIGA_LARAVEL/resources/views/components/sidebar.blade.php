<aside class="siga-sidebar" id="siga-sidebar" aria-label="Navegação principal">
    <a class="brand" href="{{ route('siga.dashboard') }}" aria-label="SIGA, início">
        <img src="{{ Vite::asset('resources/js/siga/assets/siga-logo-1.png') }}" alt="SIGA">
    </a>

    <nav class="sidebar-nav">
        <a class="nav-link {{ request()->routeIs('siga.dashboard') ? 'is-active' : '' }}" href="{{ route('siga.dashboard') }}" @if (request()->routeIs('siga.dashboard')) aria-current="page" @endif>
            <span class="nav-icon" aria-hidden="true">⌂</span><span>Início</span>
        </a>
        <a class="nav-link {{ request()->routeIs('siga.map') ? 'is-active' : '' }}" href="{{ route('siga.map') }}" @if (request()->routeIs('siga.map')) aria-current="page" @endif>
            <span class="nav-icon" aria-hidden="true">⌖</span><span>Mapa</span>
        </a>
        <a class="nav-link {{ request()->routeIs('siga.notifications') ? 'is-active' : '' }}" href="{{ route('siga.notifications') }}" @if (request()->routeIs('siga.notifications')) aria-current="page" @endif>
            <span class="nav-icon" aria-hidden="true">♧</span><span>Notificações</span>
        </a>
        <a class="nav-link {{ request()->routeIs('siga.readings') ? 'is-active' : '' }}" href="{{ route('siga.readings') }}" @if (request()->routeIs('siga.readings')) aria-current="page" @endif>
            <span class="nav-icon" aria-hidden="true">▤</span><span>Leituras</span>
        </a>
    </nav>

    <div class="sidebar-footer">
        <span class="avatar" aria-hidden="true">SG</span>
        <span class="sidebar-profile">
            <strong>Monitoramento</strong>
            <small>SIGA · Crajubar, CE</small>
        </span>
    </div>
</aside>
