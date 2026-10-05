<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\InventoryMovement;
use App\Models\Item;
use App\Models\Order;
use App\Models\Station;
use App\Models\StationItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrTransactionApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_standalone_routes_are_admin_only_and_read_only(): void
    {
        $this->getJson('/api/or-transactions')->assertUnauthorized();
        Sanctum::actingAs(User::factory()->endUser()->create());
        $this->getJson('/api/or-transactions')->assertForbidden();

        Sanctum::actingAs(User::factory()->admin()->create());
        foreach (['postJson', 'putJson', 'patchJson', 'deleteJson'] as $method) {
            $this->{$method}('/api/or-transactions/1', [])->assertMethodNotAllowed();
        }
    }

    public function test_admin_list_includes_cash_credit_walk_in_customer_and_authoritative_totals(): void
    {
        [$station, , $cashier] = $this->contexts();
        $walkIn = $this->order($station, $cashier, 'ORD20261005000001', '2026-10-05 01:00:00', 'cash', '135.00');
        $walkIn->update(['remitted_at' => '2026-10-05 03:30:00']);
        $customer = Customer::query()->create(['name' => 'Juan Customer', 'address' => 'CMU']);
        $credit = $this->order($station, $cashier, 'ORD20261005000002', '2026-10-05 02:00:00', 'credit', '90.00', $customer);
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/or-transactions')->assertOk()->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $credit->id)->assertJsonPath('data.0.customer.name', 'Juan Customer')
            ->assertJsonPath('data.0.paymentMethod', 'credit')->assertJsonPath('data.0.totalAmount', '90.00')
            ->assertJsonPath('data.1.id', $walkIn->id)->assertJsonPath('data.1.customer', null)
            ->assertJsonPath('data.1.totalAmount', '135.00')->assertJsonPath('data.1.remittedAt', '2026-10-05T03:30:00.000000Z');
    }

    public function test_searches_number_customer_cashier_and_station_and_filters_manila_dates(): void
    {
        [$first, $second, $firstCashier, $secondCashier] = $this->contexts();
        $customer = Customer::query()->create(['name' => 'Target Customer', 'address' => 'CMU']);
        $target = $this->order($second, $secondCashier, 'ORD20261001000001', '2026-09-30 16:30:00', 'credit', '50.00', $customer);
        $this->order($first, $firstCashier, 'ORD20260930000001', '2026-09-30 15:30:00');
        Sanctum::actingAs(User::factory()->admin()->create());

        foreach (['1000001', 'Target Customer', $secondCashier->name, $second->name] as $search) {
            $this->getJson('/api/or-transactions?search='.urlencode($search))->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $target->id);
        }
        $this->getJson('/api/or-transactions?from_date=2026-10-01&to_date=2026-10-01')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $target->id);
        $this->getJson('/api/or-transactions?from_date=2026-10-02&to_date=2026-10-01')->assertUnprocessable();
    }

    public function test_list_paginates_ten_and_station_filter_persists_in_query(): void
    {
        [$first, $second, $cashier] = $this->contexts();
        foreach (range(1, 11) as $number) {
            $this->order($first, $cashier, 'ORD202610'.str_pad((string) $number, 8, '0', STR_PAD_LEFT), '2026-10-01 01:00:00');
        }
        $otherCashier = User::factory()->endUser()->create(['station_id' => $second->id]);
        $this->order($second, $otherCashier, 'ORD20261099999999', '2026-10-01 01:00:00');
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson("/api/or-transactions?station_id={$first->id}&page=1")
            ->assertOk()->assertJsonCount(10, 'data')->assertJsonPath('meta.total', 11)->assertJsonPath('meta.last_page', 2);
    }

    public function test_customer_sort_orders_the_full_or_transaction_query(): void
    {
        [$station, , $cashier] = $this->contexts();
        $alpha = Customer::query()->create(['name' => 'Alpha Customer', 'address' => 'A']);
        $zulu = Customer::query()->create(['name' => 'Zulu Customer', 'address' => 'Z']);
        $this->order($station, $cashier, 'ORD20261005000011', '2026-10-05 01:00:00', 'credit', '10.00', $zulu);
        $this->order($station, $cashier, 'ORD20261005000012', '2026-10-05 02:00:00', 'credit', '10.00', $alpha);
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/or-transactions?customer_sort=asc')->assertOk()
            ->assertJsonPath('data.0.customer.name', 'Alpha Customer')->assertJsonPath('data.1.customer.name', 'Zulu Customer');
        $this->getJson('/api/or-transactions?customer_sort=desc')->assertOk()
            ->assertJsonPath('data.0.customer.name', 'Zulu Customer')->assertJsonPath('data.1.customer.name', 'Alpha Customer');
        $this->getJson('/api/or-transactions?customer_sort=invalid')->assertUnprocessable()->assertJsonValidationErrors('customer_sort');
    }

    public function test_details_use_order_item_snapshots_and_do_not_change_inventory(): void
    {
        [$station, , $cashier] = $this->contexts();
        $order = $this->order($station, $cashier, 'ORD20261005000003', '2026-10-05 03:00:00');
        $stock = StationItem::query()->create(['station_id' => $station->id, 'item_id' => Item::query()->firstOrFail()->id, 'quantity' => '7.500']);
        $movementCount = InventoryMovement::query()->count();
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson("/api/or-transactions/{$order->id}")->assertOk()
            ->assertJsonPath('order.orderNumber', 'ORD20261005000003')
            ->assertJsonPath('order.items.0.itemCode', 'SNAP-CODE')->assertJsonPath('order.items.0.itemName', 'Snapshot Item')
            ->assertJsonPath('order.items.0.unitPrice', '25.00')->assertJsonPath('order.items.0.subtotal', '50.00');

        $this->assertSame('7.500', $stock->fresh()->quantity);
        $this->assertSame($movementCount, InventoryMovement::query()->count());
    }

    public function test_pos_routes_require_station_and_never_expose_another_station(): void
    {
        [$first, $second, $firstCashier, $secondCashier] = $this->contexts();
        $own = $this->order($first, $firstCashier, 'ORD20261005000004', '2026-10-05 04:00:00');
        $other = $this->order($second, $secondCashier, 'ORD20261005000005', '2026-10-05 05:00:00');

        Sanctum::actingAs($firstCashier);
        $this->getJson('/api/pos/or-transactions')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $own->id);
        $this->getJson("/api/pos/or-transactions/{$own->id}")->assertOk();
        $this->getJson("/api/pos/or-transactions/{$other->id}")->assertNotFound();

        Sanctum::actingAs(User::factory()->admin()->create(['station_id' => $first->id]));
        $this->getJson('/api/pos/or-transactions')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $own->id);

        Sanctum::actingAs(User::factory()->endUser()->create(['station_id' => null]));
        $this->getJson('/api/pos/or-transactions')->assertConflict();
    }

    private function contexts(): array
    {
        $first = Station::query()->create(['name' => 'Main Station', 'location' => 'Main']);
        $second = Station::query()->create(['name' => 'Other Station', 'location' => 'Other']);

        return [$first, $second, User::factory()->endUser()->create(['name' => 'Alpha Cashier', 'station_id' => $first->id]), User::factory()->endUser()->create(['name' => 'Bravo Cashier', 'station_id' => $second->id])];
    }

    private function order(Station $station, User $cashier, string $number, string $orderedAt, string $method = 'cash', string $total = '50.00', ?Customer $customer = null): Order
    {
        $item = Item::query()->firstOrCreate(['item_code' => 'MASTER'], ['name' => 'Master', 'units_backup' => 'PACK', 'unit' => '1', 'reorder_point' => '0.000', 'price' => '10.00']);
        $order = Order::query()->create([
            'order_number' => $number, 'ordered_at' => $orderedAt, 'station_id' => $station->id, 'cashier_id' => $cashier->id,
            'customer_id' => $customer?->id, 'payment_method' => $method, 'total_amount' => $total,
            'cash_received' => $method === 'cash' ? '100.00' : null, 'change_amount' => $method === 'cash' ? bcsub('100.00', $total, 2) : null,
        ]);
        $order->orderItems()->create(['item_id' => $item->id, 'item_code' => 'SNAP-CODE', 'item_name' => 'Snapshot Item', 'unit' => 'PACK', 'quantity' => '2.000', 'unit_price' => '25.00', 'subtotal' => '50.00']);

        return $order;
    }
}
