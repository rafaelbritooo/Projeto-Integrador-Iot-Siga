<?php

namespace App\Jobs;

use App\Models\Device;
use App\Services\WifiGeolocationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class UpdateDeviceWifiLocation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public int $timeout = 15;

    public function __construct(
        public readonly int $deviceId,
        public readonly array $accessPoints,
    ) {}

    public function handle(WifiGeolocationService $geolocation): void
    {
        $fingerprint = $geolocation->fingerprint($this->accessPoints);
        $minimumInterval = max(60, (int) config('services.google_geolocation.minimum_interval_seconds', 300));

        $shouldLocate = DB::transaction(function () use ($fingerprint, $minimumInterval): bool {
            $device = Device::query()->whereKey($this->deviceId)->lockForUpdate()->first();

            if (! $device || ! $device->is_active) {
                return false;
            }

            $sameScan = hash_equals((string) $device->last_wifi_fingerprint, $fingerprint);
            if ($sameScan) {
                if ($device->location_status === 'located') {
                    return false;
                }

                if (
                    $device->last_wifi_scan_at
                    && $device->last_wifi_scan_at->diffInSeconds(now()) < $minimumInterval
                ) {
                    return false;
                }
            } elseif (
                $device->last_wifi_scan_at
                && $device->last_wifi_scan_at->diffInSeconds(now()) < $minimumInterval
            ) {
                return false;
            }

            $device->forceFill([
                'last_wifi_fingerprint' => $fingerprint,
                'last_wifi_scan_at' => now(),
                'location_status' => $device->latitude === null ? 'pending' : $device->location_status,
            ])->save();

            return true;
        });

        if (! $shouldLocate) {
            return;
        }

        $result = $geolocation->locate($this->accessPoints);

        $device = Device::query()->find($this->deviceId);
        if (! $device) {
            return;
        }

        $updates = ['location_status' => $result['status']];
        if ($result['status'] === 'located') {
            $updates += [
                'latitude' => $result['latitude'],
                'longitude' => $result['longitude'],
                'location_accuracy' => $result['accuracy'],
                'location_updated_at' => now(),
            ];
        }

        $device->forceFill($updates)->save();
    }
}
