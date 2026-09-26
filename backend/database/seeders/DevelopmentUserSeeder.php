<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Development-only users. Do not use these credentials in production.
 *
 * Admin:    admin@example.com / password
 * End User: operator@example.com / password
 */
class DevelopmentUserSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('password'),
                'role' => UserRole::Admin,
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'operator@example.com'],
            [
                'name' => 'POS Operator',
                'password' => Hash::make('password'),
                'role' => UserRole::EndUser,
            ]
        );
    }
}
