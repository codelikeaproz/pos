<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStationRequest;
use App\Http\Requests\UpdateStationRequest;
use App\Http\Resources\StationResource;
use App\Models\Station;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $searchTerm = $request->string('search')->trim()->toString();

        $stations = Station::query()
            ->when($searchTerm !== '', function ($query) use ($searchTerm) {
                $query->where(function ($searchQuery) use ($searchTerm) {
                    $searchQuery
                        ->where('name', 'like', "%{$searchTerm}%")
                        ->orWhere('location', 'like', "%{$searchTerm}%")
                        ->orWhere('description', 'like', "%{$searchTerm}%");
                });
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return StationResource::collection($stations)->response();
    }

    public function store(StoreStationRequest $request): JsonResponse
    {
        $station = Station::query()->create($request->validated());

        return response()->json([
            'message' => 'Station added successfully.',
            'station' => (new StationResource($station))->resolve(),
        ], 201);
    }

    public function show(Station $station): JsonResponse
    {
        return response()->json([
            'station' => (new StationResource($station))->resolve(),
        ]);
    }

    public function update(UpdateStationRequest $request, Station $station): JsonResponse
    {
        $station->update($request->validated());

        return response()->json([
            'message' => 'Station updated successfully.',
            'station' => (new StationResource($station->fresh()))->resolve(),
        ]);
    }

    public function destroy(Station $station): JsonResponse
    {
        if ($station->users()->exists()) {
            return response()->json(['message' => 'This station is assigned to an account and cannot be deleted.'], 409);
        }
        $station->delete();

        return response()->json([
            'message' => 'Station deleted successfully.',
        ]);
    }
}
