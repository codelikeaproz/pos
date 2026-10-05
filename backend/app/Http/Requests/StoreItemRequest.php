<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'item_code' => ['required', 'string', 'max:100', 'unique:items,item_code'],
            'name' => ['required', 'string', 'max:255'],
            'quantity' => ['prohibited'],
            'units_backup' => ['required', 'string', 'max:50'],
            'unit' => ['required', 'string', 'max:20'],
            'reorder_point' => ['required', 'numeric', 'min:0', 'regex:/^\d{1,9}(\.\d{1,3})?$/'],
            'price' => ['required', 'numeric', 'min:0', 'regex:/^\d{1,8}(\.\d{1,2})?$/'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
