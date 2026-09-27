<?php

namespace Tests\Feature;

use App\Models\Consignee;
use App\Models\Station;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ConsignmentAccountApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authorization_and_options(): void
    {
        $this->getJson('/api/consignment-accounts')->assertUnauthorized();
        Sanctum::actingAs(User::factory()->endUser()->create());
        $this->getJson('/api/consignment-accounts')->assertForbidden();
        Sanctum::actingAs(User::factory()->admin()->create());
        Station::query()->create(['name' => 'Station', 'location' => 'Main']);
        Consignee::query()->create(['name' => 'Consignee']);
        $this->getJson('/api/consignment-account-options')->assertOk()->assertJsonCount(1, 'stations')->assertJsonCount(1, 'consignees');
    }

    public function test_admin_can_create_update_and_delete_a_safe_account(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $station = Station::query()->create(['name' => 'Station', 'location' => 'Main']);
        $consignee = Consignee::query()->create(['name' => 'Consignee']);
        $payload = ['name' => 'Keith', 'email' => 'keith@example.com', 'station_id' => $station->id, 'consignee_id' => $consignee->id, 'password' => 'password123', 'password_confirmation' => 'password123'];
        $response = $this->postJson('/api/consignment-accounts', $payload)->assertCreated()
            ->assertJsonMissingPath('account.password')->assertJsonMissingPath('account.password_confirmation')
            ->assertJsonPath('account.station.name', 'Station')->assertJsonPath('account.consignee.name', 'Consignee');
        $account = User::query()->findOrFail($response->json('account.id'));
        $this->assertTrue(Hash::check('password123', $account->password));
        $hash = $account->password;
        $this->putJson("/api/consignment-accounts/{$account->id}", [...$payload, 'name' => 'Updated', 'password' => null, 'password_confirmation' => null])->assertOk();
        $this->assertSame($hash, $account->fresh()->password);
        $this->patchJson("/api/consignment-accounts/{$account->id}", [...$payload, 'password' => 'newpassword', 'password_confirmation' => 'newpassword'])->assertOk();
        $this->assertTrue(Hash::check('newpassword', $account->fresh()->password));
        $this->deleteJson("/api/consignment-accounts/{$account->id}")->assertOk();
    }

    public function test_validation_scope_search_pagination_and_relationship_protection(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $station = Station::query()->create(['name' => 'Protected Station', 'location' => 'Main']);
        $consignee = Consignee::query()->create(['name' => 'Protected Consignee']);
        $this->postJson('/api/consignment-accounts', [])->assertUnprocessable()->assertJsonValidationErrors(['name', 'email', 'station_id', 'consignee_id', 'password']);
        $ordinary = User::factory()->endUser()->create();
        $this->getJson("/api/consignment-accounts/{$ordinary->id}")->assertNotFound();
        foreach (range(1, 11) as $number) {
            User::factory()->create(['name' => sprintf('Account %02d', $number), 'email' => "account{$number}@example.com", 'station_id' => $station->id, 'consignee_id' => $consignee->id]);
        }
        $this->getJson('/api/consignment-accounts?search=Account&page=1')->assertOk()->assertJsonCount(10, 'data')->assertJsonPath('meta.total', 11);
        $this->deleteJson("/api/stations/{$station->id}")->assertStatus(409);
        $this->deleteJson("/api/consignees/{$consignee->id}")->assertStatus(409);
    }
}
