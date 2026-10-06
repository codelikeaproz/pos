<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreItemRequest;
use App\Http\Requests\UpdateItemRequest;
use App\Http\Resources\ItemResource;
use App\Models\Item;
use App\Models\Price;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $searchTerm = $request->string('search')->trim()->toString();

        $items = Item::query()->with('activePrice')
            ->when($searchTerm !== '', function ($query) use ($searchTerm) {
                $query->where(function ($searchQuery) use ($searchTerm) {
                    $searchQuery
                        ->where('item_code', 'like', "%{$searchTerm}%")
                        ->orWhere('name', 'like', "%{$searchTerm}%")
                        ->orWhere('units_backup', 'like', "%{$searchTerm}%");
                });
            })
            ->orderBy('name')
            ->paginate($this->pageSize($request))
            ->withQueryString();

        return ItemResource::collection($items)->response();
    }

    public function store(StoreItemRequest $request): JsonResponse
    {
        $item = DB::transaction(function () use ($request) {
            $item = Item::query()->create($request->validated());
            Price::query()->create(['item_id' => $item->id, 'amount' => $item->price, 'is_active' => true]);

            return $item;
        });

        return response()->json([
            'message' => 'Item added successfully.',
            'item' => (new ItemResource($item->load('activePrice')))->resolve(),
        ], 201);
    }

    public function show(Item $item): JsonResponse
    {
        return response()->json(['item' => (new ItemResource($item->load('activePrice')))->resolve()]);
    }

    public function update(UpdateItemRequest $request, Item $item): JsonResponse
    {
        $item->update($request->validated());

        return response()->json([
            'message' => 'Item updated successfully.',
            'item' => (new ItemResource($item->fresh()->load('activePrice')))->resolve(),
        ]);
    }

    public function destroy(Item $item): JsonResponse
    {
        if ($item->stationItems()->exists() || $item->orderItems()->exists() || $item->itemDeliveryItems()->exists() || $item->spoilageItems()->exists() || $item->prices()->exists()) {
            return response()->json(['message' => 'This item has inventory or history and cannot be deleted. Deactivate it instead.'], 409);
        }
        $item->delete();

        return response()->json([
            'message' => 'Item deleted successfully.',
        ]);
    }
}
