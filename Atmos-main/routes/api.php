<?php

use App\Http\Controllers\SensorDataController;
use App\Http\Middleware\AuthenticateSensor;
use Illuminate\Support\Facades\Route;

Route::middleware(AuthenticateSensor::class)->group(function () {
    Route::post('/sensor-data', [SensorDataController::class, 'store']);
    Route::get('/sensor-data', [SensorDataController::class, 'getLatestData']);
});
