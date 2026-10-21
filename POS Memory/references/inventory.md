# Inventory Context

## Read

- [[Architecture]] and [[Rules]]: current inventory architecture and invariants
- [[Database Schema]]: `station_items`, `inventory_movements`, deliveries, spoilages, and monthly reports
- [[phases/10.22B-monthly-inventory/Phase 10.22B Monthly Inventory Context|Phase 10.22B context]]: monthly count contract
- Current inventory controllers, models, migrations, and feature tests under `backend/`

## Stable invariants

- `station_items.quantity` is authoritative Station stock. Product Management does not own stock quantity; Station Inventory monitors it.
- Movement signs: SALE negative, DELIVERY positive, SPOILAGE negative, ADJUSTMENT signed.
- Stock status: quantity at or below 0 is Out of Stock; positive quantity through 10 is Low Stock; above 10 is Normal.
- Monthly End Inventory records frozen System Counts and manual Physical Counts. Finalization never changes Station stock or creates a movement.
- Inventory Reconciliation and ADJUSTMENT creation belong to Phase 10.22C and require explicit activation.
