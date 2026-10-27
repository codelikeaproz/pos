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
            'status' => ['nullable', 'in:unpaid,partially_paid,paid'],
        ]);
        $search = trim($validated['search'] ?? '');
        $orders = Order::query()->where('payment_method', 'credit')
            ->when($search !== '', fn ($query) => $query->where(fn ($matches) => $matches
                ->where('or_number', 'like', "%{$search}%")
                ->orWhere('order_number', 'like', "%{$search}%")
                ->orWhereHas('customer', fn ($customer) => $customer->where('employee_number', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")->orWhere('middle_name', 'like', "%{$search}%")->orWhere('last_name', 'like', "%{$search}%"))
                ->orWhereHas('station', fn ($station) => $station->where('name', 'like', "%{$search}%"))
                ->orWhereHas('cashier', fn ($cashier) => $cashier->where('name', 'like', "%{$search}%"))))
            ->when(isset($validated['from_date']), fn ($query) => $query->where('ordered_at', '>=',
                CarbonImmutable::parse($validated['from_date'], 'Asia/Manila')->startOfDay()->utc()->toDateTimeString()))
            ->when(isset($validated['to_date']), fn ($query) => $query->where('ordered_at', '<',
                CarbonImmutable::parse($validated['to_date'], 'Asia/Manila')->addDay()->startOfDay()->utc()->toDateTimeString()))
            ->withSum('creditPayments', 'amount')
            ->when(isset($validated['status']), function ($query) use ($validated) {
                $paid = '(SELECT COALESCE(SUM(amount), 0) FROM credit_payments WHERE credit_payments.order_id = orders.id)';
                $query->whereRaw(match ($validated['status']) {
                    'paid' => "{$paid} >= orders.total_amount",
                    'partially_paid' => "{$paid} > 0 AND {$paid} < orders.total_amount",
                    default => "{$paid} = 0",
                });
            });

        // Stream all filtered DECIMAL amounts and add integer cents, independent of pagination.
        $totalCents = 0;
        foreach ((clone $orders)->cursor() as $order) {
            $totalCents += $this->cents($order->total_amount) - min($this->cents($order->credit_payments_sum_amount ?? '0.00'), $this->cents($order->total_amount));
        }
        $totalAmount = intdiv($totalCents, 100).'.'.str_pad((string) ($totalCents % 100), 2, '0', STR_PAD_LEFT);
        $page = $orders->with(['customer', 'station', 'cashier'])
            ->when(isset($validated['customer_sort']), fn ($query) => $query->orderBy(
                Customer::query()->select('first_name')->whereColumn('customers.id', 'orders.customer_id'),
                $validated['customer_sort']
            ))
            ->orderByDesc('ordered_at')->orderByDesc('id')->paginate($this->pageSize($request))->withQueryString();

        return CreditMonitoringResource::collection($page)->additional(['totalOutstanding' => $totalAmount, 'totalAmount' => $totalAmount])->response();
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        abort_unless($order->payment_method === 'credit', 404);
        $order->load(['customer', 'station', 'cashier', 'creditPayments.recordedBy'])->loadSum('creditPayments', 'amount');

        return response()->json(['order' => (new CreditMonitoringResource($order))->resolve($request)]);
    }

    private function cents(string $amount): int
    {
        [$whole, $fraction] = array_pad(explode('.', $amount, 2), 2, '');

        return (int) $whole * 100 + (int) str_pad($fraction, 2, '0');
    }
}
