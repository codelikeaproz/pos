<?php

namespace App\Http\Controllers\Api;

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
            ->when($search !== '', fn ($query) => $query->where(fn ($matches) => $matches
                ->where('name', 'like', "%{$search}%")
                ->orWhere('address', 'like', "%{$search}%")))
            ->orderBy('name')->orderBy('id')->paginate(10)->withQueryString();

        return CustomerResource::collection($customers)->response();
    }

    public function store(StoreCustomerRequest $request): JsonResponse
    {
        $customer = Customer::query()->create($request->validated());

        return response()->json(['message' => 'Customer added successfully.', 'customer' => (new CustomerResource($customer))->resolve($request)], 201);
    }
}
