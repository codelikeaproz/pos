<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReconcileMonthlyEndItemsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'itemIds' => ['required', 'array', 'min:1'],
            'itemIds.*' => ['required', 'integer', 'distinct'],
        ];
    }
}
