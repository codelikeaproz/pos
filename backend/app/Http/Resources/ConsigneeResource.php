<?php

namespace App\Http\Resources;

use App\Models\Consignee;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Consignee */
class ConsigneeResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'contact_number' => $this->contact_number,
            'email' => $this->email,
            'address' => $this->address,
        ];
    }
}
