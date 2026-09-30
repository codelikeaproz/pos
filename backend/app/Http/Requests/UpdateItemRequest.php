<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'item_code' => [
                'required',
                'string',
                'max:100',
                Rule::unique('items', 'item_code')->ignore($this->route('item')),
            ],
            'name' => ['required', 'string', 'max:255'],
            'quantity' => ['required', 'numeric', 'min:0', 'regex:/^\d{1,9}(\.\d{1,3})?$/'],
            'units_backup' => ['required', 'string', 'max:50'],
            'unit' => ['required', 'string', 'max:20'],
            'reorder_point' => ['required', 'numeric', 'min:0', 'regex:/^\d{1,9}(\.\d{1,3})?$/'],
            'price' => ['prohibited'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
