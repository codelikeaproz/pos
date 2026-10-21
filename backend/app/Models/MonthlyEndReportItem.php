<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MonthlyEndReportItem extends Model
{
    protected $fillable = ['monthly_end_report_id', 'item_id', 'item_code_snapshot', 'item_name_snapshot', 'unit_snapshot', 'system_count', 'physical_count', 'reconciled_at', 'reconciled_by_id', 'reconciliation_movement_id'];

    protected function casts(): array
    {
        return ['system_count' => 'decimal:2', 'physical_count' => 'decimal:2', 'reconciled_at' => 'datetime'];
    }

    public function report(): BelongsTo
    {
        return $this->belongsTo(MonthlyEndReport::class, 'monthly_end_report_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function reconciledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reconciled_by_id');
    }

    public function reconciliationMovement(): BelongsTo
    {
        return $this->belongsTo(InventoryMovement::class, 'reconciliation_movement_id');
    }
}
