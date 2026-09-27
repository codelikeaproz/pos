<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Consignee extends Model
{
    /** @var list<string> */
    protected $fillable = ['name', 'contact_number', 'email', 'address'];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
