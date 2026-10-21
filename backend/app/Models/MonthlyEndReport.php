<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MonthlyEndReport extends Model
{
    public const STATUS_DRAFT = 'DRAFT';

    public const STATUS_FINALIZED = 'FINALIZED';

    protected $fillable = ['station_id', 'created_by_id', 'report_month', 'report_year', 'status', 'finalized_by_id', 'finalized_at'];

    protected function casts(): array
    {
        return ['report_month' => 'integer', 'report_year' => 'integer', 'finalized_at' => 'datetime'];
    }

    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function finalizedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'finalized_by_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(MonthlyEndReportItem::class);
    }
}
