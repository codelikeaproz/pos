# Phase 10.22D — Excel Report Export

**STATUS: COMPLETE**

## Goal

Admin-only Excel exports for Sales Report and finalized Monthly End Inventory/Reconciliation.

## Inputs

- [[../../references/reporting|Reporting reference]]
- [[../10.22A-sales-report/Phase 10.22A Sales Report Context|Sales Report]]
- [[../10.22B-monthly-inventory/Phase 10.22B Monthly Inventory Context|Monthly End Inventory]]
- [[../10.22C-inventory-reconciliation/CONTEXT|Inventory Reconciliation]]

## Invariants

- Export is authenticated, Admin-only, and read-only.
- Sales uses the same filters as the screen and exports the full filtered dataset without pagination.
- Persisted Orders supply financial and historical values; current Prices and inventory do not reconstruct history.
- Only Finalized Monthly End reports export, using frozen snapshots and persisted reconciliation audit fields.
- Export does not mutate Orders, inventory, movements, reports, reconciliation, tax, remittance, or credit state.
- PDF, CSV, formal printing, charts, and background export jobs are outside this phase.

## Outputs

- `GET /api/reports/sales/export` → styled `.xlsx` Sales Report.
- `GET /api/monthly-end-reports/{report}/export` → styled `.xlsx` Monthly End Inventory/Reconciliation report.
- `openspout/openspout` 4.28 performs synchronous server-side workbook generation on PHP 8.2 without requiring GD.

## Verification

Automated workbook parsing covers authorization, filter and summary parity, pagination independence, persisted discounts/totals, finalized-only Monthly End export, frozen Item snapshots, reconciliation audit fields, and read-only behavior.
