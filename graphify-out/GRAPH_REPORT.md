# Graph Report - pos  (2026-10-21)

## Corpus Check
- 286 files · ~182,324 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 68 file(s) not represented in the graph (top: .css 46, (none) 18, .example 2)

## Summary
- 2059 nodes · 5138 edges · 140 communities (81 shown, 59 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 87 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1f627bc1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- getUserFacingApiMessage
- StationItem
- OrdersPage.tsx
- composer.json
- MonthlyEndInventoryPage.tsx
- Illuminate\Database\Eloquent\Relations\BelongsTo
- Development Handoff
- StationItemController.php
- Rules.md
- printing.ts
- package.json
- Illuminate\Http\JsonResponse
- ItemDeliveryController.php
- Illuminate\Http\Request
- Button
- EmployeeForm.tsx
- PRD.md
- Station
- UserManagementApiTest
- OrderController.php
- PosCheckoutApiTest
- AuthContext.tsx
- MonthlyEndInventoryPage
- Order
- Illuminate\Foundation\Http\FormRequest
- AppSidebar.tsx
- spoilageService.ts
- SaleRemittanceController.php
- User
- SalesReportApiTest
- compilerOptions
- PrivilegeController.php
- index.tsx
- SaleRemittancesPage.tsx
- Development Rules
- PriceController.php
- Architecture
- HandOff.md
- ItemManagementApiTest
- UpdateTaxSettingRequest
- TaxSetting
- Requirement.md
- MonthlyEndReportController.php
- MonthlyEndReportApiTest
- Illuminate\Database\Schema\Blueprint
- PosItemApiTest
- StationsPage.tsx
- Architecture.md
- compilerOptions
- ItemController.php
- ItemDeliveryController.php
- SpoilageController
- TestCase
- ItemsPage
- UserRole
- StationController.php
- UserFactory.php
- OrderHistoryApiTest
- EnsureUserIsAdmin
- Inventory Context
- CustomerCreditMonitoringApiTest
- ItemDeliveryApiTest.php
- OrTransactionApiTest
- preload.ts
- CustomerController.php
- CustomerManagementPage.tsx
- 18. Current Phase
- AppServiceProvider.php
- bootstrap/app.php
- Illuminate\Database\Migrations\Migration
- 2026_09_30_000000_create_prices_table.php
- 2026_09_27_040000_create_station_items_table.php
- .prices
- SchemaReconciliationTest
- StationItemApiTest
- App.tsx
- UserRole
- privilegeService.ts
- itemDeliveryService.ts
- PricesPage.tsx
- 9.2 Role-Aware Application Navigation (Phase 9)
- Deferred Work Register
- 🧩 Icon System
- University HomeStay POS
- University HomeStay POS Context Router
- 0001_01_01_000001_create_cache_table.php
- CreditMonitoringPage.tsx
- 2026_10_21_010000_create_monthly_end_reports_tables.php
- stationItemService.ts
- Phase 10.21 — Non-VAT / Tax Foundation
- Phase 10.22A — Sales Report
- Phase 8 — Simple Authentication / Login Foundation
- 2026_09_27_020000_create_items_table.php
- 2026_09_27_045000_create_customers_table.php
- 2026_09_27_050000_create_orders_table.php
- main.ts
- 2026_09_30_010000_create_inventory_movements_table.php
- 2026_09_30_020000_create_item_deliveries_table.php
- 2026_09_30_030000_create_item_delivery_items_table.php
- 3. Application Layers
- StoreCustomerRequest
- apiClient.ts
- PrivilegeController.php
- tsconfig.json
- checkout.md
- AGENTS.md
- University HomeStay POS
- devDependencies
- Phase 10.22C — Inventory Reconciliation
- StoreItemDeliveryRequest
- StoreStationItemRequest
- SaleRemittanceApiTest
- StoreStationRequest
- SyncUserPrivilegesRequest
- Illuminate\Support\Facades\Schema
- printing.md
- UpdateMonthlyEndCountsRequest
- UpdateStationItemRequest
- UpdateStationRequest
- 2026_09_30_040000_create_spoilages_table.php
- salesReportService.ts
- vite-env.d.ts
- scripts
- navigation.ts
- StoreSpoilageRequest
- dependencies
- StoreMonthlyEndReportRequest
- StoreSaleRemittanceRequest
- UpdateItemRequest
- 2026_09_27_060000_create_order_items_table.php
- 14. URL / API Naming

## God Nodes (most connected - your core abstractions)
1. `getUserFacingApiMessage()` - 75 edges
2. `Button` - 65 edges
3. `User` - 55 edges
4. `apiRequest()` - 53 edges
5. `Alert()` - 51 edges
6. `OrdersPage()` - 48 edges
7. `LoadingState()` - 47 edges
8. `TestCase` - 46 edges
9. `Item` - 45 edges
10. `Modal()` - 45 edges

## Surprising Connections (you probably didn't know these)
- `9.6 Item Management (Phase 10.4)` --references--> `ItemResource`  [INFERRED]
  POS Memory/Architecture.md → backend/app/Http/Resources/ItemResource.php
- `Phase 10.20A — Admin Dashboard and Cashier landing (2026-10-11)` --references--> `LoginPage()`  [INFERRED]
  POS Memory/Architecture.md → frontend/src/features/auth/LoginPage.tsx
- `Phase 10.19.3 58 mm HTML receipt preview (2026-10-06)` --references--> `PaymentReceipt()`  [INFERRED]
  POS Memory/Architecture.md → frontend/src/features/pos/PaymentReceipt.tsx
- `14.1 API layer conventions` --references--> `OrderController`  [INFERRED]
  POS Memory/Rules.md → backend/app/Http/Controllers/Api/OrderController.php
- `14.1 API layer conventions` --references--> `StationController`  [INFERRED]
  POS Memory/Rules.md → backend/app/Http/Controllers/Api/StationController.php

## Import Cycles
- None detected.

## Communities (140 total, 59 thin omitted)

### Community 0 - "getUserFacingApiMessage"
Cohesion: 0.07
Nodes (65): Alert(), LoadingState(), Modal(), useToast(), Button, Pagination(), SearchField(), Select (+57 more)

### Community 1 - "StationItem"
Cohesion: 0.08
Nodes (3): Item, Price, StationItem

### Community 2 - "OrdersPage.tsx"
Cohesion: 0.07
Nodes (58): Props, StockQuantity(), CashReceivedDialog(), confirm(), CurrentOrderTable(), PaymentPanel(), Props, PaymentReceipt() (+50 more)

### Community 3 - "composer.json"
Cohesion: 0.04
Nodes (45): pestphp/pest-plugin, php-http/discovery, autoload, autoload-dev, psr-4, psr-4, dev-master, config (+37 more)

### Community 4 - "MonthlyEndInventoryPage.tsx"
Cohesion: 0.07
Nodes (54): AlertProps, toneIcons, LoadingStateProps, ModalProps, ToastContext, ToastContextValue, ToastItem, ToastTone (+46 more)

### Community 5 - "Illuminate\Database\Eloquent\Relations\BelongsTo"
Cohesion: 0.07
Nodes (8): InventoryMovement, ItemDelivery, ItemDeliveryItem, MonthlyEndReportItem, OrderItem, Spoilage, SpoilageItem, Phase 10.9 — Payment & Order Finalization

### Community 6 - "Development Handoff"
Cohesion: 0.06
Nodes (33): Consignee and Consignment Account removal (2026-10-09), Current development status (2026-10-07), Development Handoff, Development log — 2026-09-30 (Phase 10.16 and POS follow-up), Development log — 2026-10-01 (POS F3/F4 payment controls), Phase 10.12 current-state note, Phase 10.13 current-state note, Phase 10.14.1 current-state note (+25 more)

### Community 7 - "StationItemController.php"
Cohesion: 0.16
Nodes (3): {closure#6}(), StationItemController, StationItemResource

### Community 8 - "Rules.md"
Cohesion: 0.07
Nodes (26): 10. PHP Variable Naming, 11. React Component Naming, 12. React Function Naming, 13. React Variable Naming, 15. Page Naming, 16. Eloquent Rules, 17. Money Rules, 18 Order Processing Rule (+18 more)

### Community 9 - "printing.ts"
Cohesion: 0.18
Nodes (17): center(), decimal(), escapeHtml(), formatPrintReceipt(), line(), money(), parseReceipt(), PrintResult (+9 more)

### Community 10 - "package.json"
Cohesion: 0.14
Nodes (12): description, main, name, private, version, electron-vite, @types/node, @types/react (+4 more)

### Community 11 - "Illuminate\Http\JsonResponse"
Cohesion: 0.08
Nodes (12): AuthController, CreditMonitoringController, DashboardController, HealthController, PosItemController, PrivilegeAssignmentController, SaleRemittanceController, {closure#1}() (+4 more)

### Community 12 - "ItemDeliveryController.php"
Cohesion: 0.06
Nodes (3): {closure#1}(), PosCheckoutController, {closure#1}()

### Community 13 - "Illuminate\Http\Request"
Cohesion: 0.08
Nodes (7): OrderController, OrderDetailResource, OrderHistoryResource, OrderResource, PosItemResource, PosStationInventoryResource, SaleRemittanceResource

### Community 14 - "Button"
Cohesion: 0.10
Nodes (39): Badge(), BadgeProps, BadgeTone, CustomerSort, CustomerSortHeader(), Table(), OrderDetailView(), OrTransactionTable() (+31 more)

### Community 15 - "EmployeeForm.tsx"
Cohesion: 0.15
Nodes (15): SelectOption, SelectProps, EmployeeFieldErrors, EmployeeFormProps, ROLES, DeleteUserResponse, loadEmployeeOptions(), loadEmployees() (+7 more)

### Community 16 - "PRD.md"
Cohesion: 0.06
Nodes (30): 10. Consignee Requirements, 11. Consignment Requirements, 12. Orders / POS Requirements, 13. Payment Flow, 14. Hardware Requirements, 15. Initial Release Boundary, 16. Future Expansion, 1. Product Overview (+22 more)

### Community 17 - "Station"
Cohesion: 0.17
Nodes (3): {closure#9}(), Station, Phase 10.14 current Spoilage architecture

### Community 18 - "UserManagementApiTest"
Cohesion: 0.09
Nodes (3): PriceManagementApiTest, SpoilageApiTest, UserManagementApiTest

### Community 21 - "AuthContext.tsx"
Cohesion: 0.19
Nodes (20): AlertTone, AuthContext, AuthContextValue, AuthNotice, AuthProvider(), bootstrap(), extractLoginErrorMessage(), fetchCurrentUser() (+12 more)

### Community 22 - "MonthlyEndInventoryPage"
Cohesion: 0.14
Nodes (24): cents(), currentManila(), MonthlyEndInventoryPage(), create(), finalize(), prepareFinalize(), reconcile(), save() (+16 more)

### Community 23 - "Order"
Cohesion: 0.10
Nodes (4): Customer, {closure#1}(), Order, DashboardApiTest

### Community 24 - "Illuminate\Foundation\Http\FormRequest"
Cohesion: 0.15
Nodes (4): LoginRequest, ReconcileMonthlyEndItemsRequest, StoreItemRequest, StorePriceRequest

### Community 25 - "AppSidebar.tsx"
Cohesion: 0.33
Nodes (4): AppHeader(), AppSidebar(), AppShell(), getNavItemByPath()

### Community 26 - "spoilageService.ts"
Cohesion: 0.31
Nodes (7): loadSpoilageOptions(), loadSpoilages(), Spoilage, SpoilageItem, SpoilageList, SpoilageOption, SpoilageOptions

### Community 28 - "User"
Cohesion: 0.15
Nodes (6): {closure#3}(), {closure#4}(), Privilege, User, Phase 10.17 Privilege and Privilege Assignment (2026-10-01), Phase 10.17 status — Complete (2026-10-01)

### Community 30 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowSyntheticDefaultImports, composite, esModuleInterop, isolatedModules, jsx, lib, module (+9 more)

### Community 31 - "PrivilegeController.php"
Cohesion: 0.15
Nodes (4): {closure#1}(), StorePrivilegeRequest, {closure#1}(), UpdatePrivilegeRequest

### Community 32 - "index.tsx"
Cohesion: 0.25
Nodes (8): useAuth(), LoginPage(), PosRoute(), ProtectedRoute(), RoleRoute(), CashierHomePage(), RoleLanding(), react-router-dom

### Community 33 - "SaleRemittancesPage.tsx"
Cohesion: 0.24
Nodes (11): StatusSort, StatusSortHeader(), cents(), EMPTY, money, SaleRemittancesPage(), submit(), loadSaleRemittances() (+3 more)

### Community 34 - "Development Rules"
Cohesion: 0.07
Nodes (28): API-only backend, Cash drawer integration POC, Current module boundary — Consignee removal, Current POS interaction rules (2026-10-01), Developer context architecture, Development Rules, Migration ownership, Phase 10.13 Item Delivery rules (+20 more)

### Community 36 - "Architecture"
Cohesion: 0.08
Nodes (24): API-only backend cleanup (2026-10-07), Architecture, Current module boundary — Consignee removal (2026-10-09), Current POS layout and in-place cashier actions (2026-10-01), Phase 10.13 current Item Delivery architecture, Phase 10.14.1 confirmed legacy-facing sidebar, Phase 10.15 Customer and Credit Monitoring architecture, Phase 10.16.1 compact UI and Station Inventory summary (2026-10-01) (+16 more)

### Community 37 - "HandOff.md"
Cohesion: 0.08
Nodes (24): 10. Consignment Screen Observed, 11. POS Screen Observed, 12. Hardware Scope, 13. Architecture Decision, 14. Database Direction, 15. Naming Decision, 16. Current Scope, 17. Future Idea — Customer Food Menu (+16 more)

### Community 40 - "TaxSetting"
Cohesion: 0.14
Nodes (5): TaxStatus, NonVat, VatRegistered, TaxSetting, TaxSettingApiTest

### Community 41 - "Requirement.md"
Cohesion: 0.10
Nodes (20): 10. Authentication Requirements, 11. POS Requirements, 12. Transaction Requirements, 13. Error Handling, 14. Hardware Compatibility, 15. Testing Requirements, 16. Deployment Requirements, 17. Environment Configuration (+12 more)

### Community 42 - "MonthlyEndReportController.php"
Cohesion: 0.14
Nodes (7): {closure#5}(), {closure#6}(), {closure#7}(), {closure#8}(), MonthlyEndReportController, MonthlyEndReportResource, MonthlyEndReport

### Community 43 - "MonthlyEndReportApiTest"
Cohesion: 0.21
Nodes (8): MonthlyEndReportApiTest, Deferred / out of scope, Goal, Inputs, Invariants, Phase 10.22B — Monthly End Inventory, Process and outputs, Verification

### Community 44 - "Illuminate\Database\Schema\Blueprint"
Cohesion: 0.23
Nodes (6): {closure#1}(), {closure#2}(), {closure#3}(), {closure#1}(), {closure#2}(), {closure#3}()

### Community 46 - "StationsPage.tsx"
Cohesion: 0.15
Nodes (20): StationFieldErrors, StationForm(), StationFormProps, StationTable(), EMPTY_LIST, fieldErrorsFrom(), FormDialog, StationsPage() (+12 more)

### Community 47 - "Architecture.md"
Cohesion: 0.12
Nodes (19): 10. Future Architecture, 11. Architecture Principle, 1. Project Overview, 2. Technology Architecture, 4. Initial Application Flow, 5. POS Order Flow, 6. Hardware Architecture, 7. Database Structure (+11 more)

### Community 48 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, allowSyntheticDefaultImports, composite, esModuleInterop, module, moduleResolution, noEmit, resolveJsonModule (+4 more)

### Community 49 - "ItemController.php"
Cohesion: 0.19
Nodes (3): ItemController, ItemResource, 14.1 API layer conventions

### Community 52 - "TestCase"
Cohesion: 0.07
Nodes (5): HealthEndpointTest, MonthlyEndReconciliationApiTest, PrivilegeApiTest, StationManagementApiTest, TestCase

### Community 53 - "ItemsPage"
Cohesion: 0.16
Nodes (17): ItemFieldErrors, ItemForm(), Props, EMPTY_LIST, fieldErrorsFrom(), FormDialog, save(), createItem() (+9 more)

### Community 54 - "UserRole"
Cohesion: 0.08
Nodes (6): UserRole, Admin, EndUser, DatabaseSeeder, DevelopmentUserSeeder, AuthApiTest

### Community 58 - "EnsureUserIsAdmin"
Cohesion: 0.17
Nodes (17): EnsureUserIsAdmin, 9.1 Authentication (Phase 8), 9.3 Employee Management (Phase 10.1), Architecture simplification — 2026-09-26, Deferred feature register carried forward, Phase 10.1 deliverables, Phase 10.1 — Employee Management, Phase 10.1 verification — 2026-09-26 (+9 more)

### Community 59 - "Inventory Context"
Cohesion: 0.67
Nodes (3): Inventory Context, Read, Stable invariants

### Community 63 - "preload.ts"
Cohesion: 0.31
Nodes (9): AppInfo, CashDrawerResult, APP_GET_INFO, AppIpcChannel, CASH_DRAWER_OPEN, PRINTERS_GET, RECEIPT_PRINT, ElectronAPI (+1 more)

### Community 65 - "CustomerManagementPage.tsx"
Cohesion: 0.29
Nodes (7): EMPTY, EMPTY, money, addCustomer(), loadCustomers(), Customer, CustomerList

### Community 66 - "18. Current Phase"
Cohesion: 0.22
Nodes (9): 18. Current Phase, Frontend UI cleanup — 2026-09-27, Phase 10.10 — Transaction History, Phase 10.6 — Consignment Account Management, Phase 10.7 — Station Inventory Foundation, Phase 10.8 — Orders / POS Foundation, Phase 9 — Dashboard & Role-Aware Navigation Foundation, Phase 9 deliverables (+1 more)

### Community 68 - "bootstrap/app.php"
Cohesion: 0.28
Nodes (3): {closure#1}(), {closure#2}(), {closure#3}()

### Community 70 - "2026_09_30_000000_create_prices_table.php"
Cohesion: 0.25
Nodes (5): backfillPrices(), {closure#1}(), {closure#2}(), {closure#5}(), up()

### Community 72 - ".prices"
Cohesion: 0.20
Nodes (8): Phase 10.11B current schema, Phase 10.12 current pricing architecture, Phase 10.11B current-state note, Project Documentation, Requirements, University HomeStay POS, Phase 10.11B current rules, Phase 10.12 current pricing rules

### Community 75 - "App.tsx"
Cohesion: 0.32
Nodes (5): App(), router, ToastProvider(), appRoutes, react-dom

### Community 76 - "UserRole"
Cohesion: 0.14
Nodes (3): CheckoutOrderRequest, StoreUserRequest, UpdateUserRequest

### Community 77 - "privilegeService.ts"
Cohesion: 0.24
Nodes (10): save(), createPrivilege(), loadPrivilegeAssignments(), loadPrivileges(), PaginatedPrivileges, updatePrivilege(), AssignmentUser, Privilege (+2 more)

### Community 78 - "itemDeliveryService.ts"
Cohesion: 0.36
Nodes (6): loadDeliveries(), loadDeliveryOptions(), DeliveryItem, DeliveryList, DeliveryOptions, ItemDelivery

### Community 79 - "PricesPage.tsx"
Cohesion: 0.31
Nodes (7): activatePrice(), loadPriceItemOptions(), loadPrices(), PaginatedPrices, PriceItemOption, PriceList, PriceRecord

### Community 80 - "9.2 Role-Aware Application Navigation (Phase 9)"
Cohesion: 0.22
Nodes (9): 9.10 Orders / POS Foundation (Phase 10.8), 9.11 Payment and Order Finalization (Phase 10.9), 9.12 Transaction History (Phase 10.10), 9.2 Role-Aware Application Navigation (Phase 9), 9.4 Station Management (Phase 10.2), 9.6 Item Management (Phase 10.4), 9.7 Consignee Management (Phase 10.5), 9.8 Consignment Account Management (Phase 10.6) (+1 more)

### Community 81 - "Deferred Work Register"
Cohesion: 0.25
Nodes (7): Accounting, Deferred Work Register, Hardware, Inventory, Other, Reporting, Tax

### Community 82 - "🧩 Icon System"
Cohesion: 0.25
Nodes (8): 🎨 Brand Design System & Components, Common Icon Mapping, Icon Library, Icon Rules, Icon Size Guidelines, 🧩 Icon System, Recommended Default, University HomeStay POS

### Community 83 - "University HomeStay POS"
Cohesion: 0.25
Nodes (7): AI Context Architecture, Backend, Communication, Frontend, Layout, Stack notes, University HomeStay POS

### Community 84 - "University HomeStay POS Context Router"
Cohesion: 0.29
Nodes (6): Authority, Core sources, Documentation workflow, Graphify use, Task routing, University HomeStay POS Context Router

### Community 87 - "CreditMonitoringPage.tsx"
Cohesion: 0.60
Nodes (3): loadCreditMonitoring(), CreditMonitoringList, CreditOrder

### Community 89 - "stationItemService.ts"
Cohesion: 0.21
Nodes (10): assignItemToStation(), loadStationInventory(), PageResponse, removeItemFromStation(), updateStationQuantity(), InventoryItemOption, InventoryOption, StationInventoryList (+2 more)

### Community 90 - "Phase 10.21 — Non-VAT / Tax Foundation"
Cohesion: 0.17
Nodes (10): Deferred / out of scope, Goal, Inputs, Invariants and process, Outputs, Phase 10.21 — Non-VAT / Tax Foundation, Verification, Read (+2 more)

### Community 91 - "Phase 10.22A — Sales Report"
Cohesion: 0.29
Nodes (7): Deferred / out of scope, Goal, Inputs, Invariants and process, Outputs, Phase 10.22A — Sales Report, Verification

### Community 92 - "Phase 8 — Simple Authentication / Login Foundation"
Cohesion: 0.33
Nodes (6): Development credentials (local only — never use in production), Environment decisions (still in force), Phase 7/8 verification and hardening — 2026-09-26, Phase 8 deliverables, Phase 8 — Simple Authentication / Login Foundation, Prior phases

### Community 96 - "main.ts"
Cohesion: 0.20
Nodes (5): registerAppIpc(), openCashDrawer(), registerCashDrawerIpc(), Phase 10.20D — AQ405A Cash Drawer Integration (2026-10-08), Phase 10.20D AQ405A Cash Drawer Integration — Architecture complete, controller execution deferred (2026-10-08)

### Community 100 - "3. Application Layers"
Cohesion: 0.40
Nodes (5): 3.1 Electron, 3.2 React + TypeScript, 3.3 Laravel, 3.4 MySQL, 3. Application Layers

### Community 102 - "apiClient.ts"
Cohesion: 0.18
Nodes (14): ApiError, ApiErrorKind, apiRequest(), ApiRequestOptions, currentPricesFrom(), currentStockFrom(), getApiBaseUrl(), messageForHttpStatus() (+6 more)

### Community 112 - "checkout.md"
Cohesion: 0.50
Nodes (3): Checkout Context, Read, Stable invariants

### Community 116 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, electron, electron-vite, @types/node, @types/react, @types/react-dom, typescript, vite (+1 more)

### Community 117 - "Phase 10.22C — Inventory Reconciliation"
Cohesion: 0.33
Nodes (6): Critical invariants, Goal, Inputs, Out of scope, Phase 10.22C — Inventory Reconciliation, Verification

### Community 124 - "printing.md"
Cohesion: 0.50
Nodes (3): Printing and Hardware Context, Read, Stable invariants

### Community 129 - "salesReportService.ts"
Cohesion: 0.38
Nodes (5): loadSalesReport(), SalesReportFilters, OrderParty, SalesReportData, SalesReportPeriod

### Community 130 - "vite-env.d.ts"
Cohesion: 0.38
Nodes (5): AppInfo, ElectronAPI, ImportMeta, ImportMetaEnv, Window

### Community 131 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, postinstall, preview, typecheck

### Community 132 - "navigation.ts"
Cohesion: 0.33
Nodes (5): getNavItemsForRole(), NavItem, navItems, otherPages, lucide-react

### Community 134 - "dependencies"
Cohesion: 0.40
Nodes (5): dependencies, lucide-react, react, react-dom, react-router-dom

### Community 139 - "14. URL / API Naming"
Cohesion: 0.67
Nodes (3): 14.2 Success response conventions, 14.3 Error response conventions, 14. URL / API Naming

## Knowledge Gaps
- **9 isolated node(s):** `NonVat`, `VatRegistered`, `Admin`, `EndUser`, `@types/node` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 845 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **59 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `18. Current Phase` connect `18. Current Phase` to `EnsureUserIsAdmin`, `Illuminate\Database\Eloquent\Relations\BelongsTo`, `Phase 8 — Simple Authentication / Login Foundation`, `HandOff.md`?**
  _High betweenness centrality (0.333) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `User` (e.g. with `9.3 Employee Management (Phase 10.1)` and `Phase 10.1 deliverables`) actually correct?**
  _`User` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `NonVat`, `VatRegistered`, `Admin` to the rest of the system?**
  _9 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `getUserFacingApiMessage` be split into smaller, more focused modules?**
  _Cohesion score 0.06740506329113924 - nodes in this community are weakly interconnected._
- **Why does `Frontend UI cleanup — 2026-09-27` connect `18. Current Phase` to `getUserFacingApiMessage`?**
  _High betweenness centrality (0.306) - this node is a cross-community bridge._
- **Should `StationItem` be split into smaller, more focused modules?**
  _Cohesion score 0.0796221322537112 - nodes in this community are weakly interconnected._
- **Why does `Phase 10.9 — Payment & Order Finalization` connect `Illuminate\Database\Eloquent\Relations\BelongsTo` to `18. Current Phase`, `Order`?**
  _High betweenness centrality (0.177) - this node is a cross-community bridge._