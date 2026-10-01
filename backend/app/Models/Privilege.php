<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Privilege extends Model
{
    use HasFactory;

    protected $fillable = ['description'];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_privilege')->withTimestamps();
    }
}
