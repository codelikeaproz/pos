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
            'items.*.expectedUnitPrice' => ['required', 'string', 'regex:/^\d{1,8}(\.\d{1,2})?$/'],
            'paymentMethod' => ['required', Rule::in(['cash', 'credit'])],
            'cashReceived' => ['required_if:paymentMethod,cash', 'nullable', 'string', 'regex:/^\d{1,10}(\.\d{1,2})?$/'],
            'customerId' => ['required_if:paymentMethod,credit', 'nullable', 'integer', 'exists:customers,id'],
            'customerCount' => ['nullable', 'required_with:seniorCount', 'integer', 'min:1'],
            'seniorCount' => ['nullable', 'required_with:customerCount', 'integer', 'min:1', 'lte:customerCount'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.min' => 'Add at least one item before payment.',
            'items.*.itemId.distinct' => 'Each item may appear only once in an order.',
            'items.*.quantity.regex' => 'Quantity must be positive and use no more than three decimal places.',
            'items.*.expectedUnitPrice.regex' => 'Expected price must have no more than two decimal places.',
            'paymentMethod.in' => 'Select Cash or Credit / Utang.',
            'cashReceived.regex' => 'Cash received must be a valid amount with no more than two decimal places.',
            'seniorCount.lte' => 'Number of Senior Citizens cannot exceed Number of Customers.',
        ];
    }
}
