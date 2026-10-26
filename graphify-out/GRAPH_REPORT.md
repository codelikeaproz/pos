# Graph Report - pos  (2026-10-26)

## Corpus Check
- 299 files · ~128,116 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 69 file(s) not represented in the graph (top: .css 47, (none) 18, .example 2)

## Summary
- 2188 nodes · 5434 edges · 130 communities (76 shown, 54 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 93 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `48eca85d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- SpoilageController.php
- TestCase
- OrdersPage.tsx
- composer.json
- User
- Illuminate\Database\Eloquent\Relations\BelongsTo
- Development Handoff
- PrivilegesPage.tsx
- Rules.md
- printing.ts
- package.json
- Controller
- SchemaReconciliationTest
- UserController.php
- SalesReportPage.tsx
- ItemDeliveriesPage.tsx
- PRD.md
- Table
- UserManagementApiTest
- TestCase
- PosCheckoutApiTest
- AuthContext.tsx
- MonthlyEndInventoryPage
- OrderController.php
- StationsPage.tsx
- index.tsx
- SpoilagesPage
- StationItemController.php
- MonthlyEndReportController.php
- Illuminate\Validation\Rule
- compilerOptions
- ItemController.php
- SaleRemittanceController.php
- SaleRemittancesPage.tsx
- Development Rules
- UserFactory.php
- Architecture
- HandOff.md
- Illuminate\Support\Facades\Schema
- ItemDeliveryController.php
- PriceController.php
- Requirement.md
- AuthApiTest
- MonthlyEndReportApiTest
- Illuminate\Database\Schema\Blueprint
- PosItemApiTest
- Phase 10.23H.5 — Reorder Point Activation and Low-Stock Threshold
- MonthlyEndReportController
- compilerOptions
- BatchLimitValidationTest.php
- react
- Station
- EmployeesPage.tsx
- SpoilageApiTest
- Button
- StationController.php
- University HomeStay POS
- OrderHistoryApiTest
- EnsureUserIsAdmin
- Illuminate\Foundation\Http\FormRequest
- CustomerCreditMonitoringApiTest
- OrTransactionApiTest
- TestCase
- PrivilegeController.php
- PrivilegeController.php
- Phase 10.22D — Excel Report Export
- AppServiceProvider.php
- bootstrap/app.php
- UpdateTaxSettingRequest
- 2026_09_30_000000_create_prices_table.php
- Illuminate\Database\Migrations\Migration
- .prices
- Illuminate\Foundation\Testing\RefreshDatabase
- StationItemApiTest
- App.tsx
- getUserFacingApiMessage
- LoginSlideshow.tsx
- CustomerController.php
- CheckoutOrderRequest
- 9.2 Role-Aware Application Navigation (Phase 9)
- Deferred Work Register
- 🧩 Icon System
- University HomeStay POS
- University HomeStay POS Context Router
- 0001_01_01_000001_create_cache_table.php
- navigation.ts
- 2026_10_21_010000_create_monthly_end_reports_tables.php
- Illuminate\Http\Request
- Phase 10.21 — Non-VAT / Tax Foundation
- Phase 10.22A — Sales Report
- Phase 8 — Simple Authentication / Login Foundation
- 2026_09_27_020000_create_items_table.php
- 2026_09_27_045000_create_customers_table.php
- 2026_09_27_050000_create_orders_table.php
- StoreCustomerRequest
- 2026_09_30_010000_create_inventory_movements_table.php
- 2026_09_30_020000_create_item_deliveries_table.php
- 2026_09_30_030000_create_item_delivery_items_table.php
- Architecture.md
- SalesReportController.php
- apiClient.ts
- StoreItemDeliveryRequest
- tsconfig.json
- Architecture.md
- AGENTS.md
- 18. Current Phase
- StoreSpoilageRequest
- PricesPage.tsx
- Phase 10.22C — Inventory Reconciliation
- StoreStationItemRequest
- TaxSetting
- Phase 10.23H — Security, Data Integrity, and Code Health
- StoreStationRequest
- UpdateStationItemRequest
- 2026_09_27_040000_create_station_items_table.php
- SalesReportApiTest
- Phase 10.23UI — Sidebar Profile and Navigation
- 2026_09_30_040000_create_spoilages_table.php
- assets.d.ts
- Reporting Context
- 2026_09_27_060000_create_order_items_table.php

## God Nodes (most connected - your core abstractions)
1. `getUserFacingApiMessage()` - 80 edges
2. `Button` - 67 edges
3. `User` - 57 edges
4. `Alert()` - 53 edges
5. `apiRequest()` - 53 edges
6. `TestCase` - 50 edges
7. `OrdersPage()` - 48 edges
8. `LoadingState()` - 47 edges
9. `Modal()` - 47 edges
10. `Station` - 46 edges

## Surprising Connections (you probably didn't know these)
- `Phase 10.4 verification — 2026-09-27` --references--> `EnsureUserIsAdmin`  [INFERRED]
  POS Memory/HandOff.md → backend/app/Http/Middleware/EnsureUserIsAdmin.php
- `9.6 Item Management (Phase 10.4)` --references--> `ItemResource`  [INFERRED]
  POS Memory/Architecture.md → backend/app/Http/Resources/ItemResource.php
- `Phase 10.19.3 58 mm HTML receipt preview (2026-10-06)` --references--> `PaymentReceipt()`  [INFERRED]
  POS Memory/Architecture.md → frontend/src/features/pos/PaymentReceipt.tsx
- `14.1 API layer conventions` --references--> `OrderController`  [INFERRED]
  POS Memory/Rules.md → backend/app/Http/Controllers/Api/OrderController.php
- `14.1 API layer conventions` --references--> `StationController`  [INFERRED]
  POS Memory/Rules.md → backend/app/Http/Controllers/Api/StationController.php

## Import Cycles
- None detected.

## Communities (130 total, 54 thin omitted)

### Community 1 - "TestCase"
Cohesion: 0.07
Nodes (4): InventoryMovement, Item, Price, StationItem

### Community 2 - "OrdersPage.tsx"
Cohesion: 0.07
Nodes (58): Props, StockQuantity(), confirm(), PaymentPanel(), Props, PaymentReceipt(), PosItemSearch(), add() (+50 more)

### Community 3 - "composer.json"
Cohesion: 0.04
Nodes (46): pestphp/pest-plugin, php-http/discovery, autoload, autoload-dev, psr-4, psr-4, dev-master, config (+38 more)

### Community 4 - "User"
Cohesion: 0.13
Nodes (7): {closure#3}(), {closure#4}(), Privilege, User, ReportExcelExportApiTest, Phase 10.17 Privilege and Privilege Assignment (2026-10-01), Phase 10.17 status — Complete (2026-10-01)

### Community 5 - "Illuminate\Database\Eloquent\Relations\BelongsTo"
Cohesion: 0.07
Nodes (9): ItemDelivery, ItemDeliveryItem, MonthlyEndReportItem, {closure#1}(), Order, OrderItem, Spoilage, SpoilageItem (+1 more)

### Community 6 - "Development Handoff"
Cohesion: 0.06
Nodes (34): Consignee and Consignment Account removal (2026-10-09), Current development status (2026-10-07), Development log — 2026-09-30 (Phase 10.16 and POS follow-up), Development log — 2026-10-01 (POS F3/F4 payment controls), Phase 10.12 current-state note, Phase 10.13 current-state note, Phase 10.14.1 current-state note, Phase 10.14 current-state note (+26 more)

### Community 7 - "PrivilegesPage.tsx"
Cohesion: 0.14
Nodes (18): AdminPageSize, Props, EMPTY, PrivilegeAssignmentsPage(), save(), EMPTY, PrivilegesPage(), save() (+10 more)

### Community 8 - "Rules.md"
Cohesion: 0.07
Nodes (26): 10. PHP Variable Naming, 11. React Component Naming, 12. React Function Naming, 13. React Variable Naming, 15. Page Naming, 16. Eloquent Rules, 17. Money Rules, 18 Order Processing Rule (+18 more)

### Community 9 - "printing.ts"
Cohesion: 0.09
Nodes (31): AppInfo, registerAppIpc(), CashDrawerResult, openCashDrawer(), registerCashDrawerIpc(), APP_GET_INFO, AppIpcChannel, CASH_DRAWER_OPEN (+23 more)

### Community 10 - "package.json"
Cohesion: 0.06
Nodes (32): dependencies, lucide-react, react, react-dom, react-router-dom, description, devDependencies, electron (+24 more)

### Community 11 - "Controller"
Cohesion: 0.10
Nodes (7): CreditMonitoringController, DashboardController, HealthController, PosItemController, PrivilegeAssignmentController, SaleRemittanceController, Controller

### Community 13 - "UserController.php"
Cohesion: 0.19
Nodes (5): AuthController, {closure#4}(), {closure#5}(), UserController, UserResource

### Community 14 - "SalesReportPage.tsx"
Cohesion: 0.13
Nodes (29): CustomerSort, CustomerSortHeader(), OrderDetailView(), OrTransactionTable(), EMPTY, formatManilaLongDateTime(), formatPrice(), EMPTY (+21 more)

### Community 15 - "ItemDeliveriesPage.tsx"
Cohesion: 0.18
Nodes (16): CartLine, EMPTY, ItemDeliveriesPage(), confirm(), submitForm(), view(), NO_OPTIONS, validQuantity() (+8 more)

### Community 16 - "PRD.md"
Cohesion: 0.06
Nodes (30): 10. Consignee Requirements, 11. Consignment Requirements, 12. Orders / POS Requirements, 13. Payment Flow, 14. Hardware Requirements, 15. Initial Release Boundary, 16. Future Expansion, 1. Product Overview (+22 more)

### Community 17 - "Table"
Cohesion: 0.08
Nodes (37): AlertProps, toneIcons, LoadingStateProps, ToastContext, ToastContextValue, ToastItem, ToastTone, SidebarProfileMenuProps (+29 more)

### Community 18 - "UserManagementApiTest"
Cohesion: 0.06
Nodes (4): ItemDeliveryApiTest, ItemManagementApiTest, PriceManagementApiTest, UserManagementApiTest

### Community 21 - "AuthContext.tsx"
Cohesion: 0.17
Nodes (23): AlertTone, AuthContext, AuthContextValue, AuthNotice, AuthProvider(), bootstrap(), ApiError, extractLoginErrorMessage() (+15 more)

### Community 22 - "MonthlyEndInventoryPage"
Cohesion: 0.13
Nodes (26): cents(), currentManila(), MonthlyEndInventoryPage(), create(), exportExcel(), finalize(), prepareFinalize(), reconcile() (+18 more)

### Community 24 - "StationsPage.tsx"
Cohesion: 0.16
Nodes (19): useToast(), StationFieldErrors, StationFormProps, EMPTY_LIST, fieldErrorsFrom(), FormDialog, StationsPage(), handleDelete() (+11 more)

### Community 25 - "index.tsx"
Cohesion: 0.19
Nodes (10): AppHeader(), useAuth(), LoginPage(), PosRoute(), ProtectedRoute(), RoleRoute(), AppShell(), CashierHomePage() (+2 more)

### Community 26 - "SpoilagesPage"
Cohesion: 0.16
Nodes (20): formatManilaDate(), CartLine, EMPTY, NO_OPTIONS, SpoilagesPage(), confirm(), openForm(), submitForm() (+12 more)

### Community 27 - "StationItemController.php"
Cohesion: 0.16
Nodes (3): {closure#6}(), StationItemController, StationItemResource

### Community 28 - "MonthlyEndReportController.php"
Cohesion: 0.10
Nodes (6): {closure#5}(), {closure#6}(), {closure#7}(), {closure#8}(), MonthlyEndReport, ReportExportService

### Community 29 - "Illuminate\Validation\Rule"
Cohesion: 0.12
Nodes (4): UpdateProfileRequest, StoreUserRequest, UpdateStationRequest, UpdateUserRequest

### Community 30 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowSyntheticDefaultImports, composite, esModuleInterop, isolatedModules, jsx, lib, module (+9 more)

### Community 31 - "ItemController.php"
Cohesion: 0.12
Nodes (9): ItemController, StoreItemRequest, UpdateItemRequest, ItemResource, Phase 10.4 deliverables, 14.1 API layer conventions, 14.2 Success response conventions, 14.3 Error response conventions (+1 more)

### Community 32 - "SaleRemittanceController.php"
Cohesion: 0.10
Nodes (5): {closure#10}(), {closure#11}(), {closure#1}(), TaxSettingController, {closure#1}()

### Community 33 - "SaleRemittancesPage.tsx"
Cohesion: 0.12
Nodes (21): StatusSort, StatusSortHeader(), formatManilaDateTime(), manilaDate, manilaDateTime, manilaLongDateTime, CreditMonitoringPage(), EMPTY (+13 more)

### Community 34 - "Development Rules"
Cohesion: 0.07
Nodes (30): API-only backend, Cash drawer integration POC, Current module boundary — Consignee removal, Current POS interaction rules (2026-10-01), Developer context architecture, Development Rules, Migration ownership, Phase 10.13 Item Delivery rules (+22 more)

### Community 36 - "Architecture"
Cohesion: 0.07
Nodes (28): API-only backend cleanup (2026-10-07), Architecture, Current module boundary — Consignee removal (2026-10-09), Current POS layout and in-place cashier actions (2026-10-01), Phase 10.13 current Item Delivery architecture, Phase 10.14.1 confirmed legacy-facing sidebar, Phase 10.15 Customer and Credit Monitoring architecture, Phase 10.16.1 compact UI and Station Inventory summary (2026-10-01) (+20 more)

### Community 37 - "HandOff.md"
Cohesion: 0.08
Nodes (23): 10. Consignment Screen Observed, 11. POS Screen Observed, 12. Hardware Scope, 13. Architecture Decision, 14. Database Direction, 15. Naming Decision, 16. Current Scope, 17. Future Idea — Customer Food Menu (+15 more)

### Community 41 - "Requirement.md"
Cohesion: 0.10
Nodes (20): 10. Authentication Requirements, 11. POS Requirements, 12. Transaction Requirements, 13. Error Handling, 14. Hardware Compatibility, 15. Testing Requirements, 16. Deployment Requirements, 17. Environment Configuration (+12 more)

### Community 43 - "MonthlyEndReportApiTest"
Cohesion: 0.21
Nodes (8): MonthlyEndReportApiTest, Deferred / out of scope, Goal, Inputs, Invariants, Phase 10.22B — Monthly End Inventory, Process and outputs, Verification

### Community 44 - "Illuminate\Database\Schema\Blueprint"
Cohesion: 0.23
Nodes (6): {closure#1}(), {closure#2}(), {closure#3}(), {closure#1}(), {closure#2}(), {closure#3}()

### Community 46 - "Phase 10.23H.5 — Reorder Point Activation and Low-Stock Threshold"
Cohesion: 0.40
Nodes (4): Boundaries, Implemented, Phase 10.23H.5 — Reorder Point Activation and Low-Stock Threshold, Verification

### Community 48 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, allowSyntheticDefaultImports, composite, esModuleInterop, module, moduleResolution, noEmit, resolveJsonModule (+4 more)

### Community 49 - "BatchLimitValidationTest.php"
Cohesion: 0.12
Nodes (4): ReconcileMonthlyEndItemsRequest, StoreSaleRemittanceRequest, UpdateMonthlyEndCountsRequest, BatchLimitValidationTest

### Community 50 - "react"
Cohesion: 0.14
Nodes (20): InputProps, LabelProps, ItemFieldErrors, Props, EMPTY_LIST, fieldErrorsFrom(), FormDialog, ItemsPage() (+12 more)

### Community 51 - "Station"
Cohesion: 0.17
Nodes (3): {closure#9}(), Station, Phase 10.14 current Spoilage architecture

### Community 52 - "EmployeesPage.tsx"
Cohesion: 0.12
Nodes (24): EmployeeFieldErrors, EmployeeForm(), EmployeeFormProps, ROLES, EmployeesPage(), handleSave(), handleStatusChange(), EMPTY_LIST (+16 more)

### Community 54 - "Button"
Cohesion: 0.12
Nodes (18): Modal(), ModalProps, SidebarProfileMenu(), saveProfile(), Button, Input, Label(), ItemForm() (+10 more)

### Community 56 - "University HomeStay POS"
Cohesion: 0.50
Nodes (4): Development Handoff, Phase 10.23H.5 — Reorder Point Activation and Low-Stock Threshold (2026-10-26), University HomeStay POS, User Account Deactivation (2026-10-26)

### Community 58 - "EnsureUserIsAdmin"
Cohesion: 0.20
Nodes (14): EnsureUserIsAdmin, 9.1 Authentication (Phase 8), 9.3 Employee Management (Phase 10.1), Architecture simplification — 2026-09-26, Deferred feature register carried forward, Phase 10.1 deliverables, Phase 10.1 — Employee Management, Phase 10.1 verification — 2026-09-26 (+6 more)

### Community 59 - "Illuminate\Foundation\Http\FormRequest"
Cohesion: 0.14
Nodes (4): LoginRequest, StoreMonthlyEndReportRequest, StorePriceRequest, SyncUserPrivilegesRequest

### Community 63 - "TestCase"
Cohesion: 0.13
Nodes (4): HealthEndpointTest, MonthlyEndReconciliationApiTest, SaleRemittanceApiTest, TestCase

### Community 64 - "PrivilegeController.php"
Cohesion: 0.15
Nodes (4): {closure#1}(), StorePrivilegeRequest, {closure#1}(), UpdatePrivilegeRequest

### Community 66 - "Phase 10.22D — Excel Report Export"
Cohesion: 0.33
Nodes (6): Goal, Inputs, Invariants, Outputs, Phase 10.22D — Excel Report Export, Verification

### Community 68 - "bootstrap/app.php"
Cohesion: 0.28
Nodes (3): {closure#1}(), {closure#2}(), {closure#3}()

### Community 70 - "2026_09_30_000000_create_prices_table.php"
Cohesion: 0.25
Nodes (5): backfillPrices(), {closure#1}(), {closure#2}(), {closure#5}(), up()

### Community 72 - ".prices"
Cohesion: 0.20
Nodes (8): Phase 10.11B current schema, Phase 10.12 current pricing architecture, Phase 10.11B current-state note, Project Documentation, Requirements, University HomeStay POS, Phase 10.11B current rules, Phase 10.12 current pricing rules

### Community 73 - "Illuminate\Foundation\Testing\RefreshDatabase"
Cohesion: 0.06
Nodes (7): UserRole, Admin, EndUser, DatabaseSeeder, DevelopmentUserSeeder, PrivilegeApiTest, StationManagementApiTest

### Community 75 - "App.tsx"
Cohesion: 0.32
Nodes (5): App(), router, ToastProvider(), appRoutes, react-dom

### Community 76 - "getUserFacingApiMessage"
Cohesion: 0.12
Nodes (33): Alert(), LoadingState(), Pagination(), SearchField(), CustomerSelector(), EMPTY, EMPTY, PosStationInventoryDialog() (+25 more)

### Community 77 - "LoginSlideshow.tsx"
Cohesion: 0.18
Nodes (5): LoginSlide, LoginSlideshow(), SLIDES, Phase 10.20A — Admin Dashboard and Cashier landing (2026-10-11), Phase 10.23UI — Sidebar Profile and Navigation (2026-10-22)

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

### Community 87 - "navigation.ts"
Cohesion: 0.16
Nodes (10): AppSidebar(), iconSizeNav, getNavGroupsForRole(), NavGroupKey, navGroupLabels, navGroupOrder, NavItem, navItems (+2 more)

### Community 89 - "Illuminate\Http\Request"
Cohesion: 0.09
Nodes (7): OrderController, OrderDetailResource, OrderHistoryResource, OrderResource, PosItemResource, PosStationInventoryResource, SaleRemittanceResource

### Community 90 - "Phase 10.21 — Non-VAT / Tax Foundation"
Cohesion: 0.17
Nodes (10): Deferred / out of scope, Goal, Inputs, Invariants and process, Outputs, Phase 10.21 — Non-VAT / Tax Foundation, Verification, Read (+2 more)

### Community 91 - "Phase 10.22A — Sales Report"
Cohesion: 0.29
Nodes (7): Deferred / out of scope, Goal, Inputs, Invariants and process, Outputs, Phase 10.22A — Sales Report, Verification

### Community 92 - "Phase 8 — Simple Authentication / Login Foundation"
Cohesion: 0.33
Nodes (6): Development credentials (local only — never use in production), Environment decisions (still in force), Phase 7/8 verification and hardening — 2026-09-26, Phase 8 deliverables, Phase 8 — Simple Authentication / Login Foundation, Prior phases

### Community 100 - "Architecture.md"
Cohesion: 0.09
Nodes (20): 10. Future Architecture, 11. Architecture Principle, 1. Project Overview, 2. Technology Architecture, 3.1 Electron, 3.2 React + TypeScript, 3.3 Laravel, 3.4 MySQL (+12 more)

### Community 102 - "apiClient.ts"
Cohesion: 0.08
Nodes (33): Panel(), PanelProps, DashboardPage(), Kpi, KpiCard(), peso(), TaxConfigurationPage(), save() (+25 more)

### Community 112 - "Architecture.md"
Cohesion: 0.14
Nodes (13): Database Schema — legacy field notes, Phase 10.22C reconciliation additions, Phase 10.23UI.1 — User Account Deactivation, Obsidian + Graphify + ICM, POS Memory Context Router, Authentication and User Integrity Context, Stable invariants, Checkout Context (+5 more)

### Community 114 - "18. Current Phase"
Cohesion: 0.20
Nodes (10): 18. Current Phase, Phase 10.10 — Transaction History, Phase 10.4 — Item Management, Phase 10.4 verification — 2026-09-27, Phase 10.6 — Consignment Account Management, Phase 10.7 — Station Inventory Foundation, Phase 10.8 — Orders / POS Foundation, Phase 9 — Dashboard & Role-Aware Navigation Foundation (+2 more)

### Community 116 - "PricesPage.tsx"
Cohesion: 0.22
Nodes (12): EMPTY, money, PricesPage(), save(), activatePrice(), addPrice(), loadPriceItemOptions(), loadPrices() (+4 more)

### Community 117 - "Phase 10.22C — Inventory Reconciliation"
Cohesion: 0.33
Nodes (6): Critical invariants, Goal, Inputs, Out of scope, Phase 10.22C — Inventory Reconciliation, Verification

### Community 119 - "TaxSetting"
Cohesion: 0.11
Nodes (7): TaxStatus, NonVat, VatRegistered, {closure#1}(), PosCheckoutController, TaxSetting, TaxSettingApiTest

### Community 120 - "Phase 10.23H — Security, Data Integrity, and Code Health"
Cohesion: 0.40
Nodes (5): Phase 10.23H — Security, Data Integrity, and Code Health, Preserved boundaries, Read next, Scope completed, Verification

### Community 125 - "Phase 10.23UI — Sidebar Profile and Navigation"
Cohesion: 0.40
Nodes (5): Goal, Inputs, Invariants, Outputs, Phase 10.23UI — Sidebar Profile and Navigation

### Community 127 - "assets.d.ts"
Cohesion: 0.50
Nodes (3): *.jpg, *.png, *.webp

### Community 132 - "Reporting Context"
Cohesion: 0.67
Nodes (3): Read, Reporting Context, Stable invariants

## Knowledge Gaps
- **9 isolated node(s):** `NonVat`, `VatRegistered`, `Admin`, `EndUser`, `@types/node` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 912 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **54 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `18. Current Phase` connect `18. Current Phase` to `Illuminate\Database\Eloquent\Relations\BelongsTo`, `HandOff.md`, `getUserFacingApiMessage`, `EnsureUserIsAdmin`, `Phase 8 — Simple Authentication / Login Foundation`?**
  _High betweenness centrality (0.360) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `User` (e.g. with `9.3 Employee Management (Phase 10.1)` and `Phase 10.1 deliverables`) actually correct?**
  _`User` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `NonVat`, `VatRegistered`, `Admin` to the rest of the system?**
  _9 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SpoilageController.php` be split into smaller, more focused modules?**
  _Cohesion score 0.09956709956709957 - nodes in this community are weakly interconnected._
- **Why does `Frontend UI cleanup — 2026-09-27` connect `getUserFacingApiMessage` to `18. Current Phase`?**
  _High betweenness centrality (0.331) - this node is a cross-community bridge._
- **Should `TestCase` be split into smaller, more focused modules?**
  _Cohesion score 0.06938020351526364 - nodes in this community are weakly interconnected._
- **Why does `Phase 10.9 — Payment & Order Finalization` connect `Illuminate\Database\Eloquent\Relations\BelongsTo` to `18. Current Phase`?**
  _High betweenness centrality (0.205) - this node is a cross-community bridge._