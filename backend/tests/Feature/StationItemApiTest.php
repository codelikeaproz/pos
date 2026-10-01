<?php

namespace Tests\Feature;

use App\Models\InventoryMovement;
use App\Models\Item;
use App\Models\Station;
use App\Models\StationItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StationItemApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_station_inventory_requires_admin(): void
    {
        $this->getJson('/api/station-items')->assertUnauthorized();
        Sanctum::actingAs(User::factory()->endUser()->create());
        $this->getJson('/api/station-items')->assertForbidden();
        $this->postJson('/api/station-items', [])->assertForbidden();
    }

    public function test_admin_can_assign_show_update_and_remove_station_item(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $station = $this->station();
        $item = $this->item();
        $response = $this->postJson('/api/station-items', ['station_id' => $station->id, 'item_id' => $item->id, 'quantity' => '1.500'])
            ->assertCreated()
            ->assertJsonPath('station_item.quantity', '1.500')
            ->assertJsonPath('station_item.is_low_stock', true)
            ->assertJsonPath('station_item.item.item_code', 'ITM-001');
        $id = $response->json('station_item.id');
        $this->getJson("/api/station-items/{$id}")->assertOk()->assertJsonPath('station_item.station.name', 'Main Station');
        $this->putJson("/api/station-items/{$id}", ['quantity' => '2.750', 'station_id' => 999, 'item_id' => 999])
            ->assertOk()
            ->assertJsonPath('station_item.quantity', '2.750')
            ->assertJsonPath('station_item.is_low_stock', false)
            ->assertJsonPath('station_item.item.id', $item->id)
            ->assertJsonPath('station_item.station.id', $station->id);
        $this->deleteJson("/api/station-items/{$id}")->assertConflict();
        $this->assertDatabaseHas('inventory_movements', ['station_item_id' => $id, 'type' => 'ADJUSTMENT', 'quantity_change' => '1.250']);
        $this->assertDatabaseHas('items', ['id' => $item->id]);
        $this->assertDatabaseHas('stations', ['id' => $station->id]);
    }

    public function test_validation_duplicate_constraint_and_relationship_protection(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $station = $this->station();
        $item = $this->item();
        $payload = ['station_id' => $station->id, 'item_id' => $item->id, 'quantity' => '10.000'];
        $this->postJson('/api/station-items', $payload)->assertCreated();
        $this->postJson('/api/station-items', $payload)->assertUnprocessable()->assertJsonValidationErrors('item_id');
        $this->postJson('/api/station-items', [...$payload, 'item_id' => 999])->assertUnprocessable()->assertJsonValidationErrors('item_id');
        $this->postJson('/api/station-items', [...$payload, 'station_id' => 999])->assertUnprocessable()->assertJsonValidationErrors('station_id');
        $this->postJson('/api/station-items', [...$payload, 'item_id' => $this->item('ITM-002', 'Water')->id, 'quantity' => '-1'])->assertUnprocessable()->assertJsonValidationErrors('quantity');
        $this->deleteJson("/api/items/{$item->id}")->assertConflict();
        $this->deleteJson("/api/stations/{$station->id}")->assertConflict();
    }

    public function test_low_stock_status_includes_below_equal_and_above_reorder_point(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $station = $this->station();
        $item = $this->item(reorderPoint: '5.000');
        $response = $this->postJson('/api/station-items', [
            'station_id' => $station->id,
            'item_id' => $item->id,
            'quantity' => '5.000',
        ])->assertCreated()->assertJsonPath('station_item.is_low_stock', true);
        $id = $response->json('station_item.id');

        $this->putJson("/api/station-items/{$id}", ['quantity' => '4.999'])
            ->assertOk()->assertJsonPath('station_item.is_low_stock', true);
        $this->putJson("/api/station-items/{$id}", ['quantity' => '5.001'])
            ->assertOk()->assertJsonPath('station_item.is_low_stock', false);
    }

    public function test_filter_search_pagination_and_options(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $station = $this->station();
        $otherStation = Station::query()->create(['name' => 'Other', 'location' => 'Other']);
        foreach (range(1, 11) as $number) {
            $item = $this->item(sprintf('CODE-%02d', $number), sprintf('Drink %02d', $number), '2.000', $number === 1 ? 'Special unit' : 'PIECE');
            StationItem::query()->create(['station_id' => $station->id, 'item_id' => $item->id, 'quantity' => '10.000']);
        }
        StationItem::query()->create(['station_id' => $otherStation->id, 'item_id' => $this->item('OTHER', 'Other Item')->id, 'quantity' => '1.000']);
        $this->getJson("/api/station-items?station_id={$station->id}&page=1")->assertOk()->assertJsonCount(10, 'data')->assertJsonPath('meta.total', 11);
        foreach (['Drink 01', 'CODE-01', 'Special unit'] as $term) {
            $this->getJson("/api/station-items?station_id={$station->id}&search=".urlencode($term))->assertOk()->assertJsonCount(1, 'data');
        }
        $this->getJson("/api/station-items?station_id={$station->id}&search=missing")->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/station-item-options?item_search=CODE-11')->assertOk()->assertJsonCount(1, 'items')->assertJsonCount(2, 'stations');
    }

    public function test_inventory_summary_aggregates_recorded_movements_without_recalculating_current_balance(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);
        $station = $this->station();
        $otherStation = Station::query()->create(['name' => 'Other', 'location' => 'Other']);
        $item = $this->item(reorderPoint: '1.000');
        $otherItem = $this->item('ITM-002', 'Cake');
        $stationItem = StationItem::query()->create(['station_id' => $station->id, 'item_id' => $item->id, 'quantity' => '7.625']);
        $untouched = StationItem::query()->create(['station_id' => $station->id, 'item_id' => $otherItem->id, 'quantity' => '4.250']);
        $otherBalance = StationItem::query()->create(['station_id' => $otherStation->id, 'item_id' => $item->id, 'quantity' => '99.000']);

        foreach ([
            ['DELIVERY', '10.500'], ['DELIVERY', '1.125'],
            ['SALE', '-2.250'], ['SALE', '-0.375'],
            ['SPOILAGE', '-1.125'], ['SPOILAGE', '-0.500'],
            ['ADJUSTMENT', '0.375'], ['ADJUSTMENT', '-0.125'],
        ] as [$type, $quantity]) {
            InventoryMovement::query()->create(['station_item_id' => $stationItem->id, 'item_id' => $item->id, 'quantity_change' => $quantity, 'type' => $type, 'actor_id' => $admin->id]);
        }
        InventoryMovement::query()->create(['station_item_id' => $otherBalance->id, 'item_id' => $item->id, 'quantity_change' => '-50.000', 'type' => 'SALE', 'actor_id' => $admin->id]);
        InventoryMovement::query()->create(['station_item_id' => $untouched->id, 'item_id' => $otherItem->id, 'quantity_change' => '-1.000', 'type' => 'SALE', 'actor_id' => $admin->id]);

        $response = $this->getJson("/api/station-items?station_id={$station->id}&search=ITM-001")
            ->assertOk()->assertJsonCount(1, 'data');

        $response->assertJsonPath('data.0.current_quantity', '7.625')
            ->assertJsonPath('data.0.recorded_delivered_quantity', '11.625')
            ->assertJsonPath('data.0.recorded_sold_quantity', '2.625')
            ->assertJsonPath('data.0.recorded_spoilage_quantity', '1.625')
            ->assertJsonPath('data.0.reconciled_quantity', '11.875')
            ->assertJsonPath('data.0.stock_status', 'in_stock');

        $this->getJson("/api/station-items?station_id={$station->id}&search=ITM-002")
            ->assertOk()
            ->assertJsonPath('data.0.current_quantity', '4.250')
            ->assertJsonPath('data.0.recorded_delivered_quantity', '0.000')
            ->assertJsonPath('data.0.recorded_sold_quantity', '1.000')
            ->assertJsonPath('data.0.recorded_spoilage_quantity', '0.000')
            ->assertJsonPath('data.0.reconciled_quantity', '5.250');
    }

    private function station(): Station
    {
        return Station::query()->create(['name' => 'Main Station', 'location' => 'Main']);
    }

    private function item(string $code = 'ITM-001', string $name = 'Coke', string $reorderPoint = '2.000', string $unitsBackup = 'PIECE'): Item
    {
        return Item::query()->create(['item_code' => $code, 'name' => $name, 'quantity' => '0.000', 'units_backup' => $unitsBackup, 'unit' => '1', 'reorder_point' => $reorderPoint, 'price' => '10.00']);
    }
}
