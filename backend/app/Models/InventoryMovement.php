<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryMovement extends Model
{
    protected $fillable = ['station_item_id', 'item_id', 'order_item_id', 'quantity_change', 'type', 'reference_type', 'reference_id', 'actor_id', 'notes'];

    protected function casts(): array
    {
        return ['quantity_change' => 'decimal:3'];
    }

    public function stationItem(): BelongsTo
    {
        return $this->belongsTo(StationItem::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
