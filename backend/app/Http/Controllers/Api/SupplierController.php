<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $searchTerm = $request->string('search')->trim()->toString();

        $suppliers = Supplier::query()
            ->when($searchTerm !== '', function ($query) use ($searchTerm) {
                $query->where(function ($searchQuery) use ($searchTerm) {
                    $searchQuery
                        ->where('name', 'like', "%{$searchTerm}%")
                        ->orWhere('contact_person', 'like', "%{$searchTerm}%")
                        ->orWhere('contact_number', 'like', "%{$searchTerm}%")
                        ->orWhere('email', 'like', "%{$searchTerm}%");
                });
            })
            ->orderBy('name')
            ->paginate($this->pageSize($request))
            ->withQueryString();

        return SupplierResource::collection($suppliers)->response();
    }

    public function store(StoreSupplierRequest $request): JsonResponse
    {
        $supplier = Supplier::query()->create($request->validated());

        return response()->json([
            'message' => 'Supplier added successfully.',
            'supplier' => (new SupplierResource($supplier->fresh()))->resolve(),
        ], 201);
    }

    public function show(Supplier $supplier): JsonResponse
    {
        return response()->json([
            'supplier' => (new SupplierResource($supplier))->resolve(),
        ]);
    }

    public function update(UpdateSupplierRequest $request, Supplier $supplier): JsonResponse
    {
        $supplier->update($request->validated());

        return response()->json([
            'message' => 'Supplier updated successfully.',
            'supplier' => (new SupplierResource($supplier->fresh()))->resolve(),
        ]);
    }

    public function destroy(Supplier $supplier): JsonResponse
    {
        $supplier->delete();

        return response()->json([
            'message' => 'Supplier deleted successfully.',
        ]);
    }
}
