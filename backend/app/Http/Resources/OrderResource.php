<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'orderNumber' => $this->order_number,
            'orderedAt' => $this->ordered_at->toISOString(),
            'station' => ['id' => $this->station->id, 'name' => $this->station->name],
            'cashier' => ['id' => $this->cashier->id, 'name' => $this->cashier->name],
            'customer' => $this->customer ? ['id' => $this->customer->id, 'name' => $this->customer->name, 'address' => $this->customer->address] : null,
            'paymentMethod' => $this->payment_method,
            'totalAmount' => $this->total_amount,
            'cashReceived' => $this->cash_received,
            'changeAmount' => $this->change_amount,
            'items' => $this->orderItems->map(fn ($item) => [
                'itemId' => $item->item_id,
                'itemCode' => $item->item_code,
                'itemName' => $item->item_name,
                'unit' => $item->unit,
                'quantity' => $item->quantity,
                'unitPrice' => $item->unit_price,
                'subtotal' => $item->subtotal,
            ]),
        ];
    }
}
