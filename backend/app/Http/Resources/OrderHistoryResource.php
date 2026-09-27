<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'orderNumber' => $this->order_number,
            'orderedAt' => $this->ordered_at->toISOString(),
            'station' => ['id' => $this->station->id, 'name' => $this->station->name],
            'cashier' => ['id' => $this->cashier->id, 'name' => $this->cashier->name],
            'paymentMethod' => $this->payment_method,
            'totalAmount' => $this->total_amount,
        ];
    }
}
