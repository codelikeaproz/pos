<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReconcileMonthlyEndItemsRequest;
use App\Http\Requests\StoreMonthlyEndReportRequest;
use App\Http\Requests\UpdateMonthlyEndCountsRequest;
use App\Http\Resources\MonthlyEndReportResource;
use App\Models\InventoryMovement;
use App\Models\MonthlyEndReport;
use App\Models\Station;
use App\Models\StationItem;
use App\Services\ReportExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MonthlyEndReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'report_month' => ['nullable', 'integer', 'between:1,12'],
            'report_year' => ['nullable', 'integer', 'between:2000,2100'],
            'station_id' => ['nullable', 'integer', 'exists:stations,id'],
            'status' => ['nullable', 'in:DRAFT,FINALIZED'],
            'per_page' => ['nullable', 'integer', 'in:10,20,50,100'],
        ]);
        $reports = MonthlyEndReport::query()->with(['station', 'createdBy', 'finalizedBy'])
            ->when(isset($filters['report_month']), fn ($query) => $query->where('report_month', $filters['report_month']))
            ->when(isset($filters['report_year']), fn ($query) => $query->where('report_year', $filters['report_year']))
            ->when(isset($filters['station_id']), fn ($query) => $query->where('station_id', $filters['station_id']))
            ->when(isset($filters['status']), fn ($query) => $query->where('status', $filters['status']))
            ->orderByDesc('created_at')->orderByDesc('id')->paginate($this->pageSize($request))->withQueryString();

        return MonthlyEndReportResource::collection($reports)
            ->additional(['stations' => Station::query()->orderBy('name')->get(['id', 'name'])])->response();
    }

    public function store(StoreMonthlyEndReportRequest $request): JsonResponse
    {
        $data = $request->validated();
        $report = DB::transaction(function () use ($request, $data) {
            $station = Station::query()->whereKey($data['stationId'])->lockForUpdate()->firstOrFail();
            if (MonthlyEndReport::query()->where('station_id', $station->id)->where('report_month', $data['reportMonth'])->where('report_year', $data['reportYear'])->exists()) {
                throw ValidationException::withMessages(['reportMonth' => ['A Monthly End Inventory report already exists for this Station and period.']]);
            }
            $stock = StationItem::query()->with('item')->where('station_id', $station->id)
                ->orderBy('item_id')->lockForUpdate()->get();
            if ($stock->isEmpty()) {
                throw ValidationException::withMessages(['stationId' => ['No inventory items are available for this Station.']]);
            }

            $report = MonthlyEndReport::query()->create([
                'station_id' => $station->id,
                'created_by_id' => $request->user()->id,
                'report_month' => $data['reportMonth'],
                'report_year' => $data['reportYear'],
                'status' => MonthlyEndReport::STATUS_DRAFT,
            ]);
            foreach ($stock as $balance) {
                $report->items()->create([
                    'item_id' => $balance->item_id,
                    'item_code_snapshot' => $balance->item->item_code,
                    'item_name_snapshot' => $balance->item->name,
                    'unit_snapshot' => $balance->item->units_backup,
                    'system_count' => $balance->quantity,
                    'physical_count' => null,
                ]);
            }

            return $report->load(['station', 'createdBy', 'finalizedBy', 'items']);
        });

        return response()->json(['message' => 'Monthly inventory count created.', 'report' => (new MonthlyEndReportResource($report))->resolve($request)], 201);
    }

    public function show(Request $request, MonthlyEndReport $monthlyEndReport): JsonResponse
    {
        return response()->json(['report' => (new MonthlyEndReportResource($monthlyEndReport->load($this->detailRelations())))->resolve($request)]);
    }

    public function updateCounts(UpdateMonthlyEndCountsRequest $request, MonthlyEndReport $monthlyEndReport): JsonResponse
    {
        $report = DB::transaction(function () use ($request, $monthlyEndReport) {
            $report = MonthlyEndReport::query()->whereKey($monthlyEndReport->id)->lockForUpdate()->firstOrFail();
            $this->ensureDraft($report);
            $counts = collect($request->validated('counts'));
            $items = $report->items()->whereIn('id', $counts->pluck('id'))->lockForUpdate()->get()->keyBy('id');
            if ($items->count() !== $counts->count()) {
                throw ValidationException::withMessages(['counts' => ['Every Physical Count must belong to this report.']]);
            }
            foreach ($counts as $count) {
                $items->get($count['id'])->update(['physical_count' => $count['physicalCount']]);
            }

            return $report->load($this->detailRelations());
        });

        return response()->json(['message' => 'Draft inventory counts saved.', 'report' => (new MonthlyEndReportResource($report))->resolve($request)]);
    }

    public function finalize(Request $request, MonthlyEndReport $monthlyEndReport): JsonResponse
    {
        $report = DB::transaction(function () use ($request, $monthlyEndReport) {
            $report = MonthlyEndReport::query()->whereKey($monthlyEndReport->id)->lockForUpdate()->firstOrFail();
            $this->ensureDraft($report);
            $uncounted = $report->items()->whereNull('physical_count')->count();
            if ($uncounted > 0) {
                throw ValidationException::withMessages(['report' => ["Cannot finalize report. {$uncounted} items still require a physical count."]]);
            }
            $report->update([
                'status' => MonthlyEndReport::STATUS_FINALIZED,
                'finalized_by_id' => $request->user()->id,
                'finalized_at' => now(),
            ]);

            return $report->load($this->detailRelations());
        });

        return response()->json(['message' => 'Monthly inventory report finalized.', 'report' => (new MonthlyEndReportResource($report))->resolve($request)]);
    }

    public function reconcile(ReconcileMonthlyEndItemsRequest $request, MonthlyEndReport $monthlyEndReport): JsonResponse
    {
        $report = DB::transaction(function () use ($request, $monthlyEndReport) {
            $report = MonthlyEndReport::query()->whereKey($monthlyEndReport->id)->lockForUpdate()->firstOrFail();
            if ($report->status !== MonthlyEndReport::STATUS_FINALIZED) {
                throw ValidationException::withMessages(['report' => ['Only finalized Monthly End Inventory reports can be reconciled.']]);
            }

            $ids = collect($request->validated('itemIds'))->sort()->values();
            $items = $report->items()->whereIn('id', $ids)->orderBy('id')->lockForUpdate()->get();
            if ($items->count() !== $ids->count()) {
                throw ValidationException::withMessages(['itemIds' => ['Every selected item must belong to this report.']]);
            }

            $stationItems = StationItem::query()->where('station_id', $report->station_id)
                ->whereIn('item_id', $items->pluck('item_id'))->orderBy('item_id')->lockForUpdate()->get()->keyBy('item_id');
            $report->loadMissing('station');
            $changes = [];
            foreach ($items as $item) {
                if ($item->physical_count === null || $item->reconciled_at !== null) {
                    throw ValidationException::withMessages(['itemIds' => ["{$item->item_name_snapshot} is not pending reconciliation."]]);
                }
                $variance = self::toCents($item->physical_count) - self::toCents($item->system_count);
                if ($variance === 0) {
                    throw ValidationException::withMessages(['itemIds' => ["{$item->item_name_snapshot} matches the System Count and requires no adjustment."]]);
                }
                $stock = $stationItems->get($item->item_id);
                if (! $stock) {
                    throw ValidationException::withMessages(['itemIds' => ["Cannot reconcile {$item->item_name_snapshot} because its current Station inventory record no longer exists."]]);
                }
                $current = self::toCents($stock->quantity);
                if ($current + $variance < 0) {
                    throw ValidationException::withMessages(['itemIds' => ["Cannot reconcile {$item->item_name_snapshot} because the current live stock is ".self::fromCents($current).' and the required adjustment is '.self::fromCents($variance).'.']]);
                }
                $changes[] = [$item, $stock, $variance, $current + $variance];
            }

            foreach ($changes as [$item, $stock, $variance, $result]) {
                $movement = InventoryMovement::query()->create([
                    'station_item_id' => $stock->id,
                    'item_id' => $stock->item_id,
                    'quantity_change' => self::fromCents($variance),
                    'type' => 'ADJUSTMENT',
                    'reference_type' => 'monthly_end_report_item',
                    'reference_id' => $item->id,
                    'actor_id' => $request->user()->id,
                    'notes' => "Monthly End Inventory reconciliation — {$report->report_month}/{$report->report_year} — {$report->station->name}",
                ]);
                $stock->update(['quantity' => self::fromCents($result)]);
                $item->update(['reconciled_at' => now(), 'reconciled_by_id' => $request->user()->id, 'reconciliation_movement_id' => $movement->id]);
            }

            return $report->load($this->detailRelations());
        });

        return response()->json(['message' => 'Selected inventory discrepancies reconciled.', 'report' => (new MonthlyEndReportResource($report))->resolve($request)]);
    }

    public function export(MonthlyEndReport $monthlyEndReport, ReportExportService $exporter): BinaryFileResponse
    {
        if ($monthlyEndReport->status !== MonthlyEndReport::STATUS_FINALIZED) {
            throw ValidationException::withMessages(['report' => ['Only finalized Monthly End Inventory reports can be exported.']]);
        }
        $report = $monthlyEndReport->load(['station', 'createdBy', 'finalizedBy', 'items.reconciledBy']);
        $slug = (string) str($report->station->name)->slug();
        $slug = $slug !== '' ? $slug : 'station-'.$report->station_id;
        $filename = sprintf('monthly-end-inventory-%s-%d-%02d.xlsx', $slug, $report->report_year, $report->report_month);

        return response()->download($exporter->monthlyEnd($report), $filename, ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])->deleteFileAfterSend();
    }

    private function detailRelations(): array
    {
        return ['station', 'createdBy', 'finalizedBy', 'items.reconciledBy', 'items.reconciliationMovement', 'items.item.stationItems'];
    }

    private static function toCents(string $value): int
    {
        [$whole, $fraction] = array_pad(explode('.', $value, 2), 2, '');

        return (int) $whole * 100 + (int) str_pad($fraction, 2, '0');
    }

    private static function fromCents(int $value): string
    {
        $sign = $value < 0 ? '-' : '';
        $absolute = abs($value);

        return $sign.intdiv($absolute, 100).'.'.str_pad((string) ($absolute % 100), 2, '0', STR_PAD_LEFT);
    }

    private function ensureDraft(MonthlyEndReport $report): void
    {
        if ($report->status !== MonthlyEndReport::STATUS_DRAFT) {
            throw ValidationException::withMessages(['report' => ['Finalized Monthly End Inventory reports are read-only.']]);
        }
    }
}
