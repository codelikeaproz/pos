<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Station extends Model
{
    /** @var list<string> */
    protected $fillable = [
        'name',
        'location',
        'description',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function stationItems(): HasMany
    {
        return $this->hasMany(StationItem::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function itemDeliveries(): HasMany
    {
        return $this->hasMany(ItemDelivery::class);
    }

    public function spoilages(): HasMany
    {
        return $this->hasMany(Spoilage::class);
    }
}
