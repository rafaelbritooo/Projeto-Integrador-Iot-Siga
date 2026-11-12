<?php

namespace App\Http\Controllers;

use App\Models\SensorData;
use Illuminate\Contracts\View\View;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReadingController extends Controller
{
    public function index(Request $request): View|JsonResponse
    {
        $filters = $request->validate([
            'q' => ['sometimes', 'string', 'max:100'],
            'start_date' => ['sometimes', 'nullable', 'date_format:Y-m-d'],
            'end_date' => ['sometimes', 'nullable', 'date_format:Y-m-d', 'after_or_equal:start_date'],
            'status' => ['sometimes', 'nullable', 'string', 'max:255'],
            'source' => ['sometimes', 'in:all,real,simulation'],
            'sort' => ['sometimes', 'in:newest,oldest'],
            'per_page' => ['sometimes', 'integer', 'in:10,25,50'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);

        $readings = $this->readingsQuery($filters)
            ->orderBy('created_at', ($filters['sort'] ?? 'newest') === 'oldest' ? 'asc' : 'desc')
            ->orderBy('id', ($filters['sort'] ?? 'newest') === 'oldest' ? 'asc' : 'desc')
            ->paginate($filters['per_page'] ?? 25, ['*'], 'page', $filters['page'] ?? 1)
            ->withQueryString();

        if ($request->expectsJson()) {
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
                    'from' => $readings->firstItem(),
                    'to' => $readings->lastItem(),
                ],
            ]);
        }

        $statuses = SensorData::query()
            ->whereNotNull('water_status')
            ->distinct()
            ->orderBy('water_status')
            ->limit(50)
            ->pluck('water_status');

        return view('readings.index', [
            'readings' => $readings,
            'statuses' => $statuses,
            'filters' => array_merge([
                'q' => '',
                'start_date' => '',
                'end_date' => '',
                'status' => '',
                'source' => 'all',
                'sort' => 'newest',
                'per_page' => 25,
            ], $filters),
        ]);
    }

    private function readingsQuery(array $filters): Builder
    {
        return SensorData::query()
            ->select([
                'id',
                'water_level_cm',
                'rain_sensor_raw',
                'water_status',
                'pump_on',
                'simulation',
                'created_at',
            ])
            ->when($filters['q'] ?? null, function (Builder $query, string $search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query->where('water_status', 'like', "%{$search}%");

                    if (ctype_digit($search)) {
                        $query->orWhere('id', (int) $search)
                            ->orWhere('rain_sensor_raw', (int) $search);
                    } elseif (is_numeric($search)) {
                        $query->orWhere('water_level_cm', (float) $search);
                    }
                });
            })
            ->when($filters['start_date'] ?? null, fn (Builder $query, string $date) => $query->whereDate('created_at', '>=', $date))
            ->when($filters['end_date'] ?? null, fn (Builder $query, string $date) => $query->whereDate('created_at', '<=', $date))
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('water_status', $status))
            ->when(
                ($filters['source'] ?? 'all') !== 'all',
                fn (Builder $query) => $query->where('simulation', ($filters['source'] ?? '') === 'simulation'),
            );
    }
}
