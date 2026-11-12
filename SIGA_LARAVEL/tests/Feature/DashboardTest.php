<?php

namespace Tests\Feature;

use App\Models\SensorData;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_renders_without_sensor_readings(): void
    {
        $this->get('/dashboard')
            ->assertOk()
            ->assertSee('Visão Geral')
            ->assertSee('Nenhuma leitura encontrada no banco de dados.')
            ->assertSee('Aguardando localização Wi-Fi');
    }

    public function test_root_redirects_to_the_dashboard(): void
    {
        $this->get('/')
            ->assertRedirect('/dashboard');
    }

    public function test_summary_returns_real_reading_counts_and_latest_reading(): void
    {
        SensorData::create([
            'water_level_cm' => 12.5,
            'rain_sensor_raw' => 1,
            'water_status' => 'normal',
            'pump_on' => false,
            'simulation' => false,
        ]);

        $this->getJson('/dashboard/summary')
            ->assertOk()
            ->assertJsonPath('data.total_readings', 1)
            ->assertJsonPath('data.readings_today', 1)
            ->assertJsonPath('data.latest_reading.water_level_cm', 12.5);
    }

    public function test_chart_returns_aggregated_water_levels_for_a_valid_period(): void
    {
        SensorData::create([
            'water_level_cm' => 10,
            'pump_on' => false,
            'simulation' => false,
        ]);
        SensorData::create([
            'water_level_cm' => 20,
            'pump_on' => false,
            'simulation' => false,
        ]);

        $this->getJson('/dashboard/chart?period=24h')
            ->assertOk()
            ->assertJsonPath('period', '24h')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.value', 15);
    }

    public function test_chart_rejects_an_unsupported_period(): void
    {
        $this->getJson('/dashboard/chart?period=all')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('period');
    }

    public function test_recent_events_only_include_real_pump_on_readings(): void
    {
        SensorData::create([
            'water_level_cm' => 8,
            'pump_on' => true,
            'simulation' => false,
        ]);
        SensorData::create([
            'water_level_cm' => 4,
            'pump_on' => false,
            'simulation' => false,
        ]);

        $this->getJson('/dashboard/alerts')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.message', 'Bomba registrada ligada')
            ->assertJsonPath('note', 'Eventos informativos; não há regras de risco configuradas.');
    }

    public function test_readings_endpoint_returns_paginated_sensor_records(): void
    {
        SensorData::create([
            'water_level_cm' => 10,
            'pump_on' => false,
            'simulation' => false,
        ]);

        $this->getJson('/dashboard/readings?per_page=10')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.water_level_cm', 10);
    }

    public function test_readings_endpoint_paginates_without_loading_other_pages(): void
    {
        foreach (range(1, 11) as $level) {
            SensorData::create([
                'water_level_cm' => $level,
                'pump_on' => false,
                'simulation' => false,
            ]);
        }

        $this->getJson('/dashboard/readings?per_page=10&page=2')
            ->assertOk()
            ->assertJsonPath('meta.current_page', 2)
            ->assertJsonPath('meta.last_page', 2)
            ->assertJsonCount(1, 'data');
    }

    public function test_readings_endpoint_rejects_invalid_pagination_parameters(): void
    {
        $this->getJson('/dashboard/readings?per_page=500&page=0')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['page', 'per_page']);
    }
}
