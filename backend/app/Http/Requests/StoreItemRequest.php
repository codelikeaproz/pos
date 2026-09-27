<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $description = $this->input('description');
        $this->merge([
            'description' => is_string($description) && trim($description) === '' ? null : $description,
        ]);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'item_code' => ['required', 'string', 'max:100', 'unique:items,item_code'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'quantity' => ['required', 'numeric', 'min:0', 'regex:/^\d{1,9}(\.\d{1,3})?$/'],
            'unit' => ['required', 'string', 'max:50'],
            'price' => ['required', 'numeric', 'min:0', 'regex:/^\d{1,8}(\.\d{1,2})?$/'],
        ];
    }
}
