<?php

namespace Tests\Feature;

use App\Jobs\UpdateDeviceWifiLocation;
use App\Models\Device;
use App\Services\WifiGeolocationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class WifiGeolocationTest extends TestCase
{
    use RefreshDatabase;

    public function test_sensor_readings_accept_device_and_wifi_data_without_waiting_for_geolocation(): void
    {
        Queue::fake();

        $response = $this->postJson('/api/sensor-data', [
            'device_code' => 'SIGA-ESP32-01',
            'water_level_cm' => 14.5,
            'wifi_access_points' => $this->accessPoints(),
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('devices', ['code' => 'SIGA-ESP32-01']);
        $this->assertDatabaseHas('sensor_data', [
            'water_level_cm' => 14.5,
            'device_id' => Device::query()->where('code', 'SIGA-ESP32-01')->value('id'),
        ]);

        Queue::assertPushed(UpdateDeviceWifiLocation::class, fn (UpdateDeviceWifiLocation $job): bool => (
            $job->accessPoints === $this->accessPoints()
        ));
    }

    public function test_wifi_location_endpoint_validates_and_queues_a_location_attempt(): void
    {
        Queue::fake();

        $this->postJson('/api/devices/wifi-location', [
            'device_code' => 'SIGA-ESP32-01',
            'wifi_access_points' => $this->accessPoints(),
        ])->assertAccepted()
            ->assertJsonPath('device_code', 'SIGA-ESP32-01')
            ->assertJsonPath('queued', true);

        $this->postJson('/api/devices/wifi-location', [
            'device_code' => 'SIGA-ESP32-01',
            'wifi_access_points' => $this->accessPoints(),
        ])->assertAccepted()
            ->assertJsonPath('queued', false);

        Queue::assertPushed(UpdateDeviceWifiLocation::class, 1);

        $this->postJson('/api/devices/wifi-location', [
            'device_code' => 'SIGA-ESP32-02',
            'wifi_access_points' => [
                ['macAddress' => 'invalid', 'signalStrength' => -40],
            ],
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('wifi_access_points.0.macAddress');
    }

    public function test_access_points_are_normalized_deduplicated_and_invalid_addresses_discarded(): void
    {
        $normalized = app(WifiGeolocationService::class)->normalizeAccessPoints([
            ['macAddress' => '00:11:22:33:44:55', 'signalStrength' => -70, 'channel' => 6],
            ['macAddress' => '00-11-22-33-44-55', 'signalStrength' => -45, 'channel' => 6],
            ['macAddress' => '01:11:22:33:44:66', 'signalStrength' => -30, 'channel' => 1],
            ['macAddress' => '00:11:22:33:44:77', 'signalStrength' => -128, 'channel' => 1],
        ]);

        $this->assertSame([
            ['macAddress' => '00:11:22:33:44:55', 'signalStrength' => -45, 'channel' => 6],
        ], $normalized);
    }

    public function test_successful_google_response_updates_coordinates_and_sends_consider_ip_false(): void
    {
        config([
            'services.google_geolocation.api_key' => 'test-key',
            'services.google_geolocation.url' => 'https://www.googleapis.com/geolocation/v1/geolocate',
        ]);
        Http::fake([
            'www.googleapis.com/*' => Http::response([
                'location' => ['lat' => 12.345, 'lng' => -45.678],
                'accuracy' => 45,
            ]),
        ]);
        $device = Device::query()->create([
            'code' => 'SIGA-ESP32-01',
            'name' => 'SIGA-ESP32-01',
            'location_status' => 'pending',
        ]);

        (new UpdateDeviceWifiLocation($device->id, $this->accessPoints()))
            ->handle(app(WifiGeolocationService::class));
        (new UpdateDeviceWifiLocation($device->id, $this->accessPoints()))
            ->handle(app(WifiGeolocationService::class));

        $device->refresh();
        $this->assertSame('located', $device->location_status);
        $this->assertSame(12.345, $device->latitude);
        $this->assertSame(-45.678, $device->longitude);
        $this->assertSame(45.0, $device->location_accuracy);
        $this->assertNotNull($device->location_updated_at);

        Http::assertSent(fn (HttpRequest $request): bool => (
            $request['considerIp'] === false
            && count($request['wifiAccessPoints']) === 2
            && ! array_key_exists('key', $request->data())
            && parse_url($request->url(), PHP_URL_QUERY) === 'key=test-key'
        ));
        Http::assertSentCount(1);
    }

    public function test_missing_provider_location_preserves_the_last_valid_position(): void
    {
        config([
            'services.google_geolocation.api_key' => 'test-key',
            'services.google_geolocation.url' => 'https://www.googleapis.com/geolocation/v1/geolocate',
        ]);
        Http::fake([
            'www.googleapis.com/*' => Http::response(['error' => 'not found'], 404),
        ]);
        $previousUpdate = now()->subDay();
        $device = Device::query()->create([
            'code' => 'SIGA-ESP32-01',
            'name' => 'SIGA-ESP32-01',
            'latitude' => 12.345,
            'longitude' => -45.678,
            'location_accuracy' => 45,
            'location_status' => 'located',
            'location_updated_at' => $previousUpdate,
        ]);

        (new UpdateDeviceWifiLocation($device->id, $this->accessPoints()))
            ->handle(app(WifiGeolocationService::class));

        $device->refresh();
        $this->assertSame('unavailable', $device->location_status);
        $this->assertSame(12.345, $device->latitude);
        $this->assertSame(-45.678, $device->longitude);
        $this->assertEquals($previousUpdate->timestamp, $device->location_updated_at->timestamp);
    }

    public function test_insufficient_wifi_marks_location_unavailable_without_calling_google(): void
    {
        Http::fake();
        $device = Device::query()->create([
            'code' => 'SIGA-ESP32-01',
            'name' => 'SIGA-ESP32-01',
        ]);

        (new UpdateDeviceWifiLocation($device->id, []))
            ->handle(app(WifiGeolocationService::class));

        $this->assertSame('insufficient_wifi', $device->fresh()->location_status);
        Http::assertNothingSent();
    }

    public function test_missing_google_key_marks_location_error_without_external_request(): void
    {
        config(['services.google_geolocation.api_key' => null]);
        Http::fake();
        $device = Device::query()->create([
            'code' => 'SIGA-ESP32-01',
            'name' => 'SIGA-ESP32-01',
        ]);

        (new UpdateDeviceWifiLocation($device->id, $this->accessPoints()))
            ->handle(app(WifiGeolocationService::class));

        $this->assertSame('error', $device->fresh()->location_status);
        Http::assertNothingSent();
    }

    public function test_provider_timeout_marks_location_error_and_keeps_sensor_processing_separate(): void
    {
        config([
            'services.google_geolocation.api_key' => 'test-key',
            'services.google_geolocation.url' => 'https://www.googleapis.com/geolocation/v1/geolocate',
        ]);
        Http::fake(fn () => throw new ConnectionException('timeout'));
        $device = Device::query()->create([
            'code' => 'SIGA-ESP32-01',
            'name' => 'SIGA-ESP32-01',
            'latitude' => 12.345,
            'longitude' => -45.678,
            'location_status' => 'located',
        ]);

        (new UpdateDeviceWifiLocation($device->id, $this->accessPoints()))
            ->handle(app(WifiGeolocationService::class));

        $device->refresh();
        $this->assertSame('error', $device->location_status);
        $this->assertSame(12.345, $device->latitude);
        $this->assertSame(-45.678, $device->longitude);
    }

    public function test_map_returns_only_located_devices_with_their_latest_sensor_reading(): void
    {
        $locatedDevice = Device::query()->create([
            'code' => 'SIGA-ESP32-01',
            'name' => 'Sensor do portão',
            'latitude' => 12.345,
            'longitude' => -45.678,
            'location_accuracy' => 250,
            'location_status' => 'located',
        ]);
        $unlocatedDevice = Device::query()->create([
            'code' => 'SIGA-ESP32-02',
            'name' => 'Sensor do reservatório',
            'location_status' => 'insufficient_wifi',
        ]);
        $locatedDevice->sensorData()->create([
            'water_level_cm' => 22,
            'water_status' => 'attention',
            'pump_on' => true,
        ]);
        $unlocatedDevice->sensorData()->create(['water_level_cm' => 10]);

        $this->getJson('/mapa/dispositivos')
            ->assertOk()
            ->assertJsonPath('has_coordinates', true)
            ->assertJsonPath('devices.0.code', 'SIGA-ESP32-01')
            ->assertJsonPath('devices.0.latest_reading.water_level_cm', 22)
            ->assertJsonPath('devices.0.location_is_approximate', true)
            ->assertJsonPath('unlocated_devices.0.location_status', 'insufficient_wifi');
    }

    private function accessPoints(): array
    {
        return [
            ['macAddress' => '00:11:22:33:44:55', 'signalStrength' => -45, 'channel' => 6],
            ['macAddress' => '00:11:22:33:44:66', 'signalStrength' => -68, 'channel' => 11],
        ];
    }
}
