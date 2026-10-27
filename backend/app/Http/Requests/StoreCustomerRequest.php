<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'employee_number' => is_string($this->input('employee_number')) ? trim($this->input('employee_number')) : $this->input('employee_number'),
            'first_name' => is_string($this->input('first_name')) ? trim($this->input('first_name')) : $this->input('first_name'),
            'middle_name' => is_string($this->input('middle_name')) ? trim($this->input('middle_name')) : $this->input('middle_name'),
            'last_name' => is_string($this->input('last_name')) ? trim($this->input('last_name')) : $this->input('last_name'),
            'address' => is_string($this->input('address')) ? trim($this->input('address')) : $this->input('address'),
        ]);
    }

    public function rules(): array
    {
        return [
            'employee_number' => ['nullable', 'string', 'max:100', Rule::unique('customers')->ignore($this->route('customer'))],
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'sex' => ['nullable', Rule::in(['male', 'female'])],
            'birth_date' => ['nullable', 'date_format:Y-m-d', 'before_or_equal:today'],
            'address' => ['required', 'string', 'max:500'],
            'credit_limit' => ['sometimes', 'required', 'regex:/^\d{1,10}(\.\d{1,2})?$/'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
