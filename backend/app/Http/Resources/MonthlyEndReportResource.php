<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

class MonthlyEndReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $items = $this->whenLoaded('items');
        $summary = ['totalItems' => 0, 'matched' => 0, 'short' => 0, 'over' => 0, 'uncounted' => 0];
        if ($items instanceof Collection) {
            $summary['totalItems'] = $items->count();
            foreach ($items as $item) {
                if ($item->physical_count === null) {
                    $summary['uncounted']++;
                } else {
                    $difference = self::toCents($item->physical_count) - self::toCents($item->system_count);
                    $summary[$difference < 0 ? 'short' : ($difference > 0 ? 'over' : 'matched')]++;
                }
            }
        }

        return [
            'id' => $this->id,
            'reportMonth' => $this->report_month,
            'reportYear' => $this->report_year,
            'status' => $this->status,
            'station' => ['id' => $this->station->id, 'name' => $this->station->name],
            'createdBy' => ['id' => $this->createdBy->id, 'name' => $this->createdBy->name],
            'createdAt' => $this->created_at->toISOString(),
            'finalizedBy' => $this->finalizedBy ? ['id' => $this->finalizedBy->id, 'name' => $this->finalizedBy->name] : null,
            'finalizedAt' => $this->finalized_at?->toISOString(),
            'summary' => $summary,
            'items' => $this->whenLoaded('items', fn () => $items->map(function ($item) {
                $variance = $item->physical_count === null ? null : self::toCents($item->physical_count) - self::toCents($item->system_count);

                return [
                    'id' => $item->id,
                    'itemId' => $item->item_id,
                    'itemCode' => $item->item_code_snapshot,
                    'itemName' => $item->item_name_snapshot,
                    'unit' => $item->unit_snapshot,
                    'systemCount' => $item->system_count,
                    'physicalCount' => $item->physical_count,
                    'variance' => $variance === null ? null : self::fromCents($variance),
                    'result' => $variance === null ? 'UNCOUNTED' : ($variance < 0 ? 'SHORT' : ($variance > 0 ? 'OVER' : 'MATCH')),
                ];
            })),
        ];
    }

    private static function toCents(string $value): int
    {
        [$whole, $fraction] = array_pad(explode('.', $value, 2), 2, '');

        return (int) $whole * 100 + (int) str_pad($fraction, 2, '0');
    }

    private static function fromCents(int $value): string
    {
        $sign = $value < 0 ? '-' : '';
        $absolute = abs($value);

        return $sign.intdiv($absolute, 100).'.'.str_pad((string) ($absolute % 100), 2, '0', STR_PAD_LEFT);
    }
}
