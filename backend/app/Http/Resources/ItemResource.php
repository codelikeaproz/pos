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
            'description' => $this->description,
            'quantity' => $this->quantity,
            'unit' => $this->unit,
            'price' => $this->price,
        ];
    }
}
