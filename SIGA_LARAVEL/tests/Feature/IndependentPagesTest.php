<?php

namespace Tests\Feature;

use App\Models\SensorData;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IndependentPagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_sidebar_links_to_each_independent_page_and_marks_only_the_current_page(): void
    {
        $mapPage = $this->get('/mapa')
            ->assertOk()
            ->assertSee(route('siga.map'))
            ->assertSee('Mapa de monitoramento')
            ->assertSee('Aguardando dispositivos');
        $this->assertSame(1, substr_count($mapPage->getContent(), 'class="nav-link is-active"'));
        $mapPage->assertSee('class="nav-link is-active" href="'.route('siga.map').'"', false);

        $notificationsPage = $this->get('/notificacoes')
            ->assertOk()
            ->assertSee(route('siga.notifications'))
            ->assertSee('Notificações');
        $this->assertSame(1, substr_count($notificationsPage->getContent(), 'class="nav-link is-active"'));
        $notificationsPage->assertSee('class="nav-link is-active" href="'.route('siga.notifications').'"', false);

        $readingsPage = $this->get('/leituras')
            ->assertOk()
            ->assertSee(route('siga.readings'))
            ->assertSee('Histórico de leituras');
        $this->assertSame(1, substr_count($readingsPage->getContent(), 'class="nav-link is-active"'));
        $readingsPage->assertSee('class="nav-link is-active" href="'.route('siga.readings').'"', false);
    }

    public function test_map_data_does_not_invent_devices_or_coordinates(): void
    {
        SensorData::create([
            'water_level_cm' => 22,
            'pump_on' => false,
            'simulation' => false,
        ]);

        $this->getJson('/mapa/dados')
            ->assertOk()
            ->assertJsonPath('devices', [])
            ->assertJsonPath('has_coordinates', false)
            ->assertJsonPath('latest_reading.water_level_cm', 22);
    }

    public function test_notifications_show_only_actual_pump_on_readings(): void
    {
        SensorData::create([
            'water_level_cm' => 13,
            'water_status' => 'atenção',
            'pump_on' => true,
            'simulation' => false,
        ]);
        SensorData::create([
            'water_level_cm' => 3,
            'pump_on' => false,
            'simulation' => false,
        ]);

        $this->get('/notificacoes?type=pump_on&period=all')
            ->assertOk()
            ->assertSee('Bomba informada como ligada')
            ->assertSee('atenção')
            ->assertDontSee('Nenhuma notificação encontrada');
    }

    public function test_notifications_can_filter_by_period_and_validate_filter_values(): void
    {
        $this->getJson('/notificacoes?period=invalid')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('period');
    }

    public function test_readings_page_filters_by_status_source_and_search(): void
    {
        SensorData::create([
            'water_level_cm' => 12.5,
            'rain_sensor_raw' => 1,
            'water_status' => 'normal',
            'pump_on' => false,
            'simulation' => true,
        ]);
        SensorData::create([
            'water_level_cm' => 4,
            'rain_sensor_raw' => 0,
            'water_status' => 'baixo',
            'pump_on' => false,
            'simulation' => false,
        ]);

        $this->get('/leituras?status=normal&source=simulation&q=12.5')
            ->assertOk()
            ->assertSee('12,5 cm')
            ->assertSee('normal')
            ->assertSee('Exibindo 1–1 de 1 leituras');
    }

    public function test_readings_page_filters_by_date_and_returns_json_for_auto_refresh(): void
    {
        SensorData::create([
            'water_level_cm' => 18,
            'water_status' => 'normal',
            'pump_on' => false,
            'simulation' => false,
        ]);

        $today = now()->toDateString();
        $this->getJson("/leituras?start_date={$today}&end_date={$today}")
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.water_level_cm', 18);

        $this->getJson('/leituras?start_date=2026-12-01&end_date=2026-11-01')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('end_date');
    }
}
