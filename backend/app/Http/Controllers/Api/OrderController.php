<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderDetailResource;
use App\Http\Resources\OrderHistoryResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'station_id' => ['nullable', 'integer', 'exists:stations,id'],
            'from_date' => ['nullable', 'date_format:Y-m-d'],
            'to_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from_date'],
            'search' => ['nullable', 'string', 'max:100'],
        ]);
        $user = $request->user();
        if ($user->role === UserRole::EndUser && ! $user->station_id) {
            return response()->json(['message' => 'This account is not assigned to a station.'], 409);
        }

        $search = $request->string('search')->trim()->toString();
        $orders = Order::query()->with(['station', 'cashier'])
            ->when($user->role === UserRole::EndUser, fn ($query) => $query->where('station_id', $user->station_id))
            ->when($user->role === UserRole::Admin && isset($validated['station_id']), fn ($query) => $query->where('station_id', $validated['station_id']))
            ->when($search !== '', fn ($query) => $query->where(fn ($searchQuery) => $searchQuery
                ->where('order_number', 'like', "%{$search}%")
                ->orWhereHas('cashier', fn ($cashier) => $cashier->where('name', 'like', "%{$search}%"))
                ->orWhereHas('station', fn ($station) => $station->where('name', 'like', "%{$search}%"))))
            ->when(isset($validated['from_date']), fn ($query) => $query->whereDate('ordered_at', '>=', $validated['from_date']))
            ->when(isset($validated['to_date']), fn ($query) => $query->whereDate('ordered_at', '<=', $validated['to_date']))
            ->orderByDesc('ordered_at')->orderByDesc('id')->paginate(10)->withQueryString();

        return OrderHistoryResource::collection($orders)->response();
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        $user = $request->user();
        if ($user->role === UserRole::EndUser && ! $user->station_id) {
            return response()->json(['message' => 'This account is not assigned to a station.'], 409);
        }
        if ($user->role === UserRole::EndUser && $order->station_id !== $user->station_id) {
            abort(404);
        }

        return response()->json(['order' => (new OrderDetailResource($order->load(['station', 'cashier', 'orderItems'])))->resolve($request)]);
    }
}
