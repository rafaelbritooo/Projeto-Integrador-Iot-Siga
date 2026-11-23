<?php

namespace App\Http\Controllers;

use App\Models\SensorData;
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Contracts\View\View;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(): View
    {
        $latestReading = $this->latestReading();
        $readings = $this->readingsQuery()
            ->latest('created_at')
            ->paginate(10);

        return view('dashboard.index', [
            'latestReading' => $latestReading,
            'summary' => $this->summaryData($latestReading),
            'recentEvents' => $this->recentEvents(),
            'sensorData' => $readings,
            'chartData' => $this->chartData('24h'),
        ]);
    }

    public function summary(): JsonResponse
    {
        return response()->json([
            'data' => $this->summaryData(),
        ]);
    }

    public function chart(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'period' => ['sometimes', 'in:24h,7d,30d,12m'],
        ]);

        $period = $filters['period'] ?? '24h';

        return response()->json([
            'data' => $this->chartData($period),
            'period' => $period,
        ]);
    }

    public function recentAlerts(): JsonResponse
    {
        return response()->json([
            'data' => $this->recentEvents(),
            'note' => 'Eventos informativos; não há regras de risco configuradas.',
        ]);
    }

    public function readings(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'in:10,25,50'],
        ]);

        $readings = $this->readingsQuery()
            ->latest('created_at')
            ->paginate($filters['per_page'] ?? 10, ['*'], 'page', $filters['page'] ?? 1)
            ->withQueryString();

        return response()->json([
            'data' => $readings->getCollection()->map(fn (SensorData $reading): array => [
                'id' => $reading->id,
                'created_at' => $reading->created_at,
                'water_level_cm' => $reading->water_level_cm,
                'rain_sensor_raw' => $reading->rain_sensor_raw,
                'water_status' => $reading->water_status,
                'pump_on' => $reading->pump_on,
                'simulation' => $reading->simulation,
            ]),
            'meta' => [
                'current_page' => $readings->currentPage(),
                'last_page' => $readings->lastPage(),
                'per_page' => $readings->perPage(),
                'total' => $readings->total(),
            ],
        ]);
    }

    private function summaryData(?SensorData $latestReading = null): array
    {
        $latestReading ??= $this->latestReading();

        return [
            'total_readings' => SensorData::count(),
            'readings_today' => SensorData::where('created_at', '>=', now()->startOfDay())->count(),
            'latest_reading' => $latestReading,
            'updated_at' => $latestReading?->created_at,
        ];
    }

    private function recentEvents(): array
    {
        return $this->readingsQuery()
            ->where('pump_on', true)
            ->where('created_at', '>=', now()->subDay())
            ->latest('created_at')
            ->limit(5)
            ->get()
            ->map(fn (SensorData $reading): array => [
                'id' => $reading->id,
                'message' => 'Bomba registrada ligada',
                'water_status' => $reading->water_status,
                'created_at' => $reading->created_at,
            ])
            ->all();
    }

    private function latestReading(): ?SensorData
    {
        return $this->readingsQuery()
            ->latest('created_at')
            ->first();
    }

    private function readingsQuery(): Builder
    {
        $query = SensorData::query()->select([
            'id',
            'device_id',
            'sensor_id',
            'water_level_cm',
            'rain_sensor_raw',
            'water_status',
            'pump_on',
            'simulation',
            'created_at',
        ]);

        $usuarioId = session('siga_usuario_id');
        if ($usuarioId) {
            $usuario = Usuario::query()->find($usuarioId);

            if ($usuario?->orgao_id) {
                $query->where(function (Builder $scoped) use ($usuario): void {
                    $scoped
                        ->whereNull('sensor_id')
                        ->orWhereHas('sensor.area', function (Builder $area) use ($usuario): void {
                            $area->where('orgao_id', $usuario->orgao_id);
                        });
                });
            }
        }

        return $query;
    }

    private function chartData(string $period): array
    {
        $now = now();
        [$start, $bucket] = match ($period) {
            '7d' => [$now->copy()->subDays(7), 'day'],
            '30d' => [$now->copy()->subDays(30), 'day'],
            '12m' => [$now->copy()->subMonths(12), 'month'],
            default => [$now->copy()->subDay(), 'hour'],
        };

        $driver = SensorData::query()->getConnection()->getDriverName();
        $format = $driver === 'sqlite'
            ? match ($bucket) {
                'hour' => "strftime('%Y-%m-%d %H:00:00', created_at)",
                'day' => "strftime('%Y-%m-%d', created_at)",
                default => "strftime('%Y-%m', created_at)",
            }
        : match ($bucket) {
            'hour' => "DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00')",
            'day' => 'DATE(created_at)',
            default => "DATE_FORMAT(created_at, '%Y-%m')",
        };

        return SensorData::query()
            ->whereNotNull('water_level_cm')
            ->where('created_at', '>=', $start)
            ->selectRaw("$format as bucket, AVG(water_level_cm) as average_level")
            ->groupBy('bucket')
            ->orderBy('bucket')
            ->get()
            ->map(fn (SensorData $reading): array => [
                'label' => $this->formatBucket($reading->bucket, $bucket),
                'value' => round((float) $reading->average_level, 2),
            ])
            ->all();
    }

    private function formatBucket(string $bucket, string $unit): string
    {
        $date = Carbon::parse($bucket);

        return match ($unit) {
            'hour' => $date->format('d/m H:i'),
            'month' => $date->format('m/Y'),
            default => $date->format('d/m'),
        };
    }
}
