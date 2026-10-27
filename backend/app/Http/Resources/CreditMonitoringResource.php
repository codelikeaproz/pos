<?php

namespace App\Http\Resources;

use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CreditMonitoringResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $orderDay = CarbonImmutable::instance($this->ordered_at)->setTimezone('Asia/Manila')->startOfDay();
        $today = CarbonImmutable::now('Asia/Manila')->startOfDay();
        $totalPaid = min((float) ($this->credit_payments_sum_amount ?? $this->creditPayments->sum('amount')), (float) $this->total_amount);
        $outstanding = max((float) $this->total_amount - $totalPaid, 0);
        $status = $totalPaid <= 0 ? 'UNPAID' : ($outstanding > 0 ? 'PARTIALLY_PAID' : 'PAID');

        return [
            'id' => $this->id,
            'orderNumber' => $this->order_number,
            'orNumber' => $this->or_number,
            'orderedAt' => $this->ordered_at->toIso8601String(),
            'customer' => $this->customer ? ['id' => $this->customer->id, 'name' => $this->customer->display_name, 'employeeNumber' => $this->customer->employee_number] : null,
            'paymentMethod' => $this->payment_method,
            'station' => ['id' => $this->station->id, 'name' => $this->station->name],
            'cashier' => ['id' => $this->cashier->id, 'name' => $this->cashier->name],
            'totalAmount' => $this->total_amount,
            'totalPaid' => number_format($totalPaid, 2, '.', ''),
            'outstandingBalance' => number_format($outstanding, 2, '.', ''),
            'status' => $status,
            'ageDays' => max(0, (int) $orderDay->diffInDays($today)),
            'payments' => $this->whenLoaded('creditPayments', fn () => $this->creditPayments->sortByDesc('paid_at')->values()->map(fn ($payment) => [
                'id' => $payment->id,
                'paymentNumber' => $payment->payment_number,
                'amount' => $payment->amount,
                'paidAt' => $payment->paid_at->toISOString(),
                'description' => $payment->description,
                'recordedBy' => ['id' => $payment->recordedBy->id, 'name' => $payment->recordedBy->name],
            ])),
        ];
    }
}
