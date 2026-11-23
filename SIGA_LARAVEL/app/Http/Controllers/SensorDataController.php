<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\SensorData;
use App\Models\Sensor;
use App\Models\Leitura;
use App\Models\Alerta;
use App\Models\Acionamento;
use App\Models\Bomba;
use App\Services\WifiLocationDispatcher;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SensorDataController extends Controller
{
    public function store(Request $request, WifiLocationDispatcher $wifiLocationDispatcher)
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
            'sensor_id' => [
                'sometimes',
                'integer',
                'exists:sensores,id_sensores',
            ],
            'device_code' => [
                'sometimes',
                'string',
                'max:64',
                'regex:/\A[A-Za-z0-9][A-Za-z0-9._-]{0,63}\z/',
            ],
            'wifi_access_points' => [
                'sometimes',
                'array',
                'max:15',
            ],
            'wifi_access_points.*.macAddress' => [
                'required',
                'string',
                'max:17',
                'regex:/\A(?:[0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}\z/',
            ],
            'wifi_access_points.*.signalStrength' => [
                'required',
                'integer',
                'between:-127,0',
            ],
            'wifi_access_points.*.channel' => [
                'sometimes',
                'integer',
                'between:1,196',
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

            if (! empty($unexpectedFields)) {
                $validator->errors()->add(
                    'data',
                    'Campos não permitidos: '.implode(', ', $unexpectedFields)
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

            if (! $hasSensorData) {
                $validator->errors()->add(
                    'sensor_data',
                    'Informe pelo menos uma leitura ou estado dos sensores.'
                );
            }

            if ($request->exists('wifi_access_points') && ! $request->filled('device_code')) {
                $validator->errors()->add(
                    'device_code',
                    'Informe o identificador do dispositivo ao enviar redes Wi-Fi.'
                );
            }

            $accessPoints = $request->input('wifi_access_points', []);
            foreach (is_array($accessPoints) ? $accessPoints : [] as $index => $accessPoint) {
                if (! is_array($accessPoint)) {
                    continue;
                }

                $unexpectedAccessPointFields = array_diff(
                    array_keys($accessPoint),
                    ['macAddress', 'signalStrength', 'channel']
                );

                if ($unexpectedAccessPointFields !== []) {
                    $validator->errors()->add(
                        "wifi_access_points.{$index}",
                        'Campos não permitidos no ponto de acesso Wi-Fi.'
                    );
                }
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
        $sensorFields = $dataFields;
        $sensorFields[] = 'simulation';
        $sensorFields[] = 'sensor_id';
        $sensorPayload = array_intersect_key($validated, array_flip($sensorFields));
        $sensorPayload['simulation'] = $sensorPayload['simulation'] ?? false;

        $device = null;
        if (isset($validated['device_code'])) {
            $device = Device::query()->firstOrCreate(
                ['code' => $validated['device_code']],
                [
                    'name' => $validated['device_code'],
                    'location_status' => 'pending',
                ],
            );

            $linkedSensor = Sensor::query()
                ->where('device_id', $device->id)
                ->first();

            if ($linkedSensor) {
                $sensorPayload['sensor_id'] = $linkedSensor->id_sensores;
                $validated['sensor_id'] = $linkedSensor->id_sensores;
            }
        }

        $sensorData = $device
            ? $device->sensorData()->create($sensorPayload)
            : SensorData::create($sensorPayload);

        if (! empty($validated['sensor_id'])) {
            $sensor = Sensor::query()->with('area')->find($validated['sensor_id']);

            $readingValue = $validated['water_level_cm']
                ?? $validated['rain_sensor_raw']
                ?? 0;

            Leitura::create([
                'sensor_id' => $sensor->id_sensores,
                'data_leitura' => now(),
                'valor' => $readingValue,
                'status' => $validated['water_status'] ?? 'recebida',
            ]);

            $critical = ($validated['water_level_cm'] ?? 0) >= 70
                || str_contains(strtolower((string) ($validated['water_status'] ?? '')), 'alag')
                || str_contains(strtolower((string) ($validated['water_status'] ?? '')), 'crit');

            if ($critical) {
                Alerta::create([
                    'tipo' => 'nivel_critico',
                    'status' => 'novo',
                    'descricao' => 'Sensor detectou condição crítica.',
                    'sensor_id' => $sensor->id_sensores,
                    'bomba_id' => null,
                ]);
            }

            if (($validated['pump_on'] ?? false) && $sensor->area_id) {
                $bomba = Bomba::query()
                    ->where('area_id', $sensor->area_id)
                    ->where('status', 'ativo')
                    ->first();

                if ($bomba) {
                    Acionamento::create([
                        'bomba_id' => $bomba->id_bombas,
                        'data_hora' => now(),
                        'status' => 'ligada',
                    ]);
                }
            }
        }

        if (array_key_exists('wifi_access_points', $validated)) {
            $wifiLocationDispatcher->enqueue(
                $validated['device_code'],
                $validated['wifi_access_points'],
            );
        }

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

        if (! empty($filters['date'])) {
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
        } elseif (! empty($filters['month']) && ! empty($filters['year'])) {
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
        } elseif (! empty($filters['year'])) {
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
