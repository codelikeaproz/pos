<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutOrderRequest;
use App\Http\Resources\OrderResource;
use App\Services\OrderCheckoutService;
use Illuminate\Http\JsonResponse;

class PosCheckoutController extends Controller
{
    public function store(CheckoutOrderRequest $request, OrderCheckoutService $checkout): JsonResponse
    {
        $user = $request->user()->loadMissing('station');
        if (! $user->station_id || ! $user->station) {
            return response()->json(['message' => 'This account is not assigned to a station.'], 409);
        }

        $order = $checkout->checkout(
            $user,
            $request->validated('items'),
            $request->validated('cashReceived'),
        );

        return response()->json([
            'message' => 'Payment completed successfully.',
            'order' => (new OrderResource($order))->resolve($request),
        ], 201);
    }
}
