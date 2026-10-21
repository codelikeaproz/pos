<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMonthlyEndReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'stationId' => ['required', 'integer', 'exists:stations,id'],
            'reportMonth' => ['required', 'integer', 'between:1,12'],
            'reportYear' => ['required', 'integer', 'between:2000,2100'],
        ];
    }
}
