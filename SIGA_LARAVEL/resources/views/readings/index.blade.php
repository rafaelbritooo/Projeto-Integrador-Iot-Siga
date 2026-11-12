@extends('layouts.app')

@section('title', 'Leituras dos sensores · SIGA')
@section('page-title', 'Leituras')
@section('page-description', 'Histórico paginado dos dados recebidos dos sensores.')

@section('content')
    <div
        class="page-stack"
        id="reading-page"
        data-refresh-ms="10000"
        data-refresh-url="{{ route('siga.readings', request()->query()) }}"
    >
        <section class="reading-summary-strip">
            <div><strong>{{ number_format($readings->total(), 0, ',', '.') }}</strong><span>leituras encontradas</span></div>
            <div><strong>{{ $readings->total() > 0 ? $readings->lastPage() : 0 }}</strong><span>páginas</span></div>
            <span class="live-indicator"><i></i> Atualização automática a cada 10 segundos</span>
        </section>

        <section class="panel">
            <form class="filter-form reading-filters" method="GET" action="{{ route('siga.readings') }}">
                <label class="search-filter">
                    <span>Pesquisar</span>
                    <input type="search" name="q" value="{{ $filters['q'] }}" maxlength="100" placeholder="ID, chuva, nível ou situação">
                </label>
                <label>
                    <span>De</span>
                    <input type="date" name="start_date" value="{{ $filters['start_date'] }}">
                </label>
                <label>
                    <span>Até</span>
                    <input type="date" name="end_date" value="{{ $filters['end_date'] }}">
                </label>
                <label>
                    <span>Situação</span>
                    <select name="status">
                        <option value="">Todas</option>
                        @foreach ($statuses as $status)
                            <option value="{{ $status }}" @selected($filters['status'] === $status)>{{ $status }}</option>
                        @endforeach
                    </select>
                </label>
                <label>
                    <span>Origem</span>
                    <select name="source">
                        <option value="all" @selected($filters['source'] === 'all')>Todas</option>
                        <option value="real" @selected($filters['source'] === 'real')>Real</option>
                        <option value="simulation" @selected($filters['source'] === 'simulation')>Simulação</option>
                    </select>
                </label>
                <label>
                    <span>Ordenação</span>
                    <select name="sort">
                        <option value="newest" @selected($filters['sort'] === 'newest')>Mais recentes</option>
                        <option value="oldest" @selected($filters['sort'] === 'oldest')>Mais antigas</option>
                    </select>
                </label>
                <label>
                    <span>Por página</span>
                    <select name="per_page">
                        @foreach ([10, 25, 50] as $pageSize)
                            <option value="{{ $pageSize }}" @selected((int) $filters['per_page'] === $pageSize)>{{ $pageSize }}</option>
                        @endforeach
                    </select>
                </label>
                <div class="filter-actions">
                    <button class="primary-button" type="submit">Filtrar</button>
                    <a class="text-link" href="{{ route('siga.readings') }}">Limpar</a>
                </div>
            </form>
        </section>

        <section class="panel readings-page-panel">
            <div class="panel-heading">
                <div>
                    <h2>Histórico de leituras</h2>
                    <p>Resultados consultados diretamente da tabela sensor_data.</p>
                </div>
            </div>
            <div class="table-scroll">
                <table class="readings-table">
                    <thead>
                        <tr>
                            <th>Data e hora</th>
                            <th>Nível da água</th>
                            <th>Chuva (valor bruto)</th>
                            <th>Situação informada</th>
                            <th>Bomba</th>
                            <th>Origem</th>
                            <th>Detalhes</th>
                        </tr>
                    </thead>
                    <tbody id="reading-table-body">
                        @forelse ($readings as $reading)
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
                                <td><span class="status-tag {{ $reading->simulation ? 'status-info' : 'status-neutral' }}">{{ $reading->simulation ? 'Simulação' : 'Real' }}</span></td>
                                <td>
                                    <details class="reading-details">
                                        <summary>Detalhes</summary>
                                        <dl class="detail-grid">
                                            <div><dt>ID</dt><dd>{{ $reading->id }}</dd></div>
                                            <div><dt>Timestamp</dt><dd>{{ $reading->created_at?->toIso8601String() ?? '--' }}</dd></div>
                                            <div><dt>Estado da bomba</dt><dd>{{ $reading->pump_on === null ? '--' : ($reading->pump_on ? 'Ligada' : 'Desligada') }}</dd></div>
                                            <div><dt>Simulação</dt><dd>{{ $reading->simulation ? 'Sim' : 'Não' }}</dd></div>
                                        </dl>
                                    </details>
                                </td>
                            </tr>
                        @empty
                            <tr><td class="table-empty" colspan="7">Nenhuma leitura encontrada para os filtros selecionados.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            <div class="table-footer">
                <span id="reading-results-count">
                    @if ($readings->total() === 0)
                        Nenhuma leitura
                    @else
                        Exibindo {{ $readings->firstItem() }}–{{ $readings->lastItem() }} de {{ $readings->total() }} leituras
                    @endif
                </span>
                <nav class="pagination-links" id="reading-pagination" aria-label="Paginação das leituras">
                    <span data-page-link="previous">
                        @if ($readings->onFirstPage())
                            <span class="pagination-disabled">Anterior</span>
                        @else
                            <a href="{{ $readings->previousPageUrl() }}">Anterior</a>
                        @endif
                    </span>
                    <span data-page-number>Página {{ $readings->currentPage() }} de {{ max(1, $readings->lastPage()) }}</span>
                    <span data-page-link="next">
                        @if ($readings->hasMorePages())
                            <a href="{{ $readings->nextPageUrl() }}">Próxima</a>
                        @else
                            <span class="pagination-disabled">Próxima</span>
                        @endif
                    </span>
                </nav>
            </div>
        </section>
        <p class="page-refresh-status" id="reading-refresh-status" role="status" aria-live="polite"></p>
    </div>
@endsection
