# Inventory Context

## Read

- [[Architecture]] and [[Rules]]: current inventory architecture and invariants
- [[Database Schema]]: `station_items`, `inventory_movements`, deliveries, spoilages, and monthly reports
- [[phases/10.22B-monthly-inventory/Phase 10.22B Monthly Inventory Context|Phase 10.22B context]]: monthly count contract
- Current inventory controllers, models, migrations, and feature tests under `backend/`

## Stable invariants

- `station_items.quantity` is authoritative Station stock. Product Management does not own stock quantity; Station Inventory monitors it.
- Movement signs: SALE negative, DELIVERY positive, SPOILAGE negative, ADJUSTMENT signed.
- Stock status: quantity at or below 0 is Out of Stock; positive quantity at or below the Item's reorder point is Low Stock; above the threshold is Normal.
- Monthly End Inventory records frozen System Counts and manual Physical Counts. Finalization never changes Station stock or creates a movement.
- Finalized Monthly End discrepancies can be reconciled once. The server derives `physical_count - system_count`, applies that signed variance to locked current Station stock, and records a traceable ADJUSTMENT movement.
- Reconciliation never rewrites historical counts, never sets live stock directly to the physical count, and rejects any batch that would produce negative stock.
- All active quantity inputs, storage, movement records, and report counts use at most two decimal places; a third fractional digit is rejected.
- Batch inventory writes accept at most 100 rows. The Item reorder point is internal with default `10.00`; Product Management does not expose it, while each Station assignment owns only its quantity.
