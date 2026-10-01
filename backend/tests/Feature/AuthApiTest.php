<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Privilege;
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

    public function test_login_validates_email_and_password(): void
    {
        $this->postJson('/api/login', [
            'email' => 'not-an-email',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_login_is_rate_limited_after_five_attempts(): void
    {
        $credentials = [
            'email' => 'throttled@example.com',
            'password' => 'wrong-password',
        ];

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/login', $credentials)
                ->assertUnprocessable()
                ->assertJsonPath('errors.email.0', 'Invalid credentials.');
        }

        $this->postJson('/api/login', $credentials)
            ->assertTooManyRequests();
    }

    public function test_current_user_requires_authentication(): void
    {
        $this->getJson('/api/current-user')->assertUnauthorized();
    }

    public function test_current_user_returns_authenticated_user(): void
    {
        $user = User::factory()->admin()->create();
        $user->privileges()->attach(Privilege::query()->create(['description' => 'Cashier']));

        Sanctum::actingAs($user);

        $this->getJson('/api/current-user')
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.role', UserRole::Admin->value)
            ->assertJsonPath('user.privileges.0.description', 'Cashier')
            ->assertJsonMissingPath('user.password')
            ->assertJsonMissingPath('token');
    }

    public function test_expired_token_is_rejected(): void
    {
        $user = User::factory()->create();
        $expiredToken = $user
            ->createToken('expired-pos-desktop', ['*'], now()->subMinute())
            ->plainTextToken;

        $this->withToken($expiredToken)
            ->getJson('/api/current-user')
            ->assertUnauthorized();
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

    public function test_logout_revokes_only_the_current_token(): void
    {
        $user = User::factory()->create();
        $currentToken = $user->createToken('current-pos-desktop')->plainTextToken;
        $otherToken = $user->createToken('other-pos-desktop')->plainTextToken;

        $this->withToken($currentToken)
            ->postJson('/api/logout')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 1);

        $this->app['auth']->forgetGuards();

        $this->withToken($currentToken)
            ->getJson('/api/current-user')
            ->assertUnauthorized();

        $this->app['auth']->forgetGuards();

        $this->withToken($otherToken)
            ->getJson('/api/current-user')
            ->assertOk()
            ->assertJsonPath('user.id', $user->id);
    }
}
