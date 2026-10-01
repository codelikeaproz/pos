# University HomeStay POS
## Architecture

### Phase 10.16.1 compact UI and Station Inventory summary (2026-10-01)

Shared Modal focus initializes only when a dialog opens. The component keeps the latest close callback in a ref, automatically focuses the first enabled body control unless a caller supplies `initialFocusRef`, and restores the prior control on close. Controlled field rerenders and AJAX option refreshes no longer refocus the dialog container or interrupt typing.

Inventory quantity storage and calculations remain exact thousandths with `DECIMAL(12,3)`. New manual quantity entry uses at most two decimal places in Product, POS quantity editing, Item Delivery, and Spoilage; backend acceptance remains three-decimal compatible for existing records and integrations. Display formatting removes trailing `.000` and preserves a meaningful third digit in historical values such as `1.125`.

The Spoilage reporting dialog uses a compact two-table layout: Available Station Items with individual and master checkboxes on the left, and Selected Spoilage Items with editable quantities on the right. Station, Item search, selectable Manila Incident Date, and Remarks remain presentation over the existing Phase 10.14 transaction. The authenticated actor, snapshots, stock validation, locks, negative SPOILAGE movements, and rollback behavior remain authoritative.

Spoilage accepts an optional explicit Manila `incidentDate` for delayed reporting. The current UI always sends the selected date, defaults it to today, and disallows future dates. The API rejects future dates, persists a backdated incident at the selected Manila calendar day, and uses that date in `SPL-YYYYMMDD-######`; omitted dates remain compatible with server-time creation.

Station Inventory is a read-only stock monitoring module. Item Delivery is the supported workflow for introducing Item stock into a Station. Station Inventory provides Station selection, Search, pagination, View Spoilage, and the columns Description, Item Code, Qty, Sold, Spoilage, and Remaining Qty. View Spoilage routes to the existing Spoilage Management history scoped to the selected Station; it does not duplicate Spoilage logic. Station Inventory exposes no Assign, Edit, Remove, Delivery, Status, or Actions column. Existing backend inventory mutation capabilities remain implemented but are not part of this monitoring UI.

Item Delivery establishes a missing StationItem or increases an existing one, records a positive DELIVERY movement, and commits its header, snapshot details, balance update, and movement atomically. Its delivery form presents Station and Receiver followed by Item search, side-by-side Available Items and Selected Delivery Items tables, and editable two-decimal manual quantities before confirmation. Completed deliveries remain read-only and use compact detail viewing.

Price Management presents a compact read-only history table with Item Code, Item Name, Price, and Status; its Date and Action columns are not displayed. The Add Price workflow remains available and activates the newly added Price. The existing historical activation API is retained.

The shared Table, Button, Badge, Input, and Modal styling now follows a compact legacy-inspired desktop density while preserving the React/Electron component architecture, CMU green/yellow branding, keyboard focus indicators, and responsive overflow. Table headers use compact medium-weight text; all table body data is regular weight. Conventional row actions use compact Lucide icons with `aria-label`, title text, focus, disabled, and destructive states. Primary confirmation and form actions retain text. Read-only Customer and Credit tables intentionally have no invented actions.

Admin Station Inventory exposes Description, Item Code, Qty, Sold, Spoilage, and Remaining Qty. F12 exposes Item, Code, Unit, Sold, Spoilage, and Remaining. `station_items.quantity` remains the authoritative Remaining Qty. Sold and Spoilage are exact grouped absolute sums of recorded SALE and SPOILAGE movements without N+1 queries. Qty is a reconciled available/base quantity calculated in decimal SQL as `Remaining Qty + Sold + Spoilage`; therefore `Qty - Sold - Spoilage = Remaining Qty` even when DELIVERY, signed ADJUSTMENT, or a pre-ledger opening balance affected the authoritative balance. Qty is not `items.quantity`, is not a separately stored balance, and must not be interpreted as recorded deliveries alone.

Movement summaries cover only records written since inventory movement tracking began. Existing balances may therefore show zero Delivered, Sold, or Spoilage while still showing a nonzero authoritative Remaining Qty. No Orders were replayed and no historical movement rows were fabricated. F12 remains scoped to the authenticated User's Station, includes inactive and unpriced assignments, exposes no write action, and preserves the POS cart.

### Current POS layout and in-place cashier actions (2026-10-01)

The POS uses a full-width cashier layout with the existing green/yellow branding. The left column shows Available Items with inline, paginated AJAX search results and no food image. Its table shows Name, Item Code, Available stock with its unit (for example, `8 bottle`), Unit Price, and an icon-only Add action. Item names are regular weight. The current Order and payment panel remain on the right; Current Order has a separate Item Code column, regular-weight Item names, and icon-only pencil and trash actions for each cart line. The live Manila clock sits at the left of the bottom action strip. The shared application top bar and sidebar are hidden on POS and return when the cashier exits to Dashboard; the POS masthead supplies its own branding.

`GET /api/pos/items` keeps its authenticated Station scope, active-Item and single-active-Price rules, 10-row pagination, and name/code search. A blank search shows the first page. Exact Item code matches rank first within a search so Enter can add one unit from the first page; name matches are selected from the list. Zero-stock Items remain visible with a disabled plus icon and an out-of-stock tooltip, but cannot be added. Icon-only actions have item-specific accessible labels and tooltips. A search failure appears at the field without hiding the cart or payment area. Adding an Item clears the search for the next entry. F12 remains the separate read-only inventory dialog, including inactive and unpriced assigned stock. Change Quantity selects the existing value on open, accepts ordinary text editing and Backspace, and uses one-unit up/down controls while retaining up to three fractional digits. Enter submits through the same validation as Update. POS noninteger quantities display at least two fractional places (`1.50`, `2.50`), while whole numbers display as `2`. POS dialogs use their header X to cancel or close, without duplicate footer actions.

The payment panel has a prominent Mode of Payment heading above plain-text F3 Cash and F4 Credit / Utang controls in place of radio buttons. F3 aligns with Total Amount; F4 aligns with Cash Received. The heading and Pay action have no icons. F3 opens a Cash Received dialog with one ordinary text input, Order Total, and live Change; there is no on-screen keypad. Confirming a sufficient amount returns to the POS; Cash Received and Change remain read-only in the panel until Pay submits the existing checkout. F4 opens Customer selection and activates Credit only after selection. Cancelling either dialog keeps the prior payment choice. Switching methods clears the other method's details. Cash and Credit continue to use the same checkout API and server safeguards.

The footer exposes only working actions: F7 opens a read-only current-Station transaction dialog with Order details, F9 edits a cart line's quantity (using a line picker for multiple items), F10 starts a new Order, F12 opens read-only current-Station inventory, and Esc exits POS. New Order and Exit POS confirm before discarding an unpaid cart. F7 and F12 leave the cart intact. Discount, O.R Transactions, and F8 Credit Transactions remain deferred and are not shown as working buttons.

F7 reuses `GET /api/orders` with search, date filters, and pagination, then `GET /api/orders/{order}` for read-only detail. Admin POS sends its current `station_id` filter; Cashier Order requests are scoped to the signed-in Station by the server. F12 reads all assigned stock, including inactive or unpriced Items, through authenticated `GET /api/pos/station-inventory`; the server derives the Station from the User, supports search and 10-row pagination, and returns 409 for an unassigned User. The sellable `GET /api/pos/items` list retains its separate active-Item and single-active-Price rules. The inventory dialog exposes no stock editing.

### Phase 10.16 POS Credit / Utang checkout

The existing POS checkout accepts Cash or Credit / Utang through the same transaction. Cash requires `cashReceived` and permits a Walk-in Order with `customer_id = null`; the server computes change. Credit requires an existing `customerId`, stores `payment_method = credit` and the Customer FK, and leaves `cash_received` and `change_amount` null. Both cash columns are nullable in the original Orders creation migration; existing Cash Orders retain their values. There is no second checkout engine or Credit table.

Both methods lock StationItem and Item rows, resolve the single active Price, compare the displayed Price, calculate authoritative totals, create Order and OrderItem snapshots, deduct Station stock, and write negative SALE movements atomically. Stale Price returns 409 before writes; insufficient stock also prevents writes. A paginated, searchable Customer selector reuses authenticated `GET /api/customers`; Customer creation and Credit Monitoring remain Admin-only. Completed Credit Orders appear in Credit Monitoring directly from Orders. Its Total Amount is recorded Credit sales, not an outstanding balance. Customer Balance and settlement belong to the separate Accounting Office system and are not calculated or stored here.

After successful checkout, POS displays a receipt-style confirmation using the returned immutable Order summary. It shows CMU HomeStay and Station, transaction number, each Item name, quantity multiplied by snapshot Unit Price, line price, Total Price, and the purchase thank-you message. Credit receipts also identify the selected Customer. This is an on-screen receipt preview; printer hardware integration remains deferred.

### Phase 10.15 Customer and Credit Monitoring architecture

`customers` is distinct from Consignees: a Customer purchases on credit, while a Consignee participates in the separate consignment account workflow. Customer stores only name and address. `orders.customer_id` is nullable for cash/Walk-in Orders and restricts deletion when linked; a credit Order requires a Customer through the Order model invariant. Existing cash checkout remains unchanged. No credit checkout UI or endpoint exists yet.

Credit Monitoring reads existing `orders` with `payment_method = credit`, joined to Customer, Station, and Cashier. The UI displays MOP as Utang. Age is calculated from the Order date to today's date in Asia/Manila calendar days; it is not stored. Date filters use inclusive Manila dates. Total Amount sums all matching recorded credit sale totals in integer cents before pagination. This is a transaction total, not an outstanding balance. The Customer Balance column displays unavailable because Accounting Office settlement data is not represented in the POS database. The separate Accounting Office system owns settlement/payment; this POS has no settlement action or guessed integration. The existing `ORD-YYYYMMDD-######` identifier is retained, with no separate O.R number.

The confirmed sidebar order remains unchanged; Customer Management and Credit Monitoring are now enabled Admin modules. Credit Monitoring is read-only. Existing inventory, Price, Delivery, Spoilage, and cash checkout paths are unchanged.

### Phase 10.14.1 confirmed legacy-facing sidebar

Admin navigation follows this exact visible order: Dashboard, POS, Product Management, Station Inventory, Credit Monitoring, O.R Transactions, Stations, Privilege Assignment, Customer Management, Privilege, Price, Sale Remittance, Item Delivery, User Management. It uses the existing green/yellow brand tokens and Lucide icons. The top area reserves space for the unavailable original logo and displays authenticated Username and User Privilege. Technical `end_user` displays as Cashier; database role values are unchanged.

Product Management maps to the Item domain (`/items`); Stations to Station (`/stations`); Price to Price (`/prices`); User Management to User (`/employees`). Credit Monitoring, O.R Transactions, Privilege Assignment, Customer Management, Privilege, and Sale Remittance are visible but disabled as Coming Soon. Cashier navigation contains only Dashboard and POS. Spoilage, Transaction History, Supplier Management, Consignee Management, and Consignment Account remain implemented and routable outside the confirmed sidebar. No schema or business logic changed in this UI phase.

### Phase 10.14 current Spoilage architecture

`spoilages` headers belong to a Station and authenticated recording User; `spoilage_items` hold multiple Item lines with code, name, and unit snapshots. The Spoilage number is separate from POS Order and Item Delivery references. Spoilage is read-only after completion.

The Admin selects Items from that Station's `station_items` with positive stock, including inactive Items that still physically remain. No active Price is needed. Submission locks StationItem rows by Item ID, then Item rows, matching checkout and Delivery. It rechecks current stock, returning 409 with current availability when any requested deduction exceeds the locked balance. One transaction writes the header and details, decreases authoritative `station_items.quantity`, and records negative `SPOILAGE` movements referenced to detail IDs. `items.quantity` stays transitional and is not updated. Historical details remain readable after Item edits or deactivation.

### Phase 10.13 current Item Delivery architecture

Admin Item Delivery uses `item_deliveries` headers and `item_delivery_items` details. Each header belongs to a destination Station, the authenticated User who delivered, and an End User receiver assigned to that Station. Details identify Items by ID and keep item code, name, and unit snapshots for readable history after Item edits. `delivery_number` is independent of POS `orders.order_number`; Delivery is not a POS Order.

Submission locks the Station row to serialize first-time assignments, then existing StationItem rows and Item rows in the same order as checkout. One transaction creates the header and details, increases `station_items.quantity`, and writes positive `DELIVERY` movements linked to delivery detail IDs. The unique `(station_id, item_id)` constraint is the final protection against duplicate balances. Delivery does not update transitional `items.quantity`, does not require a Price, and has no edit or delete API. Active Items only can be delivered; past details remain readable when an Item is later deactivated.

### Phase 10.12 current pricing architecture

`items` has many historical `prices`; one active Price is the current selling price. Admin Price Management lists history, creates a replacement active Price, and reactivates an older record. Both changes lock the parent Item row and switch active flags in one `DB::transaction()`. Same-amount creation is rejected. There is no normal Price delete route. Application locking enforces the one-active rule for supported write paths; direct database writes can bypass it.

The POS inventory endpoint includes an Item only when it is active, belongs to the authenticated Station's `station_items`, and has exactly one active Price. Checkout locks StationItem and Item rows, resolves active Price records, compares their amounts with each cart line's `expectedUnitPrice`, and returns HTTP 409 with `currentPrices` if a displayed price changed. The frontend keeps the cart, updates displayed prices, refreshes POS data, and requires Pay again. Successful checkout snapshots the active amount into `order_items.unit_price` and writes stock and SALE movements atomically.

`items.price` remains a transitional legacy column for initial Item creation and historical backfill; Price Management changes do not synchronize it. It is not used to price new sales. Existing Item editing shows the active Price read-only. `items.quantity` remains transitional; `station_items.quantity` remains authoritative stock. Earlier sections below describe their historical phase state.

### Phase 10.11B current schema

The repository's current migrations and code supersede older phase descriptions below. `items.is_active` defaults to true; inactive Items retain station assignments and historical Orders but are excluded from new POS listings and checkout.

`prices` stores Item price history. Existing Items receive one active Price from `items.price` during migration. Item Management price changes create a new active record while deactivating the previous record under an Item row lock. The price resolver rejects zero or multiple active records. **Checkout and POS item responses still use transitional `items.price`** pending reconciliation of all write paths. `order_items.unit_price` remains the sale snapshot. Direct model or SQL edits to `items.price` can diverge from `prices` and must be eliminated before checkout switches.

`station_items.quantity` remains the authoritative current balance. `items.quantity` is transitional global quantity and is not synchronized. From Phase 10.11B onward, checkout records negative SALE movements linked to Order Items, and Admin balance edits record signed ADJUSTMENT movements in the same transaction as balance updates. Historical Orders are not backfilled into movements. Initial StationItem assignments and removals without movements are outside this ledger boundary; an assignment with movement history cannot be deleted.

Future Item Delivery is separate from POS Orders and should use an explicit `delivery_number`. Once its business rules are confirmed, completion should atomically create delivery records, lock or safely create station balances, add stock, and write positive DELIVERY movements. This workflow is not implemented.

> System architecture and technical structure of the University HomeStay POS and Inventory System.

### Project Documentation

- [[PRD]]
- [[Rules]]
- [[Requirement]]
- [[HandOff]]

---
## Related Documentation

- Product requirements → [[PRD]]
- Development conventions → [[Rules]]
- Technical requirements → [[Requirement]]
- Development handoff → [[HandOff]]



# 1. Project Overview

The University HomeStay POS and Inventory System is a Windows desktop application intended to modernize the existing University HomeStay POS system.

## Repository layout

```
POS/
├── frontend/     # Electron + React + TypeScript + Vite
├── backend/      # Laravel 12 API (University HomeStay POS API)
├── POS Memory/   # Obsidian documentation (not runtime code)
├── README.md
└── .gitignore
```

Runtime paths:

```
React Renderer
      │
      ├──────── IPC ────────→ Electron Main
      │                            │
      │                            └── Hardware (printer / cash drawer later)
      │
      │ HTTP
      ▼
Laravel 12 API
      │
      ▼
MySQL / MariaDB
```

- **HTTP API** — application data, authentication (later), business rules, inventory, orders, users
- **Electron IPC** — printer, cash drawer, native Windows integration, desktop-specific functionality

Do not mix IPC with Laravel API responsibilities. Do not use IPC as the Laravel communication mechanism.

Frontend API base URL (Vite, non-secret):

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Configured in `frontend/.env` / `frontend/.env.example`. Centralized client: `frontend/src/services/apiClient.ts`. Health check: `frontend/src/services/healthService.ts` → `GET /api/health`.

Renderer origins are intentionally explicit:

- Development: `http://localhost:5173` or `http://127.0.0.1:5173`
- Packaged Electron application: `pos://app`

The packaged application registers `pos` as a standard, secure Electron protocol and serves the built renderer from `pos://app/index.html`. Laravel CORS allows that exact origin. Do not switch the packaged renderer back to `file://` or allow the broad `null` origin; doing so either breaks API requests or grants access to unrelated local-file pages.

The existing system currently provides:

- Login
- Dashboard
- Employee management
- Item management
- Station management
- Order/POS processing
- Consignee management
- Consignment management
- Supplier management
- Transaction processing
- Cash payment and change calculation

The new implementation will preserve the existing workflow while replacing the current Visual Basic desktop implementation with a more maintainable architecture.

The initial system will focus only on the desktop POS.

Customer-facing mobile applications and public food menus are considered future extensions and are not part of the initial implementation.

---

# 2. Technology Architecture


┌──────────────────────────────────────────────────────┐
│                 WINDOWS COMPUTER                     │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │              ELECTRON DESKTOP                  │  │
│  │                                                │  │
│  │  React + TypeScript                            │  │
│  │  ├── Login                                     │  │
│  │  ├── Dashboard                                 │  │
│  │  ├── Employee                                  │  │
│  │  ├── Items                                     │  │
│  │  ├── Station                                   │  │
│  │  ├── Orders / POS                              │  │
│  │  ├── Consignee                                 │  │
│  │  ├── Consignment                               │  │
│  │  └── Supplier                                  │  │
│  │                                                │  │
│  │              HTTP / API                        │  │
│  └──────────────────────┬─────────────────────────┘  │
│                         │                            │
│                         ▼                            │
│  ┌────────────────────────────────────────────────┐  │
│  │                 LARAVEL API                    │  │
│  │                                                │  │
│  │  Authentication                                │  │
│  │  Validation                                    │  │
│  │  Business Logic                                │  │
│  │  Eloquent ORM                                  │  │
│  │  API Resources                                 │  │
│  │  Database Access                               │  │
│  └──────────────────────┬─────────────────────────┘  │
│                         │                            │
│                         ▼                            │
│                  ┌──────────────┐                    │
│                  │    MySQL     │                    │
│                  └──────────────┘                    │
│                                                      │
│  Hardware:                                           │
│  ├── Receipt Printer                                 │
│  └── Cash Drawer                                     │
└──────────────────────────────────────────────────────┘

# 3. Application Layers

## 3.1 Electron

Electron provides the Windows desktop application container.

Responsibilities:

- Launch the desktop application
- Display the React application
- Provide controlled access to local Windows functionality
- Handle printer/cash-drawer integration when required
- Package the application as a Windows executable

Electron should not contain the main business rules of the POS.

## 3.2 React + TypeScript

React is responsible for the user interface.

Responsibilities:

- Login interface
- Dashboard
- Forms
- Tables
- POS interface
- Search
- Order cart
- Payment interface
- Validation feedback
- Loading and error states

React should communicate with Laravel through API requests.

The React renderer should not directly connect to MySQL.

---

## 3.3 Laravel

Laravel is the main backend.

Responsibilities:

- Authentication
- Authorization
- Request validation
- Business rules
- Database operations
- Transaction processing
- Inventory-related operations
- API responses

Laravel will use Eloquent ORM for database interaction.

---

## 3.4 MySQL

MySQL stores persistent application data.

Initial entities:

- Users
- Stations
- Items
- Suppliers
- Consignees
- Orders
- Order Items
- Consignments

The exact structure of `consignments` must be confirmed after the existing business process is clarified.

# 4. Initial Application Flow

Login
  ↓
Dashboard
  ↓
┌───────────────────────────────────────────┐
│ Employee                                  │
│ Items                                     │
│ Station                                   │
│ Orders                                    │
│ Consignee                                 │
│ Consignment                               │
│ Supplier                                  │
└───────────────────────────────────────────┘

# 5. POS Order Flow

Login
  ↓
Orders / POS
  ↓
Search Item
  ↓
Select Item
  ↓
Add Item to Order
  ↓
Change Quantity
  ↓
Calculate Subtotal
  ↓
Calculate Total
  ↓
Select Payment Method
  ↓
Enter Cash
  ↓
Calculate Change
  ↓
Pay
  ↓
Save Transaction
  ↓
Print Receipt
  ↓
Open Cash Drawer


# 6. Hardware Architecture

   The initial hardware scope is intentionally small.

Required:
Computer
Receipt Printer
Cash Drawer


The cash drawer is expected to be connected through the receipt printer when the selected hardware supports drawer-kick functionality.

Hardware integration should be isolated from the business logic.

Example:

POS Payment
    ↓
Payment Service
    ↓
Printer Service
    ├── Print Receipt
    └── Open Cash Drawer


# 7. Database Structure

users
stations
items
suppliers
consignees
orders
order_items
consignments

Relationships currently identified:
Station
   │
   └── Users

User
   │
   └── Orders

Order
   │
   └── Order Items
          │
          └── Item

Potential future relationships involving suppliers, consignees, and consignments must be confirmed against the existing business workflow before implementation.


# 8. Laravel Eloquent Models

User
Station
Item
Supplier
Consignee
Order
OrderItem
Consignment

Laravel table naming:

users
stations
items
suppliers
consignees
orders
order_items
consignments

"Use Laravel's Eloquent conventions wherever possible."


# 9. Desktop Application Boundary

The desktop application is the primary client.

```
React Renderer
  ├─ IPC → Electron Main → Hardware (later)
  └─ HTTP → Laravel 12 API → MySQL
```

Laravel API request flow:

```
Route
  ↓
Middleware
  ↓
Form Request (when validation is needed)
  ↓
Controller
  ↓
Eloquent
  ↓
Database
```

This is the default flow. Controllers may use Eloquent directly for normal CRUD. Add a service only when a real operation spans multiple steps, models, or reusable business rules. Do not add a Repository layer over Eloquent.

Do not allow:

```
React
  ↓
MySQL
```

The renderer must not contain database credentials.

Canonical API health check: `GET /api/health` (application availability). Framework probe `/up` remains separate for ops.

# 9.1 Authentication (Phase 8)

```
Electron React
      ↓
Login Page
      ↓
Laravel 12 API
      ↓
Sanctum (personal access tokens)
      ↓
users table
      ↓
Authenticated User (currentUser)
      ↓
Admin (admin) / End User (end_user)
      ↓
Dashboard
```

Endpoints:

- `POST /api/login` — public
- `GET /api/current-user` — authenticated (do **not** use `/api/me`)
- `POST /api/logout` — authenticated (revokes only the token used for the current session)

Authentication state is centralized in the frontend auth provider and token service. An HTTP 401 from an authenticated API request clears the local token and current user, changes the application to the unauthenticated state, and returns protected routes to Login with a readable session-ended message. A startup network failure preserves the saved token while reporting that the session could not be checked. If the backend is unreachable during logout, the local session is still cleared and Login displays a warning that server-side revocation could not be confirmed.

Roles on `users.role`:

- `admin` — Admin
- `end_user` — End User

Both roles share the same `users` table. No separate employee auth table.

Advanced authentication (OTP, 2FA, password reset, email verification, social login) is intentionally postponed.

# 9.2 Role-Aware Application Navigation (Phase 9)

```
Login
  ↓
Current User
  ↓
Role
  ├── Admin
  │     ├── Dashboard
  │     ├── Employee
  │     ├── Items
  │     ├── Station
  │     ├── Orders / POS
  │     ├── Consignee
  │     ├── Consignment
  │     └── Supplier
  │
  └── End User
        ├── Dashboard
        └── Orders / POS
```

The canonical authenticated landing route is `/dashboard`. The sidebar, Dashboard quick access, and frontend routes use the authenticated `currentUser.role`. End Users who manually request an Admin-only frontend route are redirected to `/dashboard`.

Role-aware frontend navigation is a UX boundary, not backend authorization. Laravel must enforce permissions on protected business APIs when those endpoints are implemented. Phase 9 does not introduce permission tables, a complex RBAC package, business CRUD, or Dashboard statistics APIs.

## 9.3 Employee Management (Phase 10.1)

Employee Management reuses the authentication domain. An employee is a `User`; there is no separate Employee model or `employees` table.

```
Employee Management UI
        ↓
/api/users
        ↓
auth:sanctum
        ↓
EnsureUserIsAdmin middleware
        ↓
StoreUserRequest / UpdateUserRequest
        ↓
UserController
        ↓
UserResource
        ↓
User Eloquent Model
        ↓
users table
```

Canonical authenticated endpoints:

- `GET /api/users` — paginated list with optional name/email `search`
- `POST /api/users` — create an Admin or End User
- `GET /api/users/{user}` — retrieve one user
- `PUT /api/users/{user}` — update identity, role, and optionally password
- `DELETE /api/users/{user}` — delete another user

All `/api/users` routes require Sanctum authentication followed by the simple `EnsureUserIsAdmin` middleware. The middleware permits only the existing `admin` role. Unauthenticated requests receive HTTP 401 and authenticated End Users receive HTTP 403. No permission tables, complex RBAC package, Gate, or per-resource Policy is needed for the current two-role system.

Employee search is asynchronous: the renderer waits 350 ms after typing, requests `GET /api/users?search=...`, and displays the paginated Eloquent results. The input uses an inline X to clear the query; separate Search and Clear buttons are not used.

Passwords are accepted only as write-only input, are hashed by the `User` model, and are never emitted by `UserResource`. Omitting the password during update keeps the stored hash. The backend rejects deletion of the signed-in account and rejects deleting or demoting the last remaining Admin with HTTP 409. These protections are authoritative even though the frontend also disables self-delete.

Phase 10.1 does not add a migration, package, service layer, repository layer, station assignment, other Master Data CRUD, POS behavior, hardware integration, or advanced authentication.

Phase 10.6 subsequently activated the existing nullable `users.station_id` relationship for Employee Management. Employee list responses expose only the Station ID/name pair, the UI displays the Station name, and Add/Edit Employee uses a complete Station dropdown while allowing `No Station` for accounts such as the primary Admin.

## 9.4 Station Management (Phase 10.2)

Station Management introduces the first independent Master Data model. A Station is a POS location or business station; it does not yet own employees, orders, inventory, or hardware configuration.

```
Station Management UI
        ↓
/api/stations
        ↓
auth:sanctum
        ↓
EnsureUserIsAdmin middleware (`admin` alias)
        ↓
StoreStationRequest / UpdateStationRequest
        ↓
Api\StationController
        ↓
StationResource
        ↓
Station Eloquent Model
        ↓
stations table
        ↓
MySQL
```

Canonical endpoints are `GET/POST /api/stations` and `GET/PUT/PATCH/DELETE /api/stations/{station}`. They retain the established 401 unauthenticated and 403 authenticated End User behavior.

The `stations` table contains only `id`, unique `name`, required `location`, nullable `description`, and timestamps. Station CRUD uses Eloquent directly without a Service, Repository, Policy, Gate, raw SQL, or unnecessary transaction wrapper.

Station search waits 350 ms, queries name, location, and description through `GET /api/stations?search=...`, cancels superseded requests, resets pagination to page 1, and returns name-sorted pages of 10 records. The inline X restores the unfiltered list; zero matches are a valid empty state.

Phase 10.2 does not add employee assignment, order/inventory relationships, hardware fields, other Master Data CRUD, POS behavior, or advanced authentication.

## 9.5 Supplier Management (Phase 10.3)

Supplier Management is independent Master Data with no Item, Consignment, Order, Inventory, or Station relationships yet.

```
Supplier Management UI
        ↓
/api/suppliers
        ↓
auth:sanctum
        ↓
EnsureUserIsAdmin middleware (`admin` alias)
        ↓
StoreSupplierRequest / UpdateSupplierRequest
        ↓
Api\SupplierController
        ↓
SupplierResource
        ↓
Supplier Eloquent Model
        ↓
suppliers table
        ↓
MySQL
```

The `suppliers` table contains `id`, required `name`, nullable `contact_person`, `contact_number`, `email`, `address`, and timestamps. Contact numbers are strings. Supplier names and emails are not unique in this phase.

The API retains snake_case fields and provides `GET/POST /api/suppliers` plus `GET/PUT/PATCH/DELETE /api/suppliers/{supplier}`. Supplier search covers name, contact person, contact number, and email with the established 350 ms debounce, cancellation, name sorting, and 10-record pagination.

Supplier CRUD uses Eloquent directly without a Service, Repository, Policy, Gate, raw SQL, or unnecessary transaction wrapper. Relationships and dependency-aware deletion remain deferred until a real dependent module is implemented.

## 9.6 Item Management (Phase 10.4)

Item Management defines the products and food that can exist in the POS, including the original system's initial quantity and unit fields. It does not perform sales or implement inventory movement behavior.

```text
Item Management
      ↓
/api/items
      ↓
auth:sanctum
      ↓
EnsureUserIsAdmin (`admin` alias)
      ↓
Api\ItemController
      ↓
Item / Eloquent
      ↓
items
      ↓
MySQL
```

The `items` table follows the confirmed Item fields using consistent Laravel names: `id`, unique required string `item_code`, required `name`, fixed-precision `quantity DECIMAL(12,3)`, readable `units_backup`, legacy unit code `unit`, Item-level `reorder_point DECIMAL(12,3) DEFAULT 0`, fixed-precision `price DECIMAL(10,2)`, and timestamps. The API returns quantity, reorder point, and price as decimal strings; the renderer adds Philippine peso formatting for price display only.

The boundaries are explicit: Item stores the original system's quantity, readable unit backup, unit code, and reorder point. Station Inventory compares its station-specific quantity with the Item reorder point for display-only Low Stock status. Automatic deduction, stock-in, stock-out, movement history, alerts, replenishment, and order-based updates remain deferred.

Item currently has no Supplier, Consignee, Consignment, Station, Inventory, Order, or user relationship. Management routes are Admin-only; future End User read access for ordering must be introduced deliberately with the Orders/POS requirements.

The module follows Controller-to-Eloquent CRUD with Form Requests, a safe `ItemResource`, 350 ms cancellable live item-code/name/unit-name search, and 10-record pagination. Item Management keeps the simple visible fields Item Code, Item Name, Quantity, Unit, and Price. The visible Unit edits `units_backup`; the legacy `unit` code and Item `reorder_point` remain API/database details and are not shown in the Item form or table. No units table is introduced.

## 9.7 Consignee Management (Phase 10.5)

Consignee is independent Master Data for a person, organization, or entity that may later participate in a consignment workflow.

```text
Consignee Management
        ↓
/api/consignees
        ↓
auth:sanctum
        ↓
EnsureUserIsAdmin (`admin` alias)
        ↓
Api\ConsigneeController
        ↓
Consignee / Eloquent
        ↓
consignees
        ↓
MySQL
```

The `consignees` table contains `id`, required `name`, nullable string `contact_number`, nullable `email`, nullable text `address`, and timestamps. Names, contact numbers, and emails are not made unique without a confirmed business requirement.

The API provides Admin-only CRUD, name/contact-number/email live search, name ordering, and 10-record pagination. The Consignee-to-Consignment and Consignee-to-Item relationships remain deferred to Phase 10.6. Deletion is currently allowed after confirmation and must be revisited once historical Consignment records depend on Consignee.

## 9.8 Consignment Account Management (Phase 10.6)

The legacy “Consignment” screen means an authenticated account associated with a Station and Consignee. It does not represent a traditional goods-consignment transaction.

```text
Consignment Account Management → /api/consignment-accounts
        → auth:sanctum → EnsureUserIsAdmin
        → Api\ConsignmentAccountController
        → User / Eloquent → Station + Consignee → MySQL
```

The existing `users` table is reused with nullable `station_id` and `consignee_id` columns in its base schema. Because `users` is created before the referenced tables, the existing Station and Consignee migrations attach their restrictive foreign keys after creating those tables. Accounts with a non-null `consignee_id` belong to this workflow and retain the existing `end_user` role. Credentials remain solely in `users`; passwords are hashed and never exposed. Assigned Stations and Consignees cannot be deleted. No `consignments`, `consignment_items`, duplicate account table, or separate Phase 10.6 relationship migration exists.

## 9.9 Station Inventory Foundation (Phase 10.7)

Legacy `station_items` evidence confirms that quantities belong to a Station and Item combination.

```text
Station 1:N StationItem N:1 Item
```

`station_items` contains `id`, restrictive `station_id` and `item_id` foreign keys, fixed-precision `quantity DECIMAL(12,3)`, timestamps, and a database-level unique constraint across `(station_id, item_id)`. `StationItem` is a real Eloquent model because quantity is meaningful business state, not an anonymous pivot. The reorder point belongs to the Item, matching the confirmed legacy schema.

`station_items.quantity` is the source of truth for station-specific inventory. Existing `items.quantity` remains a transitional global quantity for backward compatibility and is not synchronized automatically. A future controlled cleanup must decide whether to remove or redefine it.

Admin Station Inventory management supports Station filtering, item-code/name/unit search, 10-record pagination, explicit assignment, quantity editing, computed Low Stock status when station quantity is less than or equal to the Item's reorder point, and safe removal of only the assignment. The reorder point remains an internal Item field and is not displayed in Item or Station Inventory interfaces. Future End User POS reads will follow User → assigned Station → Station Inventory. Automatic alerts, replenishment, stock deduction, and movement history remain deferred.

Legacy Item `units` values are identifiers rather than quantities, while `unitsbackup` preserves the readable label. The clean schema retains these meanings as `items.unit` and `items.units_backup`. Legacy `expiry_notification` remains deferred until Receiving or batch inventory records an actual expiration date.

The confirmed Supplier status correction is stored as `suppliers.is_active BOOLEAN DEFAULT TRUE` in the original Supplier schema; inactive Suppliers remain records rather than being deleted.

## 9.10 Orders / POS Foundation (Phase 10.8)

The POS inventory path is authenticated and Station-scoped:

```text
Authenticated User
        ↓
users.station_id
        ↓
Station
        ↓
StationItem
        ↓
Item
        ↓
GET /api/pos/items
        ↓
React in-memory Cart
```

`GET /api/pos/items` uses `auth:sanctum` without Admin-only middleware because both Admin and End User roles may operate the POS. The backend derives the Station only from the authenticated User and ignores arbitrary Station query parameters. An account without a Station receives HTTP `409`; it never falls back to all Items or another Station.

`station_items.quantity` is the exclusive POS availability source. Transitional `items.quantity` is not queried for POS availability. Zero-stock assignments remain visible but cannot be added. `items.price` is the temporary POS selling-price source until the legacy Price workflow is understood, and the readable POS unit comes from `items.units_backup`.

The Phase 10.8 cart exists only in React state. Add, edit, remove, search, and New Order actions perform no database writes and do not reserve or deduct stock. Line subtotals use price cents multiplied by quantity thousandths with half-up cent rounding; the displayed total is the sum of rounded line subtotals. Refreshing or restarting may clear the cart.

Phase 10.9 must distrust all frontend prices and totals. Finalization must re-resolve the authenticated User's Station, re-fetch Items and Station inventory, validate quantities, calculate authoritative prices/subtotals/total, generate the permanent order number server-side, and create the Order, Order Items, and inventory deductions in one database transaction.

## 9.11 Payment and Order Finalization (Phase 10.9)

```
React Cart
    ↓ POST /api/pos/checkout
auth:sanctum
    ↓
Authenticated User → Assigned Station
    ↓
DB::transaction()
    ↓
lockForUpdate() StationItem rows
    ↓
authoritative Item price + stock revalidation
    ↓
Order + OrderItem snapshots
    ↓
station_items.quantity deduction
```

Checkout accepts only Item IDs, quantities, `paymentMethod = cash`, and Cash received. Laravel resolves the Cashier and Station from the authenticated User, calculates each rounded line subtotal and total from current Item prices, generates `ORD-YYYYMMDD-######` after the Order receives its database ID, calculates Change, and returns a safe receipt-ready summary.

`station_items.quantity` is the authoritative stock and is locked and deducted atomically. `items.quantity` remains transitional legacy data and is never modified by checkout. Completed Orders and their snapshot rows are immutable in this phase; Transaction History, voids, refunds, stock reversal, Customer, Remit, receipt printing, and Cash Drawer integration remain deferred.

## 9.12 Transaction History (Phase 10.10)

```
Transaction History → GET /api/orders → role/Station scope → Order + Station + Cashier
Order Details       → GET /api/orders/{order} → role/Station scope → OrderItem snapshots
```

Admins may view all Stations and optionally filter by Station. End Users are always restricted server-side to their assigned Station, and accounts without a Station receive the established HTTP `409` response. Search covers Order Number, Cashier name, and Station name; From/To dates provide basic filtering; results are paginated ten per page newest-first.

History is read-only. Order creation remains exclusively `POST /api/pos/checkout`; there is no generic Order store, update, or delete route. Details use stored Order Item code, name, unit, price, quantity, and subtotal snapshots rather than current Item master values.


# 10. Future Architecture

Future customer-facing applications are intentionally excluded from the initial scope.

Possible future architecture:

                    Laravel API
                         │
             ┌───────────┴───────────┐
             │                       │
        Electron POS           Customer Web/App
                                     │
                               Food Menu



This can be added later without replacing the Laravel backend.



# 11. Architecture Principle

Frontend presentation follows shared tokens in `frontend/src/styles/tokens.css` and small reusable controls in `frontend/src/components/ui`. Page-specific business behavior stays in feature/page code; only repeated presentation patterns are shared. The Electron UI keeps its green/yellow identity, with blue used for supporting surfaces and focus states.

The shared quantity formatter removes trailing decimal zeroes in tables, availability messages, Order Details, and quantity edit controls. The underlying API values and fixed-point calculations continue using three-decimal precision, so the formatting change does not alter inventory or checkout values.

The first objective is not to create a completely new POS.

The first objective is:

Modernize and reproduce the existing University HomeStay POS workflow using a maintainable technology stack.

New features should only be added after the existing workflow is stable and verified.
