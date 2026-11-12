@extends('layouts.app')

@section('title', 'Notificações · SIGA')
@section('page-title', 'Notificações')
@section('page-description', 'Registros observáveis nas leituras recebidas, sem estimativas de risco.')

@section('content')
    <div class="page-stack">
        <section class="notification-summary">
            <div>
                <strong>{{ number_format($notificationCount, 0, ',', '.') }}</strong>
                <span>leituras encontradas</span>
            </div>
            <p>O banco ainda não possui uma tabela própria de alertas. Esta lista exibe somente registros reais com a bomba informada como ligada.</p>
        </section>

        <section class="panel">
            <form class="filter-form notification-filters" method="GET" action="{{ route('siga.notifications') }}">
                <label>
                    <span>Tipo de registro</span>
                    <select name="type">
                        <option value="all" @selected($type === 'all')>Todos os registros disponíveis</option>
                        <option value="pump_on" @selected($type === 'pump_on')>Leituras com bomba ligada</option>
                    </select>
                </label>
                <label>
                    <span>Período</span>
                    <select name="period">
                        <option value="24h" @selected($period === '24h')>Últimas 24 horas</option>
                        <option value="7d" @selected($period === '7d')>Últimos 7 dias</option>
                        <option value="30d" @selected($period === '30d')>Últimos 30 dias</option>
                        <option value="all" @selected($period === 'all')>Todo o período</option>
                    </select>
                </label>
                <div class="filter-actions">
                    <button class="primary-button" type="submit">Aplicar filtros</button>
                    <a class="text-link" href="{{ route('siga.notifications') }}">Limpar</a>
                </div>
            </form>
        </section>

        <section class="panel">
            <div class="panel-heading">
                <div>
                    <h2>Leituras com bomba ligada</h2>
                    <p>“Informativo” descreve a ocorrência observada; não representa alerta ou risco de alagamento.</p>
                </div>
            </div>
            <div class="notification-list">
                @forelse ($notifications as $notification)
                    <article class="notification-item">
                        <span class="notification-icon" aria-hidden="true">◉</span>
                        <div class="notification-copy">
                            <div class="notification-title">
                                <h3>Bomba informada como ligada</h3>
                                <span class="status-tag status-info">Informativo</span>
                            </div>
                            <p>
                                Estado enviado pelo sensor: <strong>{{ $notification->water_status ?? 'não informado' }}</strong>.
                                Nenhuma regra de severidade está configurada.
                            </p>
                            <time datetime="{{ $notification->created_at?->toIso8601String() }}">
                                {{ $notification->created_at?->format('d/m/Y H:i:s') ?? 'Horário indisponível' }}
                            </time>
                            <details>
                                <summary>Ver detalhes da leitura #{{ $notification->id }}</summary>
                                <dl class="detail-grid">
                                    <div><dt>ID da leitura</dt><dd>{{ $notification->id }}</dd></div>
                                    <div><dt>Nível da água</dt><dd>{{ $notification->water_level_cm !== null ? number_format($notification->water_level_cm, 1, ',', '.') . ' cm' : '--' }}</dd></div>
                                    <div><dt>Origem</dt><dd>{{ $notification->simulation ? 'Simulação' : 'Real' }}</dd></div>
                                </dl>
                            </details>
                        </div>
                    </article>
                @empty
                    <div class="empty-panel">
                        <span aria-hidden="true">♧</span>
                        <h3>Nenhuma notificação encontrada</h3>
                        <p>Não há eventos de bomba ligada para o período e filtros selecionados.</p>
                    </div>
                @endforelse
            </div>
            @if ($notifications->hasPages())
                <div class="table-footer notification-pagination">
                    <span>
                        Exibindo {{ $notifications->firstItem() }}–{{ $notifications->lastItem() }}
                        de {{ $notifications->total() }} leituras
                    </span>
                    <div class="pagination-links">
                        @if ($notifications->onFirstPage())
                            <span class="pagination-disabled">Anterior</span>
                        @else
                            <a href="{{ $notifications->previousPageUrl() }}">Anterior</a>
                        @endif
                        <span>Página {{ $notifications->currentPage() }} de {{ $notifications->lastPage() }}</span>
                        @if ($notifications->hasMorePages())
                            <a href="{{ $notifications->nextPageUrl() }}">Próxima</a>
                        @else
                            <span class="pagination-disabled">Próxima</span>
                        @endif
                    </div>
                </div>
            @endif
        </section>
    </div>
@endsection
