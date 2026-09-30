<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SpoilageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'spoilageNumber' => $this->spoilage_number,
            'station' => ['id' => $this->station->id, 'name' => $this->station->name],
            'recordedBy' => ['id' => $this->recordedBy->id, 'name' => $this->recordedBy->name],
            'reason' => $this->reason,
            'spoiledAt' => $this->spoiled_at->toIso8601String(),
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
