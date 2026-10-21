# Phase 10.21 — Non-VAT / Tax Foundation

**STATUS: COMPLETE**

## Goal

Centralize the current Non-VAT configuration and preserve tax context on new Orders without changing customer totals.

Route through [[references/tax|Tax context]], then verify the relevant sections of [[Rules]] and [[Architecture]].

## Inputs

| Source | Location | Scope | Why |
|---|---|---|---|
| Tax rules | `../../references/tax.md` | Full | Stable tax constraints |
| Canonical docs | `../../Rules.md`, `../../Architecture.md` | Phase 10.21 sections | Accepted behavior |
| Runtime | `../../../backend/app/Models/TaxSetting.php`, checkout and Order resources | Relevant files | Current implementation |
| Receipts | `../../../frontend/src/`, `../../../frontend/electron/ipc/printing.ts` | Tax display paths | Snapshot presentation |
| Tests | `../../../backend/tests/Feature/TaxSettingApiTest.php`, `PosCheckoutApiTest.php` | Tax cases | Expected behavior |

## Invariants and process

Tax Settings remain Admin-only and Non-VAT. Checkout reads the setting, persists Order tax snapshots, adds no VAT, and preserves normal VAT Exempt Sales. Discounted VAT Exempt Sales remains unresolved and displays `Pending accounting rule`.

## Outputs

Tax configuration, Order snapshots, and receipt/detail presentation are complete.

## Deferred / out of scope

Full VAT engine, tax classifications, VAT/BIR reporting, and the discounted exempt-sales decision.

## Verification

Run focused Tax Setting and checkout tests plus frontend type checking when presentation changes.
