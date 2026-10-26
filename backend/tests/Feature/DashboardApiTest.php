<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Item;
use App\Models\Order;
use App\Models\Station;
use App\Models\StationItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Date;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DashboardApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_is_admin_only_and_scopes_manila_today_and_stations(): void
    {
        Date::setTestNow('2026-10-09 16:30:00 UTC');
        $first = Station::query()->create(['name' => 'Main', 'location' => 'Main']);
        $second = Station::query()->create(['name' => 'Gate', 'location' => 'Gate']);
        $cashier = User::factory()->endUser()->create(['name' => 'Juan Cashier', 'station_id' => $first->id]);
        $customer = Customer::query()->create(['name' => 'Target Customer', 'address' => 'CMU']);
        $this->order($first, $cashier, 'CASH-1', '2026-10-09 15:59:58', 'cash', '100.00');
        $this->order($first, $cashier, 'CREDIT-1', '2026-10-09 16:30:00', 'credit', '25.00', $customer);
        $remitted = $this->order($second, $cashier, 'CASH-2', '2026-10-10 00:00:00', 'cash', '40.00');
        $remitted->update(['remitted_at' => '2026-10-10 01:00:00']);
        $this->order($second, $cashier, 'OLD-CASH', '2026-10-09 15:59:59', 'cash', '10.00');
        $item = Item::query()->create(['item_code' => 'STOCK', 'name' => 'Stock', 'units_backup' => 'pc', 'unit' => 'pc', 'reorder_point' => '2.00', 'price' => '10.00']);
        $lowStockItem = Item::query()->create(['item_code' => 'LOW', 'name' => 'Low Stock', 'units_backup' => 'pc', 'unit' => 'pc', 'reorder_point' => '5.00', 'price' => '10.00']);
        StationItem::query()->create(['station_id' => $first->id, 'item_id' => $item->id, 'quantity' => '3.00']);
        StationItem::query()->create(['station_id' => $second->id, 'item_id' => $item->id, 'quantity' => '0.00']);
        StationItem::query()->create(['station_id' => $first->id, 'item_id' => $lowStockItem->id, 'quantity' => '3.00']);

        $this->getJson('/api/dashboard')->assertUnauthorized();
        Sanctum::actingAs($cashier);
        $this->getJson('/api/dashboard')->assertForbidden();
        Sanctum::actingAs(User::factory()->admin()->create());
        $this->getJson('/api/dashboard')->assertOk()->assertJsonPath('date', '2026-10-10')
            ->assertJsonPath('summary.sales', '65.00')->assertJsonPath('summary.transactions', 2)
            ->assertJsonPath('summary.cash', '40.00')->assertJsonPath('summary.credit', '25.00')
            ->assertJsonPath('summary.unremittedCash', '110.00')
            ->assertJsonPath('summary.lowStock', 1)->assertJsonPath('summary.outOfStock', 1)
            ->assertJsonPath('orders.meta.total', 2);
        $this->getJson("/api/dashboard?station_id={$first->id}&payment_method=credit&search=Target")
            ->assertOk()->assertJsonPath('summary.sales', '25.00')->assertJsonPath('summary.unremittedCash', '100.00')
            ->assertJsonPath('summary.lowStock', 1)->assertJsonPath('summary.outOfStock', 0)
            ->assertJsonPath('orders.meta.total', 1)->assertJsonPath('orders.data.0.orderNumber', 'CREDIT-1');
        Date::setTestNow();
    }

    public function test_today_sales_filters_and_paginates_after_sorting(): void
    {
        Date::setTestNow('2026-10-09 16:30:00 UTC');
        $station = Station::query()->create(['name' => 'Main', 'location' => 'Main']);
        $cashier = User::factory()->endUser()->create(['name' => 'Juan Cashier', 'station_id' => $station->id]);
        foreach (range(1, 11) as $number) {
            $this->order($station, $cashier, 'CASH-'.$number, '2026-10-09 16:'.str_pad((string) $number, 2, '0', STR_PAD_LEFT).':00', 'cash', '1.00');
        }
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/dashboard?per_page=10')->assertOk()
            ->assertJsonPath('orders.meta.total', 11)->assertJsonPath('orders.meta.last_page', 2)
            ->assertJsonPath('orders.data.0.orderNumber', 'CASH-11')->assertJsonCount(10, 'orders.data');
        $this->getJson('/api/dashboard?per_page=10&page=2')->assertOk()
            ->assertJsonPath('orders.data.0.orderNumber', 'CASH-1')->assertJsonCount(1, 'orders.data');
        $this->getJson('/api/dashboard?payment_method=credit')->assertOk()->assertJsonPath('orders.meta.total', 0);
        $this->getJson('/api/dashboard?search=CASH-11')->assertOk()->assertJsonPath('orders.meta.total', 1);
        $this->getJson('/api/dashboard?per_page=15')->assertUnprocessable();
        Date::setTestNow();
    }

    private function order(Station $station, User $cashier, string $number, string $time, string $method, string $total, ?Customer $customer = null): Order
    {
        return Order::query()->create([
            'order_number' => $number, 'ordered_at' => $time, 'station_id' => $station->id,
            'cashier_id' => $cashier->id, 'customer_id' => $customer?->id,
            'payment_method' => $method, 'total_amount' => $total,
            'cash_received' => $method === 'cash' ? $total : null,
            'change_amount' => $method === 'cash' ? '0.00' : null,
        ]);
    }
}
