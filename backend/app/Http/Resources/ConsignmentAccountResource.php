<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConsignmentAccountResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, 'name' => $this->name, 'email' => $this->email,
            'role' => $this->role instanceof \BackedEnum ? $this->role->value : (string) $this->role,
            'station' => ['id' => $this->station->id, 'name' => $this->station->name],
            'consignee' => ['id' => $this->consignee->id, 'name' => $this->consignee->name],
        ];
    }
}
