<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CheckoutOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.itemId' => ['required', 'integer', 'distinct'],
            'items.*.quantity' => ['required', 'string', 'regex:/^\d{1,9}(\.\d{1,3})?$/', 'not_in:0,0.0,0.00,0.000'],
            'paymentMethod' => ['required', Rule::in(['cash'])],
            'cashReceived' => ['required', 'string', 'regex:/^\d{1,10}(\.\d{1,2})?$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.min' => 'Add at least one item before payment.',
            'items.*.itemId.distinct' => 'Each item may appear only once in an order.',
            'items.*.quantity.regex' => 'Quantity must be positive and use no more than three decimal places.',
            'paymentMethod.in' => 'Cash is the only supported payment method.',
            'cashReceived.regex' => 'Cash received must be a valid amount with no more than two decimal places.',
        ];
    }
}
