<?php

namespace App\Enums;

enum TaxStatus: string
{
    case NonVat = 'NON_VAT';
    case VatRegistered = 'VAT_REGISTERED';
}
