<?php

namespace Tests\Feature;

use App\Http\Requests\CheckoutOrderRequest;
use App\Http\Requests\ReconcileMonthlyEndItemsRequest;
use App\Http\Requests\StoreItemDeliveryRequest;
use App\Http\Requests\StoreSaleRemittanceRequest;
use App\Http\Requests\StoreSpoilageRequest;
use App\Http\Requests\UpdateMonthlyEndCountsRequest;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class BatchLimitValidationTest extends TestCase
{
    public function test_write_batches_allow_one_hundred_rows_and_reject_one_hundred_one(): void
    {
        foreach ([
            [CheckoutOrderRequest::class, 'items'],
            [StoreItemDeliveryRequest::class, 'items'],
            [StoreSpoilageRequest::class, 'items'],
            [UpdateMonthlyEndCountsRequest::class, 'counts'],
            [ReconcileMonthlyEndItemsRequest::class, 'itemIds'],
            [StoreSaleRemittanceRequest::class, 'order_ids'],
        ] as [$requestClass, $field]) {
            $rules = (new $requestClass)->rules()[$field];

            $this->assertFalse(Validator::make([$field => array_fill(0, 100, 1)], [$field => $rules])->fails());
            $this->assertTrue(Validator::make([$field => array_fill(0, 101, 1)], [$field => $rules])->fails());
        }
    }
}
