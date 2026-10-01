<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSaleRemittanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['order_ids' => ['required', 'array', 'min:1'], 'order_ids.*' => ['required', 'integer', 'distinct']];
    }
}
