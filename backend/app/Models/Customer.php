<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Customer extends Model
{
    protected $fillable = ['name', 'employee_number', 'first_name', 'middle_name', 'last_name', 'sex', 'birth_date', 'address', 'credit_limit', 'is_active'];

    protected function casts(): array
    {
        return ['birth_date' => 'date', 'credit_limit' => 'decimal:2', 'is_active' => 'boolean'];
    }

    public function getDisplayNameAttribute(): string
    {
        return collect([$this->first_name, $this->middle_name, $this->last_name])->filter()->join(' ');
    }

    public function getNameAttribute(): string
    {
        return $this->display_name;
    }

    public function setNameAttribute(string $value): void
    {
        // shortcut: legacy fixtures map a full name into first_name only; production writes use atomic fields.
        $this->attributes['first_name'] = trim($value);
        $this->attributes['last_name'] ??= '';
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function creditPayments(): HasManyThrough
    {
        return $this->hasManyThrough(CreditPayment::class, Order::class);
    }
}
