<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePrivilegeRequest;
use App\Http\Requests\UpdatePrivilegeRequest;
use App\Http\Resources\PrivilegeResource;
use App\Models\Privilege;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrivilegeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate(['search' => ['nullable', 'string', 'max:100']]);
        $search = trim($validated['search'] ?? '');
        $rows = Privilege::query()->when($search !== '', fn ($query) => $query->where('description', 'like', "%{$search}%"))
            ->orderBy('description')->paginate(10)->withQueryString();

        return PrivilegeResource::collection($rows)->response();
    }

    public function store(StorePrivilegeRequest $request): JsonResponse
    {
        $privilege = Privilege::query()->create($request->validated());

        return response()->json(['message' => 'Privilege created successfully.', 'privilege' => (new PrivilegeResource($privilege))->resolve()], 201);
    }

    public function update(UpdatePrivilegeRequest $request, Privilege $privilege): JsonResponse
    {
        $privilege->update($request->validated());

        return response()->json(['message' => 'Privilege updated successfully.', 'privilege' => (new PrivilegeResource($privilege->fresh()))->resolve()]);
    }
}
