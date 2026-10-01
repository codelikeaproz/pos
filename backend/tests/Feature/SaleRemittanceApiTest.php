<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\Station;
use App\Models\StationItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SaleRemittanceApiTest extends TestCase
{
    use RefreshDatabase;

    private function order(array $overrides = []): Order
    {
        $station = $overrides['station'] ?? Station::query()->create(['name' => fake()->unique()->word(), 'location' => 'Campus']);
        $cashier = $overrides['cashier'] ?? User::factory()->endUser()->create(['station_id' => $station->id]);
        unset($overrides['station'], $overrides['cashier']);

        return Order::query()->create(array_merge([
            'order_number' => 'ORD-'.fake()->unique()->numerify('######'), 'ordered_at' => now(), 'station_id' => $station->id,
            'cashier_id' => $cashier->id, 'customer_id' => null, 'payment_method' => 'cash', 'total_amount' => '100.25',
            'cash_received' => '150.00', 'change_amount' => '49.75',
        ], $overrides));
    }

    public function test_admin_lists_searches_filters_and_paginates_only_cash_orders(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);
        $station = Station::query()->create(['name' => 'Main Counter', 'location' => 'Campus']);
        $cashier = User::factory()->endUser()->create(['name' => 'Juan Cashier', 'station_id' => $station->id]);
        $customer = Customer::query()->create(['name' => 'Maria Customer', 'address' => 'Campus']);
        $cash = $this->order(['station' => $station, 'cashier' => $cashier, 'customer_id' => $customer->id, 'order_number' => 'ORD-SEARCH', 'ordered_at' => '2026-09-30 16:30:00']);
        $this->order(['station' => $station, 'cashier' => $cashier, 'customer_id' => $customer->id, 'payment_method' => 'credit', 'cash_received' => null, 'change_amount' => null]);
        $this->getJson('/api/sale-remittances?search=Maria&from_date=2026-10-01&to_date=2026-10-01')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $cash->id);
        for ($i = 0; $i < 11; $i++) {
            $this->order();
        }
        $this->getJson('/api/sale-remittances')->assertOk()->assertJsonCount(10, 'data')->assertJsonPath('meta.last_page', 2);
    }

    public function test_end_user_and_business_admin_privilege_cannot_access_remittance(): void
    {
        $user = User::factory()->endUser()->create();
        Sanctum::actingAs($user);
        $this->getJson('/api/sale-remittances')->assertForbidden();
        $this->postJson('/api/sale-remittances', ['order_ids' => []])->assertForbidden();
    }

    public function test_admin_atomically_remits_multiple_cash_orders_with_authoritative_total(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);
        $first = $this->order(['total_amount' => '100.25']);
        $second = $this->order(['total_amount' => '9.75']);
        $response = $this->postJson('/api/sale-remittances', ['order_ids' => [$second->id, $first->id]])->assertOk()
            ->assertJsonPath('remittedCount', 2)->assertJsonPath('remitTotal', '110.00')->assertJsonPath('remittedBy.id', $admin->id);
        $this->assertNotNull($first->fresh()->remitted_at);
        $this->assertSame($admin->id, $second->fresh()->remitted_by_id);
        $this->assertNotNull($response->json('remittedAt'));
    }

    public function test_credit_stale_missing_duplicate_and_mixed_batches_are_rejected_without_partial_writes(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $customer = Customer::query()->create(['name' => 'Credit Customer', 'address' => 'Campus']);
        $cash = $this->order();
        $credit = $this->order(['payment_method' => 'credit', 'customer_id' => $customer->id, 'cash_received' => null, 'change_amount' => null]);
        $this->postJson('/api/sale-remittances', ['order_ids' => [$cash->id, $credit->id]])->assertConflict();
        $this->assertNull($cash->fresh()->remitted_at);
        $this->assertNull($credit->fresh()->remitted_at);
        $this->postJson('/api/sale-remittances', ['order_ids' => [$cash->id, 999999]])->assertConflict();
        $this->assertNull($cash->fresh()->remitted_at);
        $this->postJson('/api/sale-remittances', ['order_ids' => [$cash->id, $cash->id]])->assertUnprocessable();
        $this->postJson('/api/sale-remittances', ['order_ids' => [$cash->id]])->assertOk();
        $this->postJson('/api/sale-remittances', ['order_ids' => [$cash->id]])->assertConflict();
    }

    public function test_remittance_changes_only_metadata_and_has_no_inventory_effect(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);
        $order = $this->order();
        $protected = ['order_number', 'ordered_at', 'station_id', 'cashier_id', 'customer_id', 'payment_method', 'total_amount', 'cash_received', 'change_amount'];
        $before = $order->only($protected);
        $stationItems = StationItem::query()->sum('quantity');
        $movements = InventoryMovement::query()->count();
        $this->postJson('/api/sale-remittances', ['order_ids' => [$order->id]])->assertOk();
        $after = $order->fresh();
        foreach ($protected as $attribute) {
            $this->assertEquals($before[$attribute], $after->{$attribute});
        }
        $this->assertEquals($stationItems, StationItem::query()->sum('quantity'));
        $this->assertSame($movements, InventoryMovement::query()->count());
    }
}
