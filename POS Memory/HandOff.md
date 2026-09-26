
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
- **Not** implemented: OTP, 2FA, password reset, email verification, employee CRUD, social login

### Phase 7/8 verification and hardening — 2026-09-26

The shared frontend/backend connection was reviewed before further product work. Corrections completed:

- Packaged Electron renderer now loads through the registered standard and secure `pos://app` protocol instead of `file://`.
- Laravel CORS allows only the two documented Vite origins plus `pos://app`; untrusted `Origin: null` remains rejected.
- `ImportMeta.env` declarations were corrected so the full frontend TypeScript check passes.
- The shared API client now preserves normal Laravel 422 validation messages and handles HTTP 429 without applying login-specific wording to every module.
- Laravel Pint formatting was applied with PHP 8.3.33.

Verification results:

| Check | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `php artisan test` (PATH PHP 8.2.12 with SQLite) | PASS — 12 tests, 39 assertions |
| PHP 8.3 `vendor/bin/pint --test` | PASS after formatting |
| Packaged `pos://app` CORS test | PASS |
| Untrusted `Origin: null` rejection test | PASS |

PHP 8.3 environment note: the WinGet installation has `pdo_mysql`, but its `pdo_sqlite` and `sqlite3` extensions are currently disabled. Until those are enabled, use PATH PHP 8.2.12 for the SQLite-backed test suite and WinGet PHP 8.3.33 for Pint.

Repository note: this workspace currently has no `.git` metadata. Restore or initialize the intended repository before claiming the Definition of Done item requiring a commit. Do not create unrelated history without confirming the desired remote/repository.

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
5. **Phase boundary:** Phase 8 complete. Do not start Phase 9 until explicitly requested.

Related: [[Architecture]] · [[Requirement]] · [[Rules]] · [[PRD]]

---

# 19. Next Steps

Immediate next phase (**awaiting explicit go-ahead**):

1. **Phase 9** — Master data / next product phase (as defined by product priorities)

Then:

2. POS
3. Hardware

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
