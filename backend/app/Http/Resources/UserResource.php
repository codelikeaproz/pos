<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role instanceof \BackedEnum
                ? $this->role->value
                : (string) $this->role,
            'station' => $this->station
                ? ['id' => $this->station->id, 'name' => $this->station->name]
                : null,
            'privileges' => $this->relationLoaded('privileges')
                ? PrivilegeResource::collection($this->privileges)->resolve()
                : [],
        ];
    }
}
