<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Station;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerCreditMonitoringApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_and_credit_routes_are_admin_only_and_read_only_where_required(): void
    {
        $this->getJson('/api/customers')->assertUnauthorized();
        $this->postJson('/api/customers', [])->assertUnauthorized();
        $this->getJson('/api/credit-monitoring')->assertUnauthorized();
        Sanctum::actingAs(User::factory()->endUser()->create());
        $this->getJson('/api/customers')->assertForbidden();
        $this->postJson('/api/customers', [])->assertForbidden();
        $this->getJson('/api/credit-monitoring')->assertForbidden();
        Sanctum::actingAs(User::factory()->admin()->create());
        $this->postJson('/api/credit-monitoring', [])->assertStatus(405);
        $this->deleteJson('/api/credit-monitoring/1')->assertNotFound();
    }

    public function test_admin_creates_trimmed_customers_with_duplicate_names_and_no_invented_balance(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $this->postJson('/api/customers', ['name' => '  Maria Cruz  ', 'address' => '  Main Street  ', 'balance' => '999.00'])
            ->assertCreated()->assertJsonPath('customer.name', 'Maria Cruz')->assertJsonPath('customer.address', 'Main Street')->assertJsonPath('customer.balance', null);
        $this->postJson('/api/customers', ['name' => 'Maria Cruz', 'address' => 'Other Street'])->assertCreated();
        $this->assertDatabaseCount('customers', 2);
        $this->assertSame(0, Customer::query()->firstOrFail()->orders()->count());
        $this->postJson('/api/customers', ['name' => '  ', 'address' => 'Street'])->assertUnprocessable()->assertJsonValidationErrors('name');
        $this->postJson('/api/customers', ['name' => 'Person', 'address' => '  '])->assertUnprocessable()->assertJsonValidationErrors('address');
        $this->postJson('/api/customers', ['name' => str_repeat('A', 256), 'address' => 'Street'])->assertUnprocessable()->assertJsonValidationErrors('name');
        $this->postJson('/api/customers', ['name' => 'Person', 'address' => str_repeat('A', 501)])->assertUnprocessable()->assertJsonValidationErrors('address');
        $this->assertDatabaseCount('customers', 2);
    }

    public function test_customer_search_and_pagination(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        foreach (range(1, 11) as $number) {
            Customer::query()->create(['name' => sprintf('Person %02d', $number), 'address' => "Street {$number}"]);
        }
        $this->getJson('/api/customers')->assertOk()->assertJsonCount(10, 'data')->assertJsonPath('meta.total', 11);
        $this->getJson('/api/customers?page=2')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/customers?search=Person%2003')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/customers?search=Street%204')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_cash_order_allows_walk_in_but_credit_order_requires_valid_customer_and_restricts_deletion(): void
    {
        [$station, $cashier, $customer] = $this->context();
        $cash = $this->order($station, $cashier, null, 'cash', '10.00');
        $this->assertNull($cash->customer_id);
        $this->assertNull($cash->customer);
        try {
            $this->order($station, $cashier, null, 'credit', '10.00');
            $this->fail('Expected Customer requirement');
        } catch (\DomainException $exception) {
            $this->assertSame('A credit order requires a Customer.', $exception->getMessage());
        }
        try {
            $this->order($station, $cashier, 999, 'credit', '10.00');
            $this->fail('Expected Customer foreign key');
        } catch (QueryException) {
            $this->assertDatabaseCount('orders', 1);
        }
        $credit = $this->order($station, $cashier, $customer->id, 'credit', '10.00');
        $this->assertSame($customer->id, $credit->customer->id);
        $this->assertSame($credit->id, $customer->orders()->firstOrFail()->id);
        try {
            $customer->delete();
            $this->fail('Expected restrictive Customer foreign key');
        } catch (QueryException) {
            $this->assertDatabaseHas('customers', ['id' => $customer->id]);
        }
    }

    public function test_monitoring_filters_credit_and_calculates_calendar_age_in_manila(): void
    {
        $this->travelTo(Carbon::parse('2026-09-30 17:00:00', 'UTC')); // October 1, 01:00 in Manila.
        [$station, $cashier, $customer] = $this->context();
        $today = $this->order($station, $cashier, $customer->id, 'credit', '20.00', '2026-09-30 16:00:00');
        $yesterday = $this->order($station, $cashier, $customer->id, 'credit', '30.00', '2026-09-30 15:00:00');
        $older = $this->order($station, $cashier, $customer->id, 'credit', '40.00', '2026-09-01 15:00:00');
        $this->order($station, $cashier, null, 'cash', '500.00', '2026-09-30 16:00:00');
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/credit-monitoring')->assertOk()->assertJsonCount(3, 'data')
            ->assertJsonPath('totalAmount', '90.00')
            ->assertJsonPath('data.0.orderNumber', $today->order_number)
            ->assertJsonPath('data.0.customer.name', $customer->name)
            ->assertJsonPath('data.0.station.name', $station->name)
            ->assertJsonPath('data.0.cashier.name', $cashier->name)
            ->assertJsonPath('data.0.ageDays', 0)
            ->assertJsonPath('data.1.ageDays', 1)
            ->assertJsonPath('data.2.ageDays', 30);
        $this->assertSame($yesterday->id, Order::query()->where('order_number', $yesterday->order_number)->firstOrFail()->id);
        $this->assertSame($older->id, Order::query()->where('order_number', $older->order_number)->firstOrFail()->id);
        $this->getJson('/api/credit-monitoring?from_date=2026-09-30&to_date=2026-10-01')->assertOk()->assertJsonPath('meta.total', 2)->assertJsonPath('totalAmount', '50.00');
        $this->getJson('/api/credit-monitoring?from_date=2026-10-01&to_date=2026-10-01')->assertOk()->assertJsonPath('meta.total', 1)->assertJsonPath('totalAmount', '20.00');
        $this->getJson('/api/credit-monitoring?to_date=2026-09-30')->assertOk()->assertJsonPath('meta.total', 2)->assertJsonPath('totalAmount', '70.00');
        $this->getJson('/api/credit-monitoring?from_date=2026-10-01&to_date=2026-09-30')->assertUnprocessable()->assertJsonValidationErrors('to_date');
        $this->getJson('/api/credit-monitoring?search='.urlencode($customer->name))->assertOk()->assertJsonPath('meta.total', 3);
        $this->getJson('/api/credit-monitoring?search='.urlencode($station->name))->assertOk()->assertJsonPath('meta.total', 3);
        $this->getJson('/api/credit-monitoring?search='.urlencode($cashier->name))->assertOk()->assertJsonPath('meta.total', 3);
        $this->getJson('/api/credit-monitoring?search='.$today->order_number)->assertOk()->assertJsonPath('meta.total', 1);
        $this->travelBack();
    }

    public function test_filtered_total_covers_all_pages_using_fixed_cents(): void
    {
        [$station, $cashier, $customer] = $this->context();
        foreach (range(1, 11) as $number) {
            $this->order($station, $cashier, $customer->id, 'credit', '0.10', '2026-09-30 12:00:00', $number);
        }
        $this->order($station, $cashier, null, 'cash', '100.00');
        Sanctum::actingAs(User::factory()->admin()->create());
        $this->getJson('/api/credit-monitoring?page=1')->assertOk()->assertJsonCount(10, 'data')->assertJsonPath('meta.total', 11)->assertJsonPath('totalAmount', '1.10');
        $this->getJson('/api/credit-monitoring?page=2')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('totalAmount', '1.10');
    }

    private function context(): array
    {
        $station = Station::query()->create(['name' => 'Main', 'location' => 'Main']);
        $cashier = User::factory()->endUser()->create(['station_id' => $station->id]);
        $customer = Customer::query()->create(['name' => 'Maria Cruz', 'address' => 'Main Street']);

        return [$station, $cashier, $customer];
    }

    private function order(Station $station, User $cashier, ?int $customerId, string $method, string $total, ?string $orderedAt = null, int $sequence = 1): Order
    {
        return Order::query()->create([
            'order_number' => 'ORD-20260930-'.str_pad((string) (Order::query()->count() + $sequence), 6, '0', STR_PAD_LEFT),
            'ordered_at' => $orderedAt ?? now(),
            'station_id' => $station->id,
            'cashier_id' => $cashier->id,
            'customer_id' => $customerId,
            'payment_method' => $method,
            'total_amount' => $total,
            'cash_received' => $method === 'cash' ? $total : '0.00',
            'change_amount' => '0.00',
        ]);
    }
}
