<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    /** @var list<string> */
    protected $fillable = [
        'item_code',
        'name',
        'description',
        'quantity',
        'unit',
        'price',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:3',
            'price' => 'decimal:2',
        ];
    }
}
