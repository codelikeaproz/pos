<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ConsigneeController;
use App\Http\Controllers\Api\ConsignmentAccountController;
use App\Http\Controllers\Api\CreditMonitoringController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\ItemDeliveryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PosCheckoutController;
use App\Http\Controllers\Api\PosItemController;
use App\Http\Controllers\Api\PriceController;
use App\Http\Controllers\Api\PrivilegeAssignmentController;
use App\Http\Controllers\Api\PrivilegeController;
use App\Http\Controllers\Api\SaleRemittanceController;
use App\Http\Controllers\Api\SpoilageController;
use App\Http\Controllers\Api\StationController;
use App\Http\Controllers\Api\StationItemController;
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
    Route::get('/pos/station-inventory', [PosItemController::class, 'stationInventory']);
    Route::post('/pos/checkout', [PosCheckoutController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::get('/pos/or-transactions', [OrderController::class, 'posOrTransactions']);
    Route::get('/pos/or-transactions/{order}', [OrderController::class, 'posOrTransaction']);
    Route::get('/or-transactions', [OrderController::class, 'orTransactions'])->middleware('admin');
    Route::get('/or-transactions/{order}', [OrderController::class, 'orTransaction'])->middleware('admin');

    Route::get('/employee-options', [UserController::class, 'options'])->middleware('admin');

    Route::apiResource('users', UserController::class)
        ->middleware('admin');

    Route::apiResource('stations', StationController::class)
        ->middleware('admin');

    Route::apiResource('items', ItemController::class)
        ->middleware('admin');

    Route::get('/customers', [CustomerController::class, 'index']);
    Route::post('/customers', [CustomerController::class, 'store'])->middleware('admin');
    Route::get('/credit-monitoring', [CreditMonitoringController::class, 'index'])->middleware('admin');

    Route::get('/item-delivery-options', [ItemDeliveryController::class, 'options'])->middleware('admin');
    Route::get('/item-deliveries', [ItemDeliveryController::class, 'index'])->middleware('admin');
    Route::post('/item-deliveries', [ItemDeliveryController::class, 'store'])->middleware('admin');
    Route::get('/item-deliveries/{itemDelivery}', [ItemDeliveryController::class, 'show'])->middleware('admin');

    Route::get('/spoilage-options', [SpoilageController::class, 'options'])->middleware('admin');
    Route::get('/spoilages', [SpoilageController::class, 'index'])->middleware('admin');
    Route::post('/spoilages', [SpoilageController::class, 'store'])->middleware('admin');
    Route::get('/spoilages/{spoilage}', [SpoilageController::class, 'show'])->middleware('admin');

    Route::get('/prices', [PriceController::class, 'index'])->middleware('admin');
    Route::post('/prices', [PriceController::class, 'store'])->middleware('admin');
    Route::post('/prices/{price}/activate', [PriceController::class, 'activate'])->middleware('admin');
    Route::get('/price-item-options', [PriceController::class, 'options'])->middleware('admin');
    Route::get('/sale-remittances', [SaleRemittanceController::class, 'index'])->middleware('admin');
    Route::post('/sale-remittances', [SaleRemittanceController::class, 'store'])->middleware('admin');

    Route::get('/privileges', [PrivilegeController::class, 'index'])->middleware('admin');
    Route::post('/privileges', [PrivilegeController::class, 'store'])->middleware('admin');
    Route::match(['put', 'patch'], '/privileges/{privilege}', [PrivilegeController::class, 'update'])->middleware('admin');
    Route::get('/privilege-assignments', [PrivilegeAssignmentController::class, 'index'])->middleware('admin');
    Route::put('/privilege-assignments/{user}', [PrivilegeAssignmentController::class, 'update'])->middleware('admin');

    Route::apiResource('consignees', ConsigneeController::class)
        ->middleware('admin');

    Route::get('/consignment-account-options', [ConsignmentAccountController::class, 'options'])->middleware('admin');
    Route::apiResource('consignment-accounts', ConsignmentAccountController::class)
        ->parameters(['consignment-accounts' => 'user'])->middleware('admin');

    Route::get('/station-item-options', [StationItemController::class, 'options'])->middleware('admin');
    Route::apiResource('station-items', StationItemController::class)->middleware('admin');
});
