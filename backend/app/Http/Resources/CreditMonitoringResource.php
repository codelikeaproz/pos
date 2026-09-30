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

        return [
            'id' => $this->id,
            'orderNumber' => $this->order_number,
            'orderedAt' => $this->ordered_at->toIso8601String(),
            'customer' => $this->customer ? ['id' => $this->customer->id, 'name' => $this->customer->name] : null,
            'paymentMethod' => $this->payment_method,
            'station' => ['id' => $this->station->id, 'name' => $this->station->name],
            'cashier' => ['id' => $this->cashier->id, 'name' => $this->cashier->name],
            'totalAmount' => $this->total_amount,
            'ageDays' => max(0, (int) $orderDay->diffInDays($today)),
        ];
    }
}
