<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCreditPaymentRequest;
use App\Http\Resources\CreditMonitoringResource;
use App\Models\CreditPayment;
use App\Models\Order;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreditPaymentController extends Controller
{
    public function store(StoreCreditPaymentRequest $request, Order $order): JsonResponse
    {
        $order = DB::transaction(function () use ($request, $order) {
            $locked = Order::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();
            abort_unless($locked->payment_method === 'credit', 404);
            $outstanding = $this->cents($locked->total_amount) - $this->cents((string) $locked->creditPayments()->sum('amount'));
            $amount = $this->cents($request->validated('amount'));
            if ($amount > $outstanding) {
                abort(409, 'Payment exceeds the outstanding balance of ₱'.number_format($outstanding / 100, 2).'.');
            }

            $payment = CreditPayment::query()->create([
                'payment_number' => 'PENDING-'.Str::uuid(),
                'order_id' => $locked->id,
                'amount' => $request->validated('amount'),
                'paid_at' => CarbonImmutable::parse($request->validated('paid_at'), 'Asia/Manila')->utc(),
                'description' => $request->validated('description'),
                'recorded_by_id' => $request->user()->id,
            ]);
            $payment->update(['payment_number' => 'PAY'.$payment->paid_at->setTimezone('Asia/Manila')->format('Ymd').str_pad((string) $payment->id, 6, '0', STR_PAD_LEFT)]);

            return $locked;
        });

        $order->load(['customer', 'station', 'cashier', 'creditPayments.recordedBy'])->loadSum('creditPayments', 'amount');

        return response()->json(['message' => 'Credit payment recorded successfully.', 'order' => (new CreditMonitoringResource($order))->resolve($request)], 201);
    }

    private function cents(string $amount): int
    {
        [$whole, $fraction] = array_pad(explode('.', $amount, 2), 2, '');

        return (int) $whole * 100 + (int) str_pad($fraction, 2, '0');
    }
}
