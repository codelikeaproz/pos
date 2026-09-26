# University HomeStay POS

## Development Rules

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

Controllers should remain thin.

Business logic should not become concentrated inside controllers.

Preferred structure:

Controller
    ↓
Service
    ↓
Repository / Eloquent
    ↓
Database

A repository should only be introduced where it provides meaningful value. Do not create unnecessary abstraction simply for the sake of having more layers.

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
Controller (thin)
  ↓
Form Request validation
  ↓
Service when needed
  ↓
Eloquent model
  ↓
Database
```

Controllers stay thin. Class names: `ItemController`, `StationController`, `OrderController`.

Form Requests own validation (e.g. `StoreItemRequest`, `UpdateItemRequest`). Backend validation is authoritative; frontend validation is UX only.

API Resources control JSON serialization (e.g. `ItemResource`, `OrderResource`). Do not expose raw Eloquent models blindly once domain APIs exist.

Services hold complex business logic (e.g. `OrderService`, `InventoryService`). Create services when logic requires them — do not create empty stubs for every future module.

Eloquent is the default database access approach. Use `DB::transaction(...)` for multi-write operations (orders, inventory, payments). Avoid raw SQL unless there is a clear reason.

Authentication is implemented in a later phase. Do not mix Electron IPC (hardware / desktop) with Laravel HTTP API (application data / business rules).

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
Business rules / Service
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
