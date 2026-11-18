@extends('layouts.app')

@section('title', 'Mapa de monitoramento · SIGA')
@section('page-title', 'Mapa de monitoramento')
@section('page-description', 'Posições estimadas exclusivamente pelas redes Wi-Fi detectadas pelos dispositivos.')

@section('content')
    <div class="page-stack">
        <section class="panel map-page-panel">
            <div class="panel-heading">
                <div>
                    <h2>Localização dos dispositivos</h2>
                    <p>As posições e os raios de precisão são estimativas baseadas em redes Wi-Fi, não pontos exatos.</p>
                </div>
                <span class="status-tag status-neutral" id="map-device-count">Aguardando dispositivos</span>
            </div>
            <div
                class="map-canvas map-canvas-large"
                id="full-map-canvas"
                role="region"
                aria-label="Mapa interativo das localizações Wi-Fi estimadas dos dispositivos"
                data-data-url="{{ route('siga.map.devices') }}"
                data-refresh-ms="10000"
            ></div>
            <div class="map-page-footer">
                <div class="map-legend" aria-label="Legenda">
                    <strong>Legenda</strong>
                    <span><i class="legend-dot legend-device"></i>Dispositivo localizado por Wi-Fi</span>
                    <span><i class="legend-dot legend-accuracy"></i>Raio estimado de precisão</span>
                    <span><i class="legend-dot legend-blue"></i>Marcador não representa nível de risco</span>
                </div>
                <p id="map-refresh-status" role="status" aria-live="polite">
                    Aguardando a primeira atualização dos dispositivos.
                </p>
            </div>
        </section>

        <section class="panel">
            <div class="panel-heading">
                <div>
                    <h2>Estado dos dispositivos</h2>
                    <p>Dispositivos sem coordenadas permanecem nesta lista e não recebem marcadores.</p>
                </div>
            </div>
            <div id="map-device-status-list" class="map-device-status-list" aria-live="polite">
                <p class="empty-state">Carregando dispositivos...</p>
            </div>
        </section>

        <section class="panel map-reading-summary">
            <div class="panel-heading">
                <div>
                    <h2>Última leitura disponível</h2>
                    <p>Informação da tabela sensor_data; sem localização associada.</p>
                </div>
                <a class="text-link" href="{{ route('siga.readings') }}">Consultar leituras</a>
            </div>
            @if ($latestReading)
                <dl class="reading-summary-grid">
                    <div><dt>Nível da água</dt><dd>{{ $latestReading->water_level_cm !== null ? number_format($latestReading->water_level_cm, 1, ',', '.') . ' cm' : '--' }}</dd></div>
                    <div><dt>Situação informada</dt><dd>{{ $latestReading->water_status ?? '--' }}</dd></div>
                    <div><dt>Bomba</dt><dd>{{ $latestReading->pump_on === null ? '--' : ($latestReading->pump_on ? 'Ligada' : 'Desligada') }}</dd></div>
                    <div><dt>Horário</dt><dd>{{ $latestReading->created_at?->format('d/m/Y H:i:s') ?? '--' }}</dd></div>
                </dl>
            @else
                <p class="empty-state">Nenhuma leitura encontrada no banco de dados.</p>
            @endif
        </section>
    </div>
@endsection
