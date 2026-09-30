<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreItemDeliveryRequest;
use App\Http\Resources\ItemDeliveryResource;
use App\Models\InventoryMovement;
use App\Models\Item;
use App\Models\ItemDelivery;
use App\Models\Station;
use App\Models\StationItem;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ItemDeliveryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'station_id' => ['nullable', 'integer', 'exists:stations,id'],
        ]);
        $search = trim($validated['search'] ?? '');
        $deliveries = ItemDelivery::query()->with(['station', 'deliveredBy', 'receivedBy'])->withCount('items')
            ->when(isset($validated['station_id']), fn ($query) => $query->where('station_id', $validated['station_id']))
            ->when($search !== '', fn ($query) => $query->where(fn ($matches) => $matches
                ->where('delivery_number', 'like', "%{$search}%")
                ->orWhereHas('station', fn ($station) => $station->where('name', 'like', "%{$search}%"))
                ->orWhereHas('deliveredBy', fn ($user) => $user->where('name', 'like', "%{$search}%"))
                ->orWhereHas('receivedBy', fn ($user) => $user->where('name', 'like', "%{$search}%"))))
            ->orderByDesc('delivered_at')->orderByDesc('id')->paginate(10)->withQueryString();

        return ItemDeliveryResource::collection($deliveries)->response();
    }

    public function options(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'station_id' => ['nullable', 'integer', 'exists:stations,id'],
            'item_search' => ['nullable', 'string', 'max:100'],
        ]);
        $search = trim($validated['item_search'] ?? '');

        return response()->json([
            'stations' => Station::query()->orderBy('name')->get(['id', 'name']),
            'receivers' => isset($validated['station_id']) ? User::query()->where('role', UserRole::EndUser->value)
                ->where('station_id', $validated['station_id'])->orderBy('name')->get(['id', 'name', 'email']) : [],
            'items' => Item::query()->where('is_active', true)
                ->when($search !== '', fn ($query) => $query->where(fn ($matches) => $matches
                    ->where('name', 'like', "%{$search}%")->orWhere('item_code', 'like', "%{$search}%")))
                ->orderBy('name')->limit(50)->get(['id', 'item_code', 'name', 'units_backup']),
        ]);
    }

    public function show(Request $request, ItemDelivery $itemDelivery): JsonResponse
    {
        return response()->json(['delivery' => (new ItemDeliveryResource($itemDelivery->load(['station', 'deliveredBy', 'receivedBy', 'items'])->loadCount('items')))->resolve($request)]);
    }

    public function store(StoreItemDeliveryRequest $request): JsonResponse
    {
        $data = $request->validated();
        $delivery = DB::transaction(function () use ($request, $data) {
            // All deliveries to a Station lock it first, including first-time Item assignments.
            $station = Station::query()->whereKey($data['stationId'])->lockForUpdate()->firstOrFail();
            $receiver = User::query()->whereKey($data['receivedById'])->lockForUpdate()->firstOrFail();
            if ($receiver->role !== UserRole::EndUser || $receiver->station_id !== $station->id) {
                throw ValidationException::withMessages(['receivedById' => ['Select an End User assigned to this Station.']]);
            }

            $requested = collect($data['items'])->sortBy('itemId')->values();
            // Match checkout's lock order: StationItem rows before Item rows.
            $stockByItem = StationItem::query()->where('station_id', $station->id)
                ->whereIn('item_id', $requested->pluck('itemId'))->orderBy('item_id')->lockForUpdate()->get()->keyBy('item_id');
            $items = Item::query()->whereIn('id', $requested->pluck('itemId'))->orderBy('id')->lockForUpdate()->get()->keyBy('id');
            if ($items->count() !== $requested->count() || $items->contains(fn ($item) => ! $item->is_active)) {
                throw ValidationException::withMessages(['items' => ['All delivery items must be active.']]);
            }

            $delivery = ItemDelivery::query()->create([
                'delivery_number' => 'PENDING-'.Str::uuid(),
                'station_id' => $station->id,
                'delivered_by_id' => $request->user()->id,
                'received_by_id' => $receiver->id,
                'delivered_at' => now(),
            ]);
            $delivery->update(['delivery_number' => 'DEL-'.$delivery->delivered_at->format('Ymd').'-'.str_pad((string) $delivery->id, 6, '0', STR_PAD_LEFT)]);

            foreach ($requested as $line) {
                $item = $items->get($line['itemId']);
                $quantity = self::toThousandths((string) $line['quantity']);
                $detail = $delivery->items()->create([
                    'item_id' => $item->id,
                    'item_code' => $item->item_code,
                    'item_name' => $item->name,
                    'unit' => $item->units_backup,
                    'quantity' => $line['quantity'],
                ]);
                $stock = $stockByItem->get($item->id);
                if ($stock) {
                    $newQuantity = self::toThousandths($stock->quantity) + $quantity;
                    if ($newQuantity > 999999999999) {
                        throw ValidationException::withMessages(['items' => ['Station stock would exceed the supported quantity.']]);
                    }
                    $stock->update(['quantity' => self::fromThousandths($newQuantity)]);
                } else {
                    $stock = StationItem::query()->create(['station_id' => $station->id, 'item_id' => $item->id, 'quantity' => self::fromThousandths($quantity)]);
                }
                InventoryMovement::query()->create([
                    'station_item_id' => $stock->id,
                    'item_id' => $item->id,
                    'quantity_change' => self::fromThousandths($quantity),
                    'type' => 'DELIVERY',
                    'reference_type' => 'item_delivery_item',
                    'reference_id' => $detail->id,
                    'actor_id' => $request->user()->id,
                ]);
            }

            return $delivery->load(['station', 'deliveredBy', 'receivedBy', 'items'])->loadCount('items');
        });

        return response()->json(['message' => 'Items delivered successfully.', 'delivery' => (new ItemDeliveryResource($delivery))->resolve($request)], 201);
    }

    private static function toThousandths(string $value): int
    {
        [$whole, $fraction] = array_pad(explode('.', $value, 2), 2, '');

        return (int) $whole * 1000 + (int) str_pad($fraction, 3, '0');
    }

    private static function fromThousandths(int $value): string
    {
        return intdiv($value, 1000).'.'.str_pad((string) ($value % 1000), 3, '0', STR_PAD_LEFT);
    }
}
