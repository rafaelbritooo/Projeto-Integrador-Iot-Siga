<?php

namespace Tests\Feature;

use App\Models\SensorData;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SensorDataApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_stores_esp32_sensor_data(): void
    {
        $response = $this->postJson('/api/sensor-data', [
            'water_level_cm' => 14.5,
            'rain_sensor_raw' => 1820,
            'water_status' => 'normal',
            'pump_on' => false,
            'simulation' => false,
        ]);

        $response->assertOk()
            ->assertJson(['message' => 'Data saved successfully!']);

        $this->assertDatabaseHas('sensor_data', [
            'water_level_cm' => 14.5,
            'rain_sensor_raw' => 1820,
            'water_status' => 'normal',
            'pump_on' => 0,
            'simulation' => 0,
        ]);
    }

    public function test_it_defaults_optional_simulation_to_false(): void
    {
        $this->postJson('/api/sensor-data', [
            'water_level_cm' => 14.5,
        ])->assertOk();

        $this->assertDatabaseHas('sensor_data', [
            'water_level_cm' => 14.5,
            'simulation' => 0,
        ]);
    }

    public function test_it_preserves_compatibility_with_legacy_sensor_data(): void
    {
        $response = $this->postJson('/api/sensor-data', [
            'luminosity' => 420.5,
            'rain' => 0,
            'temperature' => 24.3,
            'humidity' => 68,
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('sensor_data', [
            'luminosity' => 420.5,
            'rain' => 0,
            'temperature' => 24.3,
            'humidity' => 68,
        ]);
    }

    public function test_it_returns_validation_errors_for_invalid_sensor_data(): void
    {
        $response = $this->postJson('/api/sensor-data', [
            'water_level_cm' => -2,
            'rain_sensor_raw' => 'not-an-integer',
            'pump_on' => 'maybe',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors([
                'water_level_cm',
                'rain_sensor_raw',
                'pump_on',
            ]);

        $this->assertSame(0, SensorData::count());
    }

    public function test_it_returns_json_errors_without_an_accept_header(): void
    {
        $response = $this->call(
            'POST',
            '/api/sensor-data',
            [],
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['water_level_cm' => -2], JSON_THROW_ON_ERROR),
        );

        $response->assertUnprocessable()
            ->assertHeader('content-type', 'application/json');
    }

    public function test_it_rejects_payloads_without_sensor_data(): void
    {
        $this->postJson('/api/sensor-data', [
            'simulation' => false,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('sensor_data');
    }

    public function test_it_rejects_unrecognized_fields_instead_of_discarding_them(): void
    {
        $this->postJson('/api/sensor-data', [
            'water_level_cm' => 12,
            'unreviewed_python_field' => 42,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('data');

        $this->assertSame(0, SensorData::count());
    }
}
