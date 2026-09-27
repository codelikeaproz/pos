<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Item extends Model
{
    /** @var list<string> */
    protected $fillable = [
        'item_code',
        'name',
        'quantity',
        'units_backup',
        'unit',
        'reorder_point',
        'price',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:3',
            'reorder_point' => 'decimal:3',
            'price' => 'decimal:2',
        ];
    }

    public function stationItems(): HasMany
    {
        return $this->hasMany(StationItem::class);
    }
}
