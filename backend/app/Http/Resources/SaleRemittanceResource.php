<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaleRemittanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'orderNumber' => $this->order_number,
            'orderedAt' => $this->ordered_at->toISOString(),
            'customer' => $this->customer ? ['id' => $this->customer->id, 'name' => $this->customer->name] : null,
            'paymentMethod' => $this->payment_method,
            'station' => ['id' => $this->station->id, 'name' => $this->station->name],
            'cashier' => ['id' => $this->cashier->id, 'name' => $this->cashier->name],
            'totalAmount' => $this->total_amount,
            'status' => $this->remitted_at ? 'remitted' : 'not_remitted',
            'remittedAt' => $this->remitted_at?->toISOString(),
            'remittedBy' => $this->remittedBy ? ['id' => $this->remittedBy->id, 'name' => $this->remittedBy->name] : null,
        ];
    }
}
