<?php

namespace App\Models;

use App\Enums\TaxStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaxSetting extends Model
{
    protected $fillable = ['tax_status', 'vat_rate', 'updated_by_id'];

    protected function casts(): array
    {
        return ['tax_status' => TaxStatus::class, 'vat_rate' => 'decimal:2'];
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by_id');
    }
}
