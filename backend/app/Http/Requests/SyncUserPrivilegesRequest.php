<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SyncUserPrivilegesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'privilege_ids' => ['required', 'array'],
            'privilege_ids.*' => ['integer', 'distinct', 'exists:privileges,id'],
        ];
    }
}
