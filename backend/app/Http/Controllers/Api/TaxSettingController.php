<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateTaxSettingRequest;
use App\Models\TaxSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class TaxSettingController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json(['taxSetting' => $this->data(TaxSetting::query()->findOrFail(1))]);
    }

    public function update(UpdateTaxSettingRequest $request): JsonResponse
    {
        $setting = DB::transaction(function () use ($request) {
            $setting = TaxSetting::query()->lockForUpdate()->findOrFail(1);
            $setting->update([
                'tax_status' => $request->validated('taxStatus'),
                'vat_rate' => number_format((float) $request->validated('vatRate'), 2, '.', ''),
                'updated_by_id' => $request->user()->id,
            ]);

            return $setting;
        });

        return response()->json(['message' => 'Tax Configuration saved.', 'taxSetting' => $this->data($setting->fresh())]);
    }

    /** @return array<string, mixed> */
    private function data(TaxSetting $setting): array
    {
        return [
            'taxStatus' => $setting->tax_status->value,
            'vatRate' => $setting->vat_rate,
            'vatCalculationActive' => false,
            'updatedAt' => $setting->updated_at->toISOString(),
        ];
    }
}
