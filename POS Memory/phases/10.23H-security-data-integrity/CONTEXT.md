# Phase 10.23H — Security, Data Integrity, and Code Health

> Superseded for Low Stock by Phase 10.23H.5: the Item reorder point is active again and replaces the fixed threshold. The remaining security, precision, batch, export, and slideshow work in this phase remains current.

Status: implemented, verified, and included in the 2026-10-26 phase commit.

## Scope completed

- Enforced two-decimal quantities across checkout, deliveries, spoilage, Station Inventory, Monthly End counts/reconciliation, resources, frontend fixed-point calculations, and tests.
- Capped all affected write batches at 100 rows.
- Added 12-hour Sanctum token expiry and revoked all affected-User tokens after self-service or Admin password changes.
- Serialized final-Admin demotion/deletion and converted deletion of historically referenced Users to HTTP 409.
- Changed Sales Excel export to bounded lazy iteration.
- Removed the unused Item reorder-point stack through a forward migration; retained the fixed Low Stock boundary of 10.
- Removed the Login slideshow Pause/Play control by stakeholder request, retained reduced-motion behavior and accessible manual indicators, and use overlapping image layers for a flicker-free crossfade without duplicate JavaScript preloading.

## Preserved boundaries

- `users.role` remains the authorization boundary; business Privileges do not grant Admin access.
- Checkout, movement signs, Monthly End reconciliation, report totals, receipt/printing, and Cash Drawer behavior are unchanged.
- No RBAC redesign, audit-log subsystem, configurable KPI threshold, account-deactivation feature, or new dependency was added.

## Verification

- Backend: 185 tests, 1,534 assertions passing.
- Laravel Pint: passing.
- Frontend TypeScript: passing.
- Electron production build: passing.
- MySQL inspection confirmed scale 2 on every active quantity column, zero third-decimal conflicts, and no nonzero reorder-point data. Migration batch 2 removed `items.reorder_point` while preserving the existing Product and Users. No reset or reseed was performed.

## Read next

- [[../../references/authentication|Authentication]]
- [[../../references/inventory|Inventory]]
- [[../../references/checkout|Checkout]]
- [[../../references/reporting|Reporting]]
- [[../../Architecture|Architecture]], [[../../Rules|Rules]], and [[../../HandOff|HandOff]]
