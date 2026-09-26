<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case EndUser = 'end_user';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Admin',
            self::EndUser => 'End User',
        };
    }
}
