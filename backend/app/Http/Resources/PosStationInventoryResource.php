<?php

namespace App\Http\Resources;

use App\Models\Item;
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
            'currentQuantity' => $this->quantity,
            'recordedDeliveredQuantity' => $this->recorded_delivered_quantity ?? '0.000',
            'recordedSoldQuantity' => $this->recorded_sold_quantity ?? '0.000',
            'recordedSpoilageQuantity' => $this->recorded_spoilage_quantity ?? '0.000',
            'isActive' => $this->item->is_active,
            'isLowStock' => (float) $this->quantity <= Item::LOW_STOCK_QUANTITY,
        ];
    }
}
