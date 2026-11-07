<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login_when_accessing_the_dashboard(): void
    {
        $this->get('/')
            ->assertRedirect(route('login'));
    }

    public function test_login_page_is_available_to_guests(): void
    {
        $this->get(route('login'))
            ->assertOk()
            ->assertSee('Bem-vindo de volta');
    }

    public function test_user_can_login_with_database_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'usuario@example.com',
            'password' => 'senha-segura',
        ]);

        $this->post(route('login.attempt'), [
            'email' => $user->email,
            'password' => 'senha-segura',
        ])->assertRedirect(route('sensor.dashboard'));

        $this->assertAuthenticatedAs($user);
    }

    public function test_invalid_credentials_do_not_login(): void
    {
        User::factory()->create([
            'email' => 'usuario@example.com',
            'password' => 'senha-segura',
        ]);

        $this->from(route('login'))
            ->post(route('login.attempt'), [
                'email' => 'usuario@example.com',
                'password' => 'senha-incorreta',
            ])
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_login_is_throttled_after_repeated_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'usuario@example.com',
            'password' => 'senha-segura',
        ]);

        foreach (range(1, 5) as $attempt) {
            $this->post(route('login.attempt'), [
                'email' => 'usuario@example.com',
                'password' => 'senha-incorreta',
            ]);
        }

        $this->from(route('login'))
            ->post(route('login.attempt'), [
                'email' => 'usuario@example.com',
                'password' => 'senha-incorreta',
            ])
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('email');
    }

    public function test_authenticated_user_can_logout(): void
    {
        $this->actingAs(User::factory()->create())
            ->post(route('logout'))
            ->assertRedirect(route('login'));

        $this->assertGuest();
    }
}
