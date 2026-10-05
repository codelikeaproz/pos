<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderDetailResource;
use App\Http\Resources\OrderHistoryResource;
use App\Models\Customer;
use App\Models\Order;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $this->validateFilters($request);
        $user = $request->user();
        if ($user->role === UserRole::EndUser && ! $user->station_id) {
            return response()->json(['message' => 'This account is not assigned to a station.'], 409);
        }

        $stationId = $user->role === UserRole::EndUser ? $user->station_id : ($validated['station_id'] ?? null);

        return $this->history($request, $validated, $stationId);
    }

    public function orTransactions(Request $request): JsonResponse
    {
        $validated = $this->validateFilters($request);

        return $this->history($request, $validated, $validated['station_id'] ?? null);
    }

    public function posOrTransactions(Request $request): JsonResponse
    {
        $validated = $this->validateFilters($request);
        $user = $request->user();
        if (! $user->station_id || ! $user->station) {
            return response()->json(['message' => 'This account is not assigned to a station.'], 409);
        }

        return $this->history($request, $validated, $user->station_id);
    }

    /** @return array<string, mixed> */
    private function validateFilters(Request $request): array
    {
        return $request->validate([
            'station_id' => ['nullable', 'integer', 'exists:stations,id'],
            'from_date' => ['nullable', 'date_format:Y-m-d'],
            'to_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from_date'],
            'search' => ['nullable', 'string', 'max:100'],
            'customer_sort' => ['nullable', 'in:asc,desc'],
        ]);
    }

    /** @param array<string, mixed> $validated */
    private function history(Request $request, array $validated, ?int $stationId): JsonResponse
    {
        $search = $request->string('search')->trim()->toString();
        $orders = Order::query()->with(['station', 'cashier', 'customer'])
            ->when($stationId !== null, fn ($query) => $query->where('station_id', $stationId))
            ->when($search !== '', fn ($query) => $query->where(fn ($searchQuery) => $searchQuery
                ->where('order_number', 'like', "%{$search}%")
                ->orWhereHas('customer', fn ($customer) => $customer->where('name', 'like', "%{$search}%"))
                ->orWhereHas('cashier', fn ($cashier) => $cashier->where('name', 'like', "%{$search}%"))
                ->orWhereHas('station', fn ($station) => $station->where('name', 'like', "%{$search}%"))))
            ->when(isset($validated['from_date']), fn ($query) => $query->where('ordered_at', '>=',
                CarbonImmutable::parse($validated['from_date'], 'Asia/Manila')->startOfDay()->utc()->toDateTimeString()))
            ->when(isset($validated['to_date']), fn ($query) => $query->where('ordered_at', '<',
                CarbonImmutable::parse($validated['to_date'], 'Asia/Manila')->addDay()->startOfDay()->utc()->toDateTimeString()))
            ->when(isset($validated['customer_sort']), fn ($query) => $query->orderBy(
                Customer::query()->select('name')->whereColumn('customers.id', 'orders.customer_id'),
                $validated['customer_sort']
            ))
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

        return response()->json(['order' => (new OrderDetailResource($order->load(['station', 'cashier', 'customer', 'orderItems'])))->resolve($request)]);
    }

    public function orTransaction(Request $request, Order $order): JsonResponse
    {
        return $this->detail($request, $order);
    }

    public function posOrTransaction(Request $request, Order $order): JsonResponse
    {
        $user = $request->user();
        if (! $user->station_id || ! $user->station) {
            return response()->json(['message' => 'This account is not assigned to a station.'], 409);
        }
        if ($order->station_id !== $user->station_id) {
            abort(404);
        }

        return $this->detail($request, $order);
    }

    private function detail(Request $request, Order $order): JsonResponse
    {
        return response()->json(['order' => (new OrderDetailResource($order->load(['station', 'cashier', 'customer', 'orderItems'])))->resolve($request)]);
    }
}
