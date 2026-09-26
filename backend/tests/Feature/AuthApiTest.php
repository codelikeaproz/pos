<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_endpoint_remains_public(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertJson([
                'status' => 'ok',
                'application' => 'University HomeStay POS API',
            ]);
    }

    public function test_admin_can_login(): void
    {
        $user = User::factory()->admin()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Login successful.')
            ->assertJsonPath('user.email', 'admin@example.com')
            ->assertJsonPath('user.role', UserRole::Admin->value)
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']]);

        $this->assertArrayNotHasKey('password', $response->json('user'));
        $this->assertTrue(Hash::check('password', $user->fresh()->password));
    }

    public function test_end_user_can_login(): void
    {
        User::factory()->endUser()->create([
            'email' => 'operator@example.com',
            'password' => Hash::make('password'),
        ]);

        $this->postJson('/api/login', [
            'email' => 'operator@example.com',
            'password' => 'password',
        ])
            ->assertOk()
            ->assertJsonPath('user.role', UserRole::EndUser->value);
    }

    public function test_invalid_credentials_fail_generically(): void
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'wrong-password',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email'])
            ->assertJsonPath('errors.email.0', 'Invalid credentials.');
    }

    public function test_current_user_requires_authentication(): void
    {
        $this->getJson('/api/current-user')->assertUnauthorized();
    }

    public function test_current_user_returns_authenticated_user(): void
    {
        $user = User::factory()->admin()->create();

        Sanctum::actingAs($user);

        $this->getJson('/api/current-user')
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.role', UserRole::Admin->value)
            ->assertJsonMissingPath('user.password')
            ->assertJsonMissingPath('token');
    }

    public function test_logout_revokes_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('pos-desktop')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Logged out successfully.');

        $this->assertDatabaseCount('personal_access_tokens', 0);

        $this->app['auth']->forgetGuards();

        $this->withToken($token)
            ->getJson('/api/current-user')
            ->assertUnauthorized();
    }
}
