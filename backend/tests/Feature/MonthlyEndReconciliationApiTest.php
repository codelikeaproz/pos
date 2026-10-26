<?php

namespace Tests\Feature;

use App\Models\InventoryMovement;
use App\Models\Item;
use App\Models\MonthlyEndReport;
use App\Models\Privilege;
use App\Models\Station;
use App\Models\StationItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MonthlyEndReconciliationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_reconciliation_is_admin_only_and_requires_a_finalized_report(): void
    {
        [$report, $items, $admin] = $this->report(['ITEM' => ['10.00', '8.00']], false);
        $url = "/api/monthly-end-reports/{$report->id}/reconcile";

        $this->postJson($url, ['itemIds' => [$items['ITEM']->id]])->assertUnauthorized();
        $cashier = User::factory()->endUser()->create();
        $cashier->privileges()->attach(Privilege::query()->create(['description' => 'Stockman']));
        Sanctum::actingAs($cashier);
        $this->postJson($url, ['itemIds' => [$items['ITEM']->id]])->assertForbidden();
        Sanctum::actingAs($admin);
        $this->postJson($url, ['itemIds' => [$items['ITEM']->id]])->assertUnprocessable()->assertJsonValidationErrors('report');
    }

    public function test_signed_variances_apply_to_current_live_stock_and_preserve_snapshots(): void
    {
        [$report, $items, $admin, $stocks] = $this->report([
            'SHORT' => ['50.00', '48.00'],
            'OVER' => ['20.00', '22.00'],
            'MATCH' => ['30.00', '30.00'],
        ]);
        $stocks['SHORT']->update(['quantity' => '45.00']);
        $stocks['OVER']->update(['quantity' => '10.00']);
        $stocks['SHORT']->item->update(['name' => 'Renamed', 'is_active' => false]);
        Sanctum::actingAs($admin);

        $this->postJson("/api/monthly-end-reports/{$report->id}/reconcile", ['itemIds' => [$items['SHORT']->id, $items['OVER']->id]])
            ->assertOk()->assertJsonPath('report.reconciliationStatus', 'FULLY_RECONCILED')
            ->assertJsonPath('report.summary.pendingReconciliation', 0)->assertJsonPath('report.summary.reconciled', 2)
            ->assertJsonPath('report.items.0.itemName', 'SHORT')->assertJsonPath('report.items.0.systemCount', '50.00')
            ->assertJsonPath('report.items.0.physicalCount', '48.00')->assertJsonPath('report.items.0.currentStock', '43.00');

        $this->assertSame('43.00', $stocks['SHORT']->fresh()->quantity);
        $this->assertSame('12.00', $stocks['OVER']->fresh()->quantity);
        $this->assertSame(['-2.00', '2.00'], InventoryMovement::query()->orderBy('id')->pluck('quantity_change')->all());
        $this->assertDatabaseHas('inventory_movements', ['reference_type' => 'monthly_end_report_item', 'reference_id' => $items['SHORT']->id, 'actor_id' => $admin->id]);
        $this->assertNotNull($items['SHORT']->fresh()->reconciled_at);
        $this->assertSame($admin->id, $items['SHORT']->fresh()->reconciled_by_id);
    }

    public function test_match_and_already_reconciled_items_cannot_adjust_stock_twice(): void
    {
        [$report, $items, $admin, $stocks] = $this->report(['SHORT' => ['10.00', '8.00'], 'MATCH' => ['5.00', '5.00']]);
        Sanctum::actingAs($admin);
        $url = "/api/monthly-end-reports/{$report->id}/reconcile";

        $this->postJson($url, ['itemIds' => [$items['MATCH']->id]])->assertUnprocessable();
        $this->postJson($url, ['itemIds' => [$items['SHORT']->id]])->assertOk();
        $this->postJson($url, ['itemIds' => [$items['SHORT']->id]])->assertUnprocessable();

        $this->assertSame('8.00', $stocks['SHORT']->fresh()->quantity);
        $this->assertDatabaseCount('inventory_movements', 1);
    }

    public function test_batch_rolls_back_when_any_result_would_be_negative(): void
    {
        [$report, $items, $admin, $stocks] = $this->report(['OVER' => ['5.00', '8.00'], 'SHORT' => ['10.00', '5.00']]);
        $stocks['OVER']->update(['quantity' => '2.00']);
        $stocks['SHORT']->update(['quantity' => '1.00']);
        Sanctum::actingAs($admin);

        $this->postJson("/api/monthly-end-reports/{$report->id}/reconcile", ['itemIds' => [$items['OVER']->id, $items['SHORT']->id]])
            ->assertUnprocessable()->assertJsonValidationErrors('itemIds');

        $this->assertSame('2.00', $stocks['OVER']->fresh()->quantity);
        $this->assertSame('1.00', $stocks['SHORT']->fresh()->quantity);
        $this->assertDatabaseCount('inventory_movements', 0);
        $this->assertNull($items['OVER']->fresh()->reconciled_at);
        $this->assertNull($items['SHORT']->fresh()->reconciled_at);
    }

    /** @param array<string, array{string, string}> $counts */
    private function report(array $counts, bool $finalized = true): array
    {
        $station = Station::query()->create(['name' => 'Main Gate', 'location' => 'Main']);
        $admin = User::factory()->admin()->create(['name' => 'Admin']);
        $report = MonthlyEndReport::query()->create(['station_id' => $station->id, 'created_by_id' => $admin->id, 'report_month' => 10, 'report_year' => 2026, 'status' => $finalized ? 'FINALIZED' : 'DRAFT', 'finalized_by_id' => $finalized ? $admin->id : null, 'finalized_at' => $finalized ? now() : null]);
        $items = [];
        $stocks = [];
        foreach ($counts as $code => [$system, $physical]) {
            $item = Item::query()->create(['item_code' => $code, 'name' => $code, 'units_backup' => 'pc', 'unit' => 'pc', 'price' => '10.00']);
            $stocks[$code] = StationItem::query()->create(['station_id' => $station->id, 'item_id' => $item->id, 'quantity' => $system]);
            $items[$code] = $report->items()->create(['item_id' => $item->id, 'item_code_snapshot' => $code, 'item_name_snapshot' => $code, 'unit_snapshot' => 'pc', 'system_count' => $system, 'physical_count' => $physical]);
        }

        return [$report, $items, $admin, $stocks];
    }
}
