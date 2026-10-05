<?php

namespace Tests\Feature;

use App\Models\Station;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StationManagementApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_station_management_requires_authentication(): void
    {
        $this->getJson('/api/stations')->assertUnauthorized();
    }

    public function test_end_user_cannot_access_station_management(): void
    {
        Sanctum::actingAs(User::factory()->endUser()->create());

        $this->getJson('/api/stations')->assertForbidden();
        $this->postJson('/api/stations', [])->assertForbidden();
    }

    public function test_admin_can_create_show_and_delete_a_station(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $createResponse = $this->postJson('/api/stations', [
            'name' => 'Main Station',
            'location' => 'University HomeStay Lobby',
            'description' => 'Main University HomeStay POS Station',
        ])->assertCreated()
            ->assertJsonPath('message', 'Station added successfully.')
            ->assertJsonPath('station.name', 'Main Station');

        $stationId = $createResponse->json('station.id');

        $this->getJson("/api/stations/{$stationId}")
            ->assertOk()
            ->assertJsonPath('station.location', 'University HomeStay Lobby')
            ->assertJsonPath('station.description', 'Main University HomeStay POS Station');

        $this->deleteJson("/api/stations/{$stationId}")
            ->assertOk()
            ->assertJsonPath('message', 'Station deleted successfully.');

        $this->assertDatabaseMissing('stations', ['id' => $stationId]);
    }

    public function test_station_with_an_assigned_user_cannot_be_deleted(): void
    {
        $station = Station::query()->create(['name' => 'Main Station', 'location' => 'Main Lobby']);
        User::factory()->endUser()->create(['station_id' => $station->id]);
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/stations')
            ->assertOk()
            ->assertJsonPath('data.0.assigned_users_count', 1);

        $this->deleteJson("/api/stations/{$station->id}")
            ->assertConflict()
            ->assertJsonPath('message', 'This station is assigned to an account and cannot be deleted.');

        $this->assertDatabaseHas('stations', ['id' => $station->id]);
    }

    public function test_station_validation_rejects_missing_and_duplicate_names(): void
    {
        Station::query()->create(['name' => 'Main Station', 'location' => 'Main Lobby']);
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/stations', ['description' => 'Missing name'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');

        $this->postJson('/api/stations', ['name' => 'Main Station', 'location' => 'Main Lobby'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');

        $this->postJson('/api/stations', ['name' => 'Front Desk'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('location');
    }

    public function test_admin_can_update_with_put_and_retain_the_same_name(): void
    {
        $station = Station::query()->create(['name' => 'Main Station', 'location' => 'Main Lobby']);
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->putJson("/api/stations/{$station->id}", [
            'name' => 'Main Station',
            'location' => 'Ground Floor',
            'description' => 'Updated description',
        ])->assertOk()
            ->assertJsonPath('station.name', 'Main Station')
            ->assertJsonPath('station.location', 'Ground Floor')
            ->assertJsonPath('station.description', 'Updated description');
    }

    public function test_admin_can_update_with_patch(): void
    {
        $station = Station::query()->create(['name' => 'Front Desk', 'location' => 'Main Entrance']);
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->patchJson("/api/stations/{$station->id}", [
            'name' => 'Reception Desk',
            'location' => 'Main Entrance',
            'description' => null,
        ])->assertOk()
            ->assertJsonPath('station.name', 'Reception Desk');
    }

    public function test_searches_name_location_and_description_and_returns_empty_results(): void
    {
        Station::query()->create(['name' => 'Main Station', 'location' => 'Ground Floor', 'description' => 'Lobby terminal']);
        Station::query()->create(['name' => 'Cafeteria', 'location' => 'Second Floor', 'description' => 'Dining area']);
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/stations?search=main')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Main Station');
        $this->getJson('/api/stations?search=dining')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Cafeteria');
        $this->getJson('/api/stations?search=second')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Cafeteria');
        $this->getJson('/api/stations?search=missing')
            ->assertOk()->assertJsonCount(0, 'data')->assertJsonPath('meta.total', 0);
    }

    public function test_empty_search_is_sorted_and_pagination_uses_ten_records(): void
    {
        foreach (range(1, 11) as $number) {
            Station::query()->create([
                'name' => sprintf('Station %02d', $number),
                'location' => sprintf('Location %02d', $number),
            ]);
        }
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/stations?search=&page=1')
            ->assertOk()
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('data.0.name', 'Station 01')
            ->assertJsonPath('meta.per_page', 10)
            ->assertJsonPath('meta.total', 11)
            ->assertJsonPath('meta.last_page', 2);
    }
}
