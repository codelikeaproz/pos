<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreConsigneeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge($this->normalizedOptionalFields());
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /** @return array<string, string|null> */
    private function normalizedOptionalFields(): array
    {
        return collect(['contact_number', 'email', 'address'])->mapWithKeys(function (string $field): array {
            $value = $this->input($field);

            return [$field => is_string($value) && trim($value) === '' ? null : $value];
        })->all();
    }
}
