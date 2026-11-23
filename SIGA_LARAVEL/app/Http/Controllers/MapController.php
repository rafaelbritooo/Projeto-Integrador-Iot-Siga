<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\SensorData;
use Carbon\CarbonInterface;
use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;

class MapController extends Controller
{
    public function index(): View
    {
        return view('map.index', [
            'latestReading' => $this->latestReading(),
        ]);
    }

    public function data(): JsonResponse
    {
        $devices = Device::query()
            ->where('is_active', true)
            ->with(['latestSensorData', 'sensor.area'])
            ->get();

        $offlineBefore = now()->subMinutes(
            max(1, (int) config('services.google_geolocation.offline_after_minutes', 5))
        );
        $approximateAccuracy = max(
            1,
            (int) config('services.google_geolocation.approximate_accuracy_meters', 100)
        );

        $locatedDevices = $devices
            ->filter(fn (Device $device): bool => $this->deviceCoordinates($device) !== null)
            ->map(function (Device $device) use ($offlineBefore, $approximateAccuracy): array {
                $coordinates = $this->deviceCoordinates($device);
                $device->latitude = $coordinates['latitude'];
                $device->longitude = $coordinates['longitude'];

                return $this->serializeDevice(
                    $device,
                    $offlineBefore,
                    $approximateAccuracy,
                    $coordinates['source'],
                );
            })
            ->values();

        $unlocatedDevices = $devices
            ->filter(fn (Device $device): bool => $this->deviceCoordinates($device) === null)
            ->map(fn (Device $device): array => [
                'id' => $device->id,
                'code' => $device->code,
                'name' => $device->name,
                'location_status' => $device->location_status,
                'last_communication_at' => $device->latestSensorData?->created_at,
                'connection_status' => $device->latestSensorData?->created_at?->greaterThanOrEqualTo($offlineBefore)
                    ? 'connected'
                    : 'offline',
            ])
            ->values();

        return response()->json([
            'devices' => $locatedDevices,
            'unlocated_devices' => $unlocatedDevices,
            'has_coordinates' => $locatedDevices->isNotEmpty(),
            'latest_reading' => $this->latestReading(),
            'message' => $devices->isEmpty()
                ? 'Nenhum dispositivo foi registrado.'
                : 'Nenhum dispositivo possui uma localização Wi-Fi válida.',
            'checked_at' => now(),
        ]);
    }

    private function deviceCoordinates(Device $device): ?array
    {
        if ($device->latitude !== null && $device->longitude !== null) {
            return [
                'latitude' => $device->latitude,
                'longitude' => $device->longitude,
                'source' => 'wifi',
            ];
        }

        $area = $device->sensor?->area;
        if ($area && $area->latitude !== null && $area->longitude !== null) {
            return [
                'latitude' => $area->latitude,
                'longitude' => $area->longitude,
                'source' => 'area',
            ];
        }

        return null;
    }

    private function serializeDevice(
        Device $device,
        CarbonInterface $offlineBefore,
        int $approximateAccuracy,
        string $coordinatesSource,
    ): array
    {
        $latestReading = $device->latestSensorData;
        $lastCommunication = $latestReading?->created_at;
        $area = $device->sensor?->area;

        return [
            'id' => $device->id,
            'code' => $device->code,
            'name' => $device->name,
            'latitude' => $device->latitude,
            'longitude' => $device->longitude,
            'coordinates_source' => $coordinatesSource,
            'area_address' => $area?->localizacao,
            'location_accuracy' => $device->location_accuracy,
            'location_status' => $device->location_status,
            'location_is_approximate' => $device->location_accuracy !== null
                && $device->location_accuracy > $approximateAccuracy,
            'location_updated_at' => $device->location_updated_at,
            'last_communication_at' => $lastCommunication,
            'connection_status' => $lastCommunication?->greaterThanOrEqualTo($offlineBefore)
                ? 'connected'
                : 'offline',
            'latest_reading' => $latestReading ? [
                'water_level_cm' => $latestReading->water_level_cm,
                'water_status' => $latestReading->water_status,
                'pump_on' => $latestReading->pump_on,
                'created_at' => $lastCommunication,
            ] : null,
        ];
    }

    private function latestReading(): ?SensorData
    {
        return SensorData::query()
            ->select([
                'id',
                'water_level_cm',
                'water_status',
                'pump_on',
                'simulation',
                'created_at',
            ])
            ->latest('created_at')
            ->first();
    }
}
