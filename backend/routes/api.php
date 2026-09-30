<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ConsigneeController;
use App\Http\Controllers\Api\ConsignmentAccountController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PosCheckoutController;
use App\Http\Controllers\Api\PosItemController;
use App\Http\Controllers\Api\PriceController;
use App\Http\Controllers\Api\StationController;
use App\Http\Controllers\Api\StationItemController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Prefix: /api (Laravel default)
| Versioning: unversioned for now — do not introduce /api/v1 until required.
|
| Public: /api/health, /api/login
| Protected (Sanctum): /api/logout, /api/current-user
|
*/

Route::get('/health', [HealthController::class, 'show']);

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:login');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/current-user', [AuthController::class, 'currentUser']);

    Route::get('/pos/items', [PosItemController::class, 'index']);
    Route::post('/pos/checkout', [PosCheckoutController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);

    Route::get('/employee-options', [UserController::class, 'options'])->middleware('admin');

    Route::apiResource('users', UserController::class)
        ->middleware('admin');

    Route::apiResource('stations', StationController::class)
        ->middleware('admin');

    Route::apiResource('suppliers', SupplierController::class)
        ->middleware('admin');

    Route::apiResource('items', ItemController::class)
        ->middleware('admin');

    Route::get('/prices', [PriceController::class, 'index'])->middleware('admin');
    Route::post('/prices', [PriceController::class, 'store'])->middleware('admin');
    Route::post('/prices/{price}/activate', [PriceController::class, 'activate'])->middleware('admin');
    Route::get('/price-item-options', [PriceController::class, 'options'])->middleware('admin');

    Route::apiResource('consignees', ConsigneeController::class)
        ->middleware('admin');

    Route::get('/consignment-account-options', [ConsignmentAccountController::class, 'options'])->middleware('admin');
    Route::apiResource('consignment-accounts', ConsignmentAccountController::class)
        ->parameters(['consignment-accounts' => 'user'])->middleware('admin');

    Route::get('/station-item-options', [StationItemController::class, 'options'])->middleware('admin');
    Route::apiResource('station-items', StationItemController::class)->middleware('admin');
});
