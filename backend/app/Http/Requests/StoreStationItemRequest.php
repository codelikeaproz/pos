<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStationItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'station_id' => ['required', 'integer', 'exists:stations,id'],
            'item_id' => [
                'required', 'integer', 'exists:items,id',
                Rule::unique('station_items', 'item_id')->where('station_id', $this->integer('station_id')),
            ],
            'quantity' => ['required', 'numeric', 'min:0', 'regex:/^\d{1,9}(\.\d{1,3})?$/'],
        ];
    }

    public function messages(): array
    {
        return ['item_id.unique' => 'This item is already assigned to the selected station.'];
    }
}
