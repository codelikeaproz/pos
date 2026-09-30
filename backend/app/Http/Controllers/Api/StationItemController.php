<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStationItemRequest;
use App\Http\Requests\UpdateStationItemRequest;
use App\Http\Resources\StationItemResource;
use App\Models\InventoryMovement;
use App\Models\Item;
use App\Models\Station;
use App\Models\StationItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StationItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate(['station_id' => ['nullable', 'integer', 'exists:stations,id']]);
        $searchTerm = $request->string('search')->trim()->toString();
        $stationItems = StationItem::query()->with(['station', 'item'])
            ->when(isset($validated['station_id']), fn ($query) => $query->where('station_id', $validated['station_id']))
            ->when($searchTerm !== '', fn ($query) => $query->whereHas('item', fn ($itemQuery) => $itemQuery
                ->where('name', 'like', "%{$searchTerm}%")
                ->orWhere('item_code', 'like', "%{$searchTerm}%")
                ->orWhere('units_backup', 'like', "%{$searchTerm}%")
                ->orWhere('unit', 'like', "%{$searchTerm}%")))
            ->join('items', 'items.id', '=', 'station_items.item_id')
            ->select('station_items.*')->orderBy('items.name')->paginate(10)->withQueryString();

        return StationItemResource::collection($stationItems)->response();
    }

    public function options(Request $request): JsonResponse
    {
        $searchTerm = $request->string('item_search')->trim()->toString();

        return response()->json([
            'stations' => Station::query()->orderBy('name')->get(['id', 'name']),
            'items' => Item::query()
                ->when($searchTerm !== '', fn ($query) => $query->where(fn ($search) => $search
                    ->where('name', 'like', "%{$searchTerm}%")->orWhere('item_code', 'like', "%{$searchTerm}%")))
                ->orderBy('name')->limit(50)->get(['id', 'item_code', 'name', 'units_backup', 'unit', 'reorder_point']),
        ]);
    }

    public function store(StoreStationItemRequest $request): JsonResponse
    {
        $stationItem = StationItem::query()->create($request->validated());

        return response()->json(['message' => 'Item assigned to station successfully.', 'station_item' => (new StationItemResource($stationItem->load(['station', 'item'])))->resolve()], 201);
    }

    public function show(StationItem $stationItem): JsonResponse
    {
        return response()->json(['station_item' => (new StationItemResource($stationItem->load(['station', 'item'])))->resolve()]);
    }

    public function update(UpdateStationItemRequest $request, StationItem $stationItem): JsonResponse
    {
        DB::transaction(function () use ($request, $stationItem) {
            $locked = StationItem::query()->whereKey($stationItem->id)->lockForUpdate()->firstOrFail();
            $old = (int) round((float) $locked->quantity * 1000);
            $new = (int) round((float) $request->validated('quantity') * 1000);
            if ($old === $new) {
                return;
            }
            $locked->update(['quantity' => $request->validated('quantity')]);
            $difference = $new - $old;
            InventoryMovement::query()->create([
                'station_item_id' => $locked->id,
                'item_id' => $locked->item_id,
                'quantity_change' => ($difference < 0 ? '-' : '').sprintf('%d.%03d', intdiv(abs($difference), 1000), abs($difference) % 1000),
                'type' => 'ADJUSTMENT',
                'actor_id' => $request->user()->id,
            ]);
        });

        return response()->json(['message' => 'Station inventory updated successfully.', 'station_item' => (new StationItemResource($stationItem->fresh()->load(['station', 'item'])))->resolve()]);
    }

    public function destroy(StationItem $stationItem): JsonResponse
    {
        if ($stationItem->movements()->exists()) {
            return response()->json(['message' => 'This station inventory has movement history and cannot be removed.'], 409);
        }
        $stationItem->delete();

        return response()->json(['message' => 'Item removed from station successfully.']);
    }
}
