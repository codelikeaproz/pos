<?php

namespace Tests\Feature;

use App\Models\InventoryMovement;
use App\Models\Item;
use App\Models\Privilege;
use App\Models\Station;
use App\Models\StationItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MonthlyEndReportApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_routes_are_admin_only_even_with_business_privilege(): void
    {
        $this->getJson('/api/monthly-end-reports')->assertUnauthorized();
        $cashier = User::factory()->endUser()->create();
        $cashier->privileges()->attach(Privilege::query()->create(['description' => 'Stockman']));
        Sanctum::actingAs($cashier);
        $this->getJson('/api/monthly-end-reports')->assertForbidden();
        $this->postJson('/api/monthly-end-reports', [])->assertForbidden();

        Sanctum::actingAs(User::factory()->admin()->create());
        $this->getJson('/api/monthly-end-reports')->assertOk();
    }

    public function test_creation_snapshots_all_station_items_with_two_decimal_counts(): void
    {
        [$station, $admin] = $this->context();
        $batchoy = $this->stock($station, 'BAT001', 'Batchoy', 'serving', '50.00');
        $rice = $this->stock($station, 'RICE001', 'Rice', 'serving', '30.00', false, false);
        $coke = $this->stock($station, 'COKE001', 'Coke Can', 'can', '0.00');
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/monthly-end-reports', ['stationId' => $station->id, 'reportMonth' => 10, 'reportYear' => 2026])
            ->assertCreated()->assertJsonPath('report.status', 'DRAFT')->assertJsonPath('report.summary.totalItems', 3)
            ->assertJsonPath('report.summary.uncounted', 3)->assertJsonPath('report.items.0.physicalCount', null);

        $this->assertDatabaseHas('monthly_end_report_items', ['item_id' => $batchoy->item_id, 'system_count' => '50.00', 'physical_count' => null, 'item_name_snapshot' => 'Batchoy']);
        $this->assertDatabaseHas('monthly_end_report_items', ['item_id' => $rice->item_id, 'system_count' => '30.00']);
        $this->assertDatabaseHas('monthly_end_report_items', ['item_id' => $coke->item_id, 'system_count' => '0.00']);
        $this->assertSame($admin->id, $response->json('report.createdBy.id'));
    }

    public function test_snapshot_is_frozen_and_item_metadata_remains_historical(): void
    {
        [$station, $admin] = $this->context();
        $stock = $this->stock($station, 'COKE001', 'Coke Can', 'can', '50.00');
        Sanctum::actingAs($admin);
        $reportId = $this->postJson('/api/monthly-end-reports', ['stationId' => $station->id, 'reportMonth' => 10, 'reportYear' => 2026])->json('report.id');

        $stock->update(['quantity' => '49.00']);
        $stock->item->update(['item_code' => 'NEW-CODE', 'name' => 'Coca-Cola Can', 'units_backup' => 'bottle']);
        $this->getJson("/api/monthly-end-reports/{$reportId}")->assertOk()
            ->assertJsonPath('report.items.0.systemCount', '50.00')->assertJsonPath('report.items.0.itemCode', 'COKE001')
            ->assertJsonPath('report.items.0.itemName', 'Coke Can')->assertJsonPath('report.items.0.unit', 'can');
    }

    public function test_duplicate_period_is_rejected_per_station_and_empty_station_is_rejected(): void
    {
        [$first, $admin] = $this->context();
        $second = Station::query()->create(['name' => 'Second Station', 'location' => 'Second']);
        $empty = Station::query()->create(['name' => 'Empty Station', 'location' => 'Empty']);
        $this->stock($first, 'FIRST', 'First', 'pc', '1.00');
        $this->stock($second, 'SECOND', 'Second', 'pc', '1.00');
        Sanctum::actingAs($admin);
        $payload = ['stationId' => $first->id, 'reportMonth' => 10, 'reportYear' => 2026];

        $this->postJson('/api/monthly-end-reports', $payload)->assertCreated();
        $this->postJson('/api/monthly-end-reports', $payload)->assertUnprocessable()->assertJsonValidationErrors('reportMonth');
        $this->postJson('/api/monthly-end-reports', [...$payload, 'stationId' => $second->id])->assertCreated();
        $this->postJson('/api/monthly-end-reports', [...$payload, 'stationId' => $empty->id])->assertUnprocessable()->assertJsonValidationErrors('stationId');
    }

    public function test_draft_counts_variances_zero_and_summary_do_not_mutate_inventory(): void
    {
        [$station, $admin] = $this->context();
        $stocks = [
            $this->stock($station, 'SHORT', 'Short Item', 'pc', '50.00'),
            $this->stock($station, 'MATCH', 'Match Item', 'pc', '30.00'),
            $this->stock($station, 'OVER', 'Over Item', 'pc', '20.00'),
            $this->stock($station, 'ZERO', 'Zero Item', 'pc', '5.00'),
            $this->stock($station, 'BLANK', 'Blank Item', 'pc', '10.25'),
        ];
        Sanctum::actingAs($admin);
        $report = $this->postJson('/api/monthly-end-reports', ['stationId' => $station->id, 'reportMonth' => 10, 'reportYear' => 2026])->json('report');
        $ids = collect($report['items'])->keyBy('itemCode');
        $movementCount = InventoryMovement::query()->count();

        $this->putJson("/api/monthly-end-reports/{$report['id']}/physical-counts", ['counts' => [
            ['id' => $ids['SHORT']['id'], 'physicalCount' => '48.00'],
            ['id' => $ids['MATCH']['id'], 'physicalCount' => '30.00'],
            ['id' => $ids['OVER']['id'], 'physicalCount' => '22.00'],
            ['id' => $ids['ZERO']['id'], 'physicalCount' => '0.00'],
            ['id' => $ids['BLANK']['id'], 'physicalCount' => null],
        ]])->assertOk()->assertJsonPath('report.status', 'DRAFT')
            ->assertJsonPath('report.summary.matched', 1)->assertJsonPath('report.summary.short', 2)
            ->assertJsonPath('report.summary.over', 1)->assertJsonPath('report.summary.uncounted', 1)
            ->assertJsonPath('report.items.0.variance', '-2.00')->assertJsonPath('report.items.0.result', 'SHORT')
            ->assertJsonPath('report.items.1.variance', '0.00')->assertJsonPath('report.items.1.result', 'MATCH')
            ->assertJsonPath('report.items.2.variance', '2.00')->assertJsonPath('report.items.2.result', 'OVER')
            ->assertJsonPath('report.items.3.variance', '-5.00')->assertJsonPath('report.items.3.result', 'SHORT')
            ->assertJsonPath('report.items.4.result', 'UNCOUNTED');

        foreach ($stocks as $index => $stock) {
            $this->assertSame(['50.00', '30.00', '20.00', '5.00', '10.25'][$index], $stock->fresh()->quantity);
        }
        $this->assertSame($movementCount, InventoryMovement::query()->count());

        $this->putJson("/api/monthly-end-reports/{$report['id']}/physical-counts", ['counts' => [
            ['id' => $ids['SHORT']['id'], 'physicalCount' => '1.125'],
        ]])->assertUnprocessable()->assertJsonValidationErrors('counts.0.physicalCount');
    }

    public function test_finalization_requires_every_count_then_freezes_report_without_stock_or_movements(): void
    {
        [$station, $admin] = $this->context();
        $stock = $this->stock($station, 'ITEM', 'Item', 'pc', '50.00');
        Sanctum::actingAs($admin);
        $report = $this->postJson('/api/monthly-end-reports', ['stationId' => $station->id, 'reportMonth' => 10, 'reportYear' => 2026])->json('report');
        $itemId = $report['items'][0]['id'];
        $movementCount = InventoryMovement::query()->count();

        $this->postJson("/api/monthly-end-reports/{$report['id']}/finalize")->assertUnprocessable()->assertJsonValidationErrors('report');
        $this->putJson("/api/monthly-end-reports/{$report['id']}/physical-counts", ['counts' => [['id' => $itemId, 'physicalCount' => '48.50']]])->assertOk();
        $this->postJson("/api/monthly-end-reports/{$report['id']}/finalize")->assertOk()
            ->assertJsonPath('report.status', 'FINALIZED')->assertJsonPath('report.finalizedBy.id', $admin->id)
            ->assertJsonPath('report.summary.uncounted', 0);
        $this->putJson("/api/monthly-end-reports/{$report['id']}/physical-counts", ['counts' => [['id' => $itemId, 'physicalCount' => '50.00']]])->assertUnprocessable();
        $this->postJson("/api/monthly-end-reports/{$report['id']}/finalize")->assertUnprocessable();
        $this->assertSame('50.00', $stock->fresh()->quantity);
        $this->assertSame($movementCount, InventoryMovement::query()->count());
    }

    public function test_list_filters_and_paginates_newest_reports(): void
    {
        [$station, $admin] = $this->context();
        $this->stock($station, 'ITEM', 'Item', 'pc', '1.00');
        Sanctum::actingAs($admin);
        foreach (range(1, 11) as $month) {
            $this->postJson('/api/monthly-end-reports', ['stationId' => $station->id, 'reportMonth' => $month, 'reportYear' => 2026])->assertCreated();
        }

        $this->getJson('/api/monthly-end-reports?per_page=10')->assertOk()->assertJsonPath('meta.total', 11)->assertJsonPath('meta.last_page', 2)->assertJsonCount(10, 'data');
        $this->getJson("/api/monthly-end-reports?station_id={$station->id}&report_month=10&report_year=2026&status=DRAFT")
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.reportMonth', 10);
        $this->getJson('/api/monthly-end-reports?per_page=15')->assertUnprocessable();
    }

    /** @return array{Station, User} */
    private function context(): array
    {
        return [Station::query()->create(['name' => 'Main Gate', 'location' => 'Main']), User::factory()->admin()->create(['name' => 'Ralph Admin'])];
    }

    private function stock(Station $station, string $code, string $name, string $unit, string $quantity, bool $active = true, bool $priced = true): StationItem
    {
        $item = Item::query()->create(['item_code' => $code, 'name' => $name, 'units_backup' => $unit, 'unit' => $unit, 'price' => '10.00', 'is_active' => $active]);
        if ($priced) {
            $item->prices()->create(['amount' => '10.00', 'is_active' => true]);
        }

        return StationItem::query()->create(['station_id' => $station->id, 'item_id' => $item->id, 'quantity' => $quantity]);
    }
}
