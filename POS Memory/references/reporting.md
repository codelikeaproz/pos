# Reporting Context

## Read

- [[Architecture]], [[Rules]], and [[Database Schema]] for the relevant report sections
- [[phases/10.22A-sales-report/Phase 10.22A Sales Report Context|Phase 10.22A context]]
- [[phases/10.22B-monthly-inventory/Phase 10.22B Monthly Inventory Context|Phase 10.22B context]]
- Current report controllers, pages, migrations, and tests

## Stable invariants

- Sales Report revenue and discounts come from persisted `orders` and `order_items`, never Inventory Movements or current Prices.
- Monthly End Inventory comes from a frozen Station inventory snapshot plus manual Physical Counts.
- Monthly variance is Physical Count minus System Count: negative Short, zero Match, positive Over, null Uncounted.
- Sales Reports and Monthly End Inventory are separate read/reporting domains and must not mutate each other.
- PDF, Excel, CSV, and formal report printing remain deferred.
