@extends('layouts.app')

@section('title', 'Visão Geral · SIGA')

@section('content')
    @php
        $latestLevel = $latestReading?->water_level_cm;
    @endphp

    <div
        class="dashboard"
        id="dashboard"
        data-summary-url="{{ route('siga.dashboard.summary') }}"
        data-chart-url="{{ route('siga.dashboard.chart') }}"
        data-alerts-url="{{ route('siga.dashboard.alerts') }}"
        data-readings-url="{{ route('siga.dashboard.readings') }}"
        data-refresh-ms="8000"
    >
        <section class="metric-grid" aria-label="Indicadores das leituras">
            <article class="metric-card">
                <span class="metric-icon metric-icon-blue" aria-hidden="true">
                    <svg class="icon-svg" viewBox="0 0 24 24"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></svg>
                </span>
                <div>
                    <p>Total de leituras</p>
                    <strong id="metric-total">{{ number_format($summary['total_readings'], 0, ',', '.') }}</strong>
                    <small>Registros recebidos</small>
                </div>
            </article>
            <article class="metric-card">
                <span class="metric-icon metric-icon-green" aria-hidden="true">
                    <svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 1-2.3-5.7L20 7"/><path d="M20 3v4h-4"/></svg>
                </span>
                <div>
                    <p>Leituras hoje</p>
                    <strong id="metric-today">{{ number_format($summary['readings_today'], 0, ',', '.') }}</strong>
                    <small>Desde o início do dia</small>
                </div>
            </article>
            <article class="metric-card">
                <span class="metric-icon metric-icon-purple" aria-hidden="true">
                    <svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 3v10"/><path d="M8 7h8"/><path d="M5 12c0 4 3 7 7 7s7-3 7-7"/><path d="M8 20h8"/></svg>
                </span>
                <div>
                    <p>Nível da água</p>
                    <strong id="metric-water-level">
                        {{ $latestLevel !== null ? number_format($latestLevel, 1, ',', '.') . ' cm' : '--' }}
                    </strong>
                    <small>Última leitura disponível</small>
                </div>
            </article>
            <article class="metric-card">
                <span class="metric-icon {{ $latestReading?->pump_on ? 'metric-icon-amber' : 'metric-icon-muted' }}" aria-hidden="true">
                    <svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/></svg>
                </span>
                <div>
                    <p>Estado da bomba</p>
                    <strong id="metric-pump">
                        {{ $latestReading?->pump_on === null ? 'Sem leitura' : ($latestReading->pump_on ? 'Ligada' : 'Desligada') }}
                    </strong>
                    <small>Estado informado pelo sensor</small>
                </div>
            </article>
        </section>

        <div class="dashboard-grid">
            <div class="dashboard-main-column">
                <section class="panel chart-panel" aria-labelledby="chart-title">
                    <div class="panel-heading">
                        <div>
                            <h2 id="chart-title">Nível da água</h2>
                            <p>Média das leituras registradas · centímetros</p>
                        </div>
                        <label class="period-control">
                            <span class="sr-only">Período do gráfico</span>
                            <select id="chart-period">
                                <option value="24h">Últimas 24 horas</option>
                                <option value="7d">Últimos 7 dias</option>
                                <option value="30d">Últimos 30 dias</option>
                                <option value="12m">Últimos 12 meses</option>
                            </select>
                        </label>
                    </div>
                    <div class="chart-wrap">
                        <canvas id="water-chart" role="img" aria-label="Gráfico do nível médio da água"></canvas>
                        <p class="empty-state" id="chart-empty" hidden>Sem leituras de nível no período selecionado.</p>
                    </div>
                </section>

                <section class="panel map-panel" id="monitoring-map" aria-labelledby="map-title">
                    <div class="panel-heading">
                        <div>
                            <h2 id="map-title">Mapa de monitoramento</h2>
                            <p>As posições aparecem após a geolocalização Wi-Fi dos dispositivos.</p>
                        </div>
                        <span class="map-note" id="dashboard-map-status" role="status">Aguardando localização Wi-Fi</span>
                    </div>
                    <div
                        id="monitoring-map-canvas"
                        class="map-canvas"
                        role="region"
                        aria-label="Mapa de localização Wi-Fi dos dispositivos"
                        data-devices-url="{{ route('siga.map.devices') }}"
                    ></div>
                </section>
            </div>

            <section class="panel events-panel" id="recent-events" aria-labelledby="events-title">
                <div class="panel-heading">
                    <div>
                        <h2 id="events-title">Eventos recentes</h2>
                        <p>Informações observadas nas leituras</p>
                    </div>
                    <span class="event-info-badge">Sem regra de risco configurada</span>
                </div>
                <div class="event-list" id="event-list">
                    @forelse ($recentEvents as $event)
                        <article class="event-item">
                            <span class="event-icon" aria-hidden="true">
                                <svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/></svg>
                            </span>
                            <div class="event-copy">
                                <strong>{{ $event['message'] }}</strong>
                                <p>
                                    {{ $event['water_status'] ?: 'Estado informado pelo sensor; sem classificação de risco.' }}
                                </p>
                                <time datetime="{{ $event['created_at']?->toIso8601String() }}">
                                    {{ $event['created_at']?->format('d/m/Y H:i') }}
                                </time>
                            </div>
                            <span class="status-tag status-info">Informativo</span>
                        </article>
                    @empty
                        <p class="empty-state">Nenhum evento de bomba ligada nas últimas 24 horas.</p>
                    @endforelse
                </div>
                <p class="panel-footnote">Os dados atuais não incluem limites técnicos para alertas de alagamento.</p>
            </section>
        </div>

        <section class="panel readings-panel" id="readings" aria-labelledby="readings-title">
            <div class="panel-heading">
                <div>
                    <h2 id="readings-title">Leituras recentes</h2>
                    <p>Registros da tabela de monitoramento · sem cadastro individual de dispositivos</p>
                </div>
                <div class="table-actions">
                    <label class="period-control">
                        <span class="sr-only">Registros por página</span>
                        <select id="readings-per-page">
                            <option value="10">10 por página</option>
                            <option value="25">25 por página</option>
                            <option value="50">50 por página</option>
                        </select>
                    </label>
                    <a class="text-link" href="{{ route('siga.readings') }}">Ver leituras</a>
                </div>
            </div>
            <div class="table-scroll">
                <table class="readings-table">
                    <thead>
                        <tr>
                            <th>Data e hora</th>
                            <th>Nível da água</th>
                            <th>Chuva (digital)</th>
                            <th>Situação informada</th>
                            <th>Bomba</th>
                            <th>Origem</th>
                        </tr>
                    </thead>
                    <tbody id="readings-body">
                        @forelse ($sensorData as $reading)
                            <tr>
                                <td>{{ $reading->created_at?->format('d/m/Y H:i:s') ?? '--' }}</td>
                                <td>{{ $reading->water_level_cm !== null ? number_format($reading->water_level_cm, 1, ',', '.') . ' cm' : '--' }}</td>
                                <td>{{ $reading->rain_sensor_raw ?? '--' }}</td>
                                <td>{{ $reading->water_status ?? '--' }}</td>
                                <td>
                                    @if ($reading->pump_on === null)
                                        --
                                    @else
                                        <span class="status-tag {{ $reading->pump_on ? 'status-warning' : 'status-neutral' }}">
                                            {{ $reading->pump_on ? 'Ligada' : 'Desligada' }}
                                        </span>
                                    @endif
                                </td>
                                <td>{{ $reading->simulation ? 'Simulação' : 'Real' }}</td>
                            </tr>
                        @empty
                            <tr><td class="table-empty" colspan="6">Nenhuma leitura encontrada no banco de dados.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            <div class="table-footer">
                <span id="readings-count">
                    @if ($sensorData->total() === 0)
                        Nenhuma leitura
                    @else
                        Exibindo {{ $sensorData->firstItem() }}–{{ $sensorData->lastItem() }} de {{ $sensorData->total() }} leituras
                    @endif
                </span>
                <nav class="pagination" id="readings-pagination" aria-label="Paginação das leituras">
                    <button type="button" data-page="{{ max(1, $sensorData->currentPage() - 1) }}" @disabled($sensorData->currentPage() <= 1) aria-label="Página anterior">‹</button>
                    <span id="current-page">{{ $sensorData->currentPage() }}</span>
                    <button type="button" data-page="{{ min($sensorData->lastPage() ?: 1, $sensorData->currentPage() + 1) }}" @disabled($sensorData->currentPage() >= $sensorData->lastPage()) aria-label="Próxima página">›</button>
                </nav>
            </div>
        </section>

        <div class="dashboard-status" role="status" aria-live="polite">
            <span class="connection-dot"></span>
            <span id="refresh-status">Atualização automática a cada 8 segundos</span>
        </div>

        <script type="application/json" id="initial-chart-data">@json($chartData)</script>
    </div>
@endsection
