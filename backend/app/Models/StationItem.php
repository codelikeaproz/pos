<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class StationItem extends Model
{
    /** @var list<string> */
    protected $fillable = ['station_id', 'item_id', 'quantity'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:3',
            'recorded_delivered_quantity' => 'decimal:3',
            'recorded_sold_quantity' => 'decimal:3',
            'recorded_spoilage_quantity' => 'decimal:3',
            'reconciled_quantity' => 'decimal:3',
        ];
    }

    public function scopeWithMovementSummary(Builder $query): Builder
    {
        $summary = InventoryMovement::query()
            ->select('station_item_id')
            ->selectRaw("SUM(CASE WHEN type = 'DELIVERY' AND quantity_change > 0 THEN quantity_change ELSE 0 END) AS recorded_delivered_quantity")
            ->selectRaw("SUM(CASE WHEN type = 'SALE' THEN ABS(quantity_change) ELSE 0 END) AS recorded_sold_quantity")
            ->selectRaw("SUM(CASE WHEN type = 'SPOILAGE' THEN ABS(quantity_change) ELSE 0 END) AS recorded_spoilage_quantity")
            ->groupBy('station_item_id');

        return $query
            ->leftJoinSub($summary, 'movement_summary', 'movement_summary.station_item_id', '=', 'station_items.id')
            ->addSelect([
                DB::raw('COALESCE(movement_summary.recorded_delivered_quantity, 0) AS recorded_delivered_quantity'),
                DB::raw('COALESCE(movement_summary.recorded_sold_quantity, 0) AS recorded_sold_quantity'),
                DB::raw('COALESCE(movement_summary.recorded_spoilage_quantity, 0) AS recorded_spoilage_quantity'),
                DB::raw('(station_items.quantity + COALESCE(movement_summary.recorded_sold_quantity, 0) + COALESCE(movement_summary.recorded_spoilage_quantity, 0)) AS reconciled_quantity'),
            ]);
    }

    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function movements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class);
    }
}
