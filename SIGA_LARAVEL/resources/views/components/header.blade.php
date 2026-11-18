<header class="siga-header">
    <button class="icon-button sidebar-toggle" id="sidebar-toggle" type="button" aria-label="Recolher menu" aria-expanded="true">
        <span aria-hidden="true">☰</span>
    </button>

    <div class="page-heading">
        <h1>@yield('page-title', 'Visão Geral')</h1>
        <p>@yield('page-description', 'Monitoramento em tempo real das condições de alagamento.')</p>
    </div>

    <div class="header-actions">
        <span class="location-chip"><span aria-hidden="true">⌖</span> Crajubar · CE</span>
        <a class="icon-button notification-button" href="{{ route('siga.notifications') }}" aria-label="Ver notificações">
            <span aria-hidden="true">♧</span>
        </a>
        <button class="icon-button" id="theme-toggle" type="button" aria-label="Alternar tema">
            <span id="theme-icon" aria-hidden="true">◐</span>
        </button>
    </div>
</header>
