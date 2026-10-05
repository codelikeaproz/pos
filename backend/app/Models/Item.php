<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use LogicException;

class Item extends Model
{
    protected $attributes = ['is_active' => true];

    /** @var list<string> */
    protected $fillable = [
        'item_code',
        'name',
        'units_backup',
        'unit',
        'reorder_point',
        'price',
        'is_active',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'reorder_point' => 'decimal:3',
            'price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function stationItems(): HasMany
    {
        return $this->hasMany(StationItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function itemDeliveryItems(): HasMany
    {
        return $this->hasMany(ItemDeliveryItem::class);
    }

    public function spoilageItems(): HasMany
    {
        return $this->hasMany(SpoilageItem::class);
    }

    public function prices(): HasMany
    {
        return $this->hasMany(Price::class);
    }

    public function activePrice(): HasOne
    {
        return $this->hasOne(Price::class)->where('is_active', true);
    }

    public function activePriceAmount(): string
    {
        $active = $this->prices()->where('is_active', true)->limit(2)->get();
        if ($active->count() !== 1) {
            throw new LogicException("Item {$this->id} must have exactly one active price.");
        }

        return $active->first()->amount;
    }
}
