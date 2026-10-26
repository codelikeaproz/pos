<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\InventoryMovement;
use App\Models\Item;
use App\Models\MonthlyEndReport;
use App\Models\Order;
use App\Models\Privilege;
use App\Models\Station;
use App\Models\StationItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Date;
use Laravel\Sanctum\Sanctum;
use OpenSpout\Reader\XLSX\Reader;
use Tests\TestCase;

class ReportExcelExportApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_sales_export_is_admin_only_and_contains_every_filtered_order(): void
    {
        $this->getJson('/api/reports/sales/export?period=today')->assertUnauthorized();
        $cashier = User::factory()->endUser()->create();
        $cashier->privileges()->attach(Privilege::query()->create(['description' => 'Reporter']));
        Sanctum::actingAs($cashier);
        $this->get('/api/reports/sales/export?period=today')->assertForbidden();

        Date::setTestNow('2026-10-22 04:00:00 UTC');
        $station = Station::query()->create(['name' => 'Main Gate', 'location' => 'Main']);
        $other = Station::query()->create(['name' => 'Other', 'location' => 'Other']);
        $customer = Customer::query()->create(['name' => 'Excel Customer', 'address' => 'Musuan']);
        foreach (range(1, 25) as $number) {
            $this->order($station, $cashier, "ORDER-{$number}", 'cash', '10.00', '1.00', $customer);
        }
        $this->order($station, $cashier, 'CREDIT', 'credit', '50.00', '0.00', $customer);
        $this->order($other, $cashier, 'OTHER', 'cash', '100.00');
        $before = [Order::query()->count(), InventoryMovement::query()->count()];
        Sanctum::actingAs(User::factory()->admin()->create());

        $response = $this->get("/api/reports/sales/export?period=today&station_id={$station->id}&payment_method=cash&search=Excel&page=1&per_page=10")
            ->assertOk()->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        [$sheet, $rows] = $this->workbook($response->baseResponse->getFile()->getPathname());
        $header = collect($rows)->search(fn ($row) => ($row[0] ?? null) === 'Date');

        $this->assertSame('Sales Report', $sheet);
        $this->assertSame(25, count($rows) - $header - 1);
        $this->assertContains(['Total Sales', 250], $rows);
        $this->assertContains(['Transactions', 25], $rows);
        $this->assertSame('Excel Customer', $rows[$header + 1][3]);
        $this->assertSame(10, $rows[$header + 1][8]);
        $this->assertSame($before, [Order::query()->count(), InventoryMovement::query()->count()]);
        Date::setTestNow();
    }

    public function test_finalized_monthly_end_export_uses_snapshots_and_reconciliation_audit(): void
    {
        $station = Station::query()->create(['name' => 'Main Gate', 'location' => 'Main']);
        $admin = User::factory()->admin()->create(['name' => 'Ralph Admin']);
        $report = MonthlyEndReport::query()->create(['station_id' => $station->id, 'created_by_id' => $admin->id, 'report_month' => 10, 'report_year' => 2026, 'status' => 'FINALIZED', 'finalized_by_id' => $admin->id, 'finalized_at' => now()]);
        $rows = [];
        foreach ([['Batchoy', '50.00', '48.00'], ['Rice', '30.00', '30.00'], ['Coke', '20.00', '22.00']] as [$name, $system, $physical]) {
            $item = Item::query()->create(['item_code' => strtoupper($name), 'name' => $name, 'units_backup' => 'pc', 'unit' => 'pc', 'price' => '10.00']);
            $stock = StationItem::query()->create(['station_id' => $station->id, 'item_id' => $item->id, 'quantity' => $system]);
            $rows[$name] = $report->items()->create(['item_id' => $item->id, 'item_code_snapshot' => strtoupper($name), 'item_name_snapshot' => $name, 'unit_snapshot' => 'pc', 'system_count' => $system, 'physical_count' => $physical]);
            if ($name === 'Batchoy') {
                $movement = InventoryMovement::query()->create(['station_item_id' => $stock->id, 'item_id' => $item->id, 'quantity_change' => '-2.00', 'type' => 'ADJUSTMENT', 'reference_type' => 'monthly_end_report_item', 'reference_id' => $rows[$name]->id, 'actor_id' => $admin->id]);
                $rows[$name]->update(['reconciled_at' => now(), 'reconciled_by_id' => $admin->id, 'reconciliation_movement_id' => $movement->id]);
            }
            $item->update(['name' => "Current {$name}"]);
        }
        $before = [$report->fresh()->getAttributes(), InventoryMovement::query()->count(), StationItem::query()->pluck('quantity', 'item_id')->all()];
        Sanctum::actingAs($admin);

        $response = $this->get("/api/monthly-end-reports/{$report->id}/export")->assertOk();
        [$sheet, $workbookRows] = $this->workbook($response->baseResponse->getFile()->getPathname());
        $header = collect($workbookRows)->search(fn ($row) => ($row[0] ?? null) === 'Item');
        $batchoy = $workbookRows[$header + 1];
        $rice = $workbookRows[$header + 2];
        $coke = $workbookRows[$header + 3];

        $this->assertSame('Monthly End Inventory', $sheet);
        $this->assertSame(['Batchoy', 'BATCHOY', 'pc', 50, 48, -2, 'Short', 'Reconciled', -2, 'Ralph Admin'], array_slice($batchoy, 0, 10));
        $this->assertSame('No Adjustment Required', $rice[7]);
        $this->assertSame('Pending Reconciliation', $coke[7]);
        $this->assertSame('', $coke[11]);
        $this->assertSame($before, [$report->fresh()->getAttributes(), InventoryMovement::query()->count(), StationItem::query()->pluck('quantity', 'item_id')->all()]);

        $draft = MonthlyEndReport::query()->create(['station_id' => $station->id, 'created_by_id' => $admin->id, 'report_month' => 11, 'report_year' => 2026, 'status' => 'DRAFT']);
        $this->get("/api/monthly-end-reports/{$draft->id}/export")->assertUnprocessable();
    }

    private function order(Station $station, User $cashier, string $number, string $method, string $total, string $discount = '0.00', ?Customer $customer = null): Order
    {
        return Order::query()->create([
            'order_number' => $number, 'ordered_at' => '2026-10-22 01:00:00', 'station_id' => $station->id,
            'cashier_id' => $cashier->id, 'customer_id' => $customer?->id, 'payment_method' => $method,
            'subtotal_amount' => bcadd($total, $discount, 2), 'discount_amount' => $discount, 'total_amount' => $total,
            'cash_received' => $method === 'cash' ? $total : null, 'change_amount' => $method === 'cash' ? '0.00' : null,
        ]);
    }

    private function workbook(string $path): array
    {
        $reader = new Reader;
        $reader->open($path);
        $sheet = $reader->getSheetIterator()->current();
        $rows = [];
        foreach ($sheet->getRowIterator() as $row) {
            $rows[] = array_map(fn ($cell) => $cell->getValue(), $row->getCells());
        }
        $name = $sheet->getName();
        $reader->close();

        return [$name, $rows];
    }
}
