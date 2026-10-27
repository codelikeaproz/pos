# Checkout Context

## Read

- [[Architecture]] and [[Rules]]: POS checkout, payment, discount, inventory, and transaction rules
- `../../backend/app/Http/Controllers/Api/PosCheckoutController.php`
- `../../backend/app/Models/Order.php`, `OrderItem.php`, `Price.php`, and `StationItem.php`
- `../../backend/tests/Feature/PosCheckoutApiTest.php`

## Stable invariants

- Laravel is authoritative for checkout values; the renderer submits intent and cart inputs.
- Active Price records are authoritative. Checkout rejects stale prices and locks Station stock before deduction.
- Cash and Customer-linked Credit / Utang share one atomic transaction.
- Senior Discount uses the accepted server-side formula and persisted snapshot values.
- Orders and Order Items preserve historical values; checkout writes a negative SALE Inventory Movement with the stock deduction.
- Any validation or write failure rolls back Order, items, stock, and movements together.
- Cart quantities use at most two decimal places, and one checkout accepts at most 100 Item rows.
- Credit checkout locks the active Customer, derives outstanding payments from persisted Credit Orders and immutable Credit Payments, and rejects totals above available credit.
- Every successful Cash or Credit checkout atomically allocates an `OR#YYYYMMDD######` daily O.R Number while retaining the dash-free internal Order Number.
