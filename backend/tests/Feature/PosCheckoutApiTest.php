<?php

namespace Tests\Feature;

use App\Models\Customer;
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
use Tests\TestCase;

class PosCheckoutApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_requires_authentication_and_station(): void
    {
        $this->postJson('/api/pos/checkout', [])->assertUnauthorized();
        Sanctum::actingAs(User::factory()->endUser()->create(['station_id' => null]));
        $this->postJson('/api/pos/checkout', $this->payload())->assertConflict()
            ->assertJsonPath('message', 'This account is not assigned to a station.');
    }

    public function test_request_structure_and_cash_payment_are_validated(): void
    {
        [$user] = $this->context();
        Sanctum::actingAs($user);
        $this->postJson('/api/pos/checkout', ['items' => [], 'paymentMethod' => 'card', 'cashReceived' => '-1'])
            ->assertUnprocessable()->assertJsonValidationErrors(['items', 'paymentMethod', 'cashReceived']);
        $this->postJson('/api/pos/checkout', ['items' => [['itemId' => 999, 'quantity' => '0.000']], 'paymentMethod' => 'cash', 'cashReceived' => '10.00'])
            ->assertUnprocessable()->assertJsonValidationErrors(['items.0.quantity']);
        $this->postJson('/api/pos/checkout', $this->payload(999))
            ->assertUnprocessable()->assertJsonValidationErrors(['items']);
    }

    public function test_duplicate_items_and_excessive_precision_are_rejected(): void
    {
        [$user, , $item] = $this->context();
        Sanctum::actingAs($user);
        $this->postJson('/api/pos/checkout', [
            'items' => [['itemId' => $item->id, 'quantity' => '1.0000'], ['itemId' => $item->id, 'quantity' => '1.000']],
            'paymentMethod' => 'cash', 'cashReceived' => '100.00',
        ])->assertUnprocessable()->assertJsonValidationErrors(['items.0.quantity', 'items.1.itemId']);
    }

    public function test_item_must_belong_to_authenticated_users_station(): void
    {
        [$user, $station] = $this->context();
        $other = Station::query()->create(['name' => 'Other', 'location' => 'Other']);
        $item = $this->item('OTHER', 'Other Item');
        StationItem::query()->create(['station_id' => $other->id, 'item_id' => $item->id, 'quantity' => '5.000']);
        Sanctum::actingAs($user);

        $this->postJson('/api/pos/checkout', $this->payload($item->id) + ['station_id' => $other->id])
            ->assertUnprocessable()->assertJsonValidationErrors('items');
        $this->assertDatabaseMissing('orders', ['station_id' => $station->id]);
    }

    public function test_insufficient_stock_and_cash_leave_database_unchanged(): void
    {
        [$user, , $item, $stock] = $this->context();
        Sanctum::actingAs($user);
        $this->postJson('/api/pos/checkout', $this->payload($item->id, '6.000', '500.00'))
            ->assertUnprocessable()->assertJsonValidationErrors('items');
        $this->postJson('/api/pos/checkout', $this->payload($item->id, '2.000', '10.00'))
            ->assertUnprocessable()->assertJsonValidationErrors('cashReceived');
        $this->assertDatabaseCount('orders', 0);
        $this->assertSame('5.000', $stock->fresh()->quantity);
    }

    public function test_checkout_uses_authoritative_values_and_deducts_only_station_stock(): void
    {
        [$user, $station, $item, $stock] = $this->context();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/pos/checkout', $this->payload($item->id, '1.500', '100.00') + [
            'station_id' => 999, 'cashier_id' => 999, 'totalAmount' => '0.01', 'changeAmount' => '99.99',
            'items' => [['itemId' => $item->id, 'quantity' => '1.500', 'expectedUnitPrice' => '25.00', 'unitPrice' => '0.01', 'subtotal' => '0.01']],
        ])->assertCreated()->assertJsonPath('message', 'Payment completed successfully.')
            ->assertJsonPath('order.station.id', $station->id)
            ->assertJsonPath('order.cashier.id', $user->id)
            ->assertJsonPath('order.paymentMethod', 'cash')
            ->assertJsonPath('order.totalAmount', '37.50')
            ->assertJsonPath('order.cashReceived', '100.00')
            ->assertJsonPath('order.changeAmount', '62.50')
            ->assertJsonPath('order.items.0.itemCode', 'ITM-001')
            ->assertJsonPath('order.items.0.itemName', 'Test Item')
            ->assertJsonPath('order.items.0.unit', 'PACK')
            ->assertJsonPath('order.items.0.quantity', '1.500')
            ->assertJsonPath('order.items.0.unitPrice', '25.00')
            ->assertJsonPath('order.items.0.subtotal', '37.50');

        $order = Order::query()->firstOrFail();
        $this->assertMatchesRegularExpression('/^ORD\d{14}$/', $order->order_number);
        $this->assertNotNull($order->ordered_at);
        $this->assertSame('3.500', $stock->fresh()->quantity);
        $response->assertJsonMissingPath('order.cashier.password')->assertJsonMissingPath('order.cashier.remember_token');
    }

    public function test_exact_cash_and_exact_remaining_stock_are_accepted(): void
    {
        [$user, , $item, $stock] = $this->context();
        Sanctum::actingAs($user);
        $this->postJson('/api/pos/checkout', $this->payload($item->id, '5.000', '125.00'))
            ->assertCreated()->assertJsonPath('order.changeAmount', '0.00');
        $this->assertSame('0.000', $stock->fresh()->quantity);
    }

    public function test_credit_checkout_uses_same_stock_and_price_path_and_appears_in_monitoring(): void
    {
        [$user, , $item, $stock] = $this->context();
        $customer = Customer::query()->create(['name' => 'Maria Cruz', 'address' => 'Maramag']);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/pos/checkout', [
            'items' => [['itemId' => $item->id, 'quantity' => '1.500', 'expectedUnitPrice' => '25.00']],
            'paymentMethod' => 'credit', 'customerId' => $customer->id,
        ])->assertCreated()->assertJsonPath('order.paymentMethod', 'credit')
            ->assertJsonPath('order.customer.name', 'Maria Cruz')
            ->assertJsonPath('order.totalAmount', '37.50')
            ->assertJsonPath('order.cashReceived', null)
            ->assertJsonPath('order.changeAmount', null)
            ->assertJsonPath('order.items.0.subtotal', '37.50');
        $this->assertSame($customer->id, Order::query()->firstOrFail()->customer_id);
        $this->assertSame('3.500', $stock->fresh()->quantity);
        $this->assertDatabaseHas('inventory_movements', ['type' => 'SALE', 'quantity_change' => '-1.500']);
        $this->assertSame(1, InventoryMovement::query()->count());
        $this->assertMatchesRegularExpression('/^ORD\d{14}$/', $response->json('order.orderNumber'));

        Sanctum::actingAs(User::factory()->admin()->create());
        $this->getJson('/api/credit-monitoring')->assertOk()->assertJsonPath('data.0.customer.name', 'Maria Cruz')
            ->assertJsonPath('data.0.totalAmount', '37.50')
            ->assertJsonPath('data.0.ageDays', 0);
    }

    public function test_credit_requires_existing_customer_and_leaves_inventory_unchanged_on_failure(): void
    {
        [$user, , $item, $stock] = $this->context();
        Sanctum::actingAs($user);
        $base = ['items' => [['itemId' => $item->id, 'quantity' => '1.000', 'expectedUnitPrice' => '25.00']], 'paymentMethod' => 'credit'];
        $this->postJson('/api/pos/checkout', $base)->assertUnprocessable()->assertJsonValidationErrors('customerId');
        $this->postJson('/api/pos/checkout', $base + ['customerId' => 999])->assertUnprocessable()->assertJsonValidationErrors('customerId');
        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('inventory_movements', 0);
        $this->assertSame('5.000', $stock->fresh()->quantity);
    }

    public function test_cash_still_requires_cash_received_and_allows_walk_in(): void
    {
        [$user, , $item] = $this->context();
        Sanctum::actingAs($user);
        $base = ['items' => [['itemId' => $item->id, 'quantity' => '1.000', 'expectedUnitPrice' => '25.00']], 'paymentMethod' => 'cash'];
        $this->postJson('/api/pos/checkout', $base)->assertUnprocessable()->assertJsonValidationErrors('cashReceived');
        $this->postJson('/api/pos/checkout', $base + ['cashReceived' => '30.00'])
            ->assertCreated()->assertJsonPath('order.customer', null)->assertJsonPath('order.changeAmount', '5.00');
    }

    public function test_credit_order_item_failure_rolls_back_everything(): void
    {
        [$user, , $item, $stock] = $this->context();
        $customer = Customer::query()->create(['name' => 'Maria Cruz', 'address' => 'Maramag']);
        Sanctum::actingAs($user);
        Event::listen('eloquent.creating: '.OrderItem::class, fn () => throw new \RuntimeException('Forced item failure'));
        try {
            $this->withoutExceptionHandling()->postJson('/api/pos/checkout', [
                'items' => [['itemId' => $item->id, 'quantity' => '1.000', 'expectedUnitPrice' => '25.00']],
                'paymentMethod' => 'credit', 'customerId' => $customer->id,
            ]);
            $this->fail('Expected the forced order item failure.');
        } catch (\RuntimeException $exception) {
            $this->assertSame('Forced item failure', $exception->getMessage());
        } finally {
            Event::forget('eloquent.creating: '.OrderItem::class);
        }
        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('order_items', 0);
        $this->assertDatabaseCount('inventory_movements', 0);
        $this->assertSame('5.000', $stock->fresh()->quantity);
    }

    public function test_credit_rejects_insufficient_stock_and_changed_price_without_writes(): void
    {
        [$user, , $item, $stock] = $this->context();
        $customer = Customer::query()->create(['name' => 'Maria Cruz', 'address' => 'Maramag']);
        Sanctum::actingAs($user);
        $base = ['items' => [['itemId' => $item->id, 'quantity' => '6.000', 'expectedUnitPrice' => '25.00']], 'paymentMethod' => 'credit', 'customerId' => $customer->id];
        $this->postJson('/api/pos/checkout', $base)->assertUnprocessable()->assertJsonValidationErrors('items');
        $base['items'][0]['quantity'] = '1.000';
        $item->prices()->update(['is_active' => false]);
        $item->prices()->create(['amount' => '30.00', 'is_active' => true]);
        $this->postJson('/api/pos/checkout', $base)->assertConflict()->assertJsonPath('currentPrices.0.price', '30.00');
        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('inventory_movements', 0);
        $this->assertSame('5.000', $stock->fresh()->quantity);
    }

    public function test_line_subtotals_use_half_up_rounding_before_totaling(): void
    {
        [$user, $station, $item] = $this->context();
        $item->prices()->create(['amount' => '0.01', 'is_active' => true]);
        $item->prices()->where('amount', '25.00')->update(['is_active' => false]);
        $second = $this->item('ITM-002', 'Second Item', '0.01');
        StationItem::query()->create(['station_id' => $station->id, 'item_id' => $second->id, 'quantity' => '5.000']);
        Sanctum::actingAs($user);
        $this->postJson('/api/pos/checkout', [
            'items' => [['itemId' => $item->id, 'quantity' => '0.500', 'expectedUnitPrice' => '0.01'], ['itemId' => $second->id, 'quantity' => '0.500', 'expectedUnitPrice' => '0.01']],
            'paymentMethod' => 'cash', 'cashReceived' => '0.02',
        ])->assertCreated()->assertJsonPath('order.totalAmount', '0.02');
    }

    public function test_order_item_failure_rolls_back_order_and_inventory(): void
    {
        [$user, , $item, $stock] = $this->context();
        Sanctum::actingAs($user);
        Event::listen('eloquent.creating: '.OrderItem::class, fn () => throw new \RuntimeException('Forced item failure'));

        try {
            $this->withoutExceptionHandling()->postJson('/api/pos/checkout', $this->payload($item->id));
            $this->fail('Expected the forced order item failure.');
        } catch (\RuntimeException $exception) {
            $this->assertSame('Forced item failure', $exception->getMessage());
        } finally {
            Event::forget('eloquent.creating: '.OrderItem::class);
        }

        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('order_items', 0);
        $this->assertSame('5.000', $stock->fresh()->quantity);
    }

    public function test_stock_update_failure_rolls_back_order_items_and_all_stock(): void
    {
        [$user, , $item, $stock] = $this->context();
        Sanctum::actingAs($user);
        Event::listen('eloquent.updating: '.StationItem::class, fn () => throw new \RuntimeException('Forced stock failure'));

        try {
            $this->withoutExceptionHandling()->postJson('/api/pos/checkout', $this->payload($item->id));
            $this->fail('Expected the forced stock failure.');
        } catch (\RuntimeException $exception) {
            $this->assertSame('Forced stock failure', $exception->getMessage());
        } finally {
            Event::forget('eloquent.updating: '.StationItem::class);
        }

        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('order_items', 0);
        $this->assertSame('5.000', $stock->fresh()->quantity);
    }

    /** @return array{User, Station, Item, StationItem} */
    private function context(): array
    {
        $station = Station::query()->create(['name' => 'Main', 'location' => 'Main']);
        $user = User::factory()->endUser()->create(['station_id' => $station->id]);
        $item = $this->item();
        $stock = StationItem::query()->create(['station_id' => $station->id, 'item_id' => $item->id, 'quantity' => '5.000']);

        return [$user, $station, $item, $stock];
    }

    private function item(string $code = 'ITM-001', string $name = 'Test Item', string $price = '25.00'): Item
    {
        $item = Item::query()->create(['item_code' => $code, 'name' => $name, 'units_backup' => 'PACK', 'unit' => '1', 'reorder_point' => '0.000', 'price' => $price]);
        Price::query()->create(['item_id' => $item->id, 'amount' => $price, 'is_active' => true]);

        return $item;
    }

    private function payload(?int $itemId = null, string $quantity = '1.000', string $cash = '100.00'): array
    {
        return ['items' => [['itemId' => $itemId ?? 1, 'quantity' => $quantity, 'expectedUnitPrice' => '25.00']], 'paymentMethod' => 'cash', 'cashReceived' => $cash];
    }
}
