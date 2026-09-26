<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class HealthController extends Controller
{
    /**
     * Simple API availability check.
     * Does not depend on business modules or database connectivity.
     */
    public function show(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'application' => 'University HomeStay POS API',
        ]);
    }
}
