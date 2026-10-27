<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCreditPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['description' => is_string($this->input('description')) ? trim($this->input('description')) : $this->input('description')]);
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'string', 'regex:/^\d{1,10}(\.\d{1,2})?$/', 'not_in:0,0.0,0.00'],
            'paid_at' => ['required', 'date'],
            'description' => ['nullable', 'string', 'max:500'],
        ];
    }
}
