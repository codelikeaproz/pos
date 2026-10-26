<?php

namespace App\Services;

use App\Models\MonthlyEndReport;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\File;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Common\Entity\Style\Style;
use OpenSpout\Writer\AutoFilter;
use OpenSpout\Writer\XLSX\Entity\SheetView;
use OpenSpout\Writer\XLSX\Options;
use OpenSpout\Writer\XLSX\Writer;

class ReportExportService
{
    private const MONEY_FORMAT = '₱#,##0.00';

    private const QUANTITY_FORMAT = '#,##0.00';

    public function sales(iterable $orders, object $summary, array $context, int $orderCount): string
    {
        $path = $this->path('sales-report');
        $options = new Options;
        $options->mergeCells(0, 1, 8, 1);
        $options->mergeCells(0, 2, 8, 2);
        $writer = new Writer($options);
        $writer->openToFile($path);
        $sheet = $writer->getCurrentSheet()->setName('Sales Report');
        $sheet->setColumnWidth(13, 1, 2);
        $sheet->setColumnWidth(22, 3, 4);
        $sheet->setColumnWidth(18, 5, 6, 7);
        $sheet->setColumnWidth(16, 8, 9);

        $writer->addRow(Row::fromValues(['University HomeStay POS'], $this->titleStyle()));
        $writer->addRow(Row::fromValues(['Sales Report'], $this->subtitleStyle()));
        $writer->addRow(Row::fromValues([]));
        foreach ([
            ['Period', "{$context['from']} – {$context['to']}"],
            ['Station', $context['station']],
            ['Payment Method', $context['payment']],
            ...($context['search'] === '' ? [] : [['Search', $context['search']]]),
            ['Generated', $this->manilaNow()],
        ] as $metadata) {
            $writer->addRow(Row::fromValuesWithStyles($metadata, null, [0 => $this->labelStyle()]));
        }
        $writer->addRow(Row::fromValues([]));
        $money = $this->moneyStyle();
        foreach ([
            ['Total Sales', (float) $summary->total_sales, $money],
            ['Transactions', (int) $summary->transactions, null],
            ['Cash Sales', (float) $summary->cash_sales, $money],
            ['Credit / Utang', (float) $summary->credit_sales, $money],
            ['Senior Discounts', (float) $summary->senior_discounts, $money],
        ] as [$label, $value, $style]) {
            $writer->addRow(Row::fromValuesWithStyles([$label, $value], null, [0 => $this->labelStyle(), 1 => $style ?? new Style]));
        }
        $writer->addRow(Row::fromValues([]));
        $headerRow = 15 + ($context['search'] === '' ? 0 : 1);
        $writer->addRow(Row::fromValues(['Date', 'Time', 'Order Number', 'Customer', 'Payment Method', 'Station', 'Cashier', 'Senior Discount', 'Total Amount'], $this->headerStyle()));
        $hasOrders = false;
        foreach ($orders as $order) {
            $hasOrders = true;
            $orderedAt = CarbonImmutable::instance($order->ordered_at)->setTimezone('Asia/Manila');
            $writer->addRow(Row::fromValuesWithStyles([
                $orderedAt, $orderedAt, $order->order_number, $order->customer?->name ?? 'Walk-in',
                $order->payment_method === 'credit' ? 'Credit / Utang' : 'Cash', $order->station->name,
                $order->cashier->name, (float) $order->discount_amount, (float) $order->total_amount,
            ], null, [0 => $this->dateStyle(), 1 => $this->timeStyle(), 7 => $money, 8 => $money]));
        }
        if (! $hasOrders) {
            $writer->addRow(Row::fromValues(['No sales transactions found for the selected filters.']));
        }
        $sheet->setAutoFilter(new AutoFilter(0, $headerRow, 8, max($headerRow, $headerRow + $orderCount)));
        $sheet->setSheetView((new SheetView)->setFreezeRow($headerRow + 1));
        $writer->close();

        return $path;
    }

    public function monthlyEnd(MonthlyEndReport $report): string
    {
        $path = $this->path('monthly-end-inventory');
        $options = new Options;
        $options->mergeCells(0, 1, 11, 1);
        $options->mergeCells(0, 2, 11, 2);
        $writer = new Writer($options);
        $writer->openToFile($path);
        $sheet = $writer->getCurrentSheet()->setName('Monthly End Inventory');
        $sheet->setColumnWidth(24, 1);
        $sheet->setColumnWidth(16, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12);

        $writer->addRow(Row::fromValues(['University HomeStay POS'], $this->titleStyle()));
        $writer->addRow(Row::fromValues(['Monthly End Inventory Report'], $this->subtitleStyle()));
        $writer->addRow(Row::fromValues([]));
        foreach ([
            ['Reporting Period', CarbonImmutable::create($report->report_year, $report->report_month)->format('F Y')],
            ['Station', $report->station->name], ['Status', 'Finalized'],
            ['Created By', $report->createdBy->name], ['Created At', $this->manila($report->created_at)],
            ['Finalized By', $report->finalizedBy->name], ['Finalized At', $this->manila($report->finalized_at)],
            ['Generated', $this->manilaNow()],
        ] as $metadata) {
            $writer->addRow(Row::fromValuesWithStyles($metadata, null, [0 => $this->labelStyle()]));
        }
        $writer->addRow(Row::fromValues([]));
        $counts = ['Matched' => 0, 'Short' => 0, 'Over' => 0];
        foreach ($report->items as $item) {
            $variance = round((float) $item->physical_count - (float) $item->system_count, 2);
            $counts[$variance < 0 ? 'Short' : ($variance > 0 ? 'Over' : 'Matched')]++;
        }
        foreach ([['Total Items', $report->items->count()], ...array_map(null, array_keys($counts), array_values($counts))] as [$label, $value]) {
            $writer->addRow(Row::fromValuesWithStyles([$label, $value], null, [0 => $this->labelStyle()]));
        }
        $writer->addRow(Row::fromValues([]));
        $headerRow = 18;
        $writer->addRow(Row::fromValues(['Item', 'Item Code', 'Unit', 'System Count', 'Physical Count', 'Variance', 'Result', 'Reconciliation Status', 'Adjustment', 'Reconciled By', 'Reconciled At', 'Movement Reference'], $this->headerStyle()));
        $quantity = $this->quantityStyle();
        foreach ($report->items as $item) {
            $variance = round((float) $item->physical_count - (float) $item->system_count, 2);
            $match = $variance === 0.0;
            $reconciled = $item->reconciled_at !== null;
            $writer->addRow(Row::fromValuesWithStyles([
                $item->item_name_snapshot, $item->item_code_snapshot, $item->unit_snapshot,
                (float) $item->system_count, (float) $item->physical_count, $variance,
                $variance < 0 ? 'Short' : ($variance > 0 ? 'Over' : 'Match'),
                $match ? 'No Adjustment Required' : ($reconciled ? 'Reconciled' : 'Pending Reconciliation'),
                $reconciled ? $variance : null, $item->reconciledBy?->name,
                $item->reconciled_at ? $this->manila($item->reconciled_at) : null,
                $item->reconciliation_movement_id ? 'Movement #'.$item->reconciliation_movement_id : null,
            ], null, [3 => $quantity, 4 => $quantity, 5 => $quantity, 8 => $quantity]));
        }
        $sheet->setAutoFilter(new AutoFilter(0, $headerRow, 11, $headerRow + $report->items->count()));
        $sheet->setSheetView((new SheetView)->setFreezeRow($headerRow + 1));
        $writer->close();

        return $path;
    }

    private function path(string $prefix): string
    {
        $directory = storage_path('app/private/exports');
        File::ensureDirectoryExists($directory);

        return $directory.'/'.$prefix.'-'.bin2hex(random_bytes(8)).'.xlsx';
    }

    private function titleStyle(): Style
    {
        return (new Style)->setFontBold()->setFontSize(16)->setFontColor('FFFFFF')->setBackgroundColor('00491E');
    }

    private function subtitleStyle(): Style
    {
        return (new Style)->setFontBold()->setFontSize(14)->setFontColor('00491E');
    }

    private function headerStyle(): Style
    {
        return (new Style)->setFontBold()->setFontColor('00491E')->setBackgroundColor('FFF2B3')->setShouldWrapText();
    }

    private function labelStyle(): Style
    {
        return (new Style)->setFontBold()->setFontColor('00491E');
    }

    private function moneyStyle(): Style
    {
        return (new Style)->setFormat(self::MONEY_FORMAT);
    }

    private function quantityStyle(): Style
    {
        return (new Style)->setFormat(self::QUANTITY_FORMAT);
    }

    private function dateStyle(): Style
    {
        return (new Style)->setFormat('mm/dd/yyyy');
    }

    private function timeStyle(): Style
    {
        return (new Style)->setFormat('hh:mm AM/PM');
    }

    private function manilaNow(): string
    {
        return CarbonImmutable::now('Asia/Manila')->format('F j, Y g:i A');
    }

    private function manila($value): string
    {
        return CarbonImmutable::instance($value)->setTimezone('Asia/Manila')->format('F j, Y g:i A');
    }
}
