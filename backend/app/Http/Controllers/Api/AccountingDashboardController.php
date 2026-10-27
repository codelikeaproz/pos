<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CreditPayment;
use App\Models\Customer;
use App\Models\Order;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;

class AccountingDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $paid = '(SELECT COALESCE(SUM(amount), 0) FROM credit_payments WHERE credit_payments.order_id = orders.id)';
        $credit = Order::query()->where('payment_method', 'credit');
        $today = CarbonImmutable::now('Asia/Manila')->startOfDay();
        $startToday = $today->utc();
        $endToday = $today->addDay()->utc();
        $startMonth = $today->startOfMonth()->utc();

        return response()->json(['summary' => [
            'totalCreditSales' => $this->money((clone $credit)->sum('total_amount')),
            'unpaidCredit' => $this->money((clone $credit)->whereRaw("{$paid} = 0")->selectRaw("COALESCE(SUM(total_amount - {$paid}), 0) AS amount")->value('amount')),
            'partiallyPaidCredit' => $this->money((clone $credit)->whereRaw("{$paid} > 0 AND {$paid} < orders.total_amount")->selectRaw("COALESCE(SUM(total_amount - {$paid}), 0) AS amount")->value('amount')),
            'paidCredit' => (clone $credit)->whereRaw("{$paid} >= orders.total_amount")->count(),
            'collectionsToday' => $this->money(CreditPayment::query()->where('paid_at', '>=', $startToday)->where('paid_at', '<', $endToday)->sum('amount')),
            'collectionsThisMonth' => $this->money(CreditPayment::query()->where('paid_at', '>=', $startMonth)->where('paid_at', '<', $endToday)->sum('amount')),
            'totalCustomers' => Customer::query()->where('is_active', true)->count(),
            'customersWithOutstandingBalance' => Customer::query()->whereHas('orders', fn ($query) => $query->where('payment_method', 'credit')->whereRaw("orders.total_amount > {$paid}"))->count(),
        ]]);
    }

    private function money(mixed $value): string
    {
        return number_format((float) $value, 2, '.', '');
    }
}
