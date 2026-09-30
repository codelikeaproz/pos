<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PosStationInventoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'itemId' => $this->item->id,
            'itemCode' => $this->item->item_code,
            'name' => $this->item->name,
            'unit' => $this->item->units_backup,
            'quantity' => $this->quantity,
            'isActive' => $this->item->is_active,
        ];
    }
}
