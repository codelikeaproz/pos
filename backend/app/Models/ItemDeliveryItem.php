<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemDeliveryItem extends Model
{
    protected $fillable = ['item_id', 'item_code', 'item_name', 'unit', 'quantity'];

    protected function casts(): array
    {
        return ['quantity' => 'decimal:3'];
    }

    public function delivery(): BelongsTo
    {
        return $this->belongsTo(ItemDelivery::class, 'item_delivery_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}
