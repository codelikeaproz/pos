<?php

namespace Tests\Feature;

use App\Models\Item;
use App\Models\Order;
use App\Models\Station;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderHistoryApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_history_routes_require_authentication_and_are_read_only(): void
    {
        $this->getJson('/api/orders')->assertUnauthorized();
        $this->getJson('/api/orders/1')->assertUnauthorized();
        $this->postJson('/api/orders', [])->assertMethodNotAllowed();
        $this->putJson('/api/orders/1', [])->assertMethodNotAllowed();
        $this->patchJson('/api/orders/1', [])->assertMethodNotAllowed();
        $this->deleteJson('/api/orders/1')->assertMethodNotAllowed();
    }

    public function test_admin_can_list_all_orders_filter_by_station_and_view_details(): void
    {
        [$firstStation, $secondStation, $firstCashier, $secondCashier] = $this->contexts();
        $first = $this->order($firstStation, $firstCashier, 'ORD20260901000001', '2026-09-01 08:00:00');
        $second = $this->order($secondStation, $secondCashier, 'ORD20260902000002', '2026-09-02 08:00:00');
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/orders')->assertOk()->assertJsonCount(2, 'data')->assertJsonPath('data.0.id', $second->id)
            ->assertJsonMissingPath('data.0.items')->assertJsonMissingPath('data.0.cashReceived');
        $this->getJson("/api/orders?station_id={$firstStation->id}")->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $first->id);
        $this->getJson("/api/orders/{$second->id}")->assertOk()->assertJsonPath('order.id', $second->id)->assertJsonCount(1, 'order.items');
    }

    public function test_end_user_is_strictly_scoped_to_assigned_station(): void
    {
        [$firstStation, $secondStation, $firstCashier, $secondCashier] = $this->contexts();
        $own = $this->order($firstStation, $firstCashier, 'OWN-001', '2026-09-01 08:00:00');
        $other = $this->order($secondStation, $secondCashier, 'OTHER-001', '2026-09-02 08:00:00');
        Sanctum::actingAs($firstCashier);

        $this->getJson("/api/orders?station_id={$secondStation->id}")->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $own->id);
        $this->getJson("/api/orders/{$own->id}")->assertOk();
        $this->getJson("/api/orders/{$other->id}")->assertNotFound();
    }

    public function test_end_user_without_station_receives_conflict(): void
    {
        Sanctum::actingAs(User::factory()->endUser()->create(['station_id' => null]));
        $this->getJson('/api/orders')->assertConflict()->assertJsonPath('message', 'This account is not assigned to a station.');
        $station = Station::query()->create(['name' => 'Main', 'location' => 'Main']);
        $cashier = User::factory()->endUser()->create(['station_id' => $station->id]);
        $order = $this->order($station, $cashier, 'ORDER-1', '2026-09-01 08:00:00');
        $this->getJson("/api/orders/{$order->id}")->assertConflict();
    }

    public function test_searches_order_cashier_and_station_and_combines_date_filters(): void
    {
        [$firstStation, $secondStation, $firstCashier, $secondCashier] = $this->contexts();
        $this->order($firstStation, $firstCashier, 'ORD-ALPHA', '2026-09-01 08:00:00');
        $target = $this->order($secondStation, $secondCashier, 'ORD-BRAVO', '2026-09-15 08:00:00');
        Sanctum::actingAs(User::factory()->admin()->create());

        foreach (['BRAVO', $secondCashier->name, $secondStation->name] as $search) {
            $this->getJson('/api/orders?search='.urlencode($search))->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $target->id);
        }
        $this->getJson('/api/orders?from_date=2026-09-10&to_date=2026-09-20&search=BRAVO')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/orders?from_date=2026-09-16')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/orders?to_date=2026-09-10')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_date_filters_use_manila_calendar_boundaries(): void
    {
        [$station, , $cashier] = $this->contexts();
        $order = $this->order($station, $cashier, 'ORD-MANILA-MIDNIGHT', '2026-09-30 16:30:00');
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/orders?from_date=2026-10-01&to_date=2026-10-01')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $order->id);
        $this->getJson('/api/orders?from_date=2026-09-30&to_date=2026-09-30')
            ->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_history_paginates_ten_and_orders_newest_first(): void
    {
        [$station, , $cashier] = $this->contexts();
        foreach (range(1, 11) as $number) {
            $this->order($station, $cashier, "ORD-{$number}", '2026-09-'.str_pad((string) $number, 2, '0', STR_PAD_LEFT).' 08:00:00');
        }
        Sanctum::actingAs(User::factory()->admin()->create());
        $this->getJson('/api/orders')->assertOk()->assertJsonCount(10, 'data')->assertJsonPath('data.0.orderNumber', 'ORD-11')
            ->assertJsonPath('meta.total', 11)->assertJsonPath('meta.last_page', 2);
    }

    public function test_details_use_historical_snapshots_and_expose_no_credentials(): void
    {
        [$station, , $cashier] = $this->contexts();
        $order = $this->order($station, $cashier, 'ORD-SNAPSHOT', '2026-09-01 08:00:00');
        $item = Item::query()->firstOrFail();
        $item->update(['item_code' => 'CHANGED', 'name' => 'Changed Item', 'units_backup' => 'BOX', 'price' => '99.00']);
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson("/api/orders/{$order->id}")->assertOk()
            ->assertJsonPath('order.items.0.itemCode', 'OLD-CODE')->assertJsonPath('order.items.0.itemName', 'Old Name')
            ->assertJsonPath('order.items.0.unit', 'PACK')->assertJsonPath('order.items.0.unitPrice', '25.00')
            ->assertJsonPath('order.items.0.quantity', '2.000')->assertJsonPath('order.items.0.subtotal', '50.00')
            ->assertJsonPath('order.cashReceived', '100.00')->assertJsonPath('order.changeAmount', '50.00')
            ->assertJsonMissingPath('order.cashier.password')->assertJsonMissingPath('order.cashier.remember_token');
    }

    private function contexts(): array
    {
        $first = Station::query()->create(['name' => 'Main Station', 'location' => 'Main']);
        $second = Station::query()->create(['name' => 'Other Station', 'location' => 'Other']);

        return [$first, $second, User::factory()->endUser()->create(['name' => 'Alpha Cashier', 'station_id' => $first->id]), User::factory()->endUser()->create(['name' => 'Bravo Cashier', 'station_id' => $second->id])];
    }

    private function order(Station $station, User $cashier, string $number, string $orderedAt): Order
    {
        $item = Item::query()->firstOrCreate(['item_code' => 'MASTER'], ['name' => 'Master', 'units_backup' => 'PACK', 'unit' => '1', 'reorder_point' => '0.000', 'price' => '10.00']);
        $order = Order::query()->create(['order_number' => $number, 'ordered_at' => $orderedAt, 'station_id' => $station->id, 'cashier_id' => $cashier->id, 'payment_method' => 'cash', 'total_amount' => '50.00', 'cash_received' => '100.00', 'change_amount' => '50.00']);
        $order->orderItems()->create(['item_id' => $item->id, 'item_code' => 'OLD-CODE', 'item_name' => 'Old Name', 'unit' => 'PACK', 'quantity' => '2.000', 'unit_price' => '25.00', 'subtotal' => '50.00']);

        return $order;
    }
}
