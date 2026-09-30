<?php

namespace Tests\Feature;

use App\Models\InventoryMovement;
use App\Models\Item;
use App\Models\ItemDelivery;
use App\Models\ItemDeliveryItem;
use App\Models\Station;
use App\Models\StationItem;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ItemDeliveryApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_routes_are_admin_only_and_history_is_immutable(): void
    {
        [$station, $receiver, $admin] = $this->setupDelivery();
        $delivery = ItemDelivery::query()->create(['delivery_number' => 'DEL-20260930-000001', 'station_id' => $station->id, 'delivered_by_id' => $admin->id, 'received_by_id' => $receiver->id, 'delivered_at' => now()]);
        $this->getJson('/api/item-deliveries')->assertUnauthorized();
        $this->getJson('/api/item-delivery-options')->assertUnauthorized();
        $this->postJson('/api/item-deliveries', [])->assertUnauthorized();
        Sanctum::actingAs(User::factory()->endUser()->create());
        $this->getJson('/api/item-deliveries')->assertForbidden();
        $this->getJson('/api/item-delivery-options')->assertForbidden();
        $this->postJson('/api/item-deliveries', [])->assertForbidden();
        $this->getJson('/api/item-deliveries/'.$delivery->id)->assertForbidden();
        $this->deleteJson('/api/item-deliveries/'.$delivery->id)->assertStatus(405);
    }

    public function test_delivery_creates_history_and_increases_existing_and_new_station_stock(): void
    {
        [$station, $receiver, $admin, $first] = $this->setupDelivery();
        $second = $this->item('B', 'Bread');
        $stock = StationItem::query()->create(['station_id' => $station->id, 'item_id' => $first->id, 'quantity' => '100.000']);
        Sanctum::actingAs($admin);

        $delivery = $this->postJson('/api/item-deliveries', [
            'stationId' => $station->id, 'receivedById' => $receiver->id,
            'deliveredById' => $receiver->id, 'deliveryNumber' => 'FAKE',
            'items' => [['itemId' => $first->id, 'quantity' => '20.250'], ['itemId' => $second->id, 'quantity' => '2.500']],
        ])->assertCreated()->json('delivery');

        $this->assertMatchesRegularExpression('/^DEL-\d{8}-\d{6}$/', $delivery['deliveryNumber']);
        $this->assertSame($admin->id, ItemDelivery::query()->firstOrFail()->delivered_by_id);
        $this->assertSame($receiver->id, ItemDelivery::query()->firstOrFail()->received_by_id);
        $this->assertSame('120.250', $stock->fresh()->quantity);
        $this->assertDatabaseHas('station_items', ['station_id' => $station->id, 'item_id' => $second->id, 'quantity' => '2.500']);
        $this->assertSame('0.000', $first->fresh()->quantity);
        $this->assertDatabaseCount('item_delivery_items', 2);
        $this->assertSame(['20.250', '2.500'], InventoryMovement::query()->orderBy('item_id')->pluck('quantity_change')->all());
        $this->assertSame(2, InventoryMovement::query()->where('type', 'DELIVERY')->count());
        $this->assertSame($admin->id, InventoryMovement::query()->firstOrFail()->actor_id);
        $this->assertSame('item_delivery_item', InventoryMovement::query()->firstOrFail()->reference_type);
        $this->assertDatabaseHas('item_delivery_items', ['item_delivery_id' => $delivery['id'], 'item_id' => $first->id, 'quantity' => '20.250']);

        $record = ItemDelivery::query()->firstOrFail();
        $this->assertSame($station->id, $record->station->id);
        $this->assertSame($admin->id, $record->deliveredBy->id);
        $this->assertSame($receiver->id, $record->receivedBy->id);
        $this->assertCount(2, $record->items);
        $this->assertSame($first->id, ItemDeliveryItem::query()->where('item_id', $first->id)->firstOrFail()->item->id);
        $first->update(['item_code' => 'CHANGED', 'name' => 'Changed']);
        $this->getJson('/api/item-deliveries/'.$record->id)->assertOk()->assertJsonPath('delivery.items.0.itemCode', 'A')->assertJsonPath('delivery.items.0.itemName', 'Apple');
    }

    public function test_invalid_receiver_items_and_quantities_are_rejected_without_writes(): void
    {
        [$station, $receiver, $admin, $item] = $this->setupDelivery();
        Sanctum::actingAs($admin);
        $base = ['stationId' => $station->id, 'receivedById' => $receiver->id, 'items' => [['itemId' => $item->id, 'quantity' => '1.000']]];
        $this->postJson('/api/item-deliveries', array_merge($base, ['stationId' => 999]))->assertUnprocessable();
        $this->postJson('/api/item-deliveries', array_merge($base, ['receivedById' => 999]))->assertUnprocessable();
        $this->postJson('/api/item-deliveries', array_merge($base, ['receivedById' => $admin->id]))->assertUnprocessable();
        $other = User::factory()->endUser()->create();
        $this->postJson('/api/item-deliveries', array_merge($base, ['receivedById' => $other->id]))->assertUnprocessable();
        $this->postJson('/api/item-deliveries', array_merge($base, ['items' => []]))->assertUnprocessable();
        $this->postJson('/api/item-deliveries', array_merge($base, ['items' => [['itemId' => 999, 'quantity' => '1']]]))->assertUnprocessable();
        foreach (['0', '-1', '1.0001', '1000000000'] as $quantity) {
            $this->postJson('/api/item-deliveries', array_merge($base, ['items' => [['itemId' => $item->id, 'quantity' => $quantity]]]))->assertUnprocessable();
        }
        $this->postJson('/api/item-deliveries', array_merge($base, ['items' => [$base['items'][0], $base['items'][0]]]))->assertUnprocessable();
        $item->update(['is_active' => false]);
        $this->postJson('/api/item-deliveries', $base)->assertUnprocessable();
        $this->assertDatabaseCount('item_deliveries', 0);
        $this->assertDatabaseCount('station_items', 0);
    }

    public function test_movement_failure_rolls_back_delivery_details_and_stock(): void
    {
        [$station, $receiver, $admin, $item] = $this->setupDelivery();
        $stock = StationItem::query()->create(['station_id' => $station->id, 'item_id' => $item->id, 'quantity' => '5.000']);
        Sanctum::actingAs($admin);
        Event::listen('eloquent.creating: '.InventoryMovement::class, fn () => throw new \RuntimeException('Movement failed'));
        try {
            $this->withoutExceptionHandling()->postJson('/api/item-deliveries', ['stationId' => $station->id, 'receivedById' => $receiver->id, 'items' => [['itemId' => $item->id, 'quantity' => '2.000']]]);
            $this->fail('Expected failure');
        } catch (\RuntimeException $exception) {
            $this->assertSame('Movement failed', $exception->getMessage());
        } finally {
            Event::forget('eloquent.creating: '.InventoryMovement::class);
        }
        $this->assertDatabaseCount('item_deliveries', 0);
        $this->assertDatabaseCount('item_delivery_items', 0);
        $this->assertDatabaseCount('inventory_movements', 0);
        $this->assertSame('5.000', $stock->fresh()->quantity);
    }

    public function test_detail_failure_rolls_back_header_and_first_time_balance(): void
    {
        [$station, $receiver, $admin, $item] = $this->setupDelivery();
        Sanctum::actingAs($admin);
        Event::listen('eloquent.creating: '.ItemDeliveryItem::class, fn () => throw new \RuntimeException('Detail failed'));
        try {
            $this->withoutExceptionHandling()->postJson('/api/item-deliveries', ['stationId' => $station->id, 'receivedById' => $receiver->id, 'items' => [['itemId' => $item->id, 'quantity' => '2.000']]]);
            $this->fail('Expected failure');
        } catch (\RuntimeException $exception) {
            $this->assertSame('Detail failed', $exception->getMessage());
        } finally {
            Event::forget('eloquent.creating: '.ItemDeliveryItem::class);
        }
        $this->assertDatabaseCount('item_deliveries', 0);
        $this->assertDatabaseCount('item_delivery_items', 0);
        $this->assertDatabaseCount('station_items', 0);
        $this->assertDatabaseCount('inventory_movements', 0);
    }

    public function test_database_uniqueness_protects_delivery_numbers_and_station_item_pairs(): void
    {
        [$station, $receiver, $admin, $item] = $this->setupDelivery();
        ItemDelivery::query()->create(['delivery_number' => 'DEL-20260930-000001', 'station_id' => $station->id, 'delivered_by_id' => $admin->id, 'received_by_id' => $receiver->id, 'delivered_at' => now()]);
        try {
            ItemDelivery::query()->create(['delivery_number' => 'DEL-20260930-000001', 'station_id' => $station->id, 'delivered_by_id' => $admin->id, 'received_by_id' => $receiver->id, 'delivered_at' => now()]);
            $this->fail('Expected unique delivery number constraint');
        } catch (QueryException) {
            $this->assertDatabaseCount('item_deliveries', 1);
        }
        StationItem::query()->create(['station_id' => $station->id, 'item_id' => $item->id, 'quantity' => '1.000']);
        try {
            StationItem::query()->create(['station_id' => $station->id, 'item_id' => $item->id, 'quantity' => '1.000']);
            $this->fail('Expected unique StationItem constraint');
        } catch (QueryException) {
            $this->assertDatabaseCount('station_items', 1);
        }
    }

    public function test_history_search_pagination_and_receiver_options(): void
    {
        [$station, $receiver, $admin, $item] = $this->setupDelivery();
        Sanctum::actingAs($admin);
        $this->getJson('/api/item-delivery-options?station_id='.$station->id)->assertOk()->assertJsonCount(1, 'receivers')->assertJsonPath('receivers.0.id', $receiver->id);
        for ($i = 0; $i < 11; $i++) {
            $this->postJson('/api/item-deliveries', ['stationId' => $station->id, 'receivedById' => $receiver->id, 'items' => [['itemId' => $item->id, 'quantity' => '1.000']]])->assertCreated();
        }
        $this->getJson('/api/item-deliveries')->assertOk()->assertJsonCount(10, 'data')->assertJsonPath('meta.total', 11);
        $this->getJson('/api/item-deliveries?search='.$station->name)->assertOk()->assertJsonPath('meta.total', 11);
        $this->getJson('/api/item-deliveries?station_id='.$station->id)->assertOk()->assertJsonPath('meta.total', 11);
        $this->assertSame(11, ItemDelivery::query()->distinct()->count('delivery_number'));
        $this->assertDatabaseCount('station_items', 1);
        $this->assertSame('11.000', StationItem::query()->firstOrFail()->quantity);
    }

    private function setupDelivery(): array
    {
        $station = Station::query()->create(['name' => 'Main', 'location' => 'Main']);
        $receiver = User::factory()->endUser()->create(['station_id' => $station->id]);
        $admin = User::factory()->admin()->create();

        return [$station, $receiver, $admin, $this->item('A', 'Apple')];
    }

    private function item(string $code, string $name): Item
    {
        return Item::query()->create(['item_code' => $code, 'name' => $name, 'quantity' => '0.000', 'units_backup' => 'PIECE', 'unit' => '1', 'reorder_point' => '0.000', 'price' => '10.00']);
    }
}
