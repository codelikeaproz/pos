<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreConsigneeRequest;
use App\Http\Requests\UpdateConsigneeRequest;
use App\Http\Resources\ConsigneeResource;
use App\Models\Consignee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConsigneeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $searchTerm = $request->string('search')->trim()->toString();
        $consignees = Consignee::query()
            ->when($searchTerm !== '', function ($query) use ($searchTerm) {
                $query->where(function ($searchQuery) use ($searchTerm) {
                    $searchQuery->where('name', 'like', "%{$searchTerm}%")
                        ->orWhere('contact_number', 'like', "%{$searchTerm}%")
                        ->orWhere('email', 'like', "%{$searchTerm}%");
                });
            })
            ->orderBy('name')->paginate($this->pageSize($request))->withQueryString();

        return ConsigneeResource::collection($consignees)->response();
    }

    public function store(StoreConsigneeRequest $request): JsonResponse
    {
        $consignee = Consignee::query()->create($request->validated());

        return response()->json(['message' => 'Consignee added successfully.', 'consignee' => (new ConsigneeResource($consignee))->resolve()], 201);
    }

    public function show(Consignee $consignee): JsonResponse
    {
        return response()->json(['consignee' => (new ConsigneeResource($consignee))->resolve()]);
    }

    public function update(UpdateConsigneeRequest $request, Consignee $consignee): JsonResponse
    {
        $consignee->update($request->validated());

        return response()->json(['message' => 'Consignee updated successfully.', 'consignee' => (new ConsigneeResource($consignee->fresh()))->resolve()]);
    }

    public function destroy(Consignee $consignee): JsonResponse
    {
        if ($consignee->users()->exists()) {
            return response()->json(['message' => 'This consignee is assigned to an account and cannot be deleted.'], 409);
        }
        $consignee->delete();

        return response()->json(['message' => 'Consignee deleted successfully.']);
    }
}
