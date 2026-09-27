<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateConsignmentAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->route('user'))],
            'station_id' => ['required', 'integer', 'exists:stations,id'],
            'consignee_id' => ['required', 'integer', 'exists:consignees,id'],
            'password' => ['nullable', 'string', 'confirmed', Password::min(8)],
        ];
    }
}
