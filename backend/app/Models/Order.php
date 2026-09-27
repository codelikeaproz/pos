<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    /** @var list<string> */
    protected $fillable = ['order_number', 'ordered_at', 'station_id', 'cashier_id', 'payment_method', 'total_amount', 'cash_received', 'change_amount'];

    protected function casts(): array
    {
        return ['ordered_at' => 'datetime', 'total_amount' => 'decimal:2', 'cash_received' => 'decimal:2', 'change_amount' => 'decimal:2'];
    }

    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class);
    }

    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
