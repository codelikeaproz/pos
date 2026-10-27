# Reporting Context

## Read

- [[Architecture]], [[Rules]], and [[Database Schema]] for the relevant report sections
- [[phases/10.22A-sales-report/Phase 10.22A Sales Report Context|Phase 10.22A context]]
- [[phases/10.22B-monthly-inventory/Phase 10.22B Monthly Inventory Context|Phase 10.22B context]]
- Current report controllers, pages, migrations, and tests

## Stable invariants

- Sales Report revenue and discounts come from persisted `orders` and `order_items`, never Inventory Movements or current Prices.
- Monthly End Inventory comes from a frozen Station inventory snapshot plus manual Physical Counts.
- Reconciliation adds audit metadata and an Inventory Movement reference to a finalized discrepancy while preserving every report snapshot field.
- Monthly variance is Physical Count minus System Count: negative Short, zero Match, positive Over, null Uncounted.
- Sales Reports and Monthly End Inventory are separate read/reporting domains and must not mutate each other.
- Excel export is Admin-only and read-only. Sales exports reuse the screen filters and include all matches; finalized Monthly End exports use frozen snapshots and reconciliation audit fields.
- Sales export iterates matching Orders in bounded chunks instead of materializing the full history in PHP memory.
- Credit payments are collections against existing sales and never increase Sales Report revenue; Accounting collection KPIs read `credit_payments` separately.
- PDF, CSV, formal report printing, advanced charts, and comparative analytics remain deferred.
