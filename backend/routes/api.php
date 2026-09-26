<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HealthController;
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

    Route::apiResource('users', UserController::class)
        ->middleware('admin');
});
