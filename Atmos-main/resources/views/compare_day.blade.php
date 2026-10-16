@extends('layouts.app')

@section('content')
<div class="container py-5">
    <h2 class="mb-5 text-center fw-bold text-primary">📈 Comparação de Leituras - Atmostech</h2>

    <!-- Filtros de mês -->
    <div class="row justify-content-center mb-4 g-2">
        <form method="GET" action="{{ url('/comparar') }}" class="d-flex justify-content-center align-items-center flex-wrap">
            <label class="me-2 fw-bold" for="month_sensor">Mês ATMOSTECH:</label>
            <select name="month_sensor" id="month_sensor" class="form-select me-3 mb-2">
                @for ($m = 1; $m <= 12; $m++)
                    <option value="{{ $m }}" {{ $m == $monthSensor ? 'selected' : '' }}>
                        {{ \Carbon\Carbon::create()->month($m)->locale('pt_BR')->monthName }}
                    </option>
                @endfor
            </select>

            <label class="me-2 fw-bold" for="month_inmet">Mês INMET:</label>
            <select name="month_inmet" id="month_inmet" class="form-select me-3 mb-2">
                @for ($m = 1; $m <= 12; $m++)
                    <option value="{{ $m }}" {{ $m == $monthInmet ? 'selected' : '' }}>
                        {{ \Carbon\Carbon::create()->month($m)->locale('pt_BR')->monthName }}
                    </option>
                @endfor
            </select>

            <button type="submit" class="btn btn-primary mb-2">Filtrar</button>
        </form>
    </div>

    <!-- Seleção de sensores Atmostech -->
    <div class="mb-4">
        <h5 class="fw-bold">Selecione os sensores para Atmostech:</h5>
        <div class="d-flex flex-wrap">
            @foreach (['temperature' => 'Temperatura', 'humidity' => 'Umidade', 'luminosity' => 'Luminosidade', 'rain' => 'Chuva'] as $key => $label)
                <div class="form-check me-3 mb-2">
                    <input class="form-check-input sensorCheckbox" type="checkbox" value="{{ $key }}" id="sensor_{{ $key }}" checked>
                    <label class="form-check-label" for="sensor_{{ $key }}">{{ $label }}</label>
                </div>
            @endforeach
        </div>
    </div>

    <h4 class="mb-3 fw-bold text-center text-secondary">🌡️ Atmostech</h4>
    <div class="card shadow-sm p-3 mb-5">
        <canvas id="sensorChart" height="250"></canvas>
    </div>

    <!-- Seleção de sensores INMET -->
    <div class="mb-4">
        <h5 class="fw-bold">Selecione os sensores para INMET:</h5>
        <div class="d-flex flex-wrap">
            @foreach (['temp_instantanea' => 'Temperatura', 'umi_instantanea' => 'Umidade', 'radiacao' => 'Luminosidade', 'chuva' => 'Chuva'] as $key => $label)
                <div class="form-check me-3 mb-2">
                    <input class="form-check-input inmetCheckbox" type="checkbox" value="{{ $key }}" id="inmet_{{ $key }}" checked>
                    <label class="form-check-label" for="inmet_{{ $key }}">{{ $label }}</label>
                </div>
            @endforeach
        </div>
    </div>

    <h4 class="mb-3 fw-bold text-center text-secondary">📊 INMET</h4>
    <div class="card shadow-sm p-3 mb-5">
        <canvas id="inmetChart" height="250"></canvas>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

<script>
const sensorData = @json($sensorData);
const inmetData = @json($inmetData);

const camposSensor = {
    'temperature': ['Temperatura', '#FF6B6B', '°C'],
    'humidity': ['Umidade', '#4D9EFF', '%'],
    'luminosity': ['Luminosidade', '#FFD166', 'lx'],
    'rain': ['Chuva', '#00BFFF', 'mm']
};

const camposInmet = {
    'temp_instantanea': ['Temperatura', '#FF9E9E', '°C'],
    'umi_instantanea': ['Umidade', '#80BFFF', '%'],
    'radiacao': ['Luminosidade', '#FFE699', 'lx'],
    'chuva': ['Chuva', '#33CFFF', 'mm']
};

function criarGrafico(canvasId, data, campos, checkboxesClass){
    const selectedKeys = $(checkboxesClass + ':checked').map((_, el) => el.value).get();
    const labels = data.map(item => item.created_at ? item.created_at.substring(0,10) : (item.data+' '+item.hora).substring(0,10));

    const datasets = selectedKeys.map(key => ({
        label: campos[key][0],
        data: labels.map(label => {
            const d = data.find(item => (item.created_at || (item.data+' '+item.hora)).substring(0,10) === label);
            return d ? d[key] ?? 0 : null;
        }),
        borderColor: campos[key][1],
        backgroundColor: campos[key][1]+'44',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7
    }));

    return new Chart(document.getElementById(canvasId).getContext('2d'), {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            interaction: { mode: 'nearest', axis: 'x', intersect: false },
            plugins: {
                legend: { position: 'top', labels: { boxWidth: 20, padding: 10 } },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const unit = campos[Object.keys(campos).find(k => campos[k][0] === context.dataset.label)]?.[2] || '';
                            return context.dataset.label + ': ' + value + ' ' + unit;
                        }
                    }
                }
            },
            scales: {
                x: { display: true, title: { display: true, text: 'Data' }, grid: { color: 'rgba(0,0,0,0.05)' } },
                y: { display: true, beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }
            }
        }
    });
}

let sensorChart = criarGrafico('sensorChart', sensorData, camposSensor, '.sensorCheckbox');
let inmetChart = criarGrafico('inmetChart', inmetData, camposInmet, '.inmetCheckbox');

$('.sensorCheckbox').change(() => { sensorChart.destroy(); sensorChart = criarGrafico('sensorChart', sensorData, camposSensor, '.sensorCheckbox'); });
$('.inmetCheckbox').change(() => { inmetChart.destroy(); inmetChart = criarGrafico('inmetChart', inmetData, camposInmet, '.inmetCheckbox'); });
</script>
@endsection
