<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSaleRemittanceRequest;
use App\Http\Resources\SaleRemittanceResource;
use App\Models\Order;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleRemittanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'from_date' => ['nullable', 'date_format:Y-m-d'],
            'to_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from_date'],
        ]);
        $search = trim($validated['search'] ?? '');
        $orders = Order::query()->where('payment_method', 'cash')
            ->with(['customer', 'station', 'cashier', 'remittedBy'])
            ->when($search !== '', fn ($query) => $query->where(fn ($matches) => $matches
                ->where('order_number', 'like', "%{$search}%")
                ->orWhereHas('customer', fn ($customer) => $customer->where('name', 'like', "%{$search}%"))
                ->orWhereHas('station', fn ($station) => $station->where('name', 'like', "%{$search}%"))
                ->orWhereHas('cashier', fn ($cashier) => $cashier->where('name', 'like', "%{$search}%"))))
            ->when(isset($validated['from_date']), fn ($query) => $query->where('ordered_at', '>=', CarbonImmutable::parse($validated['from_date'], 'Asia/Manila')->startOfDay()->utc()))
            ->when(isset($validated['to_date']), fn ($query) => $query->where('ordered_at', '<', CarbonImmutable::parse($validated['to_date'], 'Asia/Manila')->addDay()->startOfDay()->utc()))
            ->orderByDesc('ordered_at')->orderByDesc('id')->paginate(10)->withQueryString();

        return SaleRemittanceResource::collection($orders)->response();
    }

    public function store(StoreSaleRemittanceRequest $request): JsonResponse
    {
        $ids = collect($request->validated('order_ids'))->sort()->values();
        $result = DB::transaction(function () use ($ids, $request) {
            $orders = Order::query()->whereIn('id', $ids)->orderBy('id')->lockForUpdate()->get();
            if ($orders->count() !== $ids->count()) {
                abort(409, 'One or more selected Orders no longer exist. Nothing was remitted.');
            }
            if ($orders->contains(fn (Order $order) => $order->payment_method !== 'cash' || $order->remitted_at !== null)) {
                abort(409, 'One or more selected Orders are no longer eligible. Nothing was remitted.');
            }
            $totalCents = $orders->sum(function (Order $order) {
                [$whole, $fraction] = array_pad(explode('.', $order->total_amount, 2), 2, '');

                return (int) $whole * 100 + (int) str_pad($fraction, 2, '0');
            });
            $remittedAt = now();
            Order::query()->whereIn('id', $ids)->update(['remitted_at' => $remittedAt, 'remitted_by_id' => $request->user()->id]);

            return [$orders->count(), sprintf('%d.%02d', intdiv($totalCents, 100), $totalCents % 100), $remittedAt];
        });

        return response()->json(['message' => 'Sales remitted successfully.', 'remittedCount' => $result[0], 'remitTotal' => $result[1], 'remittedAt' => $result[2]->toISOString(), 'remittedBy' => ['id' => $request->user()->id, 'name' => $request->user()->name]]);
    }
}
