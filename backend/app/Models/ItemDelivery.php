<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ItemDelivery extends Model
{
    protected $fillable = ['delivery_number', 'station_id', 'delivered_by_id', 'received_by_id', 'delivered_at'];

    protected function casts(): array
    {
        return ['delivered_at' => 'datetime'];
    }

    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class);
    }

    public function deliveredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'delivered_by_id');
    }

    public function receivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ItemDeliveryItem::class);
    }
}
