<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMonthlyEndReportRequest;
use App\Http\Requests\UpdateMonthlyEndCountsRequest;
use App\Http\Resources\MonthlyEndReportResource;
use App\Models\MonthlyEndReport;
use App\Models\Station;
use App\Models\StationItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
        return response()->json(['report' => (new MonthlyEndReportResource($monthlyEndReport->load(['station', 'createdBy', 'finalizedBy', 'items'])))->resolve($request)]);
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

            return $report->load(['station', 'createdBy', 'finalizedBy', 'items']);
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

            return $report->load(['station', 'createdBy', 'finalizedBy', 'items']);
        });

        return response()->json(['message' => 'Monthly inventory report finalized.', 'report' => (new MonthlyEndReportResource($report))->resolve($request)]);
    }

    private function ensureDraft(MonthlyEndReport $report): void
    {
        if ($report->status !== MonthlyEndReport::STATUS_DRAFT) {
            throw ValidationException::withMessages(['report' => ['Finalized Monthly End Inventory reports are read-only.']]);
        }
    }
}
