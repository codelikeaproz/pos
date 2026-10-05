
---

# University HomeStay POS
## Development Handoff

### Phase 10.18.1 status — Complete (2026-10-05)

UI cleanup: modal forms and confirmations that already provide a header X no longer repeat a Cancel button in the footer. Their Save, Submit, Confirm, or destructive primary action remains. Unsaved-change prompts retain their distinct Keep Editing and Discard Changes choices.

Delivery and Spoilage confirmation/completion dialogs now share an organized summary design: a reference number where available, bordered labeled fields in a responsive grid, and a separate confirmation notice describing the inventory effect.

Date/time reconciliation: Transaction History, Order details, Credit Monitoring, Sale Remittance, Item Delivery, and Spoilage tables and dialogs now use one shared `Asia/Manila` formatter rather than the computer's local timezone. Transaction History date filters also convert Manila calendar-day boundaries to UTC, matching Credit Monitoring and Sale Remittance and preventing records near midnight from appearing under the wrong date.

MySQL timezone correction: the MySQL and MariaDB connections now explicitly use UTC. Delivery and Spoilage use `TIMESTAMP` columns, and an inherited `+08:00` database session previously converted a stored UTC instant to Manila time before Laravel interpreted it as UTC, causing the frontend to add another eight hours. Existing timestamps remain unchanged; they now serialize as their correct UTC instant and display once in Manila time, matching the POS clock.

Transaction references now use compact identifiers without separators: `ORDYYYYMMDD######`, `DELYYYYMMDD######`, and `SPLYYYYMMDD######`. Their date segment uses the Manila calendar date. Existing local Order, Delivery, and Spoilage references were converted in place without changing record IDs.

Product Management now owns product definitions only. The obsolete global `items.quantity` field was removed from the schema, model, API resources and validation contract, React types, Product form, and Product table. Item create/update explicitly rejects a submitted quantity and does not create or change Station stock or Inventory Movements.

`station_items.quantity` is the sole current inventory balance, independently scoped by Station and Item. Item Delivery remains the supported stock-entry workflow; POS checkout and Spoilage remain the supported deduction workflows. Each keeps its Station balance change and matching DELIVERY, SALE, or SPOILAGE movement atomic. Station Inventory and F12 remain read-only. Active `prices.amount` remains the selling-price authority, and historical detail snapshots remain unchanged.

The original Item creation migration no longer defines `items.quantity`. The existing local development schema was reconciled by dropping only that obsolete column; no value was copied or merged into a Station. Before reconciliation, the database contained one Item with global quantity `20.000` and one Station balance totaling `9.000`, confirming that the two values were already inconsistent. The authoritative Station balance remains `9.000`. No refresh, reset, wipe, or extra migration was required.

Regression coverage proves one product can be delivered as 20 units to Station A and 10 to Station B, then sold by 3 at A and spoiled by 2 at B, leaving independent balances of 17 and 8. The ADJUSTMENT movement type and existing backend compatibility remain; Product Management exposes no adjustment control.

### Phase 10.18 status — Complete (2026-10-01)

Sale Remittance now lists completed Cash Orders with backend search, Manila date filters, and ten-row pagination. Admins can select individual/current-page eligible Orders, review an integer-cent preview total, confirm, and submit an atomic batch. The backend locks rows deterministically, calculates the authoritative total, records server time and authenticated Admin, and prevents double remittance. Credit Orders, Order snapshots, and inventory remain untouched. Sale Remittance is enabled in the Admin sidebar; O.R Transactions remains deferred.

Verification passed: focused Sale Remittance tests **5 tests, 35 assertions**; full Laravel suite **153 tests, 1,158 assertions**; frontend TypeScript checking; Electron production build; Pint; and `git diff --check`. The disposable development database was rebuilt and seeded from the consolidated migrations; all migrations are applied. No commit or push was made.

### Phase 10.17 status — Complete (2026-10-01)

Privilege Management and Privilege Assignment now use the existing Admin authorization boundary. New `privileges` and `user_privilege` tables model business classifications independently from `users.role`. Users may hold multiple Privileges, assignments are explicitly saved and transactionally synchronized, and assigning a Privilege named Admin does not grant Admin access.

The Admin sidebar entries are enabled. Privilege Management provides live search, ten-record pagination, Add, and icon-first Edit without deletion. Privilege Assignment provides searchable paginated Users, all available Privileges, multiple checkbox selection, explicit Save, and confirmation before switching Users with unsaved changes. Sale Remittance remains Coming Soon.

Verification passed: focused Privilege tests **8 tests, 46 assertions**; full Laravel suite **148 tests, 1,122 assertions**; frontend TypeScript checking; Electron production build; Pint; and `git diff --check`. Both Phase 10.17 migrations are applied locally with nothing pending. No commit or push was made.

### Phase 10.16.1 status — Complete (2026-10-01)

Form usability follow-up: fixed the shared Modal focus lifecycle that caused parent-controlled fields to lose focus after each keystroke. Modal opening now focuses the first enabled body control once, supports an explicit initial-focus ref, uses a ref for the current close callback, preserves focus through rerenders/AJAX refreshes, and restores the opener on close. This applies across Product, Customer, Price, Delivery, Spoilage, POS quantity, and other shared dialogs.

Manual quantity entry is limited to two decimal places in Product, POS quantity editing, Item Delivery, Spoilage, and the retained Station assignment form. Database columns, ledger arithmetic, and backend compatibility remain `DECIMAL(12,3)` so existing `1.125` history is not rounded or migrated. Raw Delivery/Spoilage `.000` displays now use the shared clean formatter.

Spoilage UI follow-up: Report Spoilage uses the compact multi-item selection structure. Station and selectable Manila Incident Date appear first, followed by Item search, Available Station Items on the left, and Selected Spoilage Items with editable quantities on the right. Available Items use individual checkboxes plus Select All/Unselect All; selection remains synchronized with the selected table. Remarks and Submit remain below. Submission still calls the existing atomic Phase 10.14 API, which derives the reporting User, validates current Station stock, writes immutable snapshots and negative SPOILAGE movements, and rolls back on failure.

Incident Date is now selectable for delayed Spoilage reporting. The UI defaults it to today's Manila date and prevents choosing a future date; the API validates the same rule and persists a selected past date. SPL numbering uses the selected Manila calendar date directly, avoiding a UTC midnight date shift. Requests from older clients that omit Incident Date retain the server-time behavior.

MySQL identifier fix: Item Delivery and Spoilage use 32-character unique number columns. Their temporary insert identifiers now use `PENDING-` plus 24 random characters, fitting the existing schema exactly before replacement with the final `DEL-YYYYMMDD-######` or `SPL-YYYYMMDD-######` number. The former `PENDING-` plus UUID value was 44 characters and failed on MySQL before the final-number update; SQLite tests had not enforced the declared VARCHAR length. No migration was required.

Responsibility revision: **Station Inventory is a read-only stock monitoring module. Item Delivery is the supported workflow for introducing Item stock into a Station.** Station Inventory contains Station selection, Search, pagination, View Spoilage, and Description, Item Code, Qty, Sold, Spoilage, and Remaining Qty. Assign Item, Edit, Remove, Status, and Actions were removed. View Spoilage opens the existing Spoilage Management history scoped to the selected Station. Existing backend inventory mutation behavior and tests remain available for a future authorized adjustment workflow.

Item Delivery remains authoritative for stock entry. It creates a missing StationItem or increases an existing balance, writes positive DELIVERY movement history, and commits the header, Item snapshots, stock changes, and movements atomically. The dialog now follows the compact legacy structure: Station and Receiver, Item search, Available Items on the left, Selected Delivery Items with editable Qty on the right, review, and submit. History remains read-only with an Eye details action and compact snapshot table.

Responsibility-boundary verification passed: focused Delivery, Station Inventory, F12, Price/checkout integration, and checkout rollback coverage passed (**40 tests, 348 assertions**); the full Laravel suite passed (**139 tests, 1,068 assertions**). Frontend TypeScript checking, Electron production build, Pint, and `git diff --check` passed.

Price UI follow-up: the Price history table now shows only Item Code, Item Name, Price, and Status; Date and Action were removed from the table. Adding a Price remains the page's supported active-price change workflow, while the existing historical activation API remains unchanged.

Reconciled the implemented application with the compact density of the legacy HomeStay UI. Shared tables now use compact 12–13px typography, narrow rows, and regular-weight body data; shared inputs, buttons, badges, pagination, and dialogs are smaller while retaining accessible focus and responsive behavior. Conventional table actions are compact Lucide icons with accessible labels and titles. Product activation/deactivation uses CircleCheck/CircleOff rather than Delete. Destructive confirmations and primary form actions retain clear text.

Audited Product Management, Station Inventory, Price, Item Delivery, Spoilage, Customer Management, Credit Monitoring, Transaction History/F7 Station Transactions, transaction details, Stations, User Management, Suppliers, Consignees, Consignment, POS Available Items, POS Current Order, and F12 Station Inventory. Customer Management and Credit Monitoring remain read-only where applicable and received no invented actions. The sidebar order and business workflows are unchanged.

Admin Station Inventory columns are Description, Item Code, Qty, Sold, Spoilage, and Remaining Qty. Qty is calculated with decimal database arithmetic as `Remaining + Sold + Spoilage`, so the displayed columns always reconcile while DELIVERY, signed ADJUSTMENT, and pre-ledger opening balances remain reflected through authoritative Remaining. Sold is absolute recorded SALE, Spoilage is absolute recorded SPOILAGE, and Remaining is `station_items.quantity`. F12 remains Item, Code, Unit, Sold, Spoilage, and Remaining.

Final reconciliation verification: focused inventory, Delivery, Spoilage, checkout, Price, and Customer/Credit coverage passed (**48 tests, 524 assertions**). The full Laravel suite passed (**139 tests, 1,070 assertions**); frontend TypeScript checking, Electron production build, Pint, migration status, and `git diff --check` passed. All existing migrations are applied and no migration was added.

Historical limitation: movement summaries begin with the current movement ledger. Pre-ledger balances were not reconstructed, Orders were not replayed, and missing history was not fabricated. A row can legitimately show zero recorded Delivered/Sold/Spoilage with a nonzero Remaining balance. No migration or database architecture change was introduced.

Verification: the full Laravel suite passed with a temporary test-only application key (**139 tests, 1,068 assertions**). Focused Station Inventory and POS inventory coverage passed (**16 tests, 133 assertions**). Pint, frontend TypeScript checking, the Electron production build, and `git diff --check` passed. The source-level visual audit covered implemented tables and dialogs; a live browser walkthrough could not be performed because local browser access was denied by the environment. No commit or push was made.

### Phase 10.16 status — Complete (2026-10-01)

Cash and Customer-linked Credit / Utang checkout are complete through the shared atomic Order workflow. Cash uses F3 and a focused Cash Received text dialog; Credit uses F4 and searchable Customer selection. The payment panel shows read-only totals, and Pay performs the checkout. Both methods retain server-side active-Price resolution, stale-price protection, Station stock locks, OrderItem snapshots, stock deduction, and SALE movements. Credit stores null Cash Received and Change and appears in Credit Monitoring.

The cashier remains inside POS for F7 Station Transactions, F9 quantity editing, F10 New Order, and F12 read-only Station Inventory; Esc exits POS. Available Items uses Station-scoped debounced AJAX name/code search, exact-code Enter, pagination, visible stock with unit, and icon-only Add. Current Order separates Item Code and uses icon-only quantity and remove actions. Quantity editing supports Backspace, Enter-to-update, one-unit arrow steps, and up to three fractional digits.

Successful payment opens an on-screen receipt preview with CMU HomeStay, Station, transaction number, snapshot Item lines, quantity × Unit Price, line prices, Total Price, Credit Customer when applicable, and the thank-you message. Receipt printer commands, Cash Drawer hardware, Discount, O.R Transactions, and F8 Credit Transactions remain deferred.

Latest verification for the POS follow-up: frontend TypeScript checking, Electron production build, focused POS API tests (9 tests, 61 assertions), and `git diff --check` passed. The earlier complete Phase 10.16 backend run remains recorded below as 136 tests and 1,043 assertions. Manual receipt-printer verification is unavailable because hardware integration has not started. These changes are uncommitted.

### POS item search layout update — 2026-10-01

- Replaced the generic post-payment summary with an on-screen receipt preview: CMU HomeStay and Station, transaction number, item name, quantity × snapshot Unit Price, line price, Total Price, and a thank-you message. Credit receipts include the Customer. This prepares the display structure for future printing without adding printer integration.

- Refined POS tables: Item names are regular weight, and Current Order now has a separate Item Code column. The Change Quantity field uses a decimal text input so Backspace edits normally; up/down controls step by one while preserving fractional quantities. POS displays integers as `2`, common fractional values as `1.50` or `2.50`, and keeps three-decimal precision where needed.

- Simplified the Available Items results into a Name, Item Code, Available, Unit Price, Action table with a plus-only Add control. Available shows quantity and unit together, such as `8 bottle`; zero-stock Add remains disabled with a tooltip. Current Order actions are pencil and trash icons with item-specific accessible labels and tooltips. Search, pagination, and exact-code Enter remain in place.

- Follow-up: restored Available Items to the left column and removed the food image. The AJAX name/code search and paginated results remain there; exact-code Enter and disabled zero-stock Add remain available. The cart and payment stay on the right, and the clock stays in the footer.
- Simplified POS dialogs by removing footer Cancel/Close actions where the header X already closes them. Change Quantity focuses and selects its input so a cashier can type and press Enter to update; the Update button remains.

- Moved the debounced AJAX Item search above Customer. The left column now contains only the food image, and the live Manila clock moved into the footer.
- The focused search shows a paginated dropdown of sellable Items, with name, code, Station stock, Price, and Add. Typing searches names or codes; Enter adds one exact-code match. Exact code matches rank first in the existing POS items response, even when many names also match. Zero-stock Items stay visible but cannot be added.
- Adding an Item clears the search. Escape or clicking outside closes the dropdown. Search errors remain near the field so the cart and payment area remain usable. Checkout, F12 Station Inventory, and database schema are unchanged.

### Development log — 2026-10-01 (POS F3/F4 payment controls)

- Replaced Cash/Credit radio buttons with plain-text F3 Cash and F4 Credit / Utang controls in the POS payment panel. Mode of Payment is the main heading; F3 and F4 align with Total Amount and Cash Received. The corresponding keys open Cash Received or the existing Customer selector while the POS is active. The heading and Pay show no icons. The shared application top bar is hidden only on POS; the POS masthead remains.
- Cash entry now happens in a dialog with one ordinary text input, Order Total, and live Change. There is no on-screen keypad. Confirming a valid amount returns to the POS; the panel shows read-only Cash Received and Change. Pay remains a separate action. Missing or insufficient Cash Received reopens the dialog before checkout.
- Cancelling a payment dialog preserves the previous method. Confirming Cash clears the selected Customer; selecting Credit clears the confirmed cash amount. Existing checkout API, stock and Price safeguards, and F7/F9/F10/F12/Esc behavior remain in place. No database migration was added.

The 2026-09-30 log below describes the previous radio-button UI and is retained as phase history.

### Development log — 2026-09-30 (Phase 10.16 and POS follow-up)

- Added Credit / Utang to the existing POS checkout. Cash remains valid for Walk-in sales; Credit requires an existing Customer and stores null Cash Received and Change. Both methods share server-side Price validation, Station stock locking, Order Item snapshots, stock deduction, and SALE movements in one database transaction. Credit sales appear in read-only Credit Monitoring; Accounting Office settlement is outside this POS.
- Reworked the POS screen using the existing green/yellow branding: a full-width cashier layout, food image, Station/User masthead, order and payment area, live Manila clock, and bottom action strip. The sidebar is hidden while POS is open and returns on Exit POS. Exit or New Order confirms before discarding an unpaid cart.
- Kept Cash/Credit radio buttons as the payment controls. Choosing Credit opens searchable Customer selection immediately; Credit becomes active after selection. Cancelling an initial selection returns to Cash; cancelling a later change keeps the selected Customer. Removed F3/F4 payment shortcuts.
- Added working bottom-bar actions and keyboard shortcuts: F7 shows current-Station completed Orders with search, date filters, pagination, and read-only details; F9 edits quantity directly for one line or offers a line picker for several; F10 starts a new Order with the existing confirmation; F12 shows searchable, paginated, read-only Station stock; Esc exits POS. Opening F7 or F12 does not clear the cart.
- Added authenticated `GET /api/pos/station-inventory`. The server derives the Station from the signed-in User, returns a 409 if none is assigned, and includes all assigned stock, including inactive or unpriced Items. `GET /api/pos/items` remains the separate sellable-Item source. F7 reuses the Orders list/detail APIs; Admin POS requests its current Station explicitly, while Cashier Orders are server-scoped to the assigned Station.
- Defined Credit-compatible nullable Cash Received and Change in the original `create_orders_table` migration for this clean development database. The POS dialog work adds no migration. Ctrl+D Discount, F6 O.R Transactions, and F8 Credit Transactions remain deferred and have no visible shortcut buttons.
- Last verification for the implementation: 136 Laravel tests and 1,043 assertions passed; frontend type checking, Electron build, Pint, and `git diff --check` passed; Laravel showed no pending migrations. Manual UI walkthrough was not recorded. This documentation update does not rerun those checks. No commit or push was made for this phase.

Notes for earlier phases below record the state *at that time*; use this log and the current-state sections above them for the latest POS behavior.

### POS shortcut and dialog update

The POS keeps the cart visible while F7 opens current-Station read-only transaction history and details, F9 opens quantity editing (or a line picker for multiple cart items), and F12 opens searchable read-only Station inventory. F10 keeps the existing New Order confirmation; Esc keeps the Exit POS confirmation for an unsent cart. F3/F4 shortcuts were removed: selecting Credit by radio button opens the Customer dialog immediately, and cancelling without a selection returns to Cash. The inventory dialog includes inactive and unpriced assigned Items via a new authenticated Station-scoped read endpoint. Ctrl+D Discount, F6 O.R Transactions, and F8 Credit Transactions are not displayed or implemented in this phase.

### Phase 10.16 current-state note

**Complete.** POS supports Cash and Credit / Utang in one checkout transaction. Cash requires confirmed Cash Received, calculates Change, and allows Walk-in Orders. Credit requires a Customer selected through the searchable, paginated Customer dialog; the backend validates the ID before writes. A Credit Order has `payment_method = credit`, a Customer FK, and null Cash Received/Change. Both payment methods use the same StationItem and Item locks, active Price and stale-price checks, OrderItem snapshots, stock deduction, and negative SALE movements. Successful Credit Orders appear in Credit Monitoring from Orders. The original `create_orders_table` migration defines nullable Cash Received and Change fields; the development schema already matches it. Credit Monitoring Total is recorded Credit sales, not outstanding balance. Customer Balance is unavailable without Accounting Office settlement data; this POS does not settle Credit. The current cashier UX and receipt-preview follow-ups are summarized at the top of this handoff. Earlier phase notes below are historical.

### Phase 10.15 current-state note

Customer Management is now Admin-only and supports list/search/pagination and adding a name plus address. Customers are separate from Consignees. The Balance column is intentionally unavailable because the connected Accounting Office settlement source is not modeled here. `orders.customer_id` is nullable for cash/Walk-in and has a restrictive Customer FK; Order model writes require a Customer for `payment_method = credit`. There is no credit checkout endpoint or UI yet, so Credit Monitoring will show records only when credit Orders exist through a future supported workflow or existing connected data. Credit Monitoring is Admin-only, read-only, filtered by search and inclusive Manila dates, and shows Utang, calendar-day Age, and a fixed-cent Total Amount across all matching rows. The total is recorded credit sales, not outstanding balance. Accounting Office owns settlement; this POS does not pay or settle credit. The sidebar order and cash checkout remain unchanged. Earlier phase notes below are historical.

### Phase 10.14.1 current-state note

The Admin sidebar now reproduces the confirmed legacy names and order: Dashboard, POS, Product Management, Station Inventory, Credit Monitoring, O.R Transactions, Stations, Privilege Assignment, Customer Management, Privilege, Price, Sale Remittance, Item Delivery, User Management. Six deferred entries are visible but disabled. Cashier sees Dashboard and POS. The image area is reserved because no original logo asset exists in the repository. Authenticated Username, User Privilege (Admin/Cashier), and Logout appear in the sidebar. Spoilage, Transaction History, Supplier, Consignee, and Consignment Account stay routable outside it. No database or business logic changed. Earlier phase notes below are historical.

### Phase 10.14 current-state note

Spoilage Management now has Admin-only list, detail, options, and create APIs plus a Station-scoped cart and read-only history screen. Multiple Items may be recorded under one unique `SPL-YYYYMMDD-######` number with optional reason and Item identity snapshots. The backend locks StationItem rows before Item rows, rechecks stock, and atomically deducts `station_items.quantity` with negative `SPOILAGE` movements. Insufficient current stock returns 409; the UI preserves the cart and refreshes availability. Inactive Items with positive Station stock remain eligible. Price is not required; `items.quantity` is not updated. Withdrawal, Receiving, and advanced movement history UI remain deferred. Older phase notes below are historical.

### Phase 10.13 current-state note

Item Delivery now has Admin-only list, detail, options, and create APIs plus a management screen with a cart, confirmation, and read-only history. Each delivery has a unique `DEL-YYYYMMDD-######` reference, Station, authenticated delivering User, Station-assigned End User receiver, and Item details with code/name/unit snapshots. A transaction increases `station_items.quantity` and records positive `DELIVERY` movements; first-time assignments use Station serialization and the StationItem uniqueness constraint. `items.quantity` is not updated and no Price is required. POS Orders remain separate. Delivery history cannot be edited or deleted. Receiving, Withdrawal, Spoilage, and movement history UI remain deferred. Older phase notes below are historical.

### Phase 10.12 current-state note

Price Management now provides Admin-only `GET /api/prices`, `POST /api/prices`, `POST /api/prices/{price}/activate`, and `GET /api/price-item-options`. The UI lists price history with live search and pagination, adds a new active Price, and confirms historical activation. Parent Item row locking serializes activation. There is no Price delete endpoint.

New POS listings and checkout use the active `prices.amount`; `items.price` remains a legacy column for initial Item creation/backfill and is not synchronized after Price changes. Checkout requires each line's displayed `expectedUnitPrice` and returns 409 plus current prices when it is stale. The cart remains for review and Pay must be pressed again. `order_items.unit_price` remains the sale snapshot; `station_items.quantity` remains authoritative stock and SALE/ADJUSTMENT movement behavior remains unchanged. The Phase 10.11B notes below are historical.

### Phase 10.11B current-state note

Schema foundation adds `items.is_active`, `prices`, and `inventory_movements`. Item Management writes price history on price changes; checkout still reads transitional `items.price`. Checkout and POS listings reject inactive Items; historical Order Items remain readable. New sales and Admin balance edits write SALE and ADJUSTMENT movements atomically with `station_items.quantity`, which remains authoritative. Earlier Orders are not replayed. `items.quantity` is transitional. Delivery, Receiving, Spoilage, Withdrawal, and Price Management screens remain future phases. POS Orders and Item Deliveries are separate business records.

Older next-phase and deferred-feature statements below describe their original phases rather than current implementation status.

> Current project state, decisions, completed discovery, open questions, and next steps.

### Project Documentation

- [[Architecture]]
- [[PRD]]
- [[Rules]]
- [[Requirement]]
---

# 1. Project Direction

The project will be developed using:

Electron
+
React
+
TypeScript
+
Laravel
+
MySQL

The system will initially target Windows desktop computers.

# 2. Current Development Direction

The team decided to slow down development and first understand the existing POS before implementing additional features.

The objective is:

> Rebuild and modernize the existing University HomeStay POS workflow instead of immediately creating a much larger POS platform.

---

# 3. Existing System Screens Reviewed

The following screens have been reviewed from the existing application:

- Login
- Main Dashboard
- Employee
- Items
- Station
- Orders / POS
- Consignee
- Consignment
- Supplier

---

# 4. Existing Dashboard

The current dashboard contains:

```
Employee
Items
Station
Orders
Consignee
Consignment
Supplier
```

These modules are considered part of the initial baseline.

---

# 5. Employee Screen Observed

Fields:

```
Name
Email
Password
Confirm Password
Station
```

Actions:

```
Search
Add
Update
Delete
```

The employee is associated with a station.

---

# 6. Items Screen Observed

Fields:

```
Description
Item Code
Price
Quantity
Unit
```

Actions:

```
Search
Add
Update
Delete
```

Items are used by the POS order screen.

---

# 7. Station Screen Observed

Fields:

```
Station Name
Location
Description
```

Actions:

```
Search
Add
Update
Delete
```

Example existing stations include:

```
Main Station
Sugbahan
```

---

# 8. Supplier Screen Observed

Field:

```
Supplier Name
```

Actions:

```
Search
Add
Update
Delete
```

Example existing records:

```
Coca Cola
Royal
```

---

# 9. Consignee Screen Observed

Fields:

```
Name
Contact Number
```

Actions:

```
Search
Add
Update
```

The current interface does not display a Delete button.

Example:

```
Name       Contact Number
-------------------------
lorie      099123213
```

---

# 10. Consignment Screen Observed

The current screen displays:

```
Name
Email
Password
Confirm Password
Station
Consignee Name
```

It also provides:

```
Add Consignee
Search
Add
Update
Delete
```

The displayed table contains user-like information:

```
Name
Email
Password
Station ID
```

### Important Pending Question

The actual business purpose of the Consignment module has not yet been confirmed.

Do not finalize the Laravel `consignments` database structure until the supervisor/end user explains what this module represents.

---

# 11. POS Screen Observed

The existing POS includes:

```
University HomeStay POS
Station
User
Item Search
Item List
Order List
Transaction Number
Total Amount
Mode of Payment
Cash
Change
Pay
New Order
Change Quantity
View Transactions
```

The primary workflow is:

```
Search Item
 ↓
Add Item
 ↓
Change Quantity
 ↓
Calculate Total
 ↓
Enter Cash
 ↓
Calculate Change
 ↓
Pay
```

---

# 12. Hardware Scope

Initial hardware requirement is intentionally small:

```
Computer
Receipt Printer
Cash Drawer
```

No barcode scanner or payment terminal is currently required.

The receipt printer and cash drawer must be tested before final hardware implementation.

---

# 13. Architecture Decision

The proposed architecture is:

```
Electron
   ↓
React + TypeScript
   ↓
Laravel API
   ↓
MySQL
```

Hardware:

```
Electron
   ↓
Receipt Printer
   ↓
Cash Drawer
```

---

# 14. Database Direction

Initial Laravel Eloquent models:

```
User
Station
Item
Supplier
Consignee
Order
OrderItem
Consignment
```

Initial table names:

```
users
stations
items
suppliers
consignees
orders
order_items
consignments
```

The final `consignments` structure is pending business clarification.

---

# 15. Naming Decision

Database:

```
snake_case
plural
```

Example:

```
order_items
station_id
contact_number
total_amount
```

Laravel models:

```
PascalCase
singular
```

Example:

```
OrderItem
Supplier
Consignee
```

PHP functions:

```
camelCase
```

Example:

```
calculateTotal()
processPayment()
```

PHP variables:

```
camelCase
```

Example:

```
$totalAmount
$cashReceived
```

React components:

```
PascalCase
```

Example:

```
OrderPage.tsx
PaymentPanel.tsx
```

React functions:

```
camelCase
```

Example:

```
handlePayment()
calculateChange()
```

---

# 16. Current Scope

### Included

```
Login
Dashboard
Employee
Items
Station
Orders / POS
Consignee
Consignment
Supplier
Payment
Transactions
Receipt Printer
Cash Drawer
```

### Not Included Yet

```
Mobile application
Customer application
Customer food menu
Online ordering
Online payment
Delivery
Advanced analytics
AI features
```

---

# 17. Future Idea — Customer Food Menu

A future version may expose selected food information through the Laravel backend.

Possible customer interface:

```
Food
Price
Availability
Limited
Special
Description
```

Possible architecture:

```
Laravel API
     │
     ├── Electron POS
     │
     └── Customer Web / Mobile
```

This is a future enhancement and must not affect the current desktop MVP.

---

# 18. Current Phase

## Frontend UI cleanup — 2026-09-27

- Refined the existing typography, spacing, surface, focus, table, modal, Login, Dashboard, application-shell, POS, and Transaction History styles without changing routes or workflows
- Added shared `SearchField` and `Pagination` components and removed the duplicated page-specific search and pagination presentation rules
- Improved narrow-window stacking, table overflow, action wrapping, and Order Details dialog containment
- Corrected the Payment panel to use defined design tokens
- Standardized quantity presentation across Item, Station Inventory, POS, validation feedback, and Transaction History: whole values omit `.000`, trailing fractional zeroes are removed, and meaningful values up to three decimal places remain visible
- Quantity storage, API payloads, validation, Station availability, and fixed-point checkout calculations remain three-decimal and unchanged

Verification: frontend TypeScript checking, Electron production build, and `git diff --check` pass. Live visual click-through remains pending because the available desktop/browser inspection runtime could not initialize in the Codex session.

## Phase 10.10 — Transaction History

Status: **COMPLETE**

- Added authenticated read-only `GET /api/orders` and `GET /api/orders/{order}` endpoints
- Admins can view all transactions and filter by Station; End Users are forcibly scoped to their assigned Station
- Added live 350 ms search across Order Number, Cashier, and Station, basic From/To date filters, ten-row pagination, and newest-first sorting
- Added Transaction History navigation, POS `View Transactions`, a read-only transaction table, and centered Order Details
- Details display historical Order Item code, name, unit, quantity, unit-price, and subtotal snapshots plus Total, Cash, and Change
- Generic Order POST, PUT, PATCH, and DELETE methods are not exposed; no editing, deletion, void, refund, or stock reversal exists
- Resolved: Transaction History, transaction search, and transaction details
- Still deferred: Customer, `is_settled`, Remit/remittance/settlement, void/refund/correction/stock reversal, Receipt Printer, Cash Drawer/ESC-POS, additional or split payments, payments table, legacy Price table verification, `items.quantity` cleanup, Receiving, Withdrawal, Spoilage, inventory movement history, OTP/2FA, and customer web/mobile ordering

Verification: **96 tests, 577 assertions passed**, including **7 Transaction History tests, 56 assertions**. Checkout row-locking, forced rollback, stock deduction, POS inventory, authentication, and all existing CRUD regressions remain green. PHP 8.2 Pint, frontend TypeScript checking, the Electron production build, route inspection, and `git diff --check` passed.

Next phase is intentionally unspecified pending review. Hardware and deferred financial workflows must not start automatically.

## Phase 10.9 — Payment & Order Finalization

Status: **COMPLETE**

- Added `orders` and `order_items` with restrictive master-data foreign keys and historical Item snapshots
- Added `Order`, `OrderItem`, and their Station, Cashier, and Item relationships
- Added `POST /api/pos/checkout` behind `auth:sanctum` for Admin and End User accounts assigned to a Station
- Checkout trusts only Item IDs, quantities, Cash payment method, and Cash received; Station, Cashier, prices, subtotals, total, Change, and Order Number are server-authoritative
- Added `ORD-YYYYMMDD-######` permanent Order Numbers generated after database identity allocation
- Added locked Station stock revalidation, half-up line rounding, atomic Order/Order Item creation, and `station_items.quantity` deduction inside `DB::transaction()`
- `items.quantity` is not modified
- Added Cash Received, Change preview, protected Pay action, success summary, inventory refresh, and cart reset only after successful payment
- Failed validation, stale stock, network errors, and backend errors preserve the cart; stale-stock validation refreshes available inventory
- Resolved: Orders persistence, Order Items persistence, permanent Order Number, Cash payment, Cash Received, Change, authoritative totals, and automatic Station inventory deduction
- Still deferred: `items.quantity` cleanup, legacy Price table verification, Customer, Remit, settlement/remittance, Transaction History/search/details, void/refund/stock reversal, other or split payment methods, a payments table, Receipt Printer, Cash Drawer/ESC-POS, Receiving, Withdrawal, Spoilage, inventory movement history, OTP/2FA, and customer web/mobile ordering

Verification: **89 tests, 521 assertions passed**, including **10 checkout tests, 63 assertions**. Forced Order Item and Station stock-update failures prove transaction rollback. PHP 8.2 Pint, frontend TypeScript checking, the Electron production build, both development migrations, route middleware inspection, and `git diff --check` passed.

Next: **Phase 10.10 — Transaction History**. It is not implemented and requires explicit approval.

## Phase 10.8 — Orders / POS Foundation

Status: **COMPLETE**

- Replaced the Orders placeholder with an authenticated, station-scoped desktop POS interface
- Added `GET /api/pos/items` behind `auth:sanctum`; both Admin and End User accounts use their assigned Station, and accounts without one receive HTTP `409`
- Station resolution comes only from the authenticated User; client-supplied `station_id` values are ignored
- Available quantity comes only from `station_items.quantity`; current Item price and readable `items.units_backup` are returned for the temporary cart
- Added 350 ms cancellable live search, pagination, zero-stock visibility with disabled Add controls, User/Station context, and backend-unavailable handling
- Added a frontend-only cart with duplicate-free Add/increment, three-decimal quantity editing and validation, Remove, New Order confirmation, and integer fixed-decimal peso totals
- The cart does not persist and performs no inventory, order, order-item, or payment writes
- Reorder Point remains available internally for Station Inventory status logic but is not displayed in the current UI; `units_backup` also remains implemented internally and supplies the readable POS unit
- Added no migrations, packages, Services, Repositories, transactions, payment controls, order numbers, transaction history, printing, or keyboard shortcuts

Verification: **79 tests, 458 assertions passed**; the POS endpoint tests cover authentication, Admin and End User access, authenticated Station isolation, missing-Station `409`, manipulated `station_id`, Station quantity as the availability source, current price and readable unit mapping, search, pagination, ordering, and zero-stock inclusion. PHP 8.2 Pint, TypeScript checking, the Electron production build, migration status, and `git diff --check` passed.

Next: **Phase 10.9 — Payment & Order Finalization**. It must re-fetch Station inventory and Item prices, validate quantities, calculate authoritative totals, generate the order number, and perform order, payment, and inventory writes atomically. Phase 10.9 is not implemented.

## Phase 10.7 — Station Inventory Foundation

Status: **COMPLETE**

- Legacy `station_items` evidence reviewed and implemented with clean Laravel names
- Added `station_items`: restrictive Station/Item foreign keys, `DECIMAL(12,3)` quantity, timestamps, and unique `(station_id, item_id)`
- Added `StationItem`, its Station/Item relationships, Admin-only CRUD, filtering, live search, pagination, assignment, quantity editing, Item-threshold Low Stock status, and safe removal
- Preserved `items.quantity` as transitional global quantity without hidden synchronization
- Assigned master Items and Stations are protected from deletion
- Added scalable authorized Item lookup and complete Station options
- Added confirmed `suppliers.is_active` to the existing Supplier schema, model, API, form, and table without another Supplier migration
- Added no Orders, Order Items, payments, stock deduction, Receiving, Withdrawal, Spoilage, Price table, inventory movement table, Service, or Repository

Verification: **74 tests, 431 assertions passed**; Item-level reorder-point validation and station Low Stock coverage below/equal/above the Item threshold passed; PHP 8.2 Pint, TypeScript, the Electron production build, and `git diff --check` passed. The applied development schema and original create migrations now match: `items` contains required `name`, `units_backup`, `unit`, and `reorder_point`, while `station_items` retains station-specific quantity only. Supplier `is_active` was added directly to the live schema and its original create-table migration.

Resolved: Station-to-Item inventory relationship, station-specific quantity, Item-level reorder point, and the legacy unit fields. Legacy numeric unit values are identifiers stored in `items.unit`; readable unit labels are stored in `items.units_backup`.

Still deferred: removal/redefinition of `items.quantity`; expiry dates and `expiry_notification`; automatic low-stock alerts or replenishment; legacy Price table verification; Supplier-to-Item; Receiving and details; Withdrawal and details; Spoilage; inventory movement history; Item Delivery; Monthly End Report; Customer Management; traditional Consignment transactions/items/payments; Orders, Order Items, cart finalization, cash/change, automatic Station inventory deduction, transaction history, Customer/Remit/settlement meanings; printer/cash drawer; advanced auth; customer web/mobile menu.

## Phase 10.6 — Consignment Account Management

Status: **COMPLETE**

- Reviewed the legacy Consignment screen and confirmed it manages accounts, not goods transactions
- Reused `users`, `stations`, and `consignees`; added nullable restrictive `users.station_id` and `users.consignee_id`
- Added User-to-Station and User-to-Consignee relationships and inverse relationships
- Extended Employee Management with a Station column and optional Station dropdown backed by `users.station_id`; raw IDs remain hidden from users
- Added Admin-only `/api/consignment-accounts` CRUD plus a complete authorized options endpoint
- Added `ConsignmentAccountController`, Store/Update Form Requests, and a password-safe Resource
- New accounts retain the existing `end_user` role; no third role was introduced
- Passwords remain hashed, confirmation is never persisted, existing passwords are never loaded, and blank edit passwords preserve the hash
- Added Station/Consignee selection, Add Consignee shortcut, live 350 ms search, cancellation, pagination, and centered deletion
- Assigned Stations and Consignees now return a safe 409 instead of leaking a foreign-key error
- Added no `consignments`, `consignment_items`, Service, Repository, transaction wrapper, or inventory behavior

Verification: **69 tests, 364 assertions passed**; TypeScript and Electron production build passed. Employee Station assignment, reassignment, clearing, Station-name search, complete options, and invalid IDs are covered. The relationship columns live in the base users schema, while the existing Station and Consignee migrations add their constraints only after those referenced tables exist; no separate Phase 10.6 migration file is retained.

Resolved: Employee/User-to-Station, Consignment Account-to-Station, and Consignment Account-to-Consignee associations.

Still deferred: traditional Consignment transaction workflow and Consignment-to-Item relationship (requires additional confirmed business requirements/screens); Supplier-to-Item; quantity deduction; stock-in/out; inventory history; low-stock behavior; availability; Station-to-Order; End User Item read access; Orders, Order Items, Checkout, Payments; printing/cash drawer; advanced auth; customer menu.

## Phase 10.5 — Consignee Management

Status:

```
COMPLETE
```

### Phase 10.5 deliverables

- Introduced the `consignees` table with required `name`; nullable string `contact_number`, nullable `email`, nullable text `address`; and timestamps
- Added the `Consignee` Eloquent model without speculative relationships
- Added `Api\ConsigneeController`, `StoreConsigneeRequest`, `UpdateConsigneeRequest`, and `ConsigneeResource`
- Added `GET/POST /api/consignees` and `GET/PUT/PATCH/DELETE /api/consignees/{consignee}`
- Reused `auth:sanctum`, the `admin` alias, and `EnsureUserIsAdmin`
- Added list, create, edit, and centered delete-confirmation UI
- Added 350 ms live name/contact-number/email search, request cancellation, inline X clearing, zero-result feedback, and 10-record pagination
- Preserved contact numbers as strings and normalized blank optional fields to `null`
- Used direct Controller-to-Eloquent CRUD without a Service, Repository, raw SQL, or transaction
- Added no Consignee-to-Item or Consignee-to-Consignment relationship; deletion must be revisited in Phase 10.6

### Phase 10.5 verification — 2026-09-27

| Check | Result |
|---|---|
| Complete Laravel test suite | PASS — 65 tests, 322 assertions |
| Consignee API authorization | PASS — unauthenticated 401; End User 403; Admin allowed |
| Create/show/PUT/PATCH/delete, required name, optional fields, valid/invalid email | PASS |
| String contact number, three-field search, zero results, empty search, and pagination | PASS |
| Route middleware order | PASS — `auth:sanctum`, then `EnsureUserIsAdmin` |
| MySQL/MariaDB migration | PASS — `2026_09_27_030000_create_consignees_table` applied |
| Live API create/search/PATCH/delete | PASS — string contact number preserved; disposable record cleaned up |
| PHP 8.2 `vendor/bin/pint --test` | PASS |
| Frontend TypeScript check | PASS |
| Electron production build | PASS — main, preload, and renderer |
| `git diff --check` | PASS |

### Deferred feature register carried forward

- Employee-to-Station assignment
- Supplier-to-Item relationship
- Consignee-to-Consignment relationship
- Consignment-to-Item relationship
- Automatic Item quantity deduction, stock-in/out, movement history, reorder levels, and low-stock notifications
- Item availability/status and End User Item read access
- Station-to-Order relationship, Orders, Payments, and transaction processing
- Receipt printing, cash drawer, ESC/POS, and USB integration
- OTP/2FA and other advanced authentication
- Customer web/mobile food menu

## Phase 10.4 — Item Management

Status:

```
COMPLETE
```

### Phase 10.4 deliverables

- Introduced the `items` table with unique required string `item_code`, required `name`, fixed-precision `quantity`, readable `units_backup`, legacy unit code `unit`, Item-level `reorder_point`, fixed-precision `price`, and timestamps
- Added the `Item` Eloquent model with `decimal:3` quantity and `decimal:2` price casts and no premature relationships
- Added `Api\ItemController`, `StoreItemRequest`, `UpdateItemRequest`, and a safe `ItemResource`
- Added `GET/POST /api/items` and `GET/PUT/PATCH/DELETE /api/items/{item}`
- Reused `auth:sanctum`, the `admin` alias, and `EnsureUserIsAdmin`
- Added Item list, create, edit, centered delete confirmation, and Philippine peso display formatting
- Added 350 ms live item-code/name/unit-name search, request cancellation, inline X clearing, zero-result feedback, and 10-record pagination
- Added suggested readable unit labels while allowing custom `units_backup` values, preserved the separate legacy unit code, and added no units table
- Kept legacy unit-code and reorder-point fields hidden from Item Management; the UI retains the simple Item Code, Item Name, Quantity, Unit, and Price display
- Kept the Item reorder point hidden from Station Inventory as well; only the computed Low Stock/In Stock status is displayed
- Kept API prices as two-decimal strings and kept the peso symbol out of database values
- Allowed duplicate Item names because no uniqueness requirement has been established
- Used Controller-to-Eloquent CRUD without a Service, Repository, raw SQL, or unnecessary transaction
- Added initial Item quantity, unit label/code, and reorder point as required by the confirmed legacy format, while deferring automatic deduction, stock-in/out, inventory history, low-stock notifications, and order-based quantity updates
- Added no availability/status, Supplier, Consignee, Consignment, Station, Order, Inventory, or user relationship
- Hardware and advanced authentication remain deferred

### Phase 10.4 verification — 2026-09-27

| Check | Result |
|---|---|
| Complete Laravel test suite | PASS — 59 tests, 282 assertions |
| Item API authorization | PASS — unauthenticated 401; End User 403; Admin allowed |
| Item create/show/PUT/PATCH/delete | PASS |
| Required unique item code, name, quantity, unit label/code, reorder point, and price | PASS |
| Quantity/reorder-point/price precision, invalid/negative values, and required units | PASS |
| Duplicate names, item-code/name/unit-name search, zero results, empty search, and 10-record pagination | PASS |
| Route middleware order | PASS — `auth:sanctum`, then `EnsureUserIsAdmin` |
| MySQL/MariaDB migration | PASS — `2026_09_27_020000_create_items_table` applied in batch 4 |
| Live API create/search/PATCH/delete | PASS — decimal strings preserved; disposable record cleaned up |
| PHP 8.2 `vendor/bin/pint --test` | PASS |
| Frontend TypeScript check | PASS |
| Electron production build | PASS — main, preload, and renderer |
| Public `/api/health` | PASS — running API returned `status: ok` |
| `git diff --check` | PASS |

## Phase 10.3 — Supplier Management

Status:

```
COMPLETE
```

### Phase 10.3 deliverables

- Introduced the `suppliers` table with required `name`; nullable `contact_person`, `contact_number`, `email`, and `address`; and timestamps
- Added the `Supplier` Eloquent model without premature relationships
- Added `Api\SupplierController`, Supplier Form Requests, and a safe snake_case `SupplierResource`
- Added `GET/POST /api/suppliers` and `GET/PUT/PATCH/DELETE /api/suppliers/{supplier}`
- Reused `auth:sanctum`, the `admin` alias, and `EnsureUserIsAdmin`
- Added Supplier list, create, edit, and centered delete confirmation UI
- Added 350 ms live name/contact-person/contact-number/email search, request cancellation, inline X clearing, and 10-record pagination
- Normalized blank optional fields to `null`; retained contact numbers as strings
- Used Controller-to-Eloquent CRUD without a Service, Repository, raw SQL, or unnecessary transaction
- Added no Item, Consignment, Order, Inventory, Station, or hardware relationship
- Items and all later phases remain deferred

### Phase 10.3 verification — 2026-09-27

| Check | Result |
|---|---|
| Complete Laravel test suite | PASS — 48 tests, 203 assertions |
| Supplier API authorization | PASS — unauthenticated 401; End User 403; Admin allowed |
| Supplier create/show/PUT/PATCH/delete | PASS |
| Required name, nullable fields, valid/invalid email, string contact number | PASS |
| Four-field search, zero results, empty search, and 10-record pagination | PASS |
| Route middleware order | PASS — `auth:sanctum`, then `EnsureUserIsAdmin` |
| MySQL/MariaDB migration | PASS — `2026_09_27_010000_create_suppliers_table` applied |
| Live MySQL supplier create/search/delete | PASS — string contact number preserved; disposable record cleaned up |
| PHP 8.2 `vendor/bin/pint --test` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` (Electron main, preload, renderer) | PASS |
| Live Admin Supplier page and centered Add Supplier dialog | PASS |
| `git diff --check` | PASS |

## Phase 10.2 — Station Management

Status:

```
COMPLETE
```

### Phase 10.2 deliverables

- Introduced the `stations` table with unique `name`, required `location`, nullable `description`, and timestamps
- Added the `Station` Eloquent model without premature relationships
- Added `Api\StationController`, `StoreStationRequest`, `UpdateStationRequest`, and a safe `StationResource`
- Added `GET/POST /api/stations` and `GET/PUT/PATCH/DELETE /api/stations/{station}`
- Reused `auth:sanctum`, the `admin` alias, and `EnsureUserIsAdmin` for authoritative Admin-only access
- Added Station list, create, edit, and centered delete confirmation UI
- Added 350 ms live name/location/description search, request cancellation, inline X clearing, and 10-record pagination
- Used Controller-to-Eloquent CRUD without a Service, Repository, raw SQL, or unnecessary transaction
- Added no employee assignment, business relationship, hardware field, or package
- Supplier, Items, Consignee, Consignment, Orders, Inventory, Hardware, and advanced authentication remain deferred

### Phase 10.2 verification — 2026-09-27

| Check | Result |
|---|---|
| Complete Laravel test suite | PASS — 40 tests, 160 assertions |
| Station API authorization | PASS — unauthenticated 401; End User 403; Admin allowed |
| Station create/show/update/delete and validation | PASS |
| PUT, PATCH, same-name update, unique-name validation | PASS |
| Name/location/description/zero-result/empty search and 10-record pagination | PASS |
| Live location create/search/delete against MySQL/MariaDB | PASS — disposable record cleaned up |
| Route middleware order | PASS — `auth:sanctum`, then `EnsureUserIsAdmin` |
| MySQL/MariaDB migration | PASS — `2026_09_27_000000_create_stations_table` applied |
| PHP 8.2 `vendor/bin/pint --test` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` (Electron main, preload, renderer) | PASS |
| Live Admin Station page and centered Add Station dialog | PASS |
| `git diff --check` | PASS |

Native Electron window click-through remains subject to the previously documented local Chromium AppData cache permission issue. The production main, preload, and renderer bundles compile successfully; IPC code was not changed.

## Phase 10.1 — Employee Management

Status:

```
COMPLETE
```

### Phase 10.1 deliverables

- Employee Management implemented against the existing `users` table and `User` model
- No `employees` table, Employee model, schema migration, or new package added
- Canonical REST endpoints: `GET/POST /api/users` and `GET/PUT/DELETE /api/users/{user}`
- Laravel Sanctum authentication plus one simple `EnsureUserIsAdmin` middleware enforce Admin-only access
- Existing roles remain exactly `admin` and `end_user`
- Paginated, name-sorted employee list with 350 ms debounced live name/email search and an inline clear control
- Add, edit, optional password replacement, and centered delete confirmation
- Backend-authoritative Form Request validation and safe `UserResource` responses
- Employee Form Requests are kept directly under `app/Http/Requests`; API controllers remain conventionally grouped
- User CRUD uses Eloquent directly without a Service, Repository, or unnecessary transaction wrapper
- Passwords remain write-only and are hashed by the existing User model cast
- Signed-in Admin cannot delete their own account
- Last remaining Admin cannot be deleted or demoted
- Human-readable validation, authorization, conflict, server, and network feedback
- Supplier, Items, Consignee, and Consignment remain unimplemented
- Hardware and advanced authentication remain postponed

### Phase 10.1 verification — 2026-09-26

| Check | Result |
|---|---|
| Laravel user-management/auth/health feature tests | PASS — 32 tests, 115 assertions |
| Admin-only API authorization (401/403) | PASS |
| `/api/users` middleware order (`auth:sanctum` then `EnsureUserIsAdmin`) | PASS |
| Create Admin/End User, validation, hashing, and safe responses | PASS |
| Update with unchanged/replacement password | PASS |
| Delete, self-delete, and last-Admin safeguards | PASS |
| Live MySQL API create/update/replacement-login/delete with cleanup; 401/403 checks | PASS |
| `npm run typecheck` | PASS |
| `npm run build` (Electron main, preload, and renderer) | PASS |
| Live Admin list/search/edit, validation, self-delete UI, and centered delete dialog | PASS |
| Live 350 ms search debounce and inline X clear behavior | PASS |
| Live End User navigation and manual `/employees` route denial | PASS |
| Dashboard, Orders placeholder, and logout regression | PASS |
| PHP 8.2 `vendor/bin/pint --test` | PASS |
| Migration status | PASS — existing migrations applied; no new migration required |

### Architecture simplification — 2026-09-26

- Replaced the Employee Management Gate with the `EnsureUserIsAdmin` route middleware
- Preserved `auth:sanctum` before role authorization and the existing 401/403 behavior
- Flattened `StoreUserRequest` and `UpdateUserRequest` into `app/Http/Requests`
- Removed transaction and row-lock wrappers from single-model user update/delete operations
- Preserved self-delete and last-Admin application checks
- Replaced Search/Clear buttons with 350 ms debounced live search and an inline X clear control
- Established Controller-to-Eloquent as the default CRUD path; Services remain reserved for real multi-step operations and Repositories are not used

Windows environment note: the native Electron development process currently exits before exposing a window because Chromium cannot create its cache under `%APPDATA%\university-homestay-pos` (`Access is denied`). The same main/preload/renderer sources compile successfully, the IPC implementation was not changed, and the live Vite renderer was exercised through the in-app browser. Resolve the local AppData cache permissions before repeating a native-window IPC click-through.

## Phase 9 — Dashboard & Role-Aware Navigation Foundation

Status:

```
COMPLETE
```

### Phase 9 deliverables

- Simple Dashboard using authenticated `currentUser` name, email, and human-readable role
- Canonical authenticated landing route: `/dashboard`
- Admin navigation: Dashboard, Employee, Items, Station, Orders / POS, Consignee, Consignment, Supplier
- End User navigation: Dashboard and Orders / POS only
- Admin-only frontend routes redirect End Users to `/dashboard`
- Unauthenticated application routes remain protected by the Phase 8 auth guard
- Existing Phase 4 application shell, header, sidebar, placeholders, Lucide icons, and design tokens reused
- Existing Phase 8 logout flow reused; no duplicate authentication state or logout mechanism
- No fake Dashboard statistics, business CRUD, Dashboard APIs, database changes, or new packages
- Hardware and advanced authentication remain postponed
- Frontend role visibility is UX only; Laravel authorization remains mandatory for future protected APIs

### Phase 9 verification — 2026-09-26

| Check | Result |
|---|---|
| Admin login, Dashboard, eight navigation entries, and all placeholder routes | PASS |
| End User login, Dashboard, and Orders / POS navigation only | PASS |
| End User manual access to `/employees` redirects to `/dashboard` | PASS |
| Active sidebar state (`aria-current` plus visible selected treatment) | PASS |
| Unauthenticated, unknown, and authenticated-login route handling | PASS |
| Admin and End User logout | PASS |
| `/api/health` and `/api/current-user` regression checks | PASS |
| Electron main/preload build and development launch; IPC bridge unchanged | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `php artisan test` | PASS — 16 tests, 60 assertions |
| Laravel version | PASS — 12.69.2 |

## Phase 8 — Simple Authentication / Login Foundation

Status:

```
COMPLETE
```

### Phase 8 deliverables

- Laravel Sanctum personal access tokens (`laravel/sanctum` ^4.3)
- Existing `users` table reused; `role` column added (`admin` | `end_user`)
- Endpoints: `POST /api/login`, `POST /api/logout`, `GET /api/current-user`
- Login rate limited (`throttle:login`, 5/min per email+IP)
- Development seed users (dev-only passwords — see seeder)
- Frontend Login page, AuthProvider/`currentUser`, protected routes, header logout
- Logout revokes only the current Sanctum token so other sessions remain valid
- Authenticated HTTP 401 responses centrally clear the token/user and return protected routes to Login
- Backend-unavailable logout still clears the local session and displays a warning on Login
- **Not** implemented: OTP, 2FA, password reset, email verification, employee CRUD, social login

### Phase 7/8 verification and hardening — 2026-09-26

The shared frontend/backend connection was reviewed before further product work. Corrections completed:

- Packaged Electron renderer now loads through the registered standard and secure `pos://app` protocol instead of `file://`.
- Laravel CORS allows only the two documented Vite origins plus `pos://app`; untrusted `Origin: null` remains rejected.
- `ImportMeta.env` declarations were corrected so the full frontend TypeScript check passes.
- The shared API client now preserves normal Laravel 422 validation messages and handles HTTP 429 without applying login-specific wording to every module.
- Sanctum logout now revokes only the active token instead of every token owned by the user.
- Invalid or expired authenticated sessions now clear centralized frontend auth state and return the user to Login.
- A startup network failure reports that the saved session could not be checked without discarding its token.
- Logout remains locally safe when Laravel is unavailable and reports that remote revocation could not be confirmed.
- Laravel Pint formatting was applied with PHP 8.2.12.

Verification results:

| Check | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `php artisan test` (PATH PHP 8.2.12 with SQLite) | PASS — 16 tests, 60 assertions |
| PHP 8.2 `vendor/bin/pint --test` | PASS after formatting |
| Packaged `pos://app` CORS test | PASS |
| Untrusted `Origin: null` rejection test | PASS |
| Configured MySQL/MariaDB migrations and development users | PASS |
| Live HTTP login/current-user/logout/revoked-token/validation/health flow | PASS |
| Live renderer login, dashboard, logout, and protected-route flow | PASS |
| Invalid-token redirect with session-ended feedback | PASS |
| Backend-unavailable local logout with warning | PASS |

PHP 8.2 environment note: XAMPP PHP 8.2.12 is the primary PHP on PATH and is used for all Laravel operations including tests and Pint.

Repository note: the workspace is connected to `https://github.com/codelikeaproz/pos.git`; the Phase 8 baseline is on `main`. Authentication hardening changes remain local until an explicit commit/push request.

### Development credentials (local only — never use in production)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `password` |
| End User | `operator@example.com` | `password` |

### Prior phases

- Phase 1 — Environment Verification: **COMPLETE**
- Phase 2 — Frontend Desktop Shell: **COMPLETE**
- Phase 3 — Electron Foundation: **COMPLETE**
- Phase 4 — Frontend Foundation: **COMPLETE**
- Phase 5 — Laravel 12 Backend Foundation: **COMPLETE**
- Phase 6 — API Foundation: **COMPLETE**
- Phase 7 — Frontend ↔ Laravel API Connection: **COMPLETE**

### Environment decisions (still in force)

1. **Laravel:** **Laravel 12** (locked). Do **not** use Laravel 13. See [[Requirement]].
2. **PHP:** 8.2.12 from XAMPP is the primary PHP on PATH and is used for all Laravel operations.
3. **Database (local):** XAMPP MariaDB 10.4.32; DB `pos_homestay`; target MySQL 8.4 LTS for production.
4. **Node:** v22.14.0 acceptable for frontend development.
5. **Phase boundary:** Phase 10.10 is complete. No next phase has been approved.

Related: [[Architecture]] · [[Requirement]] · [[Rules]] · [[PRD]]

---

# 19. Next Steps

Immediate next phase (**awaiting explicit go-ahead**):

1. Review and approve Phase 10.10 Transaction History

Then:

2. Remaining confirmed Master Data modules
3. Hardware integration

Frontend run:

```
cd frontend
npm install
npm run dev
```

Backend run:

```
cd backend
php artisan serve
```

Health: `http://127.0.0.1:8000/api/health`

Auth: `POST /api/login`, `GET /api/current-user`, `POST /api/logout`

Frontend API base URL (Vite): `VITE_API_BASE_URL` in `frontend/.env`

Business / product confirmations (still open):

1. Confirm the exact purpose of Consignment.
2. Confirm the meaning of Consignee in the business workflow.
3. Confirm the Employee/User roles.
4. Confirm whether Orders and Transactions are separate concepts.
5. Confirm inventory behavior when an order is completed.
6. Identify the exact receipt printer model.
7. Identify the exact cash drawer model.
8. Test printer and cash drawer compatibility.
9. Finalize database relationships.
10. Create Laravel POS domain migrations.

---

# 20. Handoff Note

The team should not begin by implementing every feature simultaneously.

Recommended sequence:

```
Understand
   ↓
Database Design
   ↓
Laravel API
   ↓
Authentication
   ↓
Dashboard
   ↓
Management Modules
   ↓
POS
   ↓
Payment
   ↓
Hardware
   ↓
Testing
   ↓
Deployment
```

Each phase should be completed and verified before moving to the next.

---

# 21. Important Principle

> Preserve the existing workflow first. Improve it second. Expand it later.

The new architecture should make the system easier to maintain without unnecessarily changing how the users currently operate the POS.
