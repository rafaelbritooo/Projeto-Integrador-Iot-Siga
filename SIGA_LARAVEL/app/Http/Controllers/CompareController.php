<?php

namespace App\Http\Controllers;

use App\Models\SensorData;
use App\Models\InmetData;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CompareController extends Controller
{
    public function index(Request $request)
    {
        $year = date('Y');

        // ---------------------------
        // Dados do Sensor (Atmostech)
        // ---------------------------
        $monthSensor = $request->input('month_sensor', date('m'));
        $startSensor = Carbon::createFromFormat('Y-m', "$year-$monthSensor")->startOfMonth();
        $endSensor   = $startSensor->copy()->endOfMonth();
        $sensorData = SensorData::whereBetween('created_at', [$startSensor, $endSensor])->get();

        // ---------------------------
        // Dados do INMET
        // ---------------------------
        $monthInmet = $request->input('month_inmet', date('m'));
        $startInmet = Carbon::createFromFormat('Y-m-d H:i:s', "$year-$monthInmet-01 00:00:00");
        $endInmet   = (clone $startInmet)->endOfMonth()->endOfDay();

        // Combina 'data' + 'hora' para criar datetime e filtra pelo mês
        $inmetData = InmetData::whereRaw(
            "STR_TO_DATE(CONCAT(data, ' ', hora), '%Y-%m-%d %H:%i:%s') BETWEEN ? AND ?",
            [$startInmet, $endInmet]
        )->get();

        return view('compare_day', compact('sensorData', 'inmetData', 'monthSensor', 'monthInmet'));
    }
}
