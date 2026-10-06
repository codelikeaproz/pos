<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PosItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->item->id,
            'item_code' => $this->item->item_code,
            'name' => $this->item->name,
            'unit' => $this->item->units_backup,
            'price' => $this->item->activePrice->amount,
            'available_quantity' => $this->quantity,
            'is_low_stock' => (float) $this->quantity <= (float) $this->item->reorder_point,
        ];
    }
}
