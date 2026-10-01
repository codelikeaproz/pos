<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Privilege;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PrivilegeApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_search_create_and_edit_privileges(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        Privilege::query()->create(['description' => 'Cashier']);
        Privilege::query()->create(['description' => 'Clerk']);

        $this->getJson('/api/privileges?search=cash')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.description', 'Cashier');
        $created = $this->postJson('/api/privileges', ['description' => '  Purchaser  '])
            ->assertCreated()->assertJsonPath('privilege.description', 'Purchaser');
        $this->patchJson('/api/privileges/'.$created->json('privilege.id'), ['description' => 'Collector'])
            ->assertOk()->assertJsonPath('privilege.description', 'Collector');
    }

    public function test_privilege_validation_rejects_blank_long_and_case_insensitive_duplicate_descriptions(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        Privilege::query()->create(['description' => 'Cashier']);

        $this->postJson('/api/privileges', ['description' => '   '])->assertUnprocessable()->assertJsonValidationErrors('description');
        $this->postJson('/api/privileges', ['description' => str_repeat('a', 101)])->assertUnprocessable()->assertJsonValidationErrors('description');
        $this->postJson('/api/privileges', ['description' => 'cashier'])->assertUnprocessable()->assertJsonValidationErrors('description');
    }

    public function test_end_user_cannot_manage_privileges_or_assignments(): void
    {
        $user = User::factory()->endUser()->create();
        Sanctum::actingAs($user);
        $this->getJson('/api/privileges')->assertForbidden();
        $this->postJson('/api/privileges', ['description' => 'Clerk'])->assertForbidden();
        $this->getJson('/api/privilege-assignments')->assertForbidden();
        $this->putJson("/api/privilege-assignments/{$user->id}", ['privilege_ids' => []])->assertForbidden();
    }

    public function test_admin_can_view_and_replace_multiple_assignments_without_changing_role(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $user = User::factory()->endUser()->create(['name' => 'Juan']);
        $cashier = Privilege::query()->create(['description' => 'Cashier']);
        $clerk = Privilege::query()->create(['description' => 'Clerk']);
        $admin = Privilege::query()->create(['description' => 'Admin']);
        $other = User::factory()->endUser()->create();
        $other->privileges()->attach($cashier);

        $this->putJson("/api/privilege-assignments/{$user->id}", ['privilege_ids' => [$cashier->id, $clerk->id]])->assertOk();
        $this->assertEqualsCanonicalizing([$cashier->id, $clerk->id], $user->fresh()->privileges()->pluck('privileges.id')->all());
        $this->assertTrue($cashier->users()->whereKey($user->id)->exists());
        $this->assertTrue($cashier->users()->whereKey($other->id)->exists());

        $this->putJson("/api/privilege-assignments/{$user->id}", ['privilege_ids' => [$admin->id]])->assertOk();
        $this->assertSame([$admin->id], $user->fresh()->privileges()->pluck('privileges.id')->all());
        $this->assertSame(UserRole::EndUser, $user->fresh()->role);
        $this->getJson('/api/privilege-assignments?search=Juan')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.privilegeIds.0', $admin->id);
    }

    public function test_assignment_validation_rejects_duplicate_and_invalid_privilege_ids_and_missing_user(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $user = User::factory()->endUser()->create();
        $privilege = Privilege::query()->create(['description' => 'Cashier']);
        $this->putJson("/api/privilege-assignments/{$user->id}", ['privilege_ids' => [$privilege->id, $privilege->id]])->assertUnprocessable()->assertJsonValidationErrors('privilege_ids.1');
        $this->putJson("/api/privilege-assignments/{$user->id}", ['privilege_ids' => [999999]])->assertUnprocessable()->assertJsonValidationErrors('privilege_ids.0');
        $this->putJson('/api/privilege-assignments/999999', ['privilege_ids' => []])->assertNotFound();
    }

    public function test_admin_business_privilege_does_not_grant_admin_authorization(): void
    {
        $user = User::factory()->endUser()->create();
        $user->privileges()->attach(Privilege::query()->create(['description' => 'Admin']));
        Sanctum::actingAs($user);
        $this->getJson('/api/users')->assertForbidden();
        $this->getJson('/api/privileges')->assertForbidden();
    }

    public function test_pivot_has_expected_foreign_keys_and_rejects_duplicate_pairs(): void
    {
        $this->assertTrue(Schema::hasTable('privileges'));
        $this->assertTrue(Schema::hasTable('user_privilege'));
        $foreignKeys = collect(Schema::getForeignKeys('user_privilege'));
        $this->assertTrue($foreignKeys->contains(fn (array $key) => $key['foreign_table'] === 'users' && $key['on_delete'] === 'cascade'));
        $this->assertTrue($foreignKeys->contains(fn (array $key) => $key['foreign_table'] === 'privileges' && $key['on_delete'] === 'restrict'));
        $user = User::factory()->create();
        $privilege = Privilege::query()->create(['description' => 'Cashier']);
        $user->privileges()->attach($privilege);
        $this->expectException(QueryException::class);
        DB::table('user_privilege')->insert(['user_id' => $user->id, 'privilege_id' => $privilege->id, 'created_at' => now(), 'updated_at' => now()]);
    }

    public function test_deleting_a_user_removes_current_assignments_but_preserves_privileges(): void
    {
        $user = User::factory()->create();
        $privilege = Privilege::query()->create(['description' => 'Cashier']);
        $user->privileges()->attach($privilege);
        $user->delete();
        $this->assertDatabaseMissing('user_privilege', ['user_id' => $user->id]);
        $this->assertDatabaseHas('privileges', ['id' => $privilege->id]);
    }
}
