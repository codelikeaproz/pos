<?php

use App\Http\Controllers\Api\AccountingDashboardController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CreditMonitoringController;
use App\Http\Controllers\Api\CreditPaymentController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\ItemDeliveryController;
use App\Http\Controllers\Api\MonthlyEndReportController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PosCheckoutController;
use App\Http\Controllers\Api\PosItemController;
use App\Http\Controllers\Api\PriceController;
use App\Http\Controllers\Api\PrivilegeAssignmentController;
use App\Http\Controllers\Api\PrivilegeController;
use App\Http\Controllers\Api\SaleRemittanceController;
use App\Http\Controllers\Api\SalesReportController;
use App\Http\Controllers\Api\SpoilageController;
use App\Http\Controllers\Api\StationController;
use App\Http\Controllers\Api\StationItemController;
use App\Http\Controllers\Api\TaxSettingController;
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
    Route::patch('/current-user', [AuthController::class, 'updateProfile']);
    Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('admin');
    Route::get('/accounting-dashboard', [AccountingDashboardController::class, 'index'])->middleware('role:admin,accounting');
    Route::get('/monthly-end-reports', [MonthlyEndReportController::class, 'index'])->middleware('admin');
    Route::post('/monthly-end-reports', [MonthlyEndReportController::class, 'store'])->middleware('admin');
    Route::get('/monthly-end-reports/{monthlyEndReport}', [MonthlyEndReportController::class, 'show'])->middleware('admin');
    Route::put('/monthly-end-reports/{monthlyEndReport}/physical-counts', [MonthlyEndReportController::class, 'updateCounts'])->middleware('admin');
    Route::post('/monthly-end-reports/{monthlyEndReport}/finalize', [MonthlyEndReportController::class, 'finalize'])->middleware('admin');
    Route::post('/monthly-end-reports/{monthlyEndReport}/reconcile', [MonthlyEndReportController::class, 'reconcile'])->middleware('admin');
    Route::get('/monthly-end-reports/{monthlyEndReport}/export', [MonthlyEndReportController::class, 'export'])->middleware('admin');
    Route::get('/reports/sales', [SalesReportController::class, 'index'])->middleware('role:admin,accounting');
    Route::get('/reports/sales/export', [SalesReportController::class, 'export'])->middleware('role:admin,accounting');
    Route::get('/reports/sales/{order}', [SalesReportController::class, 'show'])->middleware('role:admin,accounting');
    Route::get('/tax-settings', [TaxSettingController::class, 'show'])->middleware('admin');
    Route::put('/tax-settings', [TaxSettingController::class, 'update'])->middleware('admin');

    Route::get('/pos/items', [PosItemController::class, 'index'])->middleware('role:admin,cashier');
    Route::get('/pos/station-inventory', [PosItemController::class, 'stationInventory'])->middleware('role:admin,cashier');
    Route::post('/pos/checkout', [PosCheckoutController::class, 'store'])->middleware('role:admin,cashier');
    Route::get('/orders', [OrderController::class, 'index'])->middleware('role:admin,cashier');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->middleware('role:admin,cashier');
    Route::get('/pos/or-transactions', [OrderController::class, 'posOrTransactions'])->middleware('role:admin,cashier');
    Route::get('/pos/or-transactions/{order}', [OrderController::class, 'posOrTransaction'])->middleware('role:admin,cashier');
    Route::get('/or-transactions', [OrderController::class, 'orTransactions'])->middleware('role:admin,accounting');
    Route::get('/or-transactions/{order}', [OrderController::class, 'orTransaction'])->middleware('role:admin,accounting');

    Route::get('/employee-options', [UserController::class, 'options'])->middleware('admin');
    Route::patch('/users/{user}/status', [UserController::class, 'updateStatus'])->middleware('admin');

    Route::apiResource('users', UserController::class)
        ->except('destroy')
        ->middleware('admin');

    Route::apiResource('stations', StationController::class)
        ->middleware('admin');

    Route::apiResource('items', ItemController::class)
        ->middleware('admin');

    Route::get('/customers', [CustomerController::class, 'index'])->middleware('role:admin,cashier,accounting');
    Route::post('/customers', [CustomerController::class, 'store'])->middleware('role:admin,accounting');
    Route::put('/customers/{customer}', [CustomerController::class, 'update'])->middleware('role:admin,accounting');
    Route::patch('/customers/{customer}/status', [CustomerController::class, 'updateStatus'])->middleware('role:admin,accounting');
    Route::get('/credit-monitoring', [CreditMonitoringController::class, 'index'])->middleware('role:admin,accounting');
    Route::get('/credit-orders/{order}', [CreditMonitoringController::class, 'show'])->middleware('role:admin,accounting');
    Route::post('/credit-orders/{order}/payments', [CreditPaymentController::class, 'store'])->middleware('role:admin,accounting');

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
    Route::get('/sale-remittances', [SaleRemittanceController::class, 'index'])->middleware('role:admin,accounting');
    Route::post('/sale-remittances', [SaleRemittanceController::class, 'store'])->middleware('role:admin,accounting');

    Route::get('/privileges', [PrivilegeController::class, 'index'])->middleware('admin');
    Route::post('/privileges', [PrivilegeController::class, 'store'])->middleware('admin');
    Route::match(['put', 'patch'], '/privileges/{privilege}', [PrivilegeController::class, 'update'])->middleware('admin');
    Route::get('/privilege-assignments', [PrivilegeAssignmentController::class, 'index'])->middleware('admin');
    Route::put('/privilege-assignments/{user}', [PrivilegeAssignmentController::class, 'update'])->middleware('admin');

    Route::get('/station-item-options', [StationItemController::class, 'options'])->middleware('admin');
    Route::apiResource('station-items', StationItemController::class)->middleware('admin');
});
