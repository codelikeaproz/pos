<?php

namespace Tests\Feature;

use App\Models\Item;
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
            ->assertJsonPath('data.0.available_quantity', '10.500');
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

        foreach (range(1, 11) as $number) {
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
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('data.0.name', 'Item 01')
            ->assertJsonPath('data.0.available_quantity', '0.000')
            ->assertJsonPath('meta.total', 11)
            ->assertJsonPath('meta.last_page', 2);

        foreach (['Item 01', 'CODE-01', 'SPECIAL UNIT'] as $searchTerm) {
            $this->getJson('/api/pos/items?search='.urlencode($searchTerm))
                ->assertOk()->assertJsonCount(1, 'data');
        }
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
        string $globalQuantity = '0.000'
    ): Item {
        return Item::query()->create([
            'item_code' => $code,
            'name' => $name,
            'quantity' => $globalQuantity,
            'units_backup' => $unit,
            'unit' => '1',
            'reorder_point' => '0.000',
            'price' => $price,
        ]);
    }
}
