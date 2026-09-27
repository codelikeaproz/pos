# University HomeStay POS
## Architecture

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

The first objective is not to create a completely new POS.

The first objective is:

Modernize and reproduce the existing University HomeStay POS workflow using a maintainable technology stack.

New features should only be added after the existing workflow is stable and verified.
