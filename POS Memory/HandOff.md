
---

# University HomeStay POS
## Development Handoff

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

Verification: **74 tests, 431 assertions passed**; Item-level reorder-point validation and station Low Stock coverage below/equal/above the Item threshold passed; PHP 8.3 Pint, TypeScript, the Electron production build, and `git diff --check` passed. The applied development schema and original create migrations now match: `items` contains required `name`, `units_backup`, `unit`, and `reorder_point`, while `station_items` retains station-specific quantity only. Supplier `is_active` was added directly to the live schema and its original create-table migration.

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
| PHP 8.3 `vendor/bin/pint --test` | PASS |
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
| PHP 8.3 `vendor/bin/pint --test` | PASS |
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
| PHP 8.3 `vendor/bin/pint --test` | PASS |
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
| PHP 8.3 `vendor/bin/pint --test` | PASS |
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
| PHP 8.3 `vendor/bin/pint --test` | PASS |
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
- Laravel Pint formatting was applied with PHP 8.3.33.

Verification results:

| Check | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `php artisan test` (PATH PHP 8.2.12 with SQLite) | PASS — 16 tests, 60 assertions |
| PHP 8.3 `vendor/bin/pint --test` | PASS after formatting |
| Packaged `pos://app` CORS test | PASS |
| Untrusted `Origin: null` rejection test | PASS |
| Configured MySQL/MariaDB migrations and development users | PASS |
| Live HTTP login/current-user/logout/revoked-token/validation/health flow | PASS |
| Live renderer login, dashboard, logout, and protected-route flow | PASS |
| Invalid-token redirect with session-ended feedback | PASS |
| Backend-unavailable local logout with warning | PASS |

PHP 8.3 environment note: the WinGet installation has `pdo_mysql`, but its `pdo_sqlite` and `sqlite3` extensions are currently disabled. Until those are enabled, use PATH PHP 8.2.12 for the SQLite-backed test suite and WinGet PHP 8.3.33 for Pint.

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
2. **PHP:** 8.3.33 is installed with `zip` / `pdo_mysql`, but the current shell PATH resolves XAMPP PHP 8.2.12 first. Use the WinGet PHP 8.3 executable for Pint until PATH is corrected.
3. **Database (local):** XAMPP MariaDB 10.4.32; DB `pos_homestay`; target MySQL 8.4 LTS for production.
4. **Node:** v22.14.0 acceptable for frontend development.
5. **Phase boundary:** Phase 10.7 complete. Do not start Phase 10.8 Orders/POS until explicitly requested.

Related: [[Architecture]] · [[Requirement]] · [[Rules]] · [[PRD]]

---

# 19. Next Steps

Immediate next phase (**awaiting explicit go-ahead**):

1. **Potential Phase 10.8 — Orders / POS Foundation (requires explicit approval)**

Then:

2. Remaining confirmed Master Data modules
3. POS
4. Hardware

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
