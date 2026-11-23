<?php

use App\Http\Controllers\AuraController;
use App\Http\Controllers\CompareController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DomainCrudController;
use App\Http\Controllers\Auth\UsuarioLoginController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReadingController;
use App\Http\Controllers\SensorDataController;
use App\Http\Controllers\WeatherController;
use App\Http\Controllers\WeatherNewsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;

// Página principal da Cloudinha
Route::get('/cloudinha', function () {
    return view('aura'); // mantém a mesma view
})->name('IA.cloudinha');

// Rota para o chat da Cloudinha (requisições AJAX)
Route::post('/cloudinha', [AuraController::class, 'chat']);

Route::get('/comparar', [CompareController::class, 'index'])->name('compare.index');

Route::get('/api/weather', [WeatherController::class, 'apiWeather'])->name('api.weather');

Route::get('/login', [UsuarioLoginController::class, 'create'])->name('login');
Route::post('/login', [UsuarioLoginController::class, 'store'])->name('login.store');
Route::post('/logout', [UsuarioLoginController::class, 'destroy'])->name('logout');

// Dashboard principal do SIGA
Route::get('/dashboard', [DashboardController::class, 'index'])->name('siga.dashboard');
Route::get('/', fn () => redirect()->route('siga.dashboard'));
Route::get('/dashboard/summary', [DashboardController::class, 'summary'])->name('siga.dashboard.summary');
Route::get('/dashboard/chart', [DashboardController::class, 'chart'])->name('siga.dashboard.chart');
Route::get('/dashboard/alerts', [DashboardController::class, 'recentAlerts'])->name('siga.dashboard.alerts');
Route::get('/dashboard/readings', [DashboardController::class, 'readings'])->name('siga.dashboard.readings');
Route::get('/mapa', [MapController::class, 'index'])->name('siga.map');
Route::get('/mapa/dados', [MapController::class, 'data'])->name('siga.map.data');
Route::get('/mapa/dispositivos', [MapController::class, 'data'])->name('siga.map.devices');
Route::get('/notificacoes', [NotificationController::class, 'index'])->name('siga.notifications');
Route::get('/leituras', [ReadingController::class, 'index'])->name('siga.readings');

Route::get('/sobre', [SensorDataController::class, 'sobre'])->name('siga.sobre');

Route::get('/sensor-gauges-only', [SensorDataController::class, 'gauges'])->name('sensor.gauges');

// Histórico apenas
Route::get('/sensor-historico-only', [SensorDataController::class, 'historico'])->name('sensor.historico');

// JSON para histórico filtrado
Route::get('/sensor-historico-json', [SensorDataController::class, 'jsonHistorico']);

// Tabela apenas
Route::get('/sensor-tabela-only', [SensorDataController::class, 'tabela'])->name('sensor.tabela');

// JSON para gauges
Route::get('/sensor-data-json', [SensorDataController::class, 'getLatestData']);

// Notícias do clima
Route::get('/noticias-clima', [WeatherNewsController::class, 'index'])->name('weather.news');

Route::middleware('siga.auth')->group(function () {
    Route::get('/administracao/{entity?}', [DomainCrudController::class, 'index'])
        ->defaults('entity', 'orgaos')
        ->middleware('siga.permission:domain.manage')
        ->name('siga.domain.index');

    Route::middleware('siga.permission:domain.manage')->group(function () {
        Route::post('/administracao/{entity}', [DomainCrudController::class, 'store'])
            ->name('siga.domain.store');
        Route::put('/administracao/{entity}/{id}', [DomainCrudController::class, 'update'])
            ->name('siga.domain.update');
        Route::delete('/administracao/{entity}/{id}', [DomainCrudController::class, 'destroy'])
            ->name('siga.domain.destroy');
    });
});

Route::get('/weather-map', function () {
    return view('weather.weather-map');
})->name('weather.map');

Route::get('/api/weather-click', function (Request $request) {
    $lat = $request->query('lat');
    $lon = $request->query('lon');
    $apiKey = env('OPENWEATHER_API_KEY');

    $response = Http::get('https://api.openweathermap.org/data/2.5/weather', [
        'lat' => $lat,
        'lon' => $lon,
        'units' => 'metric',
        'lang' => 'pt_br',
        'appid' => $apiKey,
    ]);

    return $response->json();
});
