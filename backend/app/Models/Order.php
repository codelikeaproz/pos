<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    /** @var list<string> */
    protected $fillable = ['order_number', 'ordered_at', 'station_id', 'cashier_id', 'customer_id', 'payment_method', 'customer_count', 'senior_count', 'subtotal_amount', 'discount_amount', 'total_amount', 'cash_received', 'change_amount', 'remitted_at', 'remitted_by_id'];

    protected static function booted(): void
    {
        static::saving(function (Order $order) {
            if ($order->payment_method === 'credit' && ! $order->customer_id) {
                throw new \DomainException('A credit order requires a Customer.');
            }
            if ($order->subtotal_amount === null) {
                $order->subtotal_amount = $order->total_amount;
            }
            if ($order->discount_amount === null) {
                $order->discount_amount = '0.00';
            }
        });
    }

    protected function casts(): array
    {
        return ['ordered_at' => 'datetime', 'remitted_at' => 'datetime', 'subtotal_amount' => 'decimal:2', 'discount_amount' => 'decimal:2', 'total_amount' => 'decimal:2', 'cash_received' => 'decimal:2', 'change_amount' => 'decimal:2'];
    }

    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class);
    }

    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function remittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'remitted_by_id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
