<?php

namespace App\Http\Controllers;

use App\Models\SensorData;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SensorDataController extends Controller
{/**
 * Dashboard principal do SIGA.
 */
public function index()
{
    $sensorData = SensorData::latest('created_at')
        ->take(100)
        ->get();

    $latestReading = $sensorData->first();

    return view('dashboard.index', compact(
        'sensorData',
        'latestReading'
    ));
}
    public function store(Request $request)
    {
        $rules = [
            'water_level_cm' => [
                'sometimes',
                'nullable',
                'numeric',
                'min:0',
            ],
            'rain_sensor_raw' => [
                'sometimes',
                'nullable',
                'integer',
                'min:0',
                'max:1',
            ],
            'water_status' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],
            'pump_on' => [
                'sometimes',
                'boolean',
            ],
            'simulation' => [
                'sometimes',
                'boolean',
            ],
        ];

        // Campos que representam leituras ou estados dos sensores.
        $dataFields = [
            'water_level_cm',
            'rain_sensor_raw',
            'water_status',
            'pump_on',
        ];

        $validator = Validator::make($request->all(), $rules);

        $validator->after(function ($validator) use ($request, $rules, $dataFields) {
            // Impede o recebimento de campos que não pertencem ao SIGA.
            $unexpectedFields = array_diff(
                array_keys($request->all()),
                array_keys($rules)
            );

            if (!empty($unexpectedFields)) {
                $validator->errors()->add(
                    'data',
                    'Campos não permitidos: ' . implode(', ', $unexpectedFields)
                );
            }

            // Exige pelo menos uma leitura ou estado dos sensores.
            $hasSensorData = false;

            foreach ($dataFields as $field) {
                if (
                    $request->exists($field) &&
                    $request->input($field) !== null
                ) {
                    $hasSensorData = true;
                    break;
                }
            }

            if (!$hasSensorData) {
                $validator->errors()->add(
                    'sensor_data',
                    'Informe pelo menos uma leitura ou estado dos sensores.'
                );
            }
        });

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Os dados enviados são inválidos.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        // Identifica como dados reais quando não informado.
        $validated['simulation'] = $validated['simulation'] ?? false;

        $sensorData = SensorData::create($validated);

        return response()->json([
            'message' => 'Leitura salva com sucesso!',
            'data' => $sensorData,
        ], 201);
    }

    /**
     * Dashboard antigo.
     */
    // public function show()
    // {
    //     $sensorData = SensorData::latest()->get();

    //     return view('dashboard.index', compact('sensorData'));
    // }

    /**
     * Página sobre os sensores.
     */
    public function sobre()
    {
        $sensorData = SensorData::latest()->get();

        return view('sensor_data', compact('sensorData'));
    }

    /**
     * Última leitura para os indicadores.
     */
    public function gauges()
    {
        $sensorData = SensorData::latest()->take(1)->get();

        return view('sensor_data_gauges', compact('sensorData'));
    }

    /**
     * Histórico das últimas 100 leituras.
     */
    public function historico()
    {
        $sensorData = SensorData::latest()->take(100)->get();

        return view('historico', compact('sensorData'));
    }

    /**
     * Histórico JSON com filtros por dia, mês ou ano.
     */
    public function jsonHistorico(Request $request)
    {
        $filters = $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d'],
            'month' => ['nullable', 'integer', 'between:1,12'],
            'year' => ['nullable', 'integer', 'between:2000,2100'],
        ]);

        $query = DB::table('sensor_data')
            ->orderBy('created_at', 'asc');

        if (!empty($filters['date'])) {
            $start = Carbon::createFromFormat(
                'Y-m-d',
                $filters['date'],
                'America/Sao_Paulo'
            )->startOfDay();

            $end = $start->copy()->endOfDay();

            $query->whereBetween('created_at', [
                $start->copy()->setTimezone('UTC'),
                $end->copy()->setTimezone('UTC'),
            ]);
        } elseif (!empty($filters['month']) && !empty($filters['year'])) {
            $start = Carbon::createFromDate(
                $filters['year'],
                $filters['month'],
                1,
                'America/Sao_Paulo'
            )->startOfMonth();

            $end = $start->copy()->endOfMonth();

            $query->whereBetween('created_at', [
                $start->copy()->setTimezone('UTC'),
                $end->copy()->setTimezone('UTC'),
            ]);
        } elseif (!empty($filters['year'])) {
            $start = Carbon::createFromDate(
                $filters['year'],
                1,
                1,
                'America/Sao_Paulo'
            )->startOfYear();

            $end = $start->copy()->endOfYear();

            $query->whereBetween('created_at', [
                $start->copy()->setTimezone('UTC'),
                $end->copy()->setTimezone('UTC'),
            ]);
        }

        $dados = $query->get();

        $result = $dados->map(function ($item) {
            return [
                'data' => Carbon::parse($item->created_at)
                    ->setTimezone('America/Sao_Paulo')
                    ->format('d/m/Y'),

                'hora' => Carbon::parse($item->created_at)
                    ->setTimezone('America/Sao_Paulo')
                    ->format('H:i:s'),

                'water_level_cm' => $item->water_level_cm,
                'rain_sensor_raw' => $item->rain_sensor_raw,
                'water_status' => $item->water_status,
                'pump_on' => (bool) $item->pump_on,
                'simulation' => (bool) $item->simulation,
            ];
        });

        return response()->json($result);
    }

    /**
     * Tabela com as últimas 100 leituras.
     */
    public function tabela()
    {
        $sensorData = SensorData::latest()->take(100)->get();

        return view('sensor_data_tabela', compact('sensorData'));
    }

    /**
     * Retorna a leitura mais recente em JSON.
     */
    public function getLatestData()
    {
        $data = SensorData::latest()->first();

        return response()->json([
            'data' => $data,
        ]);
    }
}
