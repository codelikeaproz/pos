
---
# University HomeStay POS
## Requirements

> Phase 10.16 status (2026-10-01): **Complete.** Cash and Customer-linked Credit / Utang share one checkout. F3 opens the Cash Received text dialog; F4 opens Customer selection. The cashier stays on POS for F7 current-Station Transactions, F9 Qty, F10 New Order, and F12 read-only Station Inventory; Esc exits POS. Station-scoped AJAX Item search, exact-code entry, paginated Item results, streamlined icon controls, decimal quantity editing, and the receipt-style post-payment preview are implemented. Printer and Cash Drawer hardware remain deferred. See [[Architecture]], [[Rules]], and the dated implementation log in [[HandOff]]. Earlier feature lists below retain their original planning context.

> Schema clarification originating in Phase 10.11B: the initial table list below is historical planning scope. Consignment Account Management uses `users.station_id` and `users.consignee_id`, not a `consignments` table. The current schema also contains `station_items`, `prices`, and `inventory_movements`. POS Orders are separate from Item Deliveries, which were implemented in Phase 10.13.

> Technical, functional, hardware, software, and environment requirements.

### Project Documentation

- [[Architecture]]
- [[PRD]]
- [[Rules]]
- [[HandOff]]

---

# 1. Technology Stack

| Layer | Technology | Baseline |
|---|---|---|
| Desktop | Electron | 44.x |
| Frontend | React | 19.x |
| Language | TypeScript | Current stable compatible version |
| Backend | Laravel | 12.x |
| Backend Language | PHP | 8.2+ (this machine: 8.2.12) |
| Database | MySQL | 8.4 LTS |
| Runtime | Node.js | 24.x LTS |
| Package Manager | npm | Compatible with Node.js |
| API | Laravel HTTP API | REST-style |
| ORM | Eloquent | Laravel 12 |
| Desktop Build | electron-builder | Compatible stable version |
| OS | Windows | 64-bit |

Laravel 12 is the locked backend baseline for this project (Laravel 13 is available on Packagist but is **not** used). PHP 8.2+ is required for Laravel 12; this machine uses PHP 8.2.12.

Electron 44 was released August 25, 2026 and includes Node.js 24.18.1. Electron officially supports the latest three stable major versions, so the project should pin and test a specific Electron version rather than continuously pulling arbitrary versions. :contentReference[oaicite:1]{index=1}

Node.js 24.x is an LTS line as of September 2026. :contentReference[oaicite:2]{index=2}

MySQL 8.4 is an LTS release intended for environments that prioritize stability and longer support. :contentReference[oaicite:3]{index=3}

---

# 2. Version Policy

Do not automatically upgrade major framework versions during active development.

### Locked development decisions (Phase 1 — 2026-09-25)

| Concern | Decision | Notes |
|---|---|---|
| Backend framework | **Laravel 12** | Locked; Laravel 13 not used for this POS project |
| PHP | **8.2.12** installed (8.2+ OK for L12) | XAMPP PHP; see PATH note below |
| Database (local) | **XAMPP MariaDB 10.4.32** | Accepted for local development only |
| Database (target) | **MySQL 8.4 LTS** | Production / long-term target remains unchanged |
| Node.js | **v22.14.0** (current machine) | Acceptable for Phase 2; revisit 24.x if Electron pin requires it |

Related handoff notes: [[HandOff]]

Patch updates may be applied after testing.

Major version upgrades require:

1. Review release notes
2. Test the application
3. Test database compatibility
4. Test hardware
5. Test production build


# 3. Development Environment

Recommended:

Windows 10/11 64-bit
VS Code
Git
Node.js 24 LTS (or current machine LTS-compatible version per version policy)
npm
PHP 8.2+
Composer
Laravel 12
MySQL 8.4 (local: MariaDB 10.4 via XAMPP accepted)

Verified on this machine after Phase 1 remediation:

- Node.js `v22.14.0`
- npm `11.11.0`
- PHP `8.2.12` from XAMPP; as verified 2026-09-28, this is the primary PHP on PATH
- Composer `2.8.6`; as verified 2026-09-26, it uses the first PHP on PATH (`8.2.12`)
- Git `2.46.0.windows.1`
- MariaDB `10.4.32` at `C:\xampp\mysql\bin` (on User PATH; root connection verified)

The application itself will run through Electron.

Laravel 12 application tests run under the PATH-selected PHP 8.2.12, which has the SQLite driver required by the in-memory test database.

End users do not need Node.js installed separately to run the packaged Electron application because Electron bundles its own Node.js runtime


# 4. Backend Requirements

Laravel must provide:

- Authentication API
- User management
- Station management
- Item management
- Supplier management
- Consignee management
- Consignment management
- Order management
- Payment processing
- Transaction recording
- Validation
- Error handling

---

# 5. Frontend Requirements

React must provide:

- Login
- Dashboard
- Employee page
- Item page
- Station page
- Order/POS page
- Consignee page
- Consignment page
- Supplier page
- Transaction interface

---

# 6. Desktop Requirements

Electron must provide:

- Windows application window
- Application startup
- Secure preload bridge
- API communication
- Hardware integration
- Production packaging

Target output:
UniversityHomeStayPOS.exe


# 7. Hardware Requirements

Initial hardware:

Computer
Receipt Printer
Cash Drawer


The printer should be selected before finalizing the hardware implementation.

The chosen printer must be tested for:

- USB/network connection
- Windows compatibility
- Receipt printing
- Paper cutting
- Cash drawer kick
- Driver behavior

---

# 8. Database Requirements

Initial tables:
users
stations
items
suppliers
consignees
orders
order_items
consignments

Potential additional tables may be introduced only when the workflow requires them.

# 9. Database Naming Requirements

Tables:

```
snake_case + plural
```

Examples:

```
order_items
```

Columns:

```
snake_case
```

Examples:

```
station_id
item_code
contact_number
total_amount
```

Models:

```
PascalCase + singular
```

Examples:

```
Order
OrderItem
Supplier
```

PHP methods:

```
camelCase
```

Examples:

```
calculateTotal()
processPayment()
```

PHP variables:

```
camelCase
```

Examples:

```
$totalAmount
$cashReceived
```

React components:

```
PascalCase
```

Examples:

```
OrderCart.tsx
PaymentPanel.tsx
```

React functions:

```
camelCase
```

Examples:

```
handlePayment()
calculateChange()
```


# 10. Authentication Requirements

The system must support:

Login
Logout
Session/token management
Password hashing
Authenticated API requests


Initial user categories:
Administrator
End User

Authorization rules should be implemented according to actual business requirements

# 11. POS Requirements

The POS must support:

Search Item
Add Item
Change Quantity
Remove/adjust item
Calculate Subtotal
Calculate Total
Select Payment Method
Enter Cash
Calculate Change
Complete Payment
Save Transaction
Print Receipt
Open Cash Drawer

# 12. Transaction Requirements

Every completed order should have a unique transaction identifier.

Example:
Transaction Number:
20260924163733313

Transaction data should include at minimum:

order
user
station
items
quantities
prices
total
payment method
cash received
change
date/time

Exact fields may be refined during database design.

# 13. Error Handling

The application must provide understandable errors.

Examples:

```
Unable to connect to server.
Unable to save order.
Insufficient cash.
Printer unavailable.
Unable to print receipt.
Cash drawer unavailable.
```

Do not expose technical stack traces to normal users.

# 14. Hardware Compatibility

Native Electron modules may require rebuilding against the Electron runtime. If a hardware dependency uses native Node modules, the team must account for Electron-compatible rebuilding and Windows architecture compatibility.

Hardware must be tested on the actual target Windows computer.


# 15. Testing Requirements

Each module should be tested independently.

Minimum testing:

```
Login
Employee CRUD
Item CRUD
Station CRUD
Supplier CRUD
Consignee CRUD
Consignment workflow
Order creation
Quantity changes
Payment
Change calculation
Transaction saving
Receipt printing
Cash drawer
```

---

# 16. Deployment Requirements

Production build must:

- Package Electron
- Include frontend assets
- Configure API URL
- Configure production environment
- Include required hardware dependencies
- Be tested on a clean Windows machine

---

# 17. Environment Configuration

Do not hard-code production URLs or secrets.

Example:

```
APP_API_URL=
```

Development:

```
http://localhost:8000
```

Production:

```
https://example-api.example.com
```

Actual production URL will be defined later.

# 18. Version Verification

Before development begins, record the actual installed versions:

```
node -v
npm -v
php -v
composer --version
php artisan --version
mysql --version
```

Also record:

```
npx electron --version
```

The project documentation should use the versions actually tested by the team.

---

# 19. Definition of Done

A feature is considered complete when:

- UI is implemented
- API is implemented
- Validation works
- Database operation works
- Error handling works
- Main workflow is tested
- Code follows naming conventions
- Documentation is updated
- Changes are committed to Git
