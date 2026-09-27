<?php

namespace App\Services;

use App\Models\Order;
use App\Models\StationItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderCheckoutService
{
    /** @param array<int, array{itemId: int, quantity: string}> $requestedItems */
    public function checkout(User $cashier, array $requestedItems, string $cashReceived): Order
    {
        return DB::transaction(function () use ($cashier, $requestedItems, $cashReceived) {
            $requests = collect($requestedItems)->keyBy('itemId');
            $stationItems = StationItem::query()
                ->with('item')
                ->where('station_id', $cashier->station_id)
                ->whereIn('item_id', $requests->keys()->sort()->values())
                ->orderBy('item_id')
                ->lockForUpdate()
                ->get()
                ->keyBy('item_id');

            $lines = [];
            $totalCents = 0;

            foreach ($requests as $itemId => $requestLine) {
                $stationItem = $stationItems->get($itemId);
                if (! $stationItem) {
                    throw ValidationException::withMessages(['items' => ['An item is no longer available at this station.']]);
                }

                $quantityMilli = $this->parseFixed($requestLine['quantity'], 3);
                $availableMilli = $this->parseFixed($stationItem->quantity, 3);
                if ($quantityMilli > $availableMilli) {
                    throw ValidationException::withMessages([
                        'items' => ["Only {$stationItem->quantity} units of {$stationItem->item->name} are available at this station."],
                    ]);
                }

                $priceCents = $this->parseFixed($stationItem->item->price, 2);
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

            $cashCents = $this->parseFixed($cashReceived, 2);
            if ($cashCents < $totalCents) {
                throw ValidationException::withMessages(['cashReceived' => ['Cash received is less than the order total.']]);
            }

            $order = Order::query()->create([
                'order_number' => 'PENDING-'.Str::uuid(),
                'ordered_at' => now(),
                'station_id' => $cashier->station_id,
                'cashier_id' => $cashier->id,
                'payment_method' => 'cash',
                'total_amount' => $this->formatFixed($totalCents, 2),
                'cash_received' => $this->formatFixed($cashCents, 2),
                'change_amount' => $this->formatFixed($cashCents - $totalCents, 2),
            ]);
            $order->forceFill(['order_number' => 'ORD-'.$order->ordered_at->format('Ymd').'-'.str_pad((string) $order->id, 6, '0', STR_PAD_LEFT)])->save();

            foreach ($lines as $line) {
                $stationItem = $line['stationItem'];
                $order->orderItems()->create([
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
            }

            return $order->load(['station', 'cashier', 'orderItems']);
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
