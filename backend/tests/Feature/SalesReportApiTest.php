<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\InventoryMovement;
use App\Models\Item;
use App\Models\Order;
use App\Models\Price;
use App\Models\Privilege;
use App\Models\Station;
use App\Models\StationItem;
use App\Models\TaxSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Date;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SalesReportApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_report_and_detail_are_admin_only_even_with_business_privilege(): void
    {
        $this->getJson('/api/reports/sales')->assertUnauthorized();
        $cashier = User::factory()->endUser()->create();
        $privilege = Privilege::query()->create(['description' => 'Reporter']);
        $cashier->privileges()->attach($privilege);
        Sanctum::actingAs($cashier);
        $this->getJson('/api/reports/sales')->assertForbidden();

        Sanctum::actingAs(User::factory()->admin()->create());
        $this->getJson('/api/reports/sales')->assertOk();
    }

    public function test_periods_use_inclusive_manila_calendar_boundaries(): void
    {
        Date::setTestNow('2026-10-21 04:00:00 UTC'); // Wednesday, October 21 noon in Manila.
        [$station, $cashier] = $this->context();
        foreach ([
            ['START-TODAY', '2026-10-20 16:00:00'], ['END-TODAY', '2026-10-21 15:59:59'],
            ['YESTERDAY', '2026-10-20 05:00:00'], ['WEEK-MONDAY', '2026-10-18 16:00:00'],
            ['MONTH-START', '2026-09-30 16:00:00'], ['PRIOR-MONTH', '2026-09-30 15:59:59'],
        ] as [$number, $time]) {
            $this->order($station, $cashier, $number, $time);
        }
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/reports/sales?period=today')->assertOk()->assertJsonPath('summary.transactions', 2);
        $this->getJson('/api/reports/sales?period=yesterday')->assertOk()->assertJsonPath('summary.transactions', 1);
        $this->getJson('/api/reports/sales?period=this_week')->assertOk()->assertJsonPath('summary.transactions', 4);
        $this->getJson('/api/reports/sales')->assertOk()->assertJsonPath('filters.period', 'this_month')->assertJsonPath('summary.transactions', 5);
        $this->getJson('/api/reports/sales?period=custom&from=2026-10-21&to=2026-10-21')->assertOk()->assertJsonPath('summary.transactions', 2);
        $this->getJson('/api/reports/sales?period=custom&from=2026-10-22&to=2026-10-21')->assertUnprocessable();
        $this->getJson('/api/reports/sales?period=custom')->assertUnprocessable()->assertJsonValidationErrors(['from', 'to']);
        Date::setTestNow();
    }

    public function test_summary_station_payment_and_search_share_the_same_filtered_orders(): void
    {
        Date::setTestNow('2026-10-21 04:00:00 UTC');
        [$main, $cashier] = $this->context('Main Station', 'Ralph Cashier');
        [$gate, $gateCashier] = $this->context('Gate Station', 'Gate Cashier');
        $customer = Customer::query()->create(['name' => 'Target Customer', 'address' => 'CMU']);
        $this->order($main, $cashier, 'CASH-100', '2026-10-21 01:00:00', 'cash', '100.00', '10.00');
        $this->order($main, $cashier, 'CASH-50', '2026-10-21 02:00:00', 'cash', '50.00', '5.00');
        $credit = $this->order($gate, $gateCashier, 'CREDIT-200', '2026-10-21 03:00:00', 'credit', '200.00', '20.00', $customer);
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/reports/sales?period=today')->assertOk()
            ->assertJsonPath('summary.totalSales', '350.00')->assertJsonPath('summary.transactions', 3)
            ->assertJsonPath('summary.cashSales', '150.00')->assertJsonPath('summary.creditSales', '200.00')
            ->assertJsonPath('summary.seniorDiscounts', '35.00');
        $this->getJson('/api/reports/sales?period=today&payment_method=cash')->assertOk()
            ->assertJsonPath('summary.totalSales', '150.00')->assertJsonPath('summary.transactions', 2)
            ->assertJsonPath('summary.cashSales', '150.00')->assertJsonPath('summary.creditSales', '0.00');
        $this->getJson('/api/reports/sales?period=today&payment_method=credit')->assertOk()
            ->assertJsonPath('summary.totalSales', '200.00')->assertJsonPath('summary.transactions', 1)
            ->assertJsonPath('summary.cashSales', '0.00')->assertJsonPath('summary.creditSales', '200.00');
        $this->getJson("/api/reports/sales?period=today&station_id={$main->id}")->assertOk()->assertJsonPath('summary.totalSales', '150.00')->assertJsonCount(2, 'orders.data');
        foreach (['CREDIT-200', 'Target Customer', 'Gate Cashier', 'Gate Station'] as $search) {
            $this->getJson('/api/reports/sales?period=today&payment_method=credit&search='.urlencode($search))->assertOk()
                ->assertJsonPath('summary.transactions', 1)->assertJsonPath('orders.data.0.id', $credit->id);
        }
        Date::setTestNow();
    }

    public function test_pagination_is_newest_first_and_summary_covers_all_pages(): void
    {
        Date::setTestNow('2026-10-21 04:00:00 UTC');
        [$station, $cashier] = $this->context();
        foreach (range(1, 21) as $number) {
            $this->order($station, $cashier, 'ORDER-'.$number, sprintf('2026-10-21 01:%02d:00', $number), 'cash', '1.00');
        }
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/reports/sales?period=today')->assertOk()
            ->assertJsonPath('summary.transactions', 21)->assertJsonPath('summary.totalSales', '21.00')
            ->assertJsonPath('orders.meta.per_page', 10)->assertJsonPath('orders.meta.last_page', 3)
            ->assertJsonPath('orders.data.0.orderNumber', 'ORDER-21')->assertJsonCount(10, 'orders.data');
        foreach ([20, 50, 100] as $size) {
            $this->getJson("/api/reports/sales?period=today&per_page={$size}")->assertOk()->assertJsonPath('orders.meta.per_page', $size);
        }
        $this->getJson('/api/reports/sales?per_page=15')->assertUnprocessable();
        Date::setTestNow();
    }

    public function test_report_uses_historical_snapshots_and_has_no_side_effects(): void
    {
        Date::setTestNow('2026-10-21 04:00:00 UTC');
        [$station, $cashier] = $this->context();
        $item = Item::query()->create(['item_code' => 'ITEM', 'name' => 'Current Name', 'units_backup' => 'pc', 'unit' => 'pc', 'reorder_point' => '1.000', 'price' => '50.00']);
        Price::query()->create(['item_id' => $item->id, 'amount' => '50.00', 'is_active' => true]);
        $stock = StationItem::query()->create(['station_id' => $station->id, 'item_id' => $item->id, 'quantity' => '10.000']);
        $order = $this->order($station, $cashier, 'HISTORICAL', '2026-10-21 01:00:00', 'cash', '45.00', '0.00');
        $order->update(['tax_status_snapshot' => 'NON_VAT', 'vat_rate_snapshot' => '12.00', 'vat_exempt_sales' => null]);
        $order->orderItems()->create(['item_id' => $item->id, 'item_code' => 'OLD-CODE', 'item_name' => 'Historical Name', 'unit' => 'pc', 'quantity' => '1.000', 'unit_price' => '45.00', 'subtotal' => '45.00']);
        TaxSetting::query()->create(['tax_status' => 'NON_VAT', 'vat_rate' => '12.00']);
        $beforeOrder = $order->fresh()->getAttributes();
        $movementCount = InventoryMovement::query()->count();
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/reports/sales?period=today')->assertOk()->assertJsonPath('summary.totalSales', '45.00');
        $this->getJson("/api/reports/sales/{$order->id}")->assertOk()
            ->assertJsonPath('order.items.0.itemName', 'Historical Name')->assertJsonPath('order.items.0.unitPrice', '45.00')
            ->assertJsonPath('order.taxStatusSnapshot', 'NON_VAT')->assertJsonPath('order.vatExemptSales', null);
        $this->assertSame($beforeOrder, $order->fresh()->getAttributes());
        $this->assertSame('10.000', $stock->fresh()->quantity);
        $this->assertSame($movementCount, InventoryMovement::query()->count());
        $this->assertSame('12.00', TaxSetting::query()->firstOrFail()->vat_rate);
        Date::setTestNow();
    }

    /** @return array{Station, User} */
    private function context(string $stationName = 'Main Station', string $cashierName = 'Cashier'): array
    {
        $station = Station::query()->create(['name' => $stationName, 'location' => $stationName]);

        return [$station, User::factory()->endUser()->create(['name' => $cashierName, 'station_id' => $station->id])];
    }

    private function order(Station $station, User $cashier, string $number, string $orderedAt, string $method = 'cash', string $total = '50.00', string $discount = '0.00', ?Customer $customer = null): Order
    {
        return Order::query()->create([
            'order_number' => $number, 'ordered_at' => $orderedAt, 'station_id' => $station->id, 'cashier_id' => $cashier->id,
            'customer_id' => $customer?->id, 'payment_method' => $method, 'subtotal_amount' => bcadd($total, $discount, 2),
            'discount_amount' => $discount, 'total_amount' => $total, 'cash_received' => $method === 'cash' ? $total : null,
            'change_amount' => $method === 'cash' ? '0.00' : null,
        ]);
    }
}
