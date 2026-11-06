<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SensorApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.sensor.token' => 'sensor-token-for-tests']);
    }

    public function test_sensor_data_requires_device_token(): void
    {
        $this->postJson('/api/sensor-data', [
            'luminosity' => 100,
            'rain' => 0,
            'temperature' => 25,
            'humidity' => 60,
        ])->assertUnauthorized();

        $this->assertDatabaseCount('sensor_data', 0);
    }

    public function test_sensor_data_accepts_valid_device_token(): void
    {
        $this->withHeader('X-Device-Token', 'sensor-token-for-tests')
            ->postJson('/api/sensor-data', [
                'luminosity' => 100,
                'rain' => 0,
                'temperature' => 25,
                'humidity' => 60,
            ])
            ->assertOk()
            ->assertJson(['message' => 'Data saved successfully!']);

        $this->assertDatabaseCount('sensor_data', 1);
    }

    public function test_sensor_data_rejects_invalid_values(): void
    {
        $this->withHeader('X-Device-Token', 'sensor-token-for-tests')
            ->postJson('/api/sensor-data', [
                'luminosity' => 100,
                'rain' => 0,
                'temperature' => 250,
                'humidity' => 60,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('temperature');
    }
}
