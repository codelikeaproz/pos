<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMonthlyEndCountsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'counts' => ['required', 'array', 'min:1'],
            'counts.*.id' => ['required', 'integer', 'distinct'],
            'counts.*.physicalCount' => ['nullable', 'numeric', 'min:0', 'regex:/^\d{1,10}(\.\d{1,2})?$/'],
        ];
    }
}
