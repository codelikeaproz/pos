<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderDetailResource;
use App\Http\Resources\OrderHistoryResource;
use App\Models\Order;
use App\Models\Station;
use App\Services\ReportExportService;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class SalesReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $this->filters($request);

        $period = $filters['period'] ?? 'this_month';
        [$from, $to] = $this->dateRange($period, $filters);
        $query = $this->filteredOrders($filters, $from, $to);
        $summary = $this->summary($query);
        $orders = (clone $query)->with(['station', 'cashier', 'customer'])
            ->orderByDesc('ordered_at')->orderByDesc('id')
            ->paginate((int) ($filters['per_page'] ?? 10))->withQueryString();

        return response()->json([
            'filters' => ['period' => $period, 'from' => $from->setTimezone('Asia/Manila')->toDateString(), 'to' => $to->subSecond()->setTimezone('Asia/Manila')->toDateString()],
            'stations' => Station::query()->orderBy('name')->get(['id', 'name']),
            'summary' => [
                'totalSales' => number_format((float) $summary->total_sales, 2, '.', ''),
                'transactions' => (int) $summary->transactions,
                'cashSales' => number_format((float) $summary->cash_sales, 2, '.', ''),
                'creditSales' => number_format((float) $summary->credit_sales, 2, '.', ''),
                'seniorDiscounts' => number_format((float) $summary->senior_discounts, 2, '.', ''),
            ],
            'orders' => OrderHistoryResource::collection($orders)->response()->getData(true),
        ]);
    }

    public function export(Request $request, ReportExportService $exporter): BinaryFileResponse
    {
        $filters = $this->filters($request);
        $period = $filters['period'] ?? 'this_month';
        [$from, $to] = $this->dateRange($period, $filters);
        $query = $this->filteredOrders($filters, $from, $to);
        $summary = $this->summary($query);
        $orders = (clone $query)->with(['station', 'cashier', 'customer'])
            ->orderByDesc('ordered_at')->orderByDesc('id')->lazy(500);
        $fromDate = $from->setTimezone('Asia/Manila')->toDateString();
        $toDate = $to->subSecond()->setTimezone('Asia/Manila')->toDateString();
        $path = $exporter->sales($orders, $summary, [
            'from' => CarbonImmutable::parse($fromDate)->format('F j, Y'),
            'to' => CarbonImmutable::parse($toDate)->format('F j, Y'),
            'station' => isset($filters['station_id']) ? Station::query()->findOrFail($filters['station_id'])->name : 'All Stations',
            'payment' => ($filters['payment_method'] ?? null) === 'cash' ? 'Cash' : (($filters['payment_method'] ?? null) === 'credit' ? 'Credit / Utang' : 'All'),
            'search' => trim($filters['search'] ?? ''),
        ], (int) $summary->transactions);

        return response()->download($path, "sales-report-{$fromDate}-to-{$toDate}.xlsx", ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])->deleteFileAfterSend();
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        return response()->json(['order' => (new OrderDetailResource($order->load(['station', 'cashier', 'customer', 'orderItems'])))->resolve($request)]);
    }

    /** @param array<string, mixed> $filters */
    private function filteredOrders(array $filters, CarbonImmutable $from, CarbonImmutable $to): Builder
    {
        $search = trim($filters['search'] ?? '');

        return Order::query()
            ->where('ordered_at', '>=', $from->toDateTimeString())
            ->where('ordered_at', '<', $to->toDateTimeString())
            ->when(isset($filters['station_id']), fn ($query) => $query->where('station_id', $filters['station_id']))
            ->when(isset($filters['payment_method']), fn ($query) => $query->where('payment_method', $filters['payment_method']))
            ->when($search !== '', fn ($query) => $query->where(fn ($match) => $match
                ->where('order_number', 'like', "%{$search}%")
                ->orWhere('or_number', 'like', "%{$search}%")
                ->orWhereHas('customer', fn ($customer) => $customer->where('employee_number', 'like', "%{$search}%")->orWhere('first_name', 'like', "%{$search}%")->orWhere('middle_name', 'like', "%{$search}%")->orWhere('last_name', 'like', "%{$search}%"))
                ->orWhereHas('cashier', fn ($cashier) => $cashier->where('name', 'like', "%{$search}%"))
                ->orWhereHas('station', fn ($station) => $station->where('name', 'like', "%{$search}%"))));
    }

    private function filters(Request $request): array
    {
        return $request->validate([
            'period' => ['nullable', 'in:today,yesterday,this_week,this_month,custom'],
            'from' => ['nullable', 'required_if:period,custom', 'date_format:Y-m-d'],
            'to' => ['nullable', 'required_if:period,custom', 'date_format:Y-m-d', 'after_or_equal:from'],
            'station_id' => ['nullable', 'integer', 'exists:stations,id'],
            'payment_method' => ['nullable', 'in:cash,credit'],
            'search' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'in:10,20,50,100'],
        ]);
    }

    private function summary(Builder $query): object
    {
        return (clone $query)->selectRaw("COUNT(*) AS transactions, COALESCE(SUM(total_amount), 0) AS total_sales, COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN total_amount ELSE 0 END), 0) AS cash_sales, COALESCE(SUM(CASE WHEN payment_method = 'credit' THEN total_amount ELSE 0 END), 0) AS credit_sales, COALESCE(SUM(discount_amount), 0) AS senior_discounts")->first();
    }

    /** @param array<string, mixed> $filters
     * @return array{CarbonImmutable, CarbonImmutable}
     */
    private function dateRange(string $period, array $filters): array
    {
        $today = CarbonImmutable::now('Asia/Manila')->startOfDay();
        [$from, $to] = match ($period) {
            'today' => [$today, $today->addDay()],
            'yesterday' => [$today->subDay(), $today],
            'this_week' => [$today->startOfWeek(), $today->addDay()],
            'custom' => [CarbonImmutable::parse($filters['from'], 'Asia/Manila')->startOfDay(), CarbonImmutable::parse($filters['to'], 'Asia/Manila')->addDay()->startOfDay()],
            default => [$today->startOfMonth(), $today->addDay()],
        };

        return [$from->utc(), $to->utc()];
    }
}
