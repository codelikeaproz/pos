<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'station_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, mixed>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
        ];
    }

    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class);
    }

    public function ordersAsCashier(): HasMany
    {
        return $this->hasMany(Order::class, 'cashier_id');
    }

    public function deliveriesMade(): HasMany
    {
        return $this->hasMany(ItemDelivery::class, 'delivered_by_id');
    }

    public function deliveriesReceived(): HasMany
    {
        return $this->hasMany(ItemDelivery::class, 'received_by_id');
    }

    public function spoilagesRecorded(): HasMany
    {
        return $this->hasMany(Spoilage::class, 'recorded_by_id');
    }

    public function privileges(): BelongsToMany
    {
        return $this->belongsToMany(Privilege::class, 'user_privilege')->withTimestamps();
    }
}
