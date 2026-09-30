<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Spoilage extends Model
{
    protected $fillable = ['spoilage_number', 'station_id', 'recorded_by_id', 'reason', 'spoiled_at'];

    protected function casts(): array
    {
        return ['spoiled_at' => 'datetime'];
    }

    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class);
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(SpoilageItem::class);
    }
}
