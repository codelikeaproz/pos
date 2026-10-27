<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case EndUser = 'cashier';
    case Accounting = 'accounting';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Admin',
            self::EndUser => 'Cashier',
            self::Accounting => 'Accounting',
        };
    }
}
