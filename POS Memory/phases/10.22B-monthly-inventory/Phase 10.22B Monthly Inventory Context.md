# Phase 10.22B — Monthly End Inventory

**STATUS: COMPLETE**

## Goal

Record and finalize one historical physical inventory count per Station and month/year without adjusting operational stock.

Route through [[references/inventory|Inventory context]] and [[references/reporting|Reporting context]], then verify [[Rules]], [[Architecture]], and [[Database Schema]].

## Inputs

| Source | Location | Scope | Why |
|---|---|---|---|
| Inventory | `../../references/inventory.md` | Full | Stock invariants |
| Reporting | `../../references/reporting.md` | Monthly section | Variance rules |
| Schema | `../../Database Schema.md` | Monthly report tables | Persistence contract |
| Runtime | `../../../backend/app/Http/Controllers/Api/MonthlyEndReportController.php`, `../../../frontend/src/pages/MonthlyEndInventoryPage.tsx` | Full | Current implementation |
| Tests | `../../../backend/tests/Feature/MonthlyEndReportApiTest.php` | Full | Expected behavior |

## Invariants

- System Count snapshots `station_items.quantity` when the report is created.
- Physical Count is manual; null is Uncounted and zero is counted.
- Variance is Physical Count minus System Count.
- Finalization requires all counts and freezes the report.
- Creation, saving, and finalization never modify `station_items`, create `inventory_movements`, or create ADJUSTMENT records.

## Process and outputs

Create a Draft snapshot, save counts, review Short/Match/Over/Uncounted results, then finalize with Admin accountability. Finalized reports are read-only.

## Deferred / out of scope

Phase 10.22C reconciliation, stock adjustments, exports, and formal printing.

## Verification

Run `MonthlyEndReportApiTest`, frontend type checking, and migration/status checks after related changes.
