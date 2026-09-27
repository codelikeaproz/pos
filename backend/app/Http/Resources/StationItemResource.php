<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StationItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quantity' => $this->quantity,
            'is_low_stock' => (float) $this->quantity <= (float) $this->item->reorder_point,
            'station' => ['id' => $this->station->id, 'name' => $this->station->name],
            'item' => [
                'id' => $this->item->id,
                'item_code' => $this->item->item_code,
                'name' => $this->item->name,
                'units_backup' => $this->item->units_backup,
                'unit' => $this->item->unit,
                'reorder_point' => $this->item->reorder_point,
            ],
        ];
    }
}
