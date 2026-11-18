<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class WifiGeolocationService
{
    public function normalizeAccessPoints(array $accessPoints): array
    {
        $normalized = [];

        foreach ($accessPoints as $accessPoint) {
            if (! is_array($accessPoint)) {
                continue;
            }

            $macAddress = strtoupper(str_replace('-', ':', trim((string) ($accessPoint['macAddress'] ?? ''))));

            if (! preg_match('/\A(?:[0-9A-F]{2}:){5}[0-9A-F]{2}\z/', $macAddress)) {
                continue;
            }

            $octets = array_map('hexdec', explode(':', $macAddress));
            if (
                ($octets[0] & 3) !== 0
                || $octets === array_fill(0, 6, 0)
                || $octets === array_fill(0, 6, 255)
            ) {
                continue;
            }

            $signalStrength = filter_var($accessPoint['signalStrength'] ?? null, FILTER_VALIDATE_INT);
            if ($signalStrength === false || $signalStrength < -127 || $signalStrength > 0) {
                continue;
            }

            $normalizedAccessPoint = [
                'macAddress' => $macAddress,
                'signalStrength' => $signalStrength,
            ];

            if (isset($accessPoint['channel'])) {
                $channel = filter_var($accessPoint['channel'], FILTER_VALIDATE_INT);
                if ($channel === false || $channel < 1 || $channel > 196) {
                    continue;
                }

                $normalizedAccessPoint['channel'] = $channel;
            }

            if (
                ! isset($normalized[$macAddress])
                || $signalStrength > $normalized[$macAddress]['signalStrength']
            ) {
                $normalized[$macAddress] = $normalizedAccessPoint;
            }
        }

        $normalized = array_values($normalized);
        usort(
            $normalized,
            fn (array $first, array $second): int => $second['signalStrength'] <=> $first['signalStrength']
        );

        return array_slice($normalized, 0, 15);
    }

    public function fingerprint(array $accessPoints): string
    {
        $macAddresses = array_column($this->normalizeAccessPoints($accessPoints), 'macAddress');
        sort($macAddresses);

        return hash('sha256', implode(',', $macAddresses));
    }

    public function locate(array $accessPoints): array
    {
        $accessPoints = $this->normalizeAccessPoints($accessPoints);

        if (count($accessPoints) < 2) {
            return ['status' => 'insufficient_wifi'];
        }

        $apiKey = config('services.google_geolocation.api_key');
        if (! is_string($apiKey) || trim($apiKey) === '') {
            return ['status' => 'error'];
        }

        try {
            $response = Http::acceptJson()
                ->withOptions(['query' => ['key' => $apiKey]])
                ->timeout((int) config('services.google_geolocation.timeout', 8))
                ->post(config('services.google_geolocation.url'), [
                    'considerIp' => false,
                    'wifiAccessPoints' => $accessPoints,
                ]);
        } catch (ConnectionException) {
            return ['status' => 'error'];
        }

        if ($response->status() === 404) {
            return ['status' => 'unavailable'];
        }

        if (! $response->successful()) {
            return ['status' => 'error'];
        }

        $location = $response->json('location');
        $accuracy = $response->json('accuracy');

        if (
            ! is_array($location)
            || ! is_numeric($location['lat'] ?? null)
            || ! is_numeric($location['lng'] ?? null)
            || ! is_numeric($accuracy)
        ) {
            return ['status' => 'unavailable'];
        }

        $latitude = (float) $location['lat'];
        $longitude = (float) $location['lng'];
        $accuracy = (float) $accuracy;

        if (
            ! is_finite($latitude)
            || ! is_finite($longitude)
            || ! is_finite($accuracy)
            || $latitude < -90
            || $latitude > 90
            || $longitude < -180
            || $longitude > 180
            || $accuracy <= 0
        ) {
            return ['status' => 'unavailable'];
        }

        return [
            'status' => 'located',
            'latitude' => $latitude,
            'longitude' => $longitude,
            'accuracy' => $accuracy,
        ];
    }
}
