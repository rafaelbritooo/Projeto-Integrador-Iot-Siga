@extends('layouts.app')

@section('content')

@php
    $nivelAgua = $latestReading?->water_level_cm;
    $sensorChuva = $latestReading?->rain_sensor_raw;
    $situacao = $latestReading?->water_status;
    $bombaLigada = $latestReading?->pump_on;
@endphp

<div class="dashboard-container">

    <h2>Visão Geral</h2>
    <p>Monitoramento em tempo real das condições de alagamento.</p>

    {{-- Indicadores --}}
    <div class="dashboard-cards">

        <div class="dashboard-card">
            <span>Nível da Água</span>
            <h2>
                {{ $nivelAgua !== null ? number_format($nivelAgua, 1, ',', '.') . ' cm' : '--' }}
            </h2>
        </div>

        <div class="dashboard-card">
            <span>Sensor de Chuva (valor bruto)</span>
            <h2>
                {{ $sensorChuva !== null ? $sensorChuva : '--' }}
            </h2>
        </div>

        <div class="dashboard-card">
            <span>Situação da Água</span>
            <h2>
                {{ $situacao ?? 'Sem leitura' }}
            </h2>
        </div>

        <div class="dashboard-card">
            <span>Estado da Bomba</span>
            <h2>
                {{ $bombaLigada === null ? 'Sem leitura' : ($bombaLigada ? 'Ligada' : 'Desligada') }}
            </h2>
        </div>

    </div>

    {{-- Últimas leituras --}}
    <div class="dashboard-table">

        <h3>Últimas Leituras dos Sensores</h3>

        <table>
            <thead>
                <tr>
                    <th>Data e Hora</th>
                    <th>Nível da Água</th>
                    <th>Sensor de Chuva</th>
                    <th>Situação</th>
                    <th>Bomba</th>
                    <th>Origem</th>
                </tr>
            </thead>

            <tbody>
                @forelse ($sensorData as $reading)
                    <tr>
                        <td>
                            {{ $reading->created_at?->format('d/m/Y H:i:s') ?? '--' }}
                        </td>

                        <td>
                            {{ $reading->water_level_cm !== null
                                ? number_format($reading->water_level_cm, 1, ',', '.') . ' cm'
                                : '--' }}
                        </td>

                        <td>
                            {{ $reading->rain_sensor_raw ?? '--' }}
                        </td>

                        <td>
                            {{ $reading->water_status ?? '--' }}
                        </td>

                        <td>
                            {{ $reading->pump_on === null
                                ? '--'
                                : ($reading->pump_on ? 'Ligada' : 'Desligada') }}
                        </td>

                        <td>
                            {{ $reading->simulation ? 'Simulação' : 'Real' }}
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6">
                            Nenhuma leitura encontrada no banco de dados.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>

    </div>

</div>

@endsection