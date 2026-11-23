<header class="siga-header">
    <button class="icon-button sidebar-toggle" id="sidebar-toggle" type="button" aria-label="Recolher menu" aria-expanded="true">
        <svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
    </button>

    <div class="page-heading">
        <h1>@yield('page-title', 'Visão Geral')</h1>
        <p>@yield('page-description', 'Monitoramento em tempo real das condições de alagamento.')</p>
    </div>

    <div class="header-actions">
        <span class="location-chip">
            <svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
            Crajubar · CE
        </span>
        <a class="icon-button notification-button" href="{{ route('siga.notifications') }}" aria-label="Ver notificações">
            <svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/></svg>
        </a>
        <button class="icon-button" id="theme-toggle" type="button" aria-label="Alternar tema">
            <svg class="icon-svg" id="theme-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/></svg>
        </button>
    </div>
</header>
