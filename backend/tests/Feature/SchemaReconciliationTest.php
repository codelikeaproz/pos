<?php

namespace Tests\Feature;

use App\Models\InventoryMovement;
use App\Models\Item;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Price;
use App\Models\Station;
use App\Models\StationItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Laravel\Sanctum\Sanctum;
use LogicException;
use Tests\TestCase;

class SchemaReconciliationTest extends TestCase
{
    use RefreshDatabase;

    public function test_backfill_is_repeatable_and_uses_item_ids_even_for_duplicate_names(): void
    {
        $first = $this->item('ONE', 'Same', '20.00');
        $second = $this->item('TWO', 'Same', '25.00');
        $migration = require database_path('migrations/2026_09_30_000000_create_prices_table.php');
        $migration->backfillPrices();
        $migration->backfillPrices();

        $this->assertSame(1, $first->prices()->count());
        $this->assertSame(1, $second->prices()->count());
        $this->assertSame('20.00', $first->activePriceAmount());
        $this->assertSame('25.00', $second->activePrice->amount);
    }

    public function test_activation_keeps_history_and_ambiguous_active_prices_are_rejected(): void
    {
        $item = $this->item();
        Sanctum::actingAs(User::factory()->admin()->create());
        $this->postJson('/api/prices', ['item_id' => $item->id, 'amount' => '25.00'])->assertCreated();
        $this->postJson('/api/prices', ['item_id' => $item->id, 'amount' => '30.00'])->assertCreated();
        $this->assertSame('30.00', $item->activePriceAmount());
        $this->assertSame(2, $item->prices()->count());
        $this->assertSame(1, $item->prices()->where('is_active', true)->count());
        $this->assertSame($item->id, $item->prices()->first()->item->id);

        Price::query()->where('item_id', $item->id)->update(['is_active' => true]);
        $this->expectException(LogicException::class);
        $item->activePriceAmount();
    }

    public function test_inactive_item_is_hidden_from_pos_and_rejected_at_checkout_without_losing_history(): void
    {
        [$user, $item, $stock] = $this->stock();
        Sanctum::actingAs($user);
        $this->postJson('/api/pos/checkout', $this->checkout($item->id))->assertCreated();
        $snapshot = OrderItem::query()->firstOrFail();
        $item->update(['is_active' => false, 'price' => '99.00']);

        $this->getJson('/api/pos/items')->assertOk()->assertJsonCount(0, 'data');
        $this->postJson('/api/pos/checkout', $this->checkout($item->id))->assertUnprocessable();
        $this->assertSame('20.00', $snapshot->fresh()->unit_price);
        $this->assertDatabaseHas('station_items', ['id' => $stock->id]);
        $this->getJson('/api/orders/'.Order::query()->firstOrFail()->id)->assertOk()->assertJsonPath('order.items.0.unitPrice', '20.00');
    }

    public function test_sale_movement_is_negative_and_failure_rolls_back_everything(): void
    {
        [$user, $item, $stock] = $this->stock();
        Sanctum::actingAs($user);
        $this->postJson('/api/pos/checkout', $this->checkout($item->id))->assertCreated();
        $movement = InventoryMovement::query()->firstOrFail();
        $this->assertSame('SALE', $movement->type);
        $this->assertSame('-1.000', $movement->quantity_change);
        $this->assertSame('order_item', $movement->reference_type);
        $this->assertSame(OrderItem::query()->firstOrFail()->id, $movement->reference_id);
        $this->assertSame(OrderItem::query()->firstOrFail()->id, $movement->order_item_id);
        $this->assertSame('4.000', $stock->fresh()->quantity);

        Event::listen('eloquent.creating: '.InventoryMovement::class, fn () => throw new \RuntimeException('Forced movement failure'));
        try {
            $this->withoutExceptionHandling()->postJson('/api/pos/checkout', $this->checkout($item->id));
            $this->fail('Expected failure.');
        } catch (\RuntimeException $exception) {
            $this->assertSame('Forced movement failure', $exception->getMessage());
        } finally {
            Event::forget('eloquent.creating: '.InventoryMovement::class);
        }
        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('order_items', 1);
        $this->assertDatabaseCount('inventory_movements', 1);
        $this->assertSame('4.000', $stock->fresh()->quantity);
    }

    public function test_adjustments_are_signed_skip_noop_and_roll_back_on_failure(): void
    {
        [$user, , $stock] = $this->stock();
        Sanctum::actingAs(User::factory()->admin()->create(['station_id' => $user->station_id]));
        $url = '/api/station-items/'.$stock->id;
        $this->putJson($url, ['quantity' => '7.000'])->assertOk();
        $this->putJson($url, ['quantity' => '7.000'])->assertOk();
        $this->putJson($url, ['quantity' => '6.500'])->assertOk();
        $this->assertSame(['2.000', '-0.500'], InventoryMovement::query()->orderBy('id')->pluck('quantity_change')->all());

        Event::listen('eloquent.creating: '.InventoryMovement::class, fn () => throw new \RuntimeException('Forced movement failure'));
        try {
            $this->withoutExceptionHandling()->putJson($url, ['quantity' => '8.000']);
            $this->fail('Expected failure.');
        } catch (\RuntimeException $exception) {
            $this->assertSame('Forced movement failure', $exception->getMessage());
        } finally {
            Event::forget('eloquent.creating: '.InventoryMovement::class);
        }
        $this->assertSame('6.500', $stock->fresh()->quantity);
        $this->assertDatabaseCount('inventory_movements', 2);
    }

    private function item(string $code = 'ONE', string $name = 'Item', string $price = '20.00'): Item
    {
        return Item::query()->create(['item_code' => $code, 'name' => $name, 'quantity' => '0.000', 'units_backup' => 'PIECE', 'unit' => '1', 'reorder_point' => '0.000', 'price' => $price]);
    }

    private function stock(): array
    {
        $station = Station::query()->create(['name' => 'Main', 'location' => 'Main']);
        $user = User::factory()->endUser()->create(['station_id' => $station->id]);
        $item = $this->item();
        Price::query()->create(['item_id' => $item->id, 'amount' => '20.00', 'is_active' => true]);
        $stock = StationItem::query()->create(['station_id' => $station->id, 'item_id' => $item->id, 'quantity' => '5.000']);

        return [$user, $item, $stock];
    }

    private function checkout(int $itemId): array
    {
        return ['items' => [['itemId' => $itemId, 'quantity' => '1.000', 'expectedUnitPrice' => '20.00', 'unitPrice' => '0.01']], 'paymentMethod' => 'cash', 'cashReceived' => '100.00'];
    }
}
