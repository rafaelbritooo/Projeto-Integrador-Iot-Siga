<?php

use App\Http\Controllers\AuraController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompareController;
use App\Http\Controllers\SensorDataController;
use App\Http\Controllers\WeatherController;
use App\Http\Controllers\WeatherNewsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.attempt');
});

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth')
    ->name('logout');

Route::middleware('auth')->group(function () {
    // Página principal da Cloudinha
    Route::get('/cloudinha', function () {
        return view('aura');
    })->name('IA.cloudinha');

    Route::post('/cloudinha', [AuraController::class, 'chat']);

    Route::get('/comparar', [CompareController::class, 'index'])->name('compare.index');
    Route::get('/api/weather', [WeatherController::class, 'apiWeather'])->name('api.weather');
    Route::get('/', [SensorDataController::class, 'show'])->name('sensor.dashboard');
    Route::get('/sobre', [SensorDataController::class, 'sobre'])->name('sensor.sobre');
    Route::get('/sensor-gauges-only', [SensorDataController::class, 'gauges'])->name('sensor.gauges');
    Route::get('/sensor-historico-only', [SensorDataController::class, 'historico'])->name('sensor.historico');
    Route::get('/sensor-historico-json', [SensorDataController::class, 'jsonHistorico']);
    Route::get('/sensor-tabela-only', [SensorDataController::class, 'tabela'])->name('sensor.tabela');
    Route::get('/sensor-data-json', [SensorDataController::class, 'getLatestData']);
    Route::get('/noticias-clima', [WeatherNewsController::class, 'index'])->name('weather.news');

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
});
