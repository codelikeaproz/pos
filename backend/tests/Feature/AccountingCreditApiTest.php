<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Item;
use App\Models\Order;
use App\Models\Price;
use App\Models\Station;
use App\Models\StationItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AccountingCreditApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_accounting_role_has_financial_access_but_not_admin_or_pos_access(): void
    {
        $accounting = User::factory()->accounting()->create(['email' => 'accounting-test@example.com']);
        $this->postJson('/api/login', ['email' => $accounting->email, 'password' => 'password'])->assertOk()->assertJsonPath('user.role', 'accounting');
        Sanctum::actingAs($accounting);

        $this->getJson('/api/accounting-dashboard')->assertOk();
        $this->getJson('/api/customers')->assertOk();
        $this->getJson('/api/credit-monitoring')->assertOk();
        $this->getJson('/api/reports/sales')->assertOk();
        $this->getJson('/api/users')->assertForbidden();
        $this->getJson('/api/items')->assertForbidden();
        $this->getJson('/api/dashboard')->assertForbidden();
        $this->getJson('/api/pos/items')->assertForbidden();
    }

    public function test_customer_normalization_credit_limit_and_lifecycle(): void
    {
        Sanctum::actingAs(User::factory()->accounting()->create());
        $response = $this->postJson('/api/customers', [
            'employee_number' => '00123', 'first_name' => 'Juan', 'middle_name' => 'Santos', 'last_name' => 'Dela Cruz',
            'sex' => 'male', 'birth_date' => '1990-01-02', 'address' => 'Musuan',
        ])->assertCreated()->assertJsonPath('customer.name', 'Juan Santos Dela Cruz')->assertJsonPath('customer.creditLimit', '500.00');
        $id = $response->json('customer.id');
        $this->putJson("/api/customers/{$id}", [
            'employee_number' => '00123', 'first_name' => 'Juan', 'middle_name' => null, 'last_name' => 'Dela Cruz',
            'sex' => 'male', 'birth_date' => '1990-01-02', 'address' => 'CMU', 'credit_limit' => '750.50', 'is_active' => true,
        ])->assertOk()->assertJsonPath('customer.creditLimit', '750.50');
        $this->patchJson("/api/customers/{$id}/status", ['is_active' => false])->assertOk()->assertJsonPath('customer.isActive', false);
        $this->postJson('/api/customers', ['employee_number' => '00123', 'first_name' => 'Other', 'last_name' => 'Person', 'address' => 'CMU'])->assertUnprocessable()->assertJsonValidationErrors('employee_number');
    }

    public function test_partial_payments_derive_status_and_block_overpayment(): void
    {
        [$order] = $this->creditOrder('1000.00');
        Sanctum::actingAs(User::factory()->accounting()->create());

        $this->postJson("/api/credit-orders/{$order->id}/payments", ['amount' => '400.00', 'paid_at' => '2026-10-26 09:00:00'])
            ->assertCreated()->assertJsonPath('order.totalPaid', '400.00')->assertJsonPath('order.outstandingBalance', '600.00')->assertJsonPath('order.status', 'PARTIALLY_PAID');
        $this->assertDatabaseHas('credit_payments', ['order_id' => $order->id, 'paid_at' => '2026-10-26 01:00:00']);
        $this->postJson("/api/credit-orders/{$order->id}/payments", ['amount' => '600.01', 'paid_at' => '2026-10-26 10:00:00'])->assertConflict();
        $this->postJson("/api/credit-orders/{$order->id}/payments", ['amount' => '600.00', 'paid_at' => '2026-10-26 10:00:00'])
            ->assertCreated()->assertJsonPath('order.status', 'PAID')->assertJsonPath('order.outstandingBalance', '0.00');
        $this->assertDatabaseCount('credit_payments', 2);
        $this->assertMatchesRegularExpression('/^PAY20261026\d{6}$/', $order->creditPayments()->firstOrFail()->payment_number);
        $this->getJson('/api/accounting-dashboard')->assertOk()->assertJsonPath('summary.totalCreditSales', '1000.00')->assertJsonPath('summary.paidCredit', 1);
    }

    public function test_checkout_enforces_available_credit_and_generates_daily_or_numbers_without_order_dashes(): void
    {
        Carbon::setTestNow('2026-10-26 01:00:00 UTC');
        [$cashier, $customer, $item] = $this->checkoutContext();
        Sanctum::actingAs($cashier);
        $payload = ['items' => [['itemId' => $item->id, 'quantity' => '1.00', 'expectedUnitPrice' => '300.00']], 'paymentMethod' => 'credit', 'customerId' => $customer->id];

        $first = $this->postJson('/api/pos/checkout', $payload)->assertCreated()->assertJsonPath('order.orNumber', 'OR#20261026000001');
        $this->assertMatchesRegularExpression('/^ORD\d{14}$/', $first->json('order.orderNumber'));
        $this->postJson('/api/pos/checkout', $payload)->assertCreated()->assertJsonPath('order.orNumber', 'OR#20261026000002');
        Carbon::setTestNow('2026-10-27 01:00:00 UTC');
        $this->postJson('/api/pos/checkout', $payload)->assertCreated()->assertJsonPath('order.orNumber', 'OR#20261027000001');
        $this->postJson('/api/pos/checkout', $payload)->assertUnprocessable()->assertJsonValidationErrors('customerId');
        $this->assertDatabaseCount('orders', 3);
        Carbon::setTestNow();
    }

    private function creditOrder(string $total): array
    {
        $station = Station::query()->create(['name' => 'Main', 'location' => 'Main']);
        $cashier = User::factory()->endUser()->create(['station_id' => $station->id]);
        $customer = Customer::query()->create(['name' => 'Credit Customer', 'address' => 'CMU']);
        $order = Order::query()->create(['order_number' => 'ORD20261026000001', 'or_number' => 'OR#20261026000001', 'ordered_at' => now(), 'station_id' => $station->id, 'cashier_id' => $cashier->id, 'customer_id' => $customer->id, 'payment_method' => 'credit', 'total_amount' => $total]);

        return [$order, $customer];
    }

    private function checkoutContext(): array
    {
        $station = Station::query()->create(['name' => 'Main', 'location' => 'Main']);
        $cashier = User::factory()->endUser()->create(['station_id' => $station->id]);
        $customer = Customer::query()->create(['name' => 'Credit Customer', 'address' => 'CMU', 'credit_limit' => '1000.00']);
        $item = Item::query()->create(['item_code' => 'ITM-001', 'name' => 'Item', 'units_backup' => 'PACK', 'unit' => '1', 'price' => '300.00']);
        Price::query()->create(['item_id' => $item->id, 'amount' => '300.00', 'is_active' => true]);
        StationItem::query()->create(['station_id' => $station->id, 'item_id' => $item->id, 'quantity' => '5.00']);

        return [$cashier, $customer, $item];
    }
}
