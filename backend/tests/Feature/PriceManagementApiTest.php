<?php

namespace Tests\Feature;

use App\Models\InventoryMovement;
use App\Models\Item;
use App\Models\OrderItem;
use App\Models\Price;
use App\Models\Station;
use App\Models\StationItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PriceManagementApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_price_management_is_admin_only_and_has_no_delete_route(): void
    {
        $item = $this->item();
        $price = $item->prices()->create(['amount' => '20.00', 'is_active' => true]);
        $this->getJson('/api/prices')->assertUnauthorized();
        $this->postJson('/api/prices', [])->assertUnauthorized();
        $this->postJson('/api/prices/'.$price->id.'/activate')->assertUnauthorized();

        Sanctum::actingAs(User::factory()->endUser()->create());
        $this->getJson('/api/prices')->assertForbidden();
        $this->getJson('/api/price-item-options')->assertForbidden();
        $this->postJson('/api/prices', [])->assertForbidden();
        $this->postJson('/api/prices/'.$price->id.'/activate')->assertForbidden();
        $this->deleteJson('/api/prices/'.$price->id)->assertNotFound();
    }

    public function test_admin_adds_replaces_and_reactivates_historical_price(): void
    {
        $item = $this->item('COKE-001', 'Coca-Cola', '25.00');
        $old = $item->prices()->create(['amount' => '25.00', 'is_active' => true]);
        Sanctum::actingAs(User::factory()->admin()->create());

        $response = $this->postJson('/api/prices', ['item_id' => $item->id, 'amount' => '30.00', 'is_active' => false])
            ->assertCreated()->assertJsonPath('price.amount', '30.00')->assertJsonPath('price.isActive', true);
        $this->assertFalse($old->fresh()->is_active);
        $this->assertSame(2, $item->prices()->count());
        $this->assertSame(1, $item->prices()->where('is_active', true)->count());

        $this->postJson('/api/prices', ['item_id' => $item->id, 'amount' => '30'])
            ->assertUnprocessable()->assertJsonValidationErrors('amount');
        $this->assertSame(2, $item->prices()->count());

        $this->postJson('/api/prices/'.$old->id.'/activate')->assertOk()->assertJsonPath('price.id', $old->id);
        $this->assertTrue($old->fresh()->is_active);
        $this->assertFalse(Price::query()->findOrFail($response->json('price.id'))->is_active);
        $this->assertSame(1, $item->prices()->where('is_active', true)->count());
        $this->assertSame('25.00', $item->activePriceAmount());
    }

    public function test_validation_zero_price_and_failed_insert_preserve_current_price(): void
    {
        $item = $this->item();
        $old = $item->prices()->create(['amount' => '20.00', 'is_active' => true]);
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/prices', ['item_id' => 999, 'amount' => '10.00'])->assertUnprocessable()->assertJsonValidationErrors('item_id');
        foreach (['-1', '1.234', 'bad', '999999999.99'] as $amount) {
            $this->postJson('/api/prices', ['item_id' => $item->id, 'amount' => $amount])->assertUnprocessable()->assertJsonValidationErrors('amount');
        }

        Event::listen('eloquent.creating: '.Price::class, fn () => throw new \RuntimeException('Forced price failure'));
        try {
            $this->withoutExceptionHandling()->postJson('/api/prices', ['item_id' => $item->id, 'amount' => '22.00']);
            $this->fail('Expected forced failure.');
        } catch (\RuntimeException $exception) {
            $this->assertSame('Forced price failure', $exception->getMessage());
        } finally {
            Event::forget('eloquent.creating: '.Price::class);
        }
        $this->assertTrue($old->fresh()->is_active);
        $this->assertSame(1, $item->prices()->count());

        $this->postJson('/api/prices', ['item_id' => $item->id, 'amount' => '0'])->assertCreated()->assertJsonPath('price.amount', '0.00');
        $this->assertSame('0.00', $item->activePriceAmount());
    }

    public function test_search_pagination_and_duplicate_names_use_item_ids(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        foreach (range(1, 11) as $number) {
            $item = $this->item(sprintf('CODE-%02d', $number), 'Shared name');
            $item->prices()->create(['amount' => '10.00', 'is_active' => true]);
        }
        $this->getJson('/api/prices?page=1')->assertOk()->assertJsonCount(10, 'data')->assertJsonPath('meta.total', 11);
        $this->getJson('/api/prices?search=Shared')->assertOk()->assertJsonPath('meta.total', 11);
        $this->getJson('/api/prices?search=CODE-03')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.item.itemCode', 'CODE-03');
        $this->getJson('/api/price-item-options?search=CODE-03')->assertOk()->assertJsonCount(1, 'items');

        $first = Item::query()->where('item_code', 'CODE-01')->firstOrFail();
        $second = Item::query()->where('item_code', 'CODE-02')->firstOrFail();
        $this->postJson('/api/prices', ['item_id' => $second->id, 'amount' => '15.00'])->assertCreated();
        $this->assertSame('10.00', $first->activePriceAmount());
        $this->assertSame('15.00', $second->activePriceAmount());
        $this->getJson('/api/prices?item_id='.$second->id)->assertOk()->assertJsonPath('meta.total', 2);
    }

    public function test_price_can_be_created_when_item_has_no_price_and_conflicts_are_rejected(): void
    {
        $item = $this->item();
        Sanctum::actingAs(User::factory()->admin()->create());
        $this->postJson('/api/prices', ['item_id' => $item->id, 'amount' => '12.00'])
            ->assertCreated()->assertJsonPath('price.isActive', true);
        $this->assertSame(1, $item->prices()->where('is_active', true)->count());

        $other = $item->prices()->create(['amount' => '14.00', 'is_active' => true]);
        $this->postJson('/api/prices', ['item_id' => $item->id, 'amount' => '16.00'])->assertConflict();
        $this->postJson('/api/prices/'.$other->id.'/activate')->assertConflict();
        $this->assertSame(2, $item->prices()->where('is_active', true)->count());
    }

    public function test_pos_and_checkout_use_active_price_and_reject_stale_cart(): void
    {
        $station = Station::query()->create(['name' => 'Main', 'location' => 'Main']);
        $cashier = User::factory()->endUser()->create(['station_id' => $station->id]);
        $item = $this->item('COKE-001', 'Coca-Cola', '10.00');
        $item->prices()->create(['amount' => '30.00', 'is_active' => true]);
        $stock = StationItem::query()->create(['station_id' => $station->id, 'item_id' => $item->id, 'quantity' => '5.000']);
        Sanctum::actingAs($cashier);

        $this->getJson('/api/pos/items')->assertOk()->assertJsonPath('data.0.price', '30.00');
        $this->postJson('/api/pos/checkout', $this->checkout($item->id, '30.00'))
            ->assertCreated()->assertJsonPath('order.items.0.unitPrice', '30.00');
        $firstOrderItem = OrderItem::query()->firstOrFail();

        Sanctum::actingAs(User::factory()->admin()->create());
        $this->postJson('/api/prices', ['item_id' => $item->id, 'amount' => '35.00'])->assertCreated();
        $this->getJson('/api/items/'.$item->id)->assertOk()->assertJsonPath('item.price', '35.00');
        Sanctum::actingAs($cashier);
        $this->postJson('/api/pos/checkout', $this->checkout($item->id, '30.00'))
            ->assertConflict()->assertJsonPath('currentPrices.0.itemId', $item->id)->assertJsonPath('currentPrices.0.price', '35.00');
        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('order_items', 1);
        $this->assertDatabaseCount('inventory_movements', 1);
        $this->assertSame('4.000', $stock->fresh()->quantity);
        $this->assertSame('30.00', $firstOrderItem->fresh()->unit_price);
        $this->getJson('/api/pos/items')->assertOk()->assertJsonPath('data.0.price', '35.00');

        $this->postJson('/api/pos/checkout', $this->checkout($item->id, '35.00'))
            ->assertCreated()->assertJsonPath('order.items.0.unitPrice', '35.00');
        $this->assertSame('3.000', $stock->fresh()->quantity);
        $this->assertSame(2, InventoryMovement::query()->where('type', 'SALE')->count());
    }

    public function test_missing_or_conflicting_active_price_is_not_sellable(): void
    {
        $station = Station::query()->create(['name' => 'Main', 'location' => 'Main']);
        $cashier = User::factory()->endUser()->create(['station_id' => $station->id]);
        $missing = $this->item('MISSING', 'Missing');
        StationItem::query()->create(['station_id' => $station->id, 'item_id' => $missing->id, 'quantity' => '2.000']);
        Sanctum::actingAs($cashier);
        $this->getJson('/api/pos/items')->assertOk()->assertJsonCount(0, 'data');
        $this->postJson('/api/pos/checkout', $this->checkout($missing->id, '20.00'))->assertUnprocessable();

        $missing->prices()->create(['amount' => '20.00', 'is_active' => true]);
        $missing->prices()->create(['amount' => '25.00', 'is_active' => true]);
        $this->getJson('/api/pos/items')->assertOk()->assertJsonCount(0, 'data');
        $this->postJson('/api/pos/checkout', $this->checkout($missing->id, '20.00'))->assertUnprocessable();
        $this->assertDatabaseCount('orders', 0);
    }

    private function item(string $code = 'ITEM-1', string $name = 'Item', string $legacyPrice = '20.00'): Item
    {
        return Item::query()->create(['item_code' => $code, 'name' => $name, 'units_backup' => 'PIECE', 'unit' => '1', 'reorder_point' => '0.000', 'price' => $legacyPrice]);
    }

    private function checkout(int $itemId, string $expectedPrice): array
    {
        return ['items' => [['itemId' => $itemId, 'quantity' => '1.000', 'expectedUnitPrice' => $expectedPrice]], 'paymentMethod' => 'cash', 'cashReceived' => '100.00'];
    }
}
