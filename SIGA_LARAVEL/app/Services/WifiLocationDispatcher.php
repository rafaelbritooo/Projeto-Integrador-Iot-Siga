<?php

namespace App\Services;

use App\Jobs\UpdateDeviceWifiLocation;
use App\Models\Device;
use Illuminate\Support\Facades\RateLimiter;

class WifiLocationDispatcher
{
    public function enqueue(string $deviceCode, array $accessPoints): array
    {
        $device = Device::query()->firstOrCreate(
            ['code' => $deviceCode],
            [
                'name' => $deviceCode,
                'location_status' => 'pending',
            ],
        );

        $minimumInterval = max(
            60,
            (int) config('services.google_geolocation.minimum_interval_seconds', 300)
        );

        $queued = RateLimiter::attempt(
            "wifi-geolocation-device:{$device->id}",
            1,
            function () use ($device, $accessPoints): bool {
                UpdateDeviceWifiLocation::dispatch($device->id, $accessPoints)
                    ->onConnection('database')
                    ->onQueue('wifi-geolocation');

                return true;
            },
            $minimumInterval,
        );

        return [
            'device' => $device,
            'queued' => (bool) $queued,
        ];
    }
}
