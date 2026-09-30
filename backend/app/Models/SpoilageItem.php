<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SpoilageItem extends Model
{
    protected $fillable = ['item_id', 'quantity', 'item_code', 'item_name', 'unit'];

    protected function casts(): array
    {
        return ['quantity' => 'decimal:3'];
    }

    public function spoilage(): BelongsTo
    {
        return $this->belongsTo(Spoilage::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}
