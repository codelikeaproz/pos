<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate(['search' => ['nullable', 'string', 'max:100']]);
        $search = trim($validated['search'] ?? '');
        $customers = Customer::query()
            ->when($request->user()->role === UserRole::EndUser, fn ($query) => $query->where('is_active', true))
            ->when($search !== '', fn ($query) => $query->where(fn ($matches) => $matches
                ->where('employee_number', 'like', "%{$search}%")
                ->orWhere('first_name', 'like', "%{$search}%")
                ->orWhere('middle_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%")
                ->orWhere('address', 'like', "%{$search}%")))
            ->withSum(['orders as credit_orders_sum_total_amount' => fn ($query) => $query->where('payment_method', 'credit')], 'total_amount')
            ->withSum('creditPayments', 'amount')
            ->orderBy('last_name')->orderBy('first_name')->orderBy('id')->paginate($this->pageSize($request))->withQueryString();

        return CustomerResource::collection($customers)->response();
    }

    public function store(StoreCustomerRequest $request): JsonResponse
    {
        $customer = Customer::query()->create($request->validated() + ['credit_limit' => '500.00']);

        return response()->json(['message' => 'Customer added successfully.', 'customer' => (new CustomerResource($customer))->resolve($request)], 201);
    }

    public function update(StoreCustomerRequest $request, Customer $customer): JsonResponse
    {
        $customer->update($request->validated());

        return response()->json(['message' => 'Customer updated successfully.', 'customer' => (new CustomerResource($this->withBalances($customer)))->resolve($request)]);
    }

    public function updateStatus(Request $request, Customer $customer): JsonResponse
    {
        $customer->update(['is_active' => $request->validate(['is_active' => ['required', 'boolean']])['is_active']]);

        return response()->json(['message' => $customer->is_active ? 'Customer reactivated successfully.' : 'Customer deactivated successfully.', 'customer' => (new CustomerResource($this->withBalances($customer)))->resolve($request)]);
    }

    private function withBalances(Customer $customer): Customer
    {
        return $customer->loadSum(['orders as credit_orders_sum_total_amount' => fn ($query) => $query->where('payment_method', 'credit')], 'total_amount')->loadSum('creditPayments', 'amount');
    }
}
