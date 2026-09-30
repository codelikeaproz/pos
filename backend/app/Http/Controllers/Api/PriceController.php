<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePriceRequest;
use App\Http\Resources\PriceResource;
use App\Models\Item;
use App\Models\Price;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PriceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'item_id' => ['nullable', 'integer', 'exists:items,id'],
        ]);
        $search = trim($validated['search'] ?? '');
        $prices = Price::query()->with('item')
            ->when(isset($validated['item_id']), fn ($query) => $query->where('item_id', $validated['item_id']))
            ->when($search !== '', fn ($query) => $query->whereHas('item', fn ($items) => $items
                ->where('name', 'like', "%{$search}%")
                ->orWhere('item_code', 'like', "%{$search}%")))
            ->orderByDesc('created_at')->orderByDesc('id')->paginate(10)->withQueryString();

        return PriceResource::collection($prices)->response();
    }

    public function options(Request $request): JsonResponse
    {
        $validated = $request->validate(['search' => ['nullable', 'string', 'max:100']]);
        $search = trim($validated['search'] ?? '');

        return response()->json(['items' => Item::query()
            ->when($search !== '', fn ($query) => $query->where(fn ($items) => $items
                ->where('item_code', 'like', "%{$search}%")->orWhere('name', 'like', "%{$search}%")))
            ->orderBy('name')->orderBy('item_code')->limit(50)->get(['id', 'item_code', 'name'])]);
    }

    public function store(StorePriceRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $price = DB::transaction(function () use ($validated) {
            $item = Item::query()->whereKey($validated['item_id'])->lockForUpdate()->firstOrFail();
            $active = $item->prices()->where('is_active', true)->limit(2)->get();
            if ($active->count() > 1) {
                abort(409, 'This item has conflicting active prices. Resolve its price history before adding another.');
            }
            $amount = number_format((float) $validated['amount'], 2, '.', '');
            if ($active->count() === 1 && $active->first()->amount === $amount) {
                throw ValidationException::withMessages(['amount' => ['This is already the active price for this item.']]);
            }

            $item->prices()->where('is_active', true)->update(['is_active' => false]);

            return $item->prices()->create(['amount' => $amount, 'is_active' => true])->load('item');
        });

        return response()->json(['message' => 'Price added and activated.', 'price' => (new PriceResource($price))->resolve()], 201);
    }

    public function activate(Price $price): JsonResponse
    {
        $activePrice = DB::transaction(function () use ($price) {
            $item = Item::query()->whereKey($price->item_id)->lockForUpdate()->firstOrFail();
            $target = $item->prices()->whereKey($price->id)->firstOrFail();
            $active = $item->prices()->where('is_active', true)->limit(2)->get();
            if ($active->count() > 1) {
                abort(409, 'This item has conflicting active prices. Resolve its price history before activating another.');
            }
            if ($target->is_active) {
                abort(409, 'This price is already active.');
            }

            $item->prices()->where('is_active', true)->update(['is_active' => false]);
            $target->update(['is_active' => true]);

            return $target->load('item');
        });

        return response()->json(['message' => 'Price activated.', 'price' => (new PriceResource($activePrice))->resolve()]);
    }
}
