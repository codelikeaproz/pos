<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CreditMonitoringResource;
use App\Models\Customer;
use App\Models\Order;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreditMonitoringController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'from_date' => ['nullable', 'date_format:Y-m-d'],
            'to_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from_date'],
            'customer_sort' => ['nullable', 'in:asc,desc'],
        ]);
        $search = trim($validated['search'] ?? '');
        $orders = Order::query()->where('payment_method', 'credit')
            ->when($search !== '', fn ($query) => $query->where(fn ($matches) => $matches
                ->where('order_number', 'like', "%{$search}%")
                ->orWhereHas('customer', fn ($customer) => $customer->where('name', 'like', "%{$search}%"))
                ->orWhereHas('station', fn ($station) => $station->where('name', 'like', "%{$search}%"))
                ->orWhereHas('cashier', fn ($cashier) => $cashier->where('name', 'like', "%{$search}%"))))
            ->when(isset($validated['from_date']), fn ($query) => $query->where('ordered_at', '>=',
                CarbonImmutable::parse($validated['from_date'], 'Asia/Manila')->startOfDay()->utc()->toDateTimeString()))
            ->when(isset($validated['to_date']), fn ($query) => $query->where('ordered_at', '<',
                CarbonImmutable::parse($validated['to_date'], 'Asia/Manila')->addDay()->startOfDay()->utc()->toDateTimeString()));

        // Stream all filtered DECIMAL amounts and add integer cents, independent of pagination.
        $totalCents = 0;
        foreach ((clone $orders)->select('total_amount')->cursor() as $order) {
            [$whole, $fraction] = array_pad(explode('.', $order->total_amount, 2), 2, '');
            $totalCents += (int) $whole * 100 + (int) str_pad($fraction, 2, '0');
        }
        $totalAmount = intdiv($totalCents, 100).'.'.str_pad((string) ($totalCents % 100), 2, '0', STR_PAD_LEFT);
        $page = $orders->with(['customer', 'station', 'cashier'])
            ->when(isset($validated['customer_sort']), fn ($query) => $query->orderBy(
                Customer::query()->select('name')->whereColumn('customers.id', 'orders.customer_id'),
                $validated['customer_sort']
            ))
            ->orderByDesc('ordered_at')->orderByDesc('id')->paginate(10)->withQueryString();

        return CreditMonitoringResource::collection($page)->additional(['totalAmount' => $totalAmount])->response();
    }
}
