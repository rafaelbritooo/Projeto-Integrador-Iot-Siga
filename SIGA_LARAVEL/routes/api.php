
<?php

use App\Http\Controllers\SensorDataController;
use App\Http\Controllers\WifiGeolocationController;
use App\Http\Controllers\DomainCrudController;
use Illuminate\Support\Facades\Route;

Route::post('/sensor-data', [SensorDataController::class, 'store']);
Route::post('/devices/wifi-location', [WifiGeolocationController::class, 'store'])
    ->middleware('throttle:6,1')
    ->name('api.devices.wifi-location');

Route::get('/sensor-data', [SensorDataController::class, 'getLatestData']);

Route::get('/sensor-data/history', [SensorDataController::class, 'jsonHistorico']);

Route::middleware(['web', 'siga.auth'])->group(function () {
    Route::get('/domain/{entity}', [DomainCrudController::class, 'apiIndex']);

    Route::middleware('siga.permission:domain.manage')->group(function () {
        Route::post('/domain/{entity}', [DomainCrudController::class, 'store']);
        Route::put('/domain/{entity}/{id}', [DomainCrudController::class, 'update']);
        Route::delete('/domain/{entity}/{id}', [DomainCrudController::class, 'destroy']);
    });
});
