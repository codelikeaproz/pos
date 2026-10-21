<?php

namespace App\Http\Requests;

use App\Enums\TaxStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaxSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'taxStatus' => ['required', Rule::in([TaxStatus::NonVat->value])],
            'vatRate' => ['required', 'numeric', 'min:0', 'max:100', 'decimal:0,2'],
        ];
    }

    public function messages(): array
    {
        return [
            'taxStatus.in' => 'VAT Registered is reserved for future support. Keep Tax Status set to Non-VAT.',
            'vatRate.decimal' => 'VAT Rate must use no more than two decimal places.',
        ];
    }
}
