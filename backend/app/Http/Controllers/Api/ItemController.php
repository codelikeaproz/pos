<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreItemRequest;
use App\Http\Requests\UpdateItemRequest;
use App\Http\Resources\ItemResource;
use App\Models\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $searchTerm = $request->string('search')->trim()->toString();

        $items = Item::query()
            ->when($searchTerm !== '', function ($query) use ($searchTerm) {
                $query->where(function ($searchQuery) use ($searchTerm) {
                    $searchQuery
                        ->where('item_code', 'like', "%{$searchTerm}%")
                        ->orWhere('name', 'like', "%{$searchTerm}%")
                        ->orWhere('description', 'like', "%{$searchTerm}%");
                });
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return ItemResource::collection($items)->response();
    }

    public function store(StoreItemRequest $request): JsonResponse
    {
        $item = Item::query()->create($request->validated());

        return response()->json([
            'message' => 'Item added successfully.',
            'item' => (new ItemResource($item))->resolve(),
        ], 201);
    }

    public function show(Item $item): JsonResponse
    {
        return response()->json([
            'item' => (new ItemResource($item))->resolve(),
        ]);
    }

    public function update(UpdateItemRequest $request, Item $item): JsonResponse
    {
        $item->update($request->validated());

        return response()->json([
            'message' => 'Item updated successfully.',
            'item' => (new ItemResource($item->fresh()))->resolve(),
        ]);
    }

    public function destroy(Item $item): JsonResponse
    {
        $item->delete();

        return response()->json([
            'message' => 'Item deleted successfully.',
        ]);
    }
}
