# Phase 10.23H.5 — Reorder Point Activation and Low-Stock Threshold

Status: implemented, verified, and included in the 2026-10-26 phase commit.

## Implemented

- `items.reorder_point` is part of the clean Items creation migration as `DECIMAL(12,2) NOT NULL DEFAULT 10.00`; no follow-up migration is used.
- Product Management does not request, edit, return, or list the Item-level Reorder Point. Product create/update rejects submitted threshold values.
- The Dashboard query and the Station Inventory/POS resources compare each Station balance with its Item's threshold.
- Shared status rule: quantity `<= 0` is Out of Stock; positive quantity `<= reorder_point` is Low Stock; higher quantity is normal.
- Existing red Out of Stock and soft-yellow Low Stock row colors are retained.

## Boundaries

- Reorder Point is Product-level and shared by all Stations; quantity remains Station-level.
- Low Stock remains sellable. Checkout stock validation and every inventory movement workflow are unchanged.
- Automatic replenishment and notification delivery remain deferred.
- Editing thresholds is deferred to a dedicated Stock Threshold configuration UI.

## Verification

- Clean MySQL `migrate:fresh --seed` completed; `items.reorder_point` is `DECIMAL(12,2) NOT NULL DEFAULT 10.00` and two development Users were seeded.
- Backend: 186 tests passed with 1,550 assertions; Pint passed.
- Frontend: TypeScript type checking and Electron production build passed.
