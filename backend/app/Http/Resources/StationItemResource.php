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
            'current_quantity' => $this->quantity,
            'recorded_delivered_quantity' => $this->recorded_delivered_quantity ?? '0.000',
            'recorded_sold_quantity' => $this->recorded_sold_quantity ?? '0.000',
            'recorded_spoilage_quantity' => $this->recorded_spoilage_quantity ?? '0.000',
            'reconciled_quantity' => $this->reconciled_quantity ?? $this->quantity,
            'is_low_stock' => (float) $this->quantity <= (float) $this->item->reorder_point,
            'stock_status' => (float) $this->quantity > 0 ? 'in_stock' : 'out_of_stock',
            'has_movement_history' => (bool) ($this->movements_exists ?? false),
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
