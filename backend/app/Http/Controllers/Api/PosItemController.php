<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PosItemResource;
use App\Models\StationItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PosItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $user = $request->user()->loadMissing('station');

        if (! $user->station_id || ! $user->station) {
            return response()->json([
                'message' => 'This account is not assigned to a station.',
            ], 409);
        }

        $searchTerm = $request->string('search')->trim()->toString();
        $stationItems = StationItem::query()
            ->with('item')
            ->where('station_id', $user->station_id)
            ->when($searchTerm !== '', fn ($query) => $query->whereHas('item', fn ($itemQuery) => $itemQuery
                ->where('name', 'like', "%{$searchTerm}%")
                ->orWhere('item_code', 'like', "%{$searchTerm}%")
                ->orWhere('units_backup', 'like', "%{$searchTerm}%")))
            ->join('items', 'items.id', '=', 'station_items.item_id')
            ->select('station_items.*')
            ->orderBy('items.name')
            ->paginate(10)
            ->withQueryString();

        return PosItemResource::collection($stationItems)
            ->additional([
                'station' => [
                    'id' => $user->station->id,
                    'name' => $user->station->name,
                ],
            ])
            ->response();
    }
}
