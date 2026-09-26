<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class UserManagementApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_management_requires_authentication(): void
    {
        $this->getJson('/api/users')->assertUnauthorized();
    }

    public function test_end_user_cannot_access_user_management(): void
    {
        Sanctum::actingAs(User::factory()->endUser()->create());

        $this->getJson('/api/users')->assertForbidden();
        $this->postJson('/api/users', [])->assertForbidden();
    }

    public function test_admin_can_list_search_and_view_users(): void
    {
        $admin = User::factory()->admin()->create(['name' => 'Zed Administrator']);
        $matchingUser = User::factory()->endUser()->create([
            'name' => 'Alice Operator',
            'email' => 'alice@example.com',
        ]);
        User::factory()->endUser()->create([
            'name' => 'Bob Operator',
            'email' => 'bob@example.com',
        ]);
        Sanctum::actingAs($admin);

        $this->getJson('/api/users?search=alice')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $matchingUser->id)
            ->assertJsonStructure(['data', 'links', 'meta']);

        $this->getJson("/api/users/{$matchingUser->id}")
            ->assertOk()
            ->assertJsonPath('user.email', 'alice@example.com')
            ->assertJsonMissingPath('user.password')
            ->assertJsonMissingPath('user.remember_token');
    }

    public function test_admin_can_create_end_user_with_hashed_password(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $response = $this->postJson('/api/users', [
            'name' => 'POS Operator',
            'email' => 'new.operator@example.com',
            'password' => 'secure-password',
            'role' => UserRole::EndUser->value,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('message', 'Employee created successfully.')
            ->assertJsonPath('user.role', UserRole::EndUser->value)
            ->assertJsonMissingPath('user.password')
            ->assertJsonMissingPath('user.remember_token');

        $createdUser = User::query()->where('email', 'new.operator@example.com')->firstOrFail();
        $this->assertTrue(Hash::check('secure-password', $createdUser->password));
        $this->assertNotSame('secure-password', $createdUser->password);
    }

    public function test_admin_can_create_another_admin(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/users', [
            'name' => 'Second Administrator',
            'email' => 'second.admin@example.com',
            'password' => 'secure-password',
            'role' => UserRole::Admin->value,
        ])
            ->assertCreated()
            ->assertJsonPath('user.role', UserRole::Admin->value);
    }

    /** @param array<string, string> $overrides */
    #[DataProvider('invalidUserDataProvider')]
    public function test_create_rejects_invalid_user_data(array $overrides, string $invalidField): void
    {
        User::factory()->create(['email' => 'existing@example.com']);
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/users', array_merge([
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'secure-password',
            'role' => UserRole::EndUser->value,
        ], $overrides))
            ->assertUnprocessable()
            ->assertJsonValidationErrors($invalidField);
    }

    /**
     * @return array<string, array{array<string, string>, string}>
     */
    public static function invalidUserDataProvider(): array
    {
        return [
            'duplicate email' => [['email' => 'existing@example.com'], 'email'],
            'invalid email' => [['email' => 'not-an-email'], 'email'],
            'invalid role' => [['role' => 'manager'], 'role'],
            'short password' => [['password' => 'short'], 'password'],
        ];
    }

    public function test_admin_can_update_user_without_changing_password(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->endUser()->create([
            'email' => 'operator@example.com',
            'password' => Hash::make('original-password'),
        ]);
        $originalPasswordHash = $user->password;
        Sanctum::actingAs($admin);

        $this->putJson("/api/users/{$user->id}", [
            'name' => 'Updated Operator',
            'email' => 'operator@example.com',
            'role' => UserRole::EndUser->value,
        ])
            ->assertOk()
            ->assertJsonPath('user.name', 'Updated Operator')
            ->assertJsonMissingPath('user.password');

        $this->assertSame($originalPasswordHash, $user->fresh()->password);
    }

    public function test_admin_can_update_user_password_securely(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->endUser()->create([
            'password' => Hash::make('original-password'),
        ]);
        Sanctum::actingAs($admin);

        $this->putJson("/api/users/{$user->id}", [
            'name' => $user->name,
            'email' => $user->email,
            'password' => 'replacement-password',
            'role' => UserRole::EndUser->value,
        ])
            ->assertOk()
            ->assertJsonMissingPath('user.password');

        $this->assertTrue(Hash::check('replacement-password', $user->fresh()->password));
    }

    public function test_admin_can_delete_another_user(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->endUser()->create();
        Sanctum::actingAs($admin);

        $this->deleteJson("/api/users/{$user->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Employee deleted successfully.');

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_admin_cannot_delete_their_own_account(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $this->deleteJson("/api/users/{$admin->id}")
            ->assertConflict()
            ->assertJsonPath('message', 'You cannot delete your own account while signed in.');

        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_last_admin_cannot_be_deleted(): void
    {
        $currentAdmin = User::factory()->admin()->create();
        $lastOtherAdmin = User::factory()->admin()->create();
        Sanctum::actingAs($currentAdmin);

        DB::table('users')->where('id', $currentAdmin->id)->update([
            'role' => UserRole::EndUser->value,
        ]);

        $this->deleteJson("/api/users/{$lastOtherAdmin->id}")
            ->assertConflict()
            ->assertJsonPath('message', 'The system must have at least one administrator.');

        $this->assertDatabaseHas('users', ['id' => $lastOtherAdmin->id]);
    }

    public function test_last_admin_cannot_be_demoted(): void
    {
        $currentAdmin = User::factory()->admin()->create();
        $lastOtherAdmin = User::factory()->admin()->create();
        Sanctum::actingAs($currentAdmin);

        DB::table('users')->where('id', $currentAdmin->id)->update([
            'role' => UserRole::EndUser->value,
        ]);

        $this->putJson("/api/users/{$lastOtherAdmin->id}", [
            'name' => $lastOtherAdmin->name,
            'email' => $lastOtherAdmin->email,
            'role' => UserRole::EndUser->value,
        ])
            ->assertConflict()
            ->assertJsonPath('message', 'The system must have at least one administrator.');

        $this->assertSame(UserRole::Admin, $lastOtherAdmin->fresh()->role);
    }

    public function test_admin_can_change_role_when_another_admin_remains(): void
    {
        $currentAdmin = User::factory()->admin()->create();
        $otherAdmin = User::factory()->admin()->create();
        Sanctum::actingAs($currentAdmin);

        $this->putJson("/api/users/{$otherAdmin->id}", [
            'name' => $otherAdmin->name,
            'email' => $otherAdmin->email,
            'role' => UserRole::EndUser->value,
        ])
            ->assertOk()
            ->assertJsonPath('user.role', UserRole::EndUser->value);
    }
}
