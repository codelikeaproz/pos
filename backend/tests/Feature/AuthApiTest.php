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
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'sex', 'role']]);

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

    public function test_inactive_user_cannot_login(): void
    {
        User::factory()->create([
            'email' => 'inactive@example.com',
            'password' => Hash::make('password'),
            'is_active' => false,
        ]);

        $this->postJson('/api/login', ['email' => 'inactive@example.com', 'password' => 'password'])
            ->assertUnprocessable()
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
            ->assertJsonPath('user.sex', $user->sex)
            ->assertJsonPath('user.privileges.0.description', 'Cashier')
            ->assertJsonMissingPath('user.password')
            ->assertJsonMissingPath('token');
    }

    public function test_authenticated_user_can_update_own_profile_without_changing_authorization(): void
    {
        $user = User::factory()->endUser()->create(['email' => 'operator@example.com']);
        Sanctum::actingAs($user);

        $this->patchJson('/api/current-user', [
            'name' => 'Updated Operator',
            'email' => 'updated@example.com',
            'sex' => 'female',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
            'role' => UserRole::Admin->value,
        ])->assertOk()
            ->assertJsonPath('message', 'Profile updated successfully.')
            ->assertJsonPath('user.name', 'Updated Operator')
            ->assertJsonPath('user.email', 'updated@example.com')
            ->assertJsonPath('user.sex', 'female')
            ->assertJsonPath('user.role', UserRole::EndUser->value);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Operator',
            'email' => 'updated@example.com',
            'sex' => 'female',
            'role' => UserRole::EndUser->value,
        ]);
        $this->assertTrue(Hash::check('new-password', $user->fresh()->password));
    }

    public function test_profile_update_requires_authentication_and_valid_identity_fields(): void
    {
        $this->patchJson('/api/current-user', [])->assertUnauthorized();

        $user = User::factory()->admin()->create();
        $other = User::factory()->create();
        Sanctum::actingAs($user);

        $this->patchJson('/api/current-user', ['name' => '', 'email' => 'invalid', 'sex' => 'unknown'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'sex']);

        $this->patchJson('/api/current-user', ['name' => $user->name, 'email' => $other->email, 'sex' => $user->sex])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);

        $this->patchJson('/api/current-user', ['name' => $user->name, 'email' => $user->email, 'sex' => $user->sex, 'password' => 'new-password', 'password_confirmation' => 'different'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
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

    public function test_desktop_tokens_expire_after_twelve_hours(): void
    {
        $this->assertSame(720, config('sanctum.expiration'));
    }

    public function test_changing_own_password_revokes_all_tokens(): void
    {
        $user = User::factory()->create(['password' => Hash::make('old-password')]);
        $currentToken = $user->createToken('current-pos-desktop')->plainTextToken;
        $user->createToken('other-pos-desktop');

        $this->withToken($currentToken)->patchJson('/api/current-user', [
            'name' => $user->name,
            'email' => $user->email,
            'sex' => $user->sex,
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->app['auth']->forgetGuards();
        $this->withToken($currentToken)->getJson('/api/current-user')->assertUnauthorized();
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
