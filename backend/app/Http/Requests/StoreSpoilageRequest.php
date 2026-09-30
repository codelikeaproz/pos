<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSpoilageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'stationId' => ['required', 'integer', 'exists:stations,id'],
            'reason' => ['nullable', 'string', 'max:500'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.itemId' => ['required', 'integer', 'distinct', 'exists:items,id'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0', 'regex:/^\d{1,9}(\.\d{1,3})?$/'],
        ];
    }

    public function messages(): array
    {
        return ['items.*.itemId.distinct' => 'Each item may appear only once in a Spoilage record.'];
    }
}
