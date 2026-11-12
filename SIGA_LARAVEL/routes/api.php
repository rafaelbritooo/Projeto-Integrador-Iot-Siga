
<?php

use App\Http\Controllers\SensorDataController;
use App\Http\Controllers\WifiGeolocationController;
use Illuminate\Support\Facades\Route;

Route::post('/sensor-data', [SensorDataController::class, 'store']);
Route::post('/devices/wifi-location', [WifiGeolocationController::class, 'store'])
    ->middleware('throttle:6,1')
    ->name('api.devices.wifi-location');

Route::get('/sensor-data', [SensorDataController::class, 'getLatestData']);

Route::get('/sensor-data/history', [SensorDataController::class, 'jsonHistorico']);
