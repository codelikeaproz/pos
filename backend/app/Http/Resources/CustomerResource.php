<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $outstanding = max((float) ($this->credit_orders_sum_total_amount ?? 0) - (float) ($this->credit_payments_sum_amount ?? 0), 0);
        $available = max((float) $this->credit_limit - $outstanding, 0);

        return [
            'id' => $this->id,
            'employeeNumber' => $this->employee_number,
            'firstName' => $this->first_name,
            'middleName' => $this->middle_name,
            'lastName' => $this->last_name,
            'name' => $this->display_name,
            'sex' => $this->sex,
            'birthDate' => $this->birth_date?->toDateString(),
            'address' => $this->address,
            'creditLimit' => $this->credit_limit,
            'outstandingBalance' => number_format($outstanding, 2, '.', ''),
            'availableCredit' => number_format($available, 2, '.', ''),
            'isActive' => $this->is_active,
        ];
    }
}
