# Phase 10.22C — Inventory Reconciliation

**STATUS: COMPLETE**

## Goal

Controlled stock adjustment from finalized Monthly End discrepancies.

## Inputs

- [[../../references/inventory|Inventory reference]]
- [[../../references/reporting|Reporting reference]]
- [[../../Database Schema|Database Schema]]
- [[../10.22B-monthly-inventory/Phase 10.22B Monthly Inventory Context|Monthly End implementation]]
- Current inventory movement implementation and reconciliation tests

## Critical invariants

- FINALIZED reports only.
- Variance is derived from stored Monthly End values.
- The signed variance is applied to current live stock through an ADJUSTMENT movement.
- Live stock is never overwritten with `physical_count`.
- Each discrepancy can be reconciled once.
- A negative resulting balance rejects the full selected batch.
- Original report snapshots remain immutable.

## Out of scope

- Generic manual stock adjustment
- Reversal or unreconcile
- Report export and formal printing
- Accounting and tax effects

## Verification

Focused backend coverage includes Admin authorization, finalized-only eligibility, Short and Over current-stock arithmetic, inactive products, zero variance, duplicate prevention, negative-stock rejection, atomic batch rollback, traceability, and historical snapshot preservation. Frontend type checking covers the selection and confirmation flow.
