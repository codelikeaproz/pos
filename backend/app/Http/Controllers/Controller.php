<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

abstract class Controller
{
    protected function pageSize(Request $request, int $default = 10): int
    {
        $validated = $request->validate([
            'per_page' => ['nullable', 'integer', 'in:10,15,20,50,100'],
        ]);

        return (int) ($validated['per_page'] ?? $default);
    }
}
