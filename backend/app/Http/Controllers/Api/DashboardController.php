<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderHistoryResource;
use App\Models\Order;
use App\Models\Station;
use App\Models\StationItem;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'station_id' => ['nullable', 'integer', 'exists:stations,id'],
            'search' => ['nullable', 'string', 'max:100'],
            'payment_method' => ['nullable', 'in:cash,credit'],
            'per_page' => ['nullable', 'integer', 'in:10,20,50,100'],
        ]);
        $stationId = $filters['station_id'] ?? null;
        $today = CarbonImmutable::now('Asia/Manila');
        $start = $today->startOfDay()->utc()->toDateTimeString();
        $end = $today->addDay()->startOfDay()->utc()->toDateTimeString();
        $stations = Station::query()->orderBy('name')->get(['id', 'name']);
        $stationIds = $stations->pluck('id');

        $todayOrders = Order::query()->whereIn('station_id', $stationIds)
            ->when($stationId, fn ($query) => $query->where('station_id', $stationId))
            ->where('ordered_at', '>=', $start)->where('ordered_at', '<', $end);
        $totals = (clone $todayOrders)->selectRaw("COUNT(*) AS transactions, COALESCE(SUM(total_amount), 0) AS sales, COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN total_amount ELSE 0 END), 0) AS cash, COALESCE(SUM(CASE WHEN payment_method = 'credit' THEN total_amount ELSE 0 END), 0) AS credit")->first();
        $unremittedCash = Order::query()->whereIn('station_id', $stationIds)
            ->when($stationId, fn ($query) => $query->where('station_id', $stationId))
            ->where('payment_method', 'cash')->whereNull('remitted_at')->sum('total_amount');
        $stock = StationItem::query()->join('items', 'items.id', '=', 'station_items.item_id')
            ->whereIn('station_items.station_id', $stationIds)
            ->when($stationId, fn ($query) => $query->where('station_items.station_id', $stationId))
            ->selectRaw('SUM(CASE WHEN station_items.quantity > 0 AND station_items.quantity <= items.reorder_point THEN 1 ELSE 0 END) AS low_stock, SUM(CASE WHEN station_items.quantity <= 0 THEN 1 ELSE 0 END) AS out_of_stock')->first();

        $search = trim($filters['search'] ?? '');
        $orders = (clone $todayOrders)->with(['station', 'cashier', 'customer'])
            ->when($search !== '', fn ($query) => $query->where(fn ($match) => $match
                ->where('order_number', 'like', "%{$search}%")
                ->orWhereHas('customer', fn ($customer) => $customer->where('name', 'like', "%{$search}%"))
                ->orWhereHas('cashier', fn ($cashier) => $cashier->where('name', 'like', "%{$search}%"))))
            ->when(isset($filters['payment_method']), fn ($query) => $query->where('payment_method', $filters['payment_method']))
            ->orderByDesc('ordered_at')->orderByDesc('id')
            ->paginate((int) ($filters['per_page'] ?? 10))->withQueryString();

        return response()->json([
            'date' => $today->toDateString(),
            'stations' => $stations,
            'summary' => [
                'sales' => number_format((float) $totals->sales, 2, '.', ''),
                'transactions' => (int) $totals->transactions,
                'cash' => number_format((float) $totals->cash, 2, '.', ''),
                'credit' => number_format((float) $totals->credit, 2, '.', ''),
                'unremittedCash' => number_format((float) $unremittedCash, 2, '.', ''),
                'lowStock' => (int) $stock->low_stock,
                'outOfStock' => (int) $stock->out_of_stock,
            ],
            'orders' => OrderHistoryResource::collection($orders)->response()->getData(true),
        ]);
    }
}
