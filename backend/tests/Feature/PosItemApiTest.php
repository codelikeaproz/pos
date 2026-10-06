<?php

namespace Tests\Feature;

use App\Models\InventoryMovement;
use App\Models\Item;
use App\Models\Price;
use App\Models\Station;
use App\Models\StationItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PosItemApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_pos_items_require_authentication(): void
    {
        $this->getJson('/api/pos/items')->assertUnauthorized();
    }

    public function test_accounts_without_a_station_receive_a_business_conflict(): void
    {
        Sanctum::actingAs(User::factory()->endUser()->create(['station_id' => null]));

        $this->getJson('/api/pos/items')
            ->assertConflict()
            ->assertJsonPath('message', 'This account is not assigned to a station.');
    }

    public function test_end_user_receives_only_items_from_their_assigned_station(): void
    {
        [$station, $otherStation] = $this->stations();
        $user = User::factory()->endUser()->create(['station_id' => $station->id]);
        $assigned = $this->item('DR-001', 'Water', 'BOTTLE', '15.00', '999.000');
        $other = $this->item('FD-001', 'Burger', 'PIECE', '50.00');
        StationItem::query()->create(['station_id' => $station->id, 'item_id' => $assigned->id, 'quantity' => '10.500']);
        StationItem::query()->create(['station_id' => $otherStation->id, 'item_id' => $other->id, 'quantity' => '5.000']);
        Sanctum::actingAs($user);

        $this->getJson("/api/pos/items?station_id={$otherStation->id}")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('station.id', $station->id)
            ->assertJsonPath('station.name', 'Main Station')
            ->assertJsonPath('data.0.id', $assigned->id)
            ->assertJsonPath('data.0.item_code', 'DR-001')
            ->assertJsonPath('data.0.name', 'Water')
            ->assertJsonPath('data.0.unit', 'BOTTLE')
            ->assertJsonPath('data.0.price', '15.00')
            ->assertJsonPath('data.0.available_quantity', '10.500')
            ->assertJsonPath('data.0.is_low_stock', true);
    }

    public function test_admin_with_an_assigned_station_can_use_the_pos_endpoint(): void
    {
        [$station] = $this->stations();
        $item = $this->item();
        StationItem::query()->create(['station_id' => $station->id, 'item_id' => $item->id, 'quantity' => '1.000']);
        Sanctum::actingAs(User::factory()->admin()->create(['station_id' => $station->id]));

        $this->getJson('/api/pos/items')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_search_pagination_ordering_and_zero_stock_inclusion(): void
    {
        [$station] = $this->stations();
        Sanctum::actingAs(User::factory()->endUser()->create(['station_id' => $station->id]));

        foreach (range(1, 16) as $number) {
            $item = $this->item(
                sprintf('CODE-%02d', $number),
                sprintf('Item %02d', $number),
                $number === 1 ? 'SPECIAL UNIT' : 'PIECE'
            );
            StationItem::query()->create([
                'station_id' => $station->id,
                'item_id' => $item->id,
                'quantity' => $number === 1 ? '0.000' : '2.000',
            ]);
        }

        $this->getJson('/api/pos/items?page=1')
            ->assertOk()
            ->assertJsonCount(15, 'data')
            ->assertJsonPath('data.0.name', 'Item 01')
            ->assertJsonPath('data.0.available_quantity', '0.000')
            ->assertJsonPath('data.0.is_low_stock', true)
            ->assertJsonPath('meta.total', 16)
            ->assertJsonPath('meta.last_page', 2);
        $this->getJson('/api/pos/items?per_page=15')->assertOk()
            ->assertJsonCount(15, 'data')->assertJsonPath('meta.per_page', 15)->assertJsonPath('meta.last_page', 2);

        foreach (['Item 01', 'CODE-01', 'SPECIAL UNIT'] as $searchTerm) {
            $this->getJson('/api/pos/items?search='.urlencode($searchTerm))
                ->assertOk()->assertJsonCount(1, 'data');
        }
    }

    public function test_exact_code_match_is_first_even_when_name_matches_fill_the_first_page(): void
    {
        [$station] = $this->stations();
        Sanctum::actingAs(User::factory()->endUser()->create(['station_id' => $station->id]));

        foreach (range(1, 11) as $number) {
            $item = $this->item(sprintf('OTHER-%02d', $number), 'Coke');
            StationItem::query()->create(['station_id' => $station->id, 'item_id' => $item->id, 'quantity' => '2.000']);
        }

        $exact = $this->item('COKE', 'Zulu Drink');
        StationItem::query()->create(['station_id' => $station->id, 'item_id' => $exact->id, 'quantity' => '3.000']);

        $this->getJson('/api/pos/items?search=coke')
            ->assertOk()
            ->assertJsonPath('meta.total', 12)
            ->assertJsonPath('data.0.item_code', 'COKE')
            ->assertJsonPath('data.0.name', 'Zulu Drink')
            ->assertJsonPath('data.1.name', 'Coke')
            ->assertJsonPath('data.2.name', 'Coke');
    }

    public function test_station_inventory_modal_endpoint_requires_authentication_and_assigned_station(): void
    {
        $this->getJson('/api/pos/station-inventory')->assertUnauthorized();
        Sanctum::actingAs(User::factory()->endUser()->create(['station_id' => null]));
        $this->getJson('/api/pos/station-inventory')->assertConflict()
            ->assertJsonPath('message', 'This account is not assigned to a station.');
    }

    public function test_station_inventory_includes_inactive_unpriced_and_zero_stock_items_but_only_at_authenticated_station(): void
    {
        [$station, $otherStation] = $this->stations();
        $inactive = $this->item('INACTIVE', 'Inactive Item');
        $inactive->update(['is_active' => false]);
        $unpriced = $this->item('UNPRICED', 'Unpriced Item');
        $unpriced->prices()->delete();
        $elsewhere = $this->item('OTHER', 'Other Station Item');
        StationItem::query()->create(['station_id' => $station->id, 'item_id' => $inactive->id, 'quantity' => '2.500']);
        StationItem::query()->create(['station_id' => $station->id, 'item_id' => $unpriced->id, 'quantity' => '0.000']);
        StationItem::query()->create(['station_id' => $otherStation->id, 'item_id' => $elsewhere->id, 'quantity' => '9.000']);

        Sanctum::actingAs(User::factory()->admin()->create(['station_id' => $station->id]));
        $this->getJson("/api/pos/station-inventory?station_id={$otherStation->id}")
            ->assertOk()->assertJsonPath('station.id', $station->id)
            ->assertJsonCount(2, 'data')->assertJsonPath('data.0.itemCode', 'INACTIVE')
            ->assertJsonPath('data.0.isActive', false)->assertJsonPath('data.0.quantity', '2.500')
            ->assertJsonPath('data.0.isLowStock', false)
            ->assertJsonPath('data.1.itemCode', 'UNPRICED')->assertJsonPath('data.1.quantity', '0.000')
            ->assertJsonPath('data.1.isLowStock', true);

        Sanctum::actingAs(User::factory()->endUser()->create(['station_id' => $station->id]));
        $this->getJson('/api/pos/station-inventory?search=UNPRICED')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.itemId', $unpriced->id);
        $this->getJson('/api/pos/station-inventory?search=other')
            ->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_station_inventory_searches_codes_and_paginates_fifteen_rows(): void
    {
        [$station] = $this->stations();
        Sanctum::actingAs(User::factory()->endUser()->create(['station_id' => $station->id]));
        foreach (range(1, 16) as $number) {
            $item = $this->item(sprintf('INV-%02d', $number), sprintf('Stock %02d', $number));
            StationItem::query()->create(['station_id' => $station->id, 'item_id' => $item->id, 'quantity' => '1.000']);
        }
        $this->getJson('/api/pos/station-inventory')->assertOk()->assertJsonCount(15, 'data')
            ->assertJsonPath('meta.total', 16)->assertJsonPath('meta.last_page', 2);
        $this->getJson('/api/pos/station-inventory?page=2')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/pos/station-inventory?search=INV-04')->assertOk()
            ->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Stock 04');
        $this->getJson('/api/pos/station-inventory?search='.str_repeat('x', 101))
            ->assertUnprocessable()->assertJsonValidationErrors('search');
    }

    public function test_station_inventory_summary_is_scoped_and_includes_inactive_items(): void
    {
        [$station, $otherStation] = $this->stations();
        $user = User::factory()->endUser()->create(['station_id' => $station->id]);
        $item = $this->item('SUM-001', 'Summary Item', 'BOTTLE', '10.00');
        $item->update(['is_active' => false]);
        $stationItem = StationItem::query()->create(['station_id' => $station->id, 'item_id' => $item->id, 'quantity' => '3.750']);
        $other = StationItem::query()->create(['station_id' => $otherStation->id, 'item_id' => $item->id, 'quantity' => '50.000']);
        foreach ([['DELIVERY', '5.500'], ['SALE', '-1.250'], ['SPOILAGE', '-0.500']] as [$type, $quantity]) {
            InventoryMovement::query()->create(['station_item_id' => $stationItem->id, 'item_id' => $item->id, 'quantity_change' => $quantity, 'type' => $type]);
        }
        InventoryMovement::query()->create(['station_item_id' => $other->id, 'item_id' => $item->id, 'quantity_change' => '-40.000', 'type' => 'SALE']);
        Sanctum::actingAs($user);

        $this->getJson('/api/pos/station-inventory?search=SUM-001')
            ->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.isActive', false)
            ->assertJsonPath('data.0.currentQuantity', '3.750')
            ->assertJsonPath('data.0.recordedDeliveredQuantity', '5.500')
            ->assertJsonPath('data.0.recordedSoldQuantity', '1.250')
            ->assertJsonPath('data.0.recordedSpoilageQuantity', '0.500');
    }

    /** @return array{Station, Station} */
    private function stations(): array
    {
        return [
            Station::query()->create(['name' => 'Main Station', 'location' => 'Main']),
            Station::query()->create(['name' => 'Other Station', 'location' => 'Other']),
        ];
    }

    private function item(
        string $code = 'ITM-001',
        string $name = 'Test Item',
        string $unit = 'PIECE',
        string $price = '20.00',
        string $reorderPoint = '0.000'
    ): Item {
        $item = Item::query()->create([
            'item_code' => $code,
            'name' => $name,
            'units_backup' => $unit,
            'unit' => '1',
            'reorder_point' => $reorderPoint,
            'price' => $price,
        ]);
        Price::query()->create(['item_id' => $item->id, 'amount' => $price, 'is_active' => true]);

        return $item;
    }
}
