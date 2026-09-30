<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ItemDeliveryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'deliveryNumber' => $this->delivery_number,
            'station' => ['id' => $this->station->id, 'name' => $this->station->name],
            'deliveredBy' => ['id' => $this->deliveredBy->id, 'name' => $this->deliveredBy->name],
            'receivedBy' => ['id' => $this->receivedBy->id, 'name' => $this->receivedBy->name],
            'deliveredAt' => $this->delivered_at->toIso8601String(),
            'itemCount' => $this->whenCounted('items'),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($line) => [
                'id' => $line->id,
                'itemId' => $line->item_id,
                'itemCode' => $line->item_code,
                'itemName' => $line->item_name,
                'unit' => $line->unit,
                'quantity' => $line->quantity,
            ])),
        ];
    }
}
