# University HomeStay POS Context Router

Use this file to choose the smallest relevant context set. Do not load every POS Memory document unless the task crosses domains.

## Authority

1. Confirmed stakeholder requirements
2. Canonical business and domain documentation in `POS Memory/`
3. Current accepted rules in `POS Memory/Rules.md`
4. Current source code and tests
5. Graphify structural analysis
6. Historical phase notes

Graphify accelerates discovery. Verify actual source and tests before changing code, and never use graph structure to override business rules.

## Core sources

- Business and domain memory: `POS Memory/POS Memory Context.md`
- Frontend and Electron: `frontend/`
- Laravel API and schema: `backend/`
- Derived structural graph: `graphify-out/`

## Task routing

| Task | Start with | Then inspect |
|---|---|---|
| Checkout or POS | `POS Memory/references/checkout.md` | Current checkout, Order, Price, stock, and tests |
| Inventory | `POS Memory/references/inventory.md` | Relevant schema, models, controllers, and tests |
| Tax or Senior Discount tax | `POS Memory/references/tax.md`, `POS Memory/phases/10.21-tax/Phase 10.21 Tax Context.md` | Checkout, tax configuration, receipt code, and tests |
| Sales reporting | `POS Memory/references/reporting.md`, `POS Memory/phases/10.22A-sales-report/Phase 10.22A Sales Report Context.md` | Report controller, page, and tests |
| Monthly End Inventory | `POS Memory/references/inventory.md`, `POS Memory/phases/10.22B-monthly-inventory/Phase 10.22B Monthly Inventory Context.md` | Monthly report schema, source, and tests |
| Inventory reconciliation | `POS Memory/references/inventory.md`, `POS Memory/phases/10.22C-inventory-reconciliation/CONTEXT.md` | Finalized Monthly End items, movements, live Station stock, and tests |
| Printing or hardware | `POS Memory/references/printing.md` | Electron IPC, receipt UI, and completed Order snapshots |
| New or postponed feature | `POS Memory/references/deferred.md` | Current user scope and relevant canonical rules |

## Graphify use

Query Graphify for dependency relationships, call paths, controller/model links, schema/code links, field writers, and cross-file implementation locations. Useful questions include what writes `station_items.quantity`, what consumes `tax_settings`, what changes `remitted_at`, and what paths print receipts.

After major modules, schema changes, or large refactors, refresh the graph. A tiny CSS change does not require regeneration. The graph is derived context and may be deleted and rebuilt. Track the compact `graphify-out/GRAPH_REPORT.md`; keep the reproducible `graph.json`, `graph.html`, caches, and manifests local through `.gitignore`.

## Documentation workflow

After a major phase: update changed canonical documents, update `POS Memory/HandOff.md`, create or update its phase context, reconcile `POS Memory/references/deferred.md`, and refresh Graphify when the structure changed materially.
