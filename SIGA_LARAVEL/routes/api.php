
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SensorDataController;

Route::post('/sensor-data', [SensorDataController::class, 'store']);

Route::get('/sensor-data', [SensorDataController::class, 'getLatestData']);

Route::get('/sensor-data/history', [SensorDataController::class, 'jsonHistorico']);
