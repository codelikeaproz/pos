<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSpoilageRequest;
use App\Http\Resources\SpoilageResource;
use App\Models\InventoryMovement;
use App\Models\Item;
use App\Models\Spoilage;
use App\Models\Station;
use App\Models\StationItem;
use Carbon\CarbonImmutable;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SpoilageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'station_id' => ['nullable', 'integer', 'exists:stations,id'],
        ]);
        $search = trim($validated['search'] ?? '');
        $spoilages = Spoilage::query()->with(['station', 'recordedBy'])->withCount('items')
            ->when(isset($validated['station_id']), fn ($query) => $query->where('station_id', $validated['station_id']))
            ->when($search !== '', fn ($query) => $query->where(fn ($matches) => $matches
                ->where('spoilage_number', 'like', "%{$search}%")
                ->orWhere('reason', 'like', "%{$search}%")
                ->orWhereHas('station', fn ($station) => $station->where('name', 'like', "%{$search}%"))
                ->orWhereHas('recordedBy', fn ($user) => $user->where('name', 'like', "%{$search}%"))))
            ->orderByDesc('spoiled_at')->orderByDesc('id')->paginate(10)->withQueryString();

        return SpoilageResource::collection($spoilages)->response();
    }

    public function options(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'station_id' => ['nullable', 'integer', 'exists:stations,id'],
            'item_search' => ['nullable', 'string', 'max:100'],
        ]);
        $search = trim($validated['item_search'] ?? '');
        $stock = isset($validated['station_id']) ? StationItem::query()->with('item')
            ->where('station_items.station_id', $validated['station_id'])->where('station_items.quantity', '>', 0)
            ->when($search !== '', fn ($query) => $query->whereHas('item', fn ($item) => $item
                ->where('name', 'like', "%{$search}%")->orWhere('item_code', 'like', "%{$search}%")))
            ->join('items', 'items.id', '=', 'station_items.item_id')
            ->select('station_items.*')->orderBy('items.name')->limit(50)->get() : collect();

        return response()->json([
            'stations' => Station::query()->orderBy('name')->get(['id', 'name']),
            'items' => $stock->map(fn ($row) => [
                'id' => $row->item_id,
                'itemCode' => $row->item->item_code,
                'name' => $row->item->name,
                'unit' => $row->item->units_backup,
                'available' => $row->quantity,
            ]),
        ]);
    }

    public function show(Request $request, Spoilage $spoilage): JsonResponse
    {
        return response()->json(['spoilage' => (new SpoilageResource($spoilage->load(['station', 'recordedBy', 'items'])->loadCount('items')))->resolve($request)]);
    }

    public function store(StoreSpoilageRequest $request): JsonResponse
    {
        $data = $request->validated();
        $spoilage = DB::transaction(function () use ($request, $data) {
            $incidentDate = $data['incidentDate'] ?? CarbonImmutable::now('Asia/Manila')->toDateString();
            $requested = collect($data['items'])->sortBy('itemId')->values();
            // Match checkout and Delivery: lock StationItem rows in Item order before Item rows.
            $stock = StationItem::query()->where('station_id', $data['stationId'])
                ->whereIn('item_id', $requested->pluck('itemId'))->orderBy('item_id')->lockForUpdate()->get()->keyBy('item_id');
            if ($stock->count() !== $requested->count()) {
                throw ValidationException::withMessages(['items' => ['Every Item must be assigned to the selected Station.']]);
            }
            $items = Item::query()->whereIn('id', $requested->pluck('itemId'))
                ->orderBy('id')->lockForUpdate()->get()->keyBy('id');

            $shortages = [];
            foreach ($requested as $line) {
                $available = self::toThousandths($stock->get($line['itemId'])->quantity);
                if (self::toThousandths((string) $line['quantity']) > $available) {
                    $shortages[] = ['itemId' => $line['itemId'], 'available' => $stock->get($line['itemId'])->quantity];
                }
            }
            if ($shortages !== []) {
                throw new HttpResponseException(response()->json([
                    'message' => 'Available inventory changed. Review the spoilage quantities and submit again.',
                    'currentStock' => $shortages,
                ], 409));
            }

            $spoilage = Spoilage::query()->create([
                'spoilage_number' => 'PENDING-'.Str::random(24),
                'station_id' => $data['stationId'],
                'recorded_by_id' => $request->user()->id,
                'reason' => $data['reason'] ?? null,
                'spoiled_at' => isset($data['incidentDate'])
                    ? CarbonImmutable::createFromFormat('!Y-m-d', $incidentDate, 'Asia/Manila')->utc()
                    : now(),
            ]);
            $spoilage->update(['spoilage_number' => 'SPL'.str_replace('-', '', $incidentDate).str_pad((string) $spoilage->id, 6, '0', STR_PAD_LEFT)]);

            foreach ($requested as $line) {
                $item = $items->get($line['itemId']);
                $balance = $stock->get($line['itemId']);
                $quantity = self::toThousandths((string) $line['quantity']);
                $detail = $spoilage->items()->create([
                    'item_id' => $item->id,
                    'quantity' => self::fromThousandths($quantity),
                    'item_code' => $item->item_code,
                    'item_name' => $item->name,
                    'unit' => $item->units_backup,
                ]);
                $balance->update(['quantity' => self::fromThousandths(self::toThousandths($balance->quantity) - $quantity)]);
                InventoryMovement::query()->create([
                    'station_item_id' => $balance->id,
                    'item_id' => $item->id,
                    'quantity_change' => '-'.self::fromThousandths($quantity),
                    'type' => 'SPOILAGE',
                    'reference_type' => 'spoilage_item',
                    'reference_id' => $detail->id,
                    'actor_id' => $request->user()->id,
                ]);
            }

            return $spoilage->load(['station', 'recordedBy', 'items'])->loadCount('items');
        });

        return response()->json(['message' => 'Spoilage recorded.', 'spoilage' => (new SpoilageResource($spoilage))->resolve($request)], 201);
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
