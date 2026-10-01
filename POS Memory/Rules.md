# University HomeStay POS

## Development Rules

### Phase 10.16.1 compact table and inventory-summary rules

Use the shared compact table density across implemented modules: approximately 12px medium headers, 13px regular body text, small supporting text, and narrow cell padding. Do not bold table body names, codes, quantities, prices, references, dates, people, statuses, or totals. Use compact Lucide icon actions for conventional Add, Edit, View, Activate, Deactivate, Delete, and Remove operations. Every icon action requires an item-specific accessible label, title, keyboard focus state, and appropriate disabled state. Keep text on primary Save, Submit, Pay, Confirm, and destructive confirmation actions.

Shared dialogs must set focus only when opening, focus their first enabled body control by default, support an explicit initial-focus ref, preserve focus through controlled rerenders and AJAX refreshes, and restore the prior control when closed. Never make a Modal focus effect depend directly on an inline close callback.

Keep quantity storage and ledger arithmetic at three-decimal precision. Ordinary manual quantity entry uses at most two decimal places, while APIs retain three-decimal compatibility for existing data and integrations. Format quantity display without unnecessary trailing zeroes and preserve meaningful historical third-decimal digits.

Station Inventory summary definitions are fixed: `recorded_delivered_quantity` is the sum of positive DELIVERY movements; `recorded_sold_quantity` is the sum of absolute SALE movement quantities; `recorded_spoilage_quantity` is the sum of absolute SPOILAGE movement quantities; `current_quantity` and Remaining Qty are the stored `station_items.quantity`. Never derive current stock as Delivered minus Sold minus Spoilage. ADJUSTMENT and future movement types may affect current balance without belonging to these informational totals. Historical summary values include only movements actually recorded by this system; do not replay Orders or fabricate pre-ledger history.

Station Inventory is a read-only stock monitoring module. Item Delivery is the supported workflow for introducing Item stock into a Station. Do not expose Assign Item, quantity editing, removal, delivery controls, or an Actions column on Station Inventory. Keep its Station selector, Search, pagination, and recorded movement summaries. Retain backend adjustment and assignment capabilities unless a later phase explicitly removes them; do not present a manual balance correction as a Delivery.

Station Inventory Qty is the reconciled display value `station_items.quantity + absolute recorded SALE + absolute recorded SPOILAGE`, calculated with database decimal arithmetic. It represents the available/base quantity needed to reconcile the monitoring columns; it is not `items.quantity` and not cumulative DELIVERY alone. Thus `Qty - Sold - Spoilage = Remaining Qty`. DELIVERY and signed ADJUSTMENT affect authoritative Remaining and therefore flow into Qty, while Sold and Spoilage remain their separate recorded consumption summaries. View Spoilage must reuse existing Spoilage Management and scope its history to the selected Station.

Spoilage Incident Date may be today or a past Manila calendar date to support late reporting; never accept a future date. Use the selected Manila date for SPL numbering and persisted incident chronology. The authenticated User remains the reporter, and creating the record still uses current stock validation, locks, snapshots, negative movements, and one transaction.

Item Delivery creates a missing StationItem or increases an existing balance and writes a positive DELIVERY movement in the same atomic transaction as its header and immutable Item snapshots. Completed Deliveries cannot be edited or deleted. F12 is read-only and shows the authenticated Station's Item, Code, Unit, recorded Sold, recorded Spoilage, and authoritative Remaining balance while preserving the POS cart.

### Current POS interaction rules (2026-10-01)

On the POS screen, keep the sidebar hidden until Exit POS returns to Dashboard. F3 Cash and F4 Credit / Utang are payment-panel controls with matching keyboard shortcuts; do not use payment radio buttons. F3 opens a Cash Received dialog with one text input and no on-screen keypad, while F4 opens Customer selection. Cancelling a dialog keeps the prior method and details. Confirming Cash clears the Credit Customer; selecting Credit clears the confirmed cash amount. Require a valid Cash amount at least equal to the current cart total before Pay; a changed cart may require cash correction. Confirming cash alone never submits the Order.

Keep the footer actions F7 current-Station Transactions, F9 Qty, F10 New Order, F12 Station Inventory, and Esc Exit POS. Both keys and visible controls must work; shortcuts must not act through an open dialog. Confirm before discarding an unpaid cart through New Order or Exit POS.

F7 and F12 are read-only in-place dialogs and must preserve the cart. F7 is limited to the current Station even for an Admin cashier; F12 derives its Station on the server from the authenticated User and includes assigned inactive or unpriced stock. Keep the sellable POS Item list separate. Do not expose Discount, O.R Transactions, or F8 Credit Transactions as working shortcuts before those workflows exist.

POS item search uses debounced AJAX in the left Available Items panel and accepts Item name or code. Its paginated table shows Name, Item Code, Available stock with unit (for example, `8 bottle`), Unit Price, and an icon-only Add action. Item names use regular weight. Zero-stock Items remain visible with Add disabled and an explanatory tooltip. Enter quick-adds only an exact Item code; names are chosen from results because they may repeat. Current Order shows Item Code in its own column, regular-weight Item names, and pencil and trash actions with item-specific accessible labels and tooltips. Search failures must not hide the cart. The food image is removed; the live clock appears in the footer. POS dialog X controls close or cancel, while primary footer actions remain. Change Quantity focuses and selects a text input so Backspace works; up/down controls change by one whole unit and Enter validates and updates the line. Keep three-decimal precision, displaying POS noninteger quantities with at least two decimal places (for example, `1.50` and `2.50`) and integers without decimal zeros.

### Migration ownership

For this development project, put a table's columns, nullability, indexes, and foreign keys in its existing `create_<table>_table` migration when that table is still being shaped. Avoid an extra `add_*_to_<table>` or `make_*_nullable` migration for the same table solely to revise its initial definition. Keep creation order valid for foreign keys, and reconcile any already-applied development database schema and migration records so fresh and existing databases agree. Once a migration has been released to a database whose history must be preserved, use a new forward migration instead of changing that released migration.

### Phase 10.16 POS Credit / Utang rules

Keep one checkout transaction for Cash and Credit. Cash requires Cash Received and may have no Customer. Credit requires a valid Customer ID and stores null Cash Received and Change; never fabricate zero cash values. Both methods must retain Station stock locks, active Price resolution, stale-price rejection, authoritative totals, OrderItem snapshots, and SALE movements. Do not allow negative Station stock. Customer search is available to authenticated cashiers; Customer creation and Credit Monitoring stay Admin-only. Credit Monitoring totals recorded Credit sales, not outstanding balance. Do not add Customer Balance, collection, remittance, or settlement behavior to this POS; the Accounting Office owns settlement.

The successful checkout dialog is a receipt-style preview built from the returned Order and OrderItem snapshots. Show CMU HomeStay, Station, transaction number, Item lines as quantity × Unit Price with line price, Total Price, and “Thank you for your purchase!” Show the Customer on Credit / Utang receipts. Keep printer commands outside this UI until receipt printer hardware is implemented.

### Phase 10.15 Customer and Credit rules

Customer has only name and address; trim and require both, and allow duplicate names. Customer Balance must not be manually stored or inferred from credit sales while Accounting Office settlement data is absent. Cash Orders may have no Customer; credit Orders require one. Keep POS Order numbers as transaction identifiers and do not create an O.R number. Credit Monitoring is Admin-only and read-only, displays MOP as Utang, computes Age from Manila calendar dates, and totals all filtered credit Order amounts before pagination using fixed cents. Accounting Office owns settlement/payment. Do not add POS settlement, collection, remittance, or mark-paid actions. Preserve existing cash checkout and inventory locking.

### Phase 10.14.1 sidebar rules

Keep the confirmed Admin sidebar module names and order: Dashboard, POS, Product Management, Station Inventory, Credit Monitoring, O.R Transactions, Stations, Privilege Assignment, Customer Management, Privilege, Price, Sale Remittance, Item Delivery, User Management. Do not add Spoilage, Transaction History, Supplier, Consignee, or Consignment Account to that confirmed list. Preserve their routes and functionality. Show unimplemented modules as disabled Coming Soon entries; never route them to fake pages. Keep Laravel authorization authoritative. Use authenticated User data for Username and User Privilege, and the existing brand palette. UI labels do not rename backend domains or role values.

### Phase 10.14 Spoilage rules

Spoilage is Admin-only, station-scoped, and inventory-only. Select existing StationItems with positive balance; inactive Items remain eligible when stock exists, and no active Price is required. Reject duplicate lines, invalid precision, and quantities exceeding the locked current Station balance. Deduct `station_items.quantity` and write a matching negative `SPOILAGE` movement in one transaction. Keep completed Spoilage read-only; do not add edit/delete routes or redundant stock totals. Never update transitional `items.quantity` during Spoilage.

### Phase 10.13 Item Delivery rules

Only Admin users may create or browse Item Deliveries. Derive `delivered_by_id` and delivery number on the server; receiver must be an End User assigned to the selected Station. Reject inactive Items, duplicate Item lines, and invalid or nonpositive quantities. Keep `item_delivery_items` as immutable history. A completed Delivery increases authoritative `station_items.quantity` and writes a matching positive `DELIVERY` movement in the same transaction; `items.quantity` stays transitional and unchanged. Delivery numbers and POS Order numbers are separate. No Delivery edit or delete route.

### Phase 10.12 current pricing rules

The single active `prices` row per Item is the current selling price. Price creation and historical activation must lock the Item row and update Price flags atomically. Reject creation of the same active amount. Do not expose a Price delete route or an arbitrary deactivate action. Item Management may set an initial Price on Item creation but must not change selling price through Item edits.

POS lists only active Items with exactly one active Price and uses that amount. Checkout must compare the server's active amount with required `expectedUnitPrice` for every cart line. On mismatch, return 409 and current prices before writing Orders or inventory. The frontend must preserve and refresh the cart for cashier review. `items.price` is legacy and must not price new sales. Preserve OrderItem snapshots and StationItem locking.

### Phase 10.11B current rules

Older phase text below is historical. `station_items.quantity` is the current inventory authority; `items.quantity` is transitional only. New SALE and ADJUSTMENT changes write matching `inventory_movements` rows in the same transaction under StationItem row locks. Movement history starts in Phase 10.11B; do not synthesize movements for prior Orders. Restrictive FKs preserve Price and movement history. Deactivate Items for product retirement rather than deleting records with history.

`prices` stores price history. Activation locks the Item and switches active records atomically; the resolver rejects ambiguous active prices. POS and checkout temporarily read `items.price`; OrderItem snapshots remain historical. Item names may repeat, while `item_code` is unique. Future Item Deliveries use a reference distinct from `orders.order_number`.

Migration filenames use Laravel's sortable timestamp followed by a specific snake_case action and table. Phase 10.11B uses `create_prices_table` (which also adds the related `items.is_active` flag) and `create_inventory_movements_table`. Use Eloquent for normal application writes and `DB::transaction()` when multiple related writes must commit together, including checkout.

> Coding, naming, UI/UX, database, API, and development conventions.

### Project Documentation

- [[Architecture]]
- [[PRD]]
- [[Requirement]]
- [[HandOff]]


## 🧩 Icon System

The frontend will use **Lucide Icons** as the standard icon library.

Lucide provides a consistent outline-based visual language across the application. Icons should support the interface and improve recognition without making the UI feel visually heavy or oversized.

### Icon Library

- Library: **Lucide Icons**
- Frontend usage: React-compatible Lucide components
- Style: Outline / stroke-based icons
- Default stroke width: `2`
- Icons must remain visually consistent throughout the application.
- Do not mix multiple icon libraries unless there is a specific technical requirement.
- Icons should support text labels rather than replace them.

### Icon Size Guidelines

| Usage | Size | Purpose |
|---|---:|---|
| Small utility icon | `16px–18px` | Secondary actions and inline information |
| Default icon | `18px–20px` | General UI and CRUD actions |
| Navigation icon | `20px–22px` | Sidebar and main navigation |
| Button icon | `18px–20px` | Icon + text buttons |
| POS action icon | `22px–24px` | Important POS actions |
| Alert/status icon | `22px–28px` | Success, warning, error, information |
| Large feature icon | `28px–32px` | Empty states or prominent sections |

### Recommended Default

The application default should be:


Default UI icon: 20px
Navigation icon: 20px–22px
Important POS icon: 22px–24px

### Common Icon Mapping

| Function | Lucide Icon |
|---|---|
| Dashboard | `LayoutDashboard` |
| Employee | `Users` |
| Items | `Package` |
| Station | `Store` |
| Orders / POS | `ShoppingCart` |
| Consignee | `Contact` |
| Consignment | `ClipboardList` |
| Supplier | `Truck` |
| Search | `Search` |
| Add | `Plus` |
| Edit | `Pencil` |
| Delete | `Trash2` |
| Save | `Save` |
| Logout | `LogOut` |
| Settings | `Settings` |
| Success | `CircleCheck` |
| Warning | `TriangleAlert` |
| Error | `CircleX` |
| Information | `Info` |
| Close | `X` |
| Back | `ArrowLeft` |
| Print | `Printer` |
| Payment | `Banknote` |
| Cash Drawer | `Archive` |
| Refresh | `RefreshCw` |

### Icon Rules

1. Prefer recognizable icons over abstract symbols.
2. Important actions should use **icon + text**, not icon-only buttons.
3. Never rely on an icon alone to communicate a critical action.
4. Destructive actions such as Delete must include visible text.
5. Maintain consistent icon sizing within the same interface.
6. Icons should support the text rather than compete with it.
7. Every icon-only interactive element must have an accessible `aria-label`.

## 🎨 Brand Design System & Components

This website utilizes CMU's official brand palette with a dedicated POS color layer for transactional interfaces. The POS palette introduces a restrained off-blue tone to improve visual separation between products, cart/order information, and payment actions while preserving CMU's green as the primary brand identity.


| Token                 | Variable                    | Color Hex | Role                                                               |
| --------------------- | --------------------------- | --------- | ------------------------------------------------------------------ |
| **Brand Green**       | `--color-brand-green`       | `#00491E` | Primary brand color, headers, CTAs, navigation, footers            |
| **Brand Green Hover** | `--color-brand-green-hover` | `#003716` | Hover states for buttons, navigation, and cards                    |
| **Brand Yellow**      | `--color-brand-yellow`      | `#FFC600` | Accents, highlights, badges, dividers                              |
| **Off-White**         | `--color-bg-offwhite`       | `#FBFBFA` | Section background contrast                                        |
| **Surface White**     | `--color-bg-surface`        | `#FFFFFF` | Cards, forms, tables, and containers                               |
| **POS Off-Blue**      | `--color-pos-blue`          | `#EAF2F8` | POS panels, order areas, selected states, informational surfaces   |
| **POS Blue**          | `--color-pos-blue-primary`  | `#2F6F9F` | POS interactive elements, selected items, links, and order actions |
| **POS Blue Hover**    | `--color-pos-blue-hover`    | `#255A82` | Hover and active states for POS blue elements                      |
| **POS Blue Border**   | `--color-pos-blue-border`   | `#C9DCEB` | Subtle borders and separators within POS sections                  |


Existing POS layout as of Now:

ORDERS

┌─────────────────────────────────────────────────────────────┐
│ University HomeStay POS                         Station/User│
├──────────────────────────────┬──────────────────────────────┤
│                              │                              │
│   ITEM SEARCH                │       ORDER / CART           │
│                              │                              │
│ ┌────────────────────────┐   │ ┌──────────────────────────┐ │
│ │ Search item...         │   │ │ Description │ Qty │ Total│ │
│ └────────────────────────┘   │ │                          │ │
│                              │ │ Coca Cola    2    ₱40    │ │
│ ┌────────────────────────┐   │ │ Royal        1    ₱20    │ │
│ │ Coca Cola              │   │ │                          │ │
│ │ ₱20.00                 │   │ └──────────────────────────┘ │
│ └────────────────────────┘   │                              │
│                              │       TOTAL: ₱60.00          │
│ ┌────────────────────────┐   │                              │
│ │ Royal                  │   │   Payment: [ Cash ▼ ]        │
│ │ ₱20.00                 │   │   Cash:     [ ₱100.00 ]      │
│ └────────────────────────┘   │   Change:   ₱40.00           │
│                              │                              │
│                              │        [ PAY ]               │
└──────────────────────────────┴──────────────────────────────┘


==================================================
DATABASE ACCESS & TRANSACTION RULES
==================================================

Use Laravel Eloquent as the default database access layer.

Preferred:

Model::query()
Model::create()
$model->update()
$model->delete()
$model->relationship()

Do not use raw SQL unless there is a clear and documented
technical reason.

Do not use DB::statement(), DB::select(), or manually
constructed SQL for normal CRUD operations.

DATABASE TRANSACTIONS:

`DB::transaction()` is NOT considered raw SQL.

It is Laravel's transaction-management mechanism.

However, do not wrap every CRUD operation in a database
transaction unnecessarily.

Simple operations such as:

- create one user
- update one user
- delete one user

normally do not require an explicit DB::transaction().

Use DB::transaction() when multiple related database writes
must succeed or fail together.

Example future POS operation:

Create Order
    ↓
Create Order Items
    ↓
Record Payment
    ↓
Update Inventory

These operations should be atomic.

If one critical operation fails, the transaction should roll
back.

Rule:

Eloquent by default.
Transactions only when atomic multi-step writes require them.
Raw SQL only when technically justified and documented.



# 1. Core Development Principle

Build the system phase-by-phase.

Do not implement features that have not been confirmed.

Priority:

Existing Requirement
        ↓
Understand Workflow
        ↓
Design
        ↓
Implement
        ↓
Test
        ↓
Document

Do not redesign the business process without confirmation from the supervisor/end users.

# 2. Laravel Responsibilities

Use:

React
  ↓
Laravel API
  ↓
MySQL

Electron provides the desktop environment and hardware integration.

Never allow the React renderer to directly access MySQL.

# 3. Laravel Responsibilities

Laravel handles:

- Authentication
- Authorization
- Validation
- Business rules
- Database operations
- Transactions
- API responses

Controllers should remain focused and readable. For normal CRUD, controllers may use Eloquent directly.

Default structure:

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

Do not create a Service for every module. Add one only when business logic involves multiple steps, models, or reusable operations, such as future order completion and inventory updates.

Do not introduce a Repository layer. Eloquent is the application's data-access abstraction unless a future technical requirement provides a strong documented reason otherwise.

# 4. React Responsibilities

React handles:

- UI
- User interaction
- Form state
- Local UI state
- API communication
- Loading states
- Error states

React must not contain database queries.

---



# 5. Electron Responsibilities

Electron handles:

- Desktop window
- Application lifecycle
- Secure preload bridge
- Windows hardware integration
- Printer integration
- Cash drawer integration

Avoid putting normal business logic into Electron's main process when it belongs in Laravel.

# 6 Naming Conventions

 Database Tables

 Use:
	 snake_case
	 plural
 Examples:

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

Do NOT use:

```
User
user
tblUser
tbl_users
userTable
```



# 7. Database Column Naming

Use lowercase snake_case.

Examples:

first_name
last_name
email
contact_number
station_id
item_code
unit_price
created_at
updated_at

Foreign keys should follow:

{model_name}_id

Examples:

station_id
supplier_id
consignee_id
order_id
item_id
user_id

# 8. Laravel Model Naming

Laravel models use singular PascalCase.

Examples:

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



# 9. PHP Method Naming

Examples:

public function createOrder()
{
}

public function calculateChange()
{
}

public function processPayment()
{
}

Do NOT use:

create_order()
CreateOrder()
CREATE_ORDER()

# 10. PHP Variable Naming

Use camelCase.

Examples:

$orderItems
$totalAmount
$cashReceived
$changeAmount
$stationId

Avoid unclear variables:

$i
$x
$a
$temp
$data1

unless the scope is extremely small and the meaning is obvious.

Prefer:
$quantity

over:
$q

# 11. React Component Naming

React components use PascalCase.

Examples:

LoginPage.tsx
DashboardPage.tsx
EmployeePage.tsx
ItemPage.tsx
StationPage.tsx
OrderPage.tsx
SupplierPage.tsx
ConsigneePage.tsx
ConsignmentPage.tsx

Components:
EmployeeForm.tsx
ItemTable.tsx
OrderCart.tsx
PaymentPanel.tsx

# 12. React Function Naming

Use camelCase.

Examples:
handleSubmit()
handleSearch()
handleAddItem()
handleRemoveItem()
calculateTotal()
calculateChange()

# 13. React Variable Naming

Use descriptive camelCase.

Good:

totalAmount
cashReceived
changeAmount
selectedItem
orderItems
searchKeyword

Avoid:

a
b
x
temp
data
thing

unless their meaning is obvious from a very small scope

# 14. URL / API Naming

Use lowercase plural resource names under `/api`.

Do **not** introduce `/api/v1` unless the project later requires versioning.

Preferred API structure:

```
GET    /api/items
POST   /api/items
GET    /api/items/{item}
PUT    /api/items/{item}
DELETE /api/items/{item}

GET    /api/stations
POST   /api/stations
GET    /api/stations/{station}
PUT    /api/stations/{station}
DELETE /api/stations/{station}

GET    /api/orders
POST   /api/orders
GET    /api/orders/{order}

GET    /api/health
```

The HTTP method describes the action. Prefer:

```
POST /api/items
```

Avoid action-in-path names:

```
/api/getItems
/api/GetItems
/api/item-list
/api/createItem
/api/Items
```

## 14.1 API layer conventions

Request flow:

```
Route
  ↓
Middleware
  ↓
Form Request (when validation is needed)
  ↓
Controller
  ↓
Eloquent model
  ↓
Database
```

Controllers stay thin. Class names: `ItemController`, `StationController`, `OrderController`.

Use Form Requests when create/update validation is substantial (e.g. `StoreItemRequest`, `UpdateItemRequest`). Do not create them for trivial endpoints without request validation. Backend validation is authoritative; frontend validation is UX only.

Use API Resources when they control exposed fields, transform output, or maintain a useful public response structure. A clean explicit JSON response is acceptable for a trivial internal response. Never expose sensitive model fields.

Services hold complex business logic (e.g. `OrderService`, `InventoryService`). Create services when logic requires them — do not create empty stubs for every future module.

Do not add a Repository layer over Eloquent. Use `DB::transaction(...)` for atomic multi-write operations (orders, inventory, payments), not ordinary single-model CRUD. Avoid raw SQL unless there is a clear documented reason.

Authentication uses Laravel Sanctum. For the current `admin` and `end_user` roles, use one simple Admin-only middleware on Admin management routes. Do not add permission tables, role tables, Spatie Permission, complex Gates, or a Policy for every simple resource. Do not mix Electron IPC (hardware / desktop) with Laravel HTTP API (application data / business rules).

Searchable Master Data pages use live asynchronous search: wait 350 ms after typing, request the existing paginated API with `?search=...`, and provide an inline X when clearing is useful. Do not add separate Search and Clear buttons or request on every individual keystroke.

Use 10 records per page for the current simple Master Data modules unless a later requirement establishes a different convention. An empty search returns the normal unfiltered list; a successful search with no matches is a valid empty state, not an error.

Supplier contact numbers are stored as strings so leading zeroes, spaces, plus signs, and hyphens are preserved. Optional Supplier fields normalize blank input to `null`; Supplier names and emails are not assumed unique without a confirmed business requirement.

## 14.2 Success response conventions

Prefer Laravel’s native API Resource / JSON behavior. Typical shapes:

Single resource:

```json
{
  "data": { },
  "message": "Item retrieved successfully."
}
```

Collection:

```json
{
  "data": [ ]
}
```

HTTP status codes:

| Code | Use |
|------|-----|
| 200 | Successful GET / update |
| 201 | Successfully created |
| 204 | Successfully deleted with no body (when appropriate) |

Do not return HTTP 200 for every operation.

## 14.3 Error response conventions

Validation errors use **HTTP 422** (not 200):

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field": [
      "The field is required."
    ]
  }
}
```

Other common statuses: 400 Bad Request, 401 Unauthenticated, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Unexpected Server Error.

Use Laravel’s existing exception handling. In production-style API responses, do not leak stack traces, database credentials, SQL, filesystem paths, or internal secrets.

CORS is configured in `backend/config/cors.php` for local Vite origins (`localhost:5173` / `127.0.0.1:5173`) and the packaged Electron renderer origin (`pos://app`). The packaged renderer must use the registered secure custom protocol, not `file://`. Do not allow unrestricted `*` or `null` origins.

Frontend API base URL uses Vite env (non-secret only):

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Do not put database passwords, `APP_KEY`, or private tokens in `VITE_*` variables. Application HTTP traffic goes through `frontend/src/services/apiClient.ts`; desktop/hardware stays on Electron IPC.

The shared API client must remain domain-neutral. It may normalize HTTP, network, timeout, rate-limit, and Laravel validation errors, but login-specific messages belong in `authService.ts`. In particular, do not translate every HTTP 422 response into "Invalid credentials" because later CRUD Form Requests also use 422.

Authentication (Phase 8): Sanctum personal access tokens. Frontend stores the token centrally (not in UI). Use `currentUser` and `GET /api/current-user` (not `/api/me`). Roles: `admin`, `end_user`.

# 15. Page Naming

Use PascalCase for React page components:

EmployeePage
ItemPage
StationPage
OrderPage
SupplierPage

Route paths should be lowercase.

Example:

/employees
/items
/stations
/orders
/suppliers

# 16. Eloquent Rules

Use Eloquent relationships.

Example:

class User extends Model
{
    public function station()
    {
        return $this->belongsTo(Station::class);
    }

```
public function orders()
{
    return $this->hasMany(Order::class);
}
```

}

Do not manually write SQL for normal CRUD operations unless there is a specific reason.

# 17. Money Rules

Do not use floating-point calculations carelessly for money.

For example:

₱100.10
₱50.25

Money values should use appropriate database precision.

For Item prices, use fixed-precision `DECIMAL` storage and preserve the decimal value as a two-decimal string across the API. Never store a formatted currency symbol in a database value; peso formatting belongs to the UI.

Item master data includes the original system's initial quantity and unit. This does not authorize automatic deduction, stock-in/out, movement history, low-stock notifications, or order-based inventory updates; those behaviors belong to later Inventory and Order phases. Do not add Supplier, Consignee, Consignment, or other Item relationships until confirmed requirements establish them.

Item Unit Name entry (`units_backup`) uses a free-text field with common suggestions rather than a closed dropdown. New readable labels may be entered directly without a units table. The required `unit` string preserves the legacy unit code separately.

Legacy Item `units` values are lookup identifiers and `unitsbackup` contains the readable unit label. Preserve these meanings as `items.unit` and `items.units_backup`; do not treat a unit code such as `2` as an inventory quantity.

Consignee remains independent Master Data until Phase 10.6 defines Consignment. Preserve contact numbers as strings, normalize blank optional contact/email/address fields to `null`, and revisit deletion before historical Consignment records can reference a Consignee.

Authentication credentials belong only to `users`; never create duplicate credential tables for business modules. `password_confirmation` is validation-only and must never be persisted. Passwords and hashes must never be returned by API Resources. Foreign-key IDs are internal; interfaces display human-readable Station and Consignee names. Deferred business functionality must remain explicitly tracked.

Inventory quantities are Station-specific and use fixed-precision `DECIMAL`, never FLOAT/DOUBLE. The reorder point belongs to the Item, matching the legacy Item schema. Each Station+Item assignment must be unique. Treat station quantity less than or equal to the Item reorder point as Low Stock for display only; alerts and automatic replenishment remain deferred. `StationItem` is a real Eloquent model, and removing it must never delete the underlying Station or Item. Do not add `expiry_notification` until batch or Receiving inventory records an actual expiration date.

POS availability must come from `station_items.quantity`, never transitional `items.quantity`. Resolve the POS Station from the authenticated User; End Users and Admins must not select or override arbitrary Station IDs. Accounts without a Station receive a readable conflict response rather than access to another Station or the full catalog.

Until finalization exists, cart state is frontend-only. Adding, editing, removing, searching, and starting a new order must never reserve, deduct, or otherwise modify database inventory. Refreshing or restarting may clear the cart.

Permanent checkout must re-fetch authoritative Item prices and Station quantities. Never trust frontend `unitPrice`, subtotal, total, Station ID, or permanent order number. Laravel must validate stock, calculate authoritative money values, generate the order number server-side, and perform Order, Order Item, and inventory writes atomically.

### Checkout finalization rules

- Never trust frontend price, subtotal, total, change, Station ID, Cashier ID, or Order Number.
- Resolve Cashier and Station from the authenticated User and reject accounts without a Station.
- Re-fetch and lock the authenticated Station's `station_items` rows during checkout, then revalidate every requested quantity.
- Generate the permanent Order Number server-side.
- Create the Order, create immutable Order Item snapshots, and deduct Station stock in one `DB::transaction()` operation.
- A failed checkout must roll back the Order, Order Items, and every stock change. The frontend must preserve its cart for correction or retry.
- Checkout modifies `station_items.quantity`, never `items.quantity`.
- Completed Orders cannot be edited or deleted until explicit void/refund and stock-reversal rules are approved.

### Transaction History rules

- Completed Orders and Order Items are immutable, and Transaction History is read-only.
- Order creation occurs only through `POST /api/pos/checkout`; never add generic Order create/update/delete routes.
- Admins may read all Orders; End Users may read only Orders belonging to their assigned Station.
- End User scope is derived server-side and cannot be overridden by a Station query parameter or guessed Order ID.
- Historical displays use the Order Item snapshot fields, never current Item master names, codes, units, or prices.
- Do not introduce Customer, `is_settled`, or Remit fields merely to match the legacy Transaction List.

Recommended:

DECIMAL(12, 2)

Examples:

price
unit_price
subtotal
total_amount
cash_received
change_amount

# 18 Order Processing Rule

Completing an order should be treated as a database transaction.

Conceptually:

BEGIN TRANSACTION

Create Order
Create Order Items
Update Inventory
Record Payment

COMMIT

If an important operation fails:

ROLLBACK

This prevents partially completed sales.

# 19. Validation

Validation must happen on the Laravel backend even if React already validates the form.

Example:

```
Frontend (UX)
  ↓
Laravel Form Request (authoritative)
  ↓
Controller
  ↓
Eloquent (or a Service only for real multi-step business logic)
  ↓
Database
```

Use Form Request classes for incoming API validation. Do not rely on frontend validation as the authority.

The backend is the final authority.

# 20. Security

Never store plain-text passwords.

Use Laravel's password hashing mechanisms.

Never expose:
Database username
Database password
Laravel secret
API secret

to the React renderer.

# 21. UI/UX Rules

The new UI should preserve the simplicity of the existing system.

Prioritize:

- Clear labels
- Large clickable buttons
- Consistent spacing
- Readable tables
- Clear validation messages
- Obvious primary actions
- Minimal unnecessary decoration

Frontend presentation conventions: use the shared design tokens and reusable SearchField, Pagination, Table, Button, Input, and Modal for repeated patterns. Keep feature-specific forms and POS calculations within their features. Search remains debounced and cancellable; presentation refactors must not change API contracts, quantity precision, or payment behavior. At narrow desktop widths, stack page actions and POS panels, allow tables to scroll within their containers, and keep dialog content within the viewport.

Quantity values retain `DECIMAL(12,3)` storage and accept up to three fractional digits. General management views omit unnecessary trailing zeroes: `5` instead of `5.000`, `1.5` instead of `1.500`, and `1.125` where all three digits matter. POS cart and quantity editing show integers without decimal zeros, nonintegers with at least two fractional places (`1.50`, `2.50`), and three places when needed (`1.125`). This is presentation normalization only; API validation, calculations, and database precision remain unchanged.

The POS screen should prioritize speed.

# 22. Hardware Rule

Hardware should be isolated behind services.
Example:
ReceiptPrinterService
CashDrawerService

The POS business logic should not contain printer-specific commands everywhere.

# 23. Scope Control

Before adding a feature, ask:

1. Is it in the approved requirement?
2. Does the existing system already have it?
3. Does the supervisor require it?
4. Is it necessary for the current phase?

If the answer is no, document it as a future feature instead of immediately implementing it.

# 24 Development Philosophy

Build:

Small
Understandable
Testable
Maintainable

Avoid:

Over-engineering
Premature abstraction
Unconfirmed features
Unnecessary dependencies

The goal is not to create the largest POS system.

The goal is to create a reliable system that matches the actual business workflow.
