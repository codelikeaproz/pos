<?php

namespace App\Http\Resources;

use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Item */
class ItemResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'item_code' => $this->item_code,
            'name' => $this->name,
            'units_backup' => $this->units_backup,
            'unit' => $this->unit,
            'reorder_point' => $this->reorder_point,
            'price' => $this->activePrice?->amount,
            'is_active' => $this->is_active,
        ];
    }
}
