<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Customer;
use App\Models\InventoryMovement;
use App\Models\Item;
use App\Models\Order;
use App\Models\Price;
use App\Models\StationItem;
use App\Models\User;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PosCheckoutController extends Controller
{
    public function store(CheckoutOrderRequest $request): JsonResponse
    {
        $user = $request->user()->loadMissing('station');
        if (! $user->station_id || ! $user->station) {
            return response()->json(['message' => 'This account is not assigned to a station.'], 409);
        }

        $order = $this->checkout($user, $request->validated('items'), $request->validated('paymentMethod'), $request->validated('cashReceived'), $request->validated('customerId'));

        return response()->json([
            'message' => $request->validated('paymentMethod') === 'cash' ? 'Payment completed successfully.' : 'Credit order completed successfully.',
            'order' => (new OrderResource($order))->resolve($request),
        ], 201);
    }

    /** @param array<int, array{itemId: int, quantity: string, expectedUnitPrice: string}> $requestedItems */
    private function checkout(User $cashier, array $requestedItems, string $paymentMethod, ?string $cashReceived, ?int $customerId): Order
    {
        return DB::transaction(function () use ($cashier, $requestedItems, $paymentMethod, $cashReceived, $customerId) {
            $customer = $customerId ? Customer::query()->lockForUpdate()->find($customerId) : null;
            if ($paymentMethod === 'credit' && ! $customer) {
                throw ValidationException::withMessages(['customerId' => ['Select a valid Customer for Credit / Utang.']]);
            }
            $requests = collect($requestedItems)->keyBy('itemId');
            $stationItems = StationItem::query()
                ->where('station_id', $cashier->station_id)
                ->whereIn('item_id', $requests->keys()->sort()->values())
                ->orderBy('item_id')
                ->lockForUpdate()
                ->get()
                ->keyBy('item_id');

            // The Item row is the activation synchronization point even when no
            // Price exists yet. Checkout and Price activation lock in this order.
            $items = Item::query()->whereIn('id', $stationItems->keys())
                ->orderBy('id')->lockForUpdate()->get()->keyBy('id');
            foreach ($stationItems as $stationItem) {
                $stationItem->setRelation('item', $items->get($stationItem->item_id));
            }
            $activePrices = Price::query()->whereIn('item_id', $stationItems->keys())
                ->where('is_active', true)->orderBy('item_id')->lockForUpdate()
                ->get()->groupBy('item_id');

            $lines = [];
            $totalCents = 0;
            $changedPrices = [];

            foreach ($requests as $itemId => $requestLine) {
                $stationItem = $stationItems->get($itemId);
                if (! $stationItem) {
                    throw ValidationException::withMessages(['items' => ['An item is no longer available at this station.']]);
                }

                if (! $stationItem->item->is_active) {
                    throw ValidationException::withMessages(['items' => ['An inactive item cannot be sold.']]);
                }

                $quantityMilli = $this->parseFixed($requestLine['quantity'], 3);
                $availableMilli = $this->parseFixed($stationItem->quantity, 3);
                if ($quantityMilli > $availableMilli) {
                    throw ValidationException::withMessages([
                        'items' => ["Only {$stationItem->quantity} units of {$stationItem->item->name} are available at this station."],
                    ]);
                }

                $itemPrices = $activePrices->get($itemId, collect());
                if ($itemPrices->count() !== 1) {
                    throw ValidationException::withMessages(['items' => ['An item has no valid active price. Refresh the cart before payment.']]);
                }
                $priceCents = $this->parseFixed($itemPrices->first()->amount, 2);
                if ($priceCents !== $this->parseFixed($requestLine['expectedUnitPrice'], 2)) {
                    $changedPrices[] = ['itemId' => (int) $itemId, 'price' => $itemPrices->first()->amount];
                }
                if ($quantityMilli !== 0 && $priceCents > intdiv(PHP_INT_MAX, $quantityMilli)) {
                    throw ValidationException::withMessages(['items' => ['The calculated order amount is too large.']]);
                }
                $subtotalCents = intdiv(($priceCents * $quantityMilli) + 500, 1000);
                $totalCents += $subtotalCents;
                if ($totalCents > 999999999999) {
                    throw ValidationException::withMessages(['items' => ['The calculated order total is too large.']]);
                }

                $lines[] = compact('stationItem', 'quantityMilli', 'priceCents', 'subtotalCents');
            }

            if ($changedPrices !== []) {
                throw new HttpResponseException(response()->json([
                    'message' => 'One or more item prices changed. Please review the cart and press Pay again.',
                    'currentPrices' => $changedPrices,
                ], 409));
            }

            $cashCents = $paymentMethod === 'cash' ? $this->parseFixed($cashReceived, 2) : null;
            if ($cashCents !== null && $cashCents < $totalCents) {
                throw ValidationException::withMessages(['cashReceived' => ['Cash received is less than the order total.']]);
            }

            $order = Order::query()->create([
                'order_number' => 'PENDING-'.Str::uuid(),
                'ordered_at' => now(),
                'station_id' => $cashier->station_id,
                'cashier_id' => $cashier->id,
                'customer_id' => $customer?->id,
                'payment_method' => $paymentMethod,
                'total_amount' => $this->formatFixed($totalCents, 2),
                'cash_received' => $cashCents === null ? null : $this->formatFixed($cashCents, 2),
                'change_amount' => $cashCents === null ? null : $this->formatFixed($cashCents - $totalCents, 2),
            ]);
            $order->forceFill(['order_number' => 'ORD'.$order->ordered_at->setTimezone('Asia/Manila')->format('Ymd').str_pad((string) $order->id, 6, '0', STR_PAD_LEFT)])->save();

            foreach ($lines as $line) {
                $stationItem = $line['stationItem'];
                $orderItem = $order->orderItems()->create([
                    'item_id' => $stationItem->item_id,
                    'item_code' => $stationItem->item->item_code,
                    'item_name' => $stationItem->item->name,
                    'unit' => $stationItem->item->units_backup,
                    'quantity' => $this->formatFixed($line['quantityMilli'], 3),
                    'unit_price' => $this->formatFixed($line['priceCents'], 2),
                    'subtotal' => $this->formatFixed($line['subtotalCents'], 2),
                ]);
                $stationItem->update([
                    'quantity' => $this->formatFixed($this->parseFixed($stationItem->quantity, 3) - $line['quantityMilli'], 3),
                ]);
                InventoryMovement::query()->create([
                    'station_item_id' => $stationItem->id,
                    'item_id' => $stationItem->item_id,
                    'order_item_id' => $orderItem->id,
                    'quantity_change' => '-'.$this->formatFixed($line['quantityMilli'], 3),
                    'type' => 'SALE',
                    'reference_type' => 'order_item',
                    'reference_id' => $orderItem->id,
                    'actor_id' => $cashier->id,
                ]);
            }

            return $order->load(['station', 'cashier', 'customer', 'orderItems']);
        });
    }

    private function parseFixed(string $value, int $scale): int
    {
        [$whole, $fraction] = array_pad(explode('.', $value, 2), 2, '');

        return ((int) $whole * (10 ** $scale)) + (int) str_pad($fraction, $scale, '0');
    }

    private function formatFixed(int $value, int $scale): string
    {
        $factor = 10 ** $scale;

        return intdiv($value, $factor).'.'.str_pad((string) ($value % $factor), $scale, '0', STR_PAD_LEFT);
    }
}
