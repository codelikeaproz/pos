<?php

namespace Tests\Feature;

use App\Models\InventoryMovement;
use App\Models\Item;
use App\Models\Price;
use App\Models\Spoilage;
use App\Models\SpoilageItem;
use App\Models\Station;
use App\Models\StationItem;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SpoilageApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_routes_are_admin_only_and_completed_records_cannot_be_edited_or_deleted(): void
    {
        [$station, $admin] = $this->setupStation();
        $spoilage = Spoilage::query()->create(['spoilage_number' => 'SPL-20260930-000001', 'station_id' => $station->id, 'recorded_by_id' => $admin->id, 'spoiled_at' => now()]);
        $this->getJson('/api/spoilages')->assertUnauthorized();
        $this->getJson('/api/spoilage-options')->assertUnauthorized();
        $this->postJson('/api/spoilages', [])->assertUnauthorized();
        Sanctum::actingAs(User::factory()->endUser()->create());
        $this->getJson('/api/spoilages')->assertForbidden();
        $this->getJson('/api/spoilage-options')->assertForbidden();
        $this->getJson('/api/spoilages/'.$spoilage->id)->assertForbidden();
        $this->postJson('/api/spoilages', [])->assertForbidden();
        Sanctum::actingAs($admin);
        $this->putJson('/api/spoilages/'.$spoilage->id, [])->assertStatus(405);
        $this->deleteJson('/api/spoilages/'.$spoilage->id)->assertStatus(405);
    }

    public function test_spoilage_deducts_exact_stock_and_records_negative_movements_for_multiple_items(): void
    {
        [$station, $admin] = $this->setupStation();
        [$beef, $beefStock] = $this->stock($station, 'BEEF', 'Beef', '20.000');
        [$milk, $milkStock] = $this->stock($station, 'MILK', 'Milk', '10.000');
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/spoilages', [
            'stationId' => $station->id, 'reason' => 'Power interruption', 'recordedById' => 999,
            'spoilageNumber' => 'FAKE', 'items' => [
                ['itemId' => $beef->id, 'quantity' => '2.500', 'itemName' => 'Fake'],
                ['itemId' => $milk->id, 'quantity' => '1.125'],
            ],
        ])->assertCreated()->assertJsonPath('spoilage.recordedBy.id', $admin->id);
        $id = $response->json('spoilage.id');
        $this->assertMatchesRegularExpression('/^SPL-\d{8}-\d{6}$/', $response->json('spoilage.spoilageNumber'));
        $this->assertSame('17.500', $beefStock->fresh()->quantity);
        $this->assertSame('8.875', $milkStock->fresh()->quantity);
        $this->assertSame('0.000', $beef->fresh()->quantity);
        $this->assertDatabaseCount('spoilage_items', 2);
        $this->assertSame(['-2.500', '-1.125'], InventoryMovement::query()->orderBy('item_id')->pluck('quantity_change')->all());
        $this->assertSame(2, InventoryMovement::query()->where('type', 'SPOILAGE')->count());
        $movement = InventoryMovement::query()->firstOrFail();
        $this->assertSame($beefStock->id, $movement->station_item_id);
        $this->assertSame($admin->id, $movement->actor_id);
        $this->assertSame('spoilage_item', $movement->reference_type);
        $this->assertSame(SpoilageItem::query()->firstOrFail()->id, $movement->reference_id);

        $record = Spoilage::query()->findOrFail($id);
        $this->assertSame($station->id, $record->station->id);
        $this->assertSame($admin->id, $record->recordedBy->id);
        $this->assertCount(2, $record->items);
        $this->assertSame($beef->id, $record->items->first()->item->id);
        $beef->update(['name' => 'Renamed Beef', 'item_code' => 'NEW-BEEF']);
        $this->getJson('/api/spoilages/'.$id)->assertOk()->assertJsonPath('spoilage.items.0.itemName', 'Beef')->assertJsonPath('spoilage.items.0.itemCode', 'BEEF');
    }

    public function test_station_scoped_options_allow_inactive_items_with_stock_and_no_price(): void
    {
        [$station, $admin] = $this->setupStation();
        [$item, $balance] = $this->stock($station, 'OLD', 'Old Stock', '3.000');
        $item->update(['is_active' => false]);
        $otherStation = Station::query()->create(['name' => 'Other', 'location' => 'Other']);
        $this->stock($otherStation, 'OTHER', 'Other Stock', '4.000');
        $this->stock($station, 'ZERO', 'Zero Stock', '0.000');
        Sanctum::actingAs($admin);
        $this->getJson('/api/spoilage-options?station_id='.$station->id)->assertOk()->assertJsonCount(1, 'items')->assertJsonPath('items.0.id', $item->id)->assertJsonPath('items.0.available', '3.000');
        $this->getJson('/api/spoilage-options?station_id='.$station->id.'&item_search=OLD')->assertOk()->assertJsonCount(1, 'items');
        $this->postJson('/api/spoilages', ['stationId' => $station->id, 'items' => [['itemId' => $item->id, 'quantity' => '1.000']]])->assertCreated();
        $this->assertSame('2.000', $balance->fresh()->quantity);
        $this->assertSame(0, Price::query()->count());
    }

    public function test_incident_date_can_be_backdated_but_not_set_in_the_future(): void
    {
        $this->travelTo(CarbonImmutable::parse('2026-10-01 04:00:00', 'UTC'));
        [$station, $admin] = $this->setupStation();
        [$item] = $this->stock($station, 'A', 'Apple', '5.000');
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/spoilages', [
            'stationId' => $station->id,
            'incidentDate' => '2026-09-25',
            'items' => [['itemId' => $item->id, 'quantity' => '1.000']],
        ])->assertCreated();

        $this->assertStringStartsWith('SPL-20260925-', $response->json('spoilage.spoilageNumber'));
        $this->assertSame('2026-09-25', Spoilage::query()->findOrFail($response->json('spoilage.id'))->spoiled_at->setTimezone('Asia/Manila')->toDateString());

        $this->postJson('/api/spoilages', [
            'stationId' => $station->id,
            'incidentDate' => '2026-10-02',
            'items' => [['itemId' => $item->id, 'quantity' => '1.000']],
        ])->assertUnprocessable()->assertJsonValidationErrors('incidentDate');
    }

    public function test_validation_and_stale_stock_reject_without_partial_writes(): void
    {
        [$station, $admin] = $this->setupStation();
        [$item, $stock] = $this->stock($station, 'A', 'Apple', '5.000');
        $unassigned = $this->item('B', 'Bread');
        Sanctum::actingAs($admin);
        $base = ['stationId' => $station->id, 'items' => [['itemId' => $item->id, 'quantity' => '1.000']]];
        $this->postJson('/api/spoilages', array_merge($base, ['stationId' => 999]))->assertUnprocessable();
        $this->postJson('/api/spoilages', array_merge($base, ['items' => []]))->assertUnprocessable();
        $this->postJson('/api/spoilages', array_merge($base, ['items' => [['itemId' => 999, 'quantity' => '1']]]))->assertUnprocessable();
        $this->postJson('/api/spoilages', array_merge($base, ['items' => [['itemId' => $unassigned->id, 'quantity' => '1']]]))->assertUnprocessable();
        $this->postJson('/api/spoilages', array_merge($base, ['items' => [$base['items'][0], $base['items'][0]]]))->assertUnprocessable();
        foreach (['0', '-1', '1.0001', '1000000000'] as $quantity) {
            $this->postJson('/api/spoilages', array_merge($base, ['items' => [['itemId' => $item->id, 'quantity' => $quantity]]]))->assertUnprocessable();
        }
        $this->postJson('/api/spoilages', array_merge($base, ['items' => [['itemId' => $item->id, 'quantity' => '6.000']]]))
            ->assertConflict()->assertJsonPath('currentStock.0.itemId', $item->id)->assertJsonPath('currentStock.0.available', '5.000');
        $stock->update(['quantity' => '2.000']);
        $this->postJson('/api/spoilages', array_merge($base, ['items' => [['itemId' => $item->id, 'quantity' => '3.000']]]))
            ->assertConflict()->assertJsonPath('currentStock.0.available', '2.000');
        $this->assertDatabaseCount('spoilages', 0);
        $this->assertDatabaseCount('spoilage_items', 0);
        $this->assertDatabaseCount('inventory_movements', 0);
        $this->assertSame('2.000', $stock->fresh()->quantity);
    }

    public function test_second_item_movement_failure_rolls_back_all_spoilage_and_stock(): void
    {
        [$station, $admin] = $this->setupStation();
        [$first, $firstStock] = $this->stock($station, 'A', 'Apple', '10.000');
        [$second, $secondStock] = $this->stock($station, 'B', 'Bread', '20.000');
        Sanctum::actingAs($admin);
        $count = 0;
        Event::listen('eloquent.creating: '.InventoryMovement::class, function () use (&$count) {
            if (++$count === 2) {
                throw new \RuntimeException('Second movement failed');
            }
        });
        try {
            $this->withoutExceptionHandling()->postJson('/api/spoilages', [
                'stationId' => $station->id,
                'items' => [['itemId' => $first->id, 'quantity' => '2.000'], ['itemId' => $second->id, 'quantity' => '5.000']],
            ]);
            $this->fail('Expected failure');
        } catch (\RuntimeException $exception) {
            $this->assertSame('Second movement failed', $exception->getMessage());
        } finally {
            Event::forget('eloquent.creating: '.InventoryMovement::class);
        }
        $this->assertDatabaseCount('spoilages', 0);
        $this->assertDatabaseCount('spoilage_items', 0);
        $this->assertDatabaseCount('inventory_movements', 0);
        $this->assertSame('10.000', $firstStock->fresh()->quantity);
        $this->assertSame('20.000', $secondStock->fresh()->quantity);
    }

    public function test_search_pagination_and_unique_number_constraint(): void
    {
        [$station, $admin] = $this->setupStation();
        [$item] = $this->stock($station, 'A', 'Apple', '20.000');
        Sanctum::actingAs($admin);
        for ($i = 0; $i < 11; $i++) {
            $this->postJson('/api/spoilages', ['stationId' => $station->id, 'reason' => 'Damage', 'items' => [['itemId' => $item->id, 'quantity' => '1.000']]])->assertCreated();
        }
        $this->getJson('/api/spoilages')->assertOk()->assertJsonCount(10, 'data')->assertJsonPath('meta.total', 11);
        $this->getJson('/api/spoilages?search=Damage')->assertOk()->assertJsonPath('meta.total', 11);
        $this->getJson('/api/spoilages?station_id='.$station->id)->assertOk()->assertJsonPath('meta.total', 11);
        $this->assertSame(11, Spoilage::query()->distinct()->count('spoilage_number'));
        $existing = Spoilage::query()->firstOrFail();
        try {
            Spoilage::query()->create(['spoilage_number' => $existing->spoilage_number, 'station_id' => $station->id, 'recorded_by_id' => $admin->id, 'spoiled_at' => now()]);
            $this->fail('Expected unique constraint');
        } catch (QueryException) {
            $this->assertDatabaseCount('spoilages', 11);
        }
    }

    public function test_sale_delivery_spoilage_and_adjustment_share_the_same_station_balance(): void
    {
        [$station, $admin] = $this->setupStation();
        [$item, $stock] = $this->stock($station, 'A', 'Apple', '10.000');
        $item->prices()->create(['amount' => '10.00', 'is_active' => true]);
        $cashier = User::factory()->endUser()->create(['station_id' => $station->id]);

        Sanctum::actingAs($cashier);
        $this->postJson('/api/pos/checkout', ['items' => [['itemId' => $item->id, 'quantity' => '3.000', 'expectedUnitPrice' => '10.00']], 'paymentMethod' => 'cash', 'cashReceived' => '30.00'])->assertCreated();
        $this->assertSame('7.000', $stock->fresh()->quantity);

        Sanctum::actingAs($admin);
        $this->postJson('/api/spoilages', ['stationId' => $station->id, 'items' => [['itemId' => $item->id, 'quantity' => '8.000']]])
            ->assertConflict()->assertJsonPath('currentStock.0.available', '7.000');
        $this->postJson('/api/item-deliveries', ['stationId' => $station->id, 'receivedById' => $cashier->id, 'items' => [['itemId' => $item->id, 'quantity' => '5.000']]])->assertCreated();
        $this->assertSame('12.000', $stock->fresh()->quantity);
        $this->postJson('/api/spoilages', ['stationId' => $station->id, 'items' => [['itemId' => $item->id, 'quantity' => '2.000']]])->assertCreated();
        $this->putJson('/api/station-items/'.$stock->id, ['quantity' => '11.000'])->assertOk();
        $this->assertSame('11.000', $stock->fresh()->quantity);
        $this->assertSame(['SALE', 'DELIVERY', 'SPOILAGE', 'ADJUSTMENT'], InventoryMovement::query()->orderBy('id')->pluck('type')->all());
        $this->assertSame('0.000', $item->fresh()->quantity);
        $this->assertSame('10.00', $item->activePriceAmount());
    }

    private function setupStation(): array
    {
        return [Station::query()->create(['name' => 'Main', 'location' => 'Main']), User::factory()->admin()->create()];
    }

    private function item(string $code, string $name): Item
    {
        return Item::query()->create(['item_code' => $code, 'name' => $name, 'quantity' => '0.000', 'units_backup' => 'PIECE', 'unit' => '1', 'reorder_point' => '0.000', 'price' => '10.00']);
    }

    private function stock(Station $station, string $code, string $name, string $quantity): array
    {
        $item = $this->item($code, $name);

        return [$item, StationItem::query()->create(['station_id' => $station->id, 'item_id' => $item->id, 'quantity' => $quantity])];
    }
}
