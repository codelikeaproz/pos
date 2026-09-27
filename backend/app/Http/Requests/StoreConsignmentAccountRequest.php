<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreConsignmentAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'station_id' => ['required', 'integer', 'exists:stations,id'],
            'consignee_id' => ['required', 'integer', 'exists:consignees,id'],
            'password' => ['required', 'string', 'confirmed', Password::min(8)],
        ];
    }
}
