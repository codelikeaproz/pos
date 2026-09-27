<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Station extends Model
{
    /** @var list<string> */
    protected $fillable = [
        'name',
        'location',
        'description',
    ];
}
