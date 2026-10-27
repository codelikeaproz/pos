# Graph Report - pos  (2026-10-27)

## Corpus Check
- 313 files · ~132,590 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 69 file(s) not represented in the graph (top: .css 47, (none) 18, .example 2)

## Summary
- 2291 nodes · 5681 edges · 132 communities (85 shown, 47 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 102 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fe3fd4cc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- SpoilageController.php
- TestCase
- OrdersPage.tsx
- composer.json
- SalesReportApiTest
- Illuminate\Database\Eloquent\Relations\BelongsTo
- Development Handoff
- PrivilegesPage.tsx
- Rules.md
- printing.ts
- package.json
- UserManagementApiTest
- SchemaReconciliationTest
- Illuminate\Http\JsonResponse
- Modal
- CustomerManagementPage.tsx
- PRD.md
- MonthlyEndInventoryPage.tsx
- AuthApiTest
- ItemManagementApiTest
- PosCheckoutApiTest
- AuthContext.tsx
- MonthlyEndInventoryPage
- OrderController.php
- StationsPage.tsx
- index.tsx
- SpoilagesPage
- StationItemController.php
- TaxSetting
- getUserFacingApiMessage
- compilerOptions
- ItemController.php
- PrivilegeAssignmentController.php
- SaleRemittancesPage.tsx
- Development Rules
- UserFactory.php
- Architecture
- HandOff.md
- Illuminate\Support\Facades\Schema
- ItemDeliveryController.php
- Requirement.md
- index.tsx
- MonthlyEndReportApiTest
- Illuminate\Database\Schema\Blueprint
- PosItemApiTest
- Phase 10.23H.5 — Reorder Point Activation and Low-Stock Threshold
- MonthlyEndReportController.php
- compilerOptions
- CustomerCreditMonitoringApiTest
- ItemsPage.tsx
- User
- EmployeesPage.tsx
- SpoilageApiTest
- ItemDeliveriesPage.tsx
- StationController.php
- University HomeStay POS
- OrderHistoryApiTest
- EnsureUserIsAdmin
- Illuminate\Foundation\Http\FormRequest
- .admin
- ItemDeliveryApiTest
- Customer
- TestCase
- UserRole
- OrTransactionApiTest
- Phase 10.22D — Excel Report Export
- AppServiceProvider.php
- bootstrap/app.php
- stationItemService.ts
- 2026_09_30_000000_create_prices_table.php
- 2026_10_01_010000_create_user_privilege_table.php
- .prices
- MonthlyEndReconciliationApiTest.php
- StationItemApiTest
- App.tsx
- Pagination
- LoginSlideshow.tsx
- CustomerController.php
- Reporting Context
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
- Illuminate\Database\Migrations\Migration
- 2026_09_27_045000_create_customers_table.php
- 2026_09_27_050000_create_orders_table.php
- PriceManagementApiTest
- 2026_09_30_010000_create_inventory_movements_table.php
- 2026_09_30_020000_create_item_deliveries_table.php
- 2026_09_30_030000_create_item_delivery_items_table.php
- 3. Application Layers
- SalesReportController.php
- apiClient.ts
- itemDeliveryService.ts
- tsconfig.json
- Architecture.md
- AGENTS.md
- 2026_10_26_000000_create_official_receipt_sequences_table.php
- Phase 10.23A — Accounting Role, Customer Normalization, Credit Payments, and O.R Number
- priceService.ts
- Phase 10.22C — Inventory Reconciliation
- Phase 10.23H — Security, Data Integrity, and Code Health
- 2026_09_27_040000_create_station_items_table.php
- spoilageService.ts
- Phase 10.23UI — Sidebar Profile and Navigation
- 2026_09_30_040000_create_spoilages_table.php
- assets.d.ts
- Checkout Context
- CreditMonitoringController.php
- 2026_10_01_000000_create_privileges_table.php
- 2026_10_26_010000_create_credit_payments_table.php
- creditMonitoringService.ts
- accounting.md
- credit-payments.md
- customers.md

## God Nodes (most connected - your core abstractions)
1. `getUserFacingApiMessage()` - 85 edges
2. `Button` - 69 edges
3. `User` - 59 edges
4. `apiRequest()` - 58 edges
5. `Alert()` - 55 edges
6. `TestCase` - 52 edges
7. `LoadingState()` - 49 edges
8. `Modal()` - 49 edges
9. `Controller` - 48 edges
10. `Order` - 48 edges

## Surprising Connections (you probably didn't know these)
- `Phase 10.19.3 58 mm HTML receipt preview (2026-10-06)` --references--> `PaymentReceipt()`  [INFERRED]
  POS Memory/Architecture.md → frontend/src/features/pos/PaymentReceipt.tsx
- `14.1 API layer conventions` --references--> `ItemController`  [INFERRED]
  POS Memory/Rules.md → backend/app/Http/Controllers/Api/ItemController.php
- `14.1 API layer conventions` --references--> `OrderController`  [INFERRED]
  POS Memory/Rules.md → backend/app/Http/Controllers/Api/OrderController.php
- `14.1 API layer conventions` --references--> `StationController`  [INFERRED]
  POS Memory/Rules.md → backend/app/Http/Controllers/Api/StationController.php
- `9.3 Employee Management (Phase 10.1)` --references--> `EnsureUserIsAdmin`  [INFERRED]
  POS Memory/Architecture.md → backend/app/Http/Middleware/EnsureUserIsAdmin.php

## Import Cycles
- None detected.

## Communities (132 total, 47 thin omitted)

### Community 0 - "SpoilageController.php"
Cohesion: 0.05
Nodes (6): {closure#1}(), PosCheckoutController, SpoilageController, StoreSpoilageRequest, SpoilageResource, {closure#1}()

### Community 1 - "TestCase"
Cohesion: 0.08
Nodes (3): InventoryMovement, Price, StationItem

### Community 2 - "OrdersPage.tsx"
Cohesion: 0.07
Nodes (63): Props, StockQuantity(), CashReceivedDialog(), confirm(), CurrentOrderTable(), PaymentPanel(), Props, PaymentReceipt() (+55 more)

### Community 3 - "composer.json"
Cohesion: 0.04
Nodes (46): pestphp/pest-plugin, php-http/discovery, autoload, autoload-dev, psr-4, psr-4, dev-master, config (+38 more)

### Community 4 - "SalesReportApiTest"
Cohesion: 0.20
Nodes (5): {closure#4}(), ReportExcelExportApiTest, SalesReportApiTest, Phase 10.17 Privilege and Privilege Assignment (2026-10-01), Phase 10.17 status — Complete (2026-10-01)

### Community 5 - "Illuminate\Database\Eloquent\Relations\BelongsTo"
Cohesion: 0.07
Nodes (9): CreditPayment, ItemDelivery, ItemDeliveryItem, MonthlyEndReportItem, {closure#1}(), OrderItem, Spoilage, SpoilageItem (+1 more)

### Community 6 - "Development Handoff"
Cohesion: 0.06
Nodes (34): Consignee and Consignment Account removal (2026-10-09), Current development status (2026-10-07), Development log — 2026-09-30 (Phase 10.16 and POS follow-up), Development log — 2026-10-01 (POS F3/F4 payment controls), Phase 10.12 current-state note, Phase 10.13 current-state note, Phase 10.14.1 current-state note, Phase 10.14 current-state note (+26 more)

### Community 7 - "PrivilegesPage.tsx"
Cohesion: 0.16
Nodes (17): useToast(), EMPTY, PrivilegeAssignmentsPage(), save(), EMPTY, PrivilegesPage(), save(), createPrivilege() (+9 more)

### Community 8 - "Rules.md"
Cohesion: 0.07
Nodes (27): 10. PHP Variable Naming, 11. React Component Naming, 12. React Function Naming, 13. React Variable Naming, 15. Page Naming, 16. Eloquent Rules, 17. Money Rules, 18 Order Processing Rule (+19 more)

### Community 9 - "printing.ts"
Cohesion: 0.09
Nodes (31): AppInfo, registerAppIpc(), CashDrawerResult, openCashDrawer(), registerCashDrawerIpc(), APP_GET_INFO, AppIpcChannel, CASH_DRAWER_OPEN (+23 more)

### Community 10 - "package.json"
Cohesion: 0.06
Nodes (32): dependencies, lucide-react, react, react-dom, react-router-dom, description, devDependencies, electron (+24 more)

### Community 13 - "Illuminate\Http\JsonResponse"
Cohesion: 0.08
Nodes (14): AccountingDashboardController, AuthController, DashboardController, HealthController, PosItemController, PriceController, SaleRemittanceController, {closure#1}() (+6 more)

### Community 14 - "Modal"
Cohesion: 0.09
Nodes (25): Modal(), SidebarProfileMenu(), saveProfile(), Badge(), BadgeProps, BadgeTone, Table(), TableColumn (+17 more)

### Community 15 - "CustomerManagementPage.tsx"
Cohesion: 0.18
Nodes (19): Pagination(), SearchField(), CustomerSelector(), EMPTY, blank(), CustomerManagementPage(), open(), save() (+11 more)

### Community 16 - "PRD.md"
Cohesion: 0.06
Nodes (31): 10. Consignee Requirements, 11. Consignment Requirements, 12. Orders / POS Requirements, 13. Payment Flow, 14. Hardware Requirements, 15. Initial Release Boundary, 16. Future Expansion, 1. Product Overview (+23 more)

### Community 17 - "MonthlyEndInventoryPage.tsx"
Cohesion: 0.08
Nodes (34): AlertProps, toneIcons, LoadingStateProps, ModalProps, ToastContext, ToastContextValue, ToastItem, ToastTone (+26 more)

### Community 18 - "AuthApiTest"
Cohesion: 0.09
Nodes (3): DatabaseSeeder, DevelopmentUserSeeder, AuthApiTest

### Community 21 - "AuthContext.tsx"
Cohesion: 0.18
Nodes (22): AlertTone, AuthContext, AuthContextValue, AuthNotice, AuthProvider(), bootstrap(), extractLoginErrorMessage(), fetchCurrentUser() (+14 more)

### Community 22 - "MonthlyEndInventoryPage"
Cohesion: 0.12
Nodes (27): cents(), currentManila(), MonthlyEndInventoryPage(), create(), exportExcel(), finalize(), prepareFinalize(), reconcile() (+19 more)

### Community 23 - "OrderController.php"
Cohesion: 0.12
Nodes (4): UserRole, Accounting, Admin, EndUser

### Community 24 - "StationsPage.tsx"
Cohesion: 0.12
Nodes (24): Button, ButtonProps, ButtonVariant, Props, StationFieldErrors, StationForm(), StationFormProps, StationTable() (+16 more)

### Community 25 - "index.tsx"
Cohesion: 0.15
Nodes (12): AppHeader(), AppSidebar(), useAuth(), PosRoute(), RoleRoute(), AppShell(), iconSizeNav, getNavGroupsForRole() (+4 more)

### Community 26 - "SpoilagesPage"
Cohesion: 0.15
Nodes (17): formatManilaDate(), manilaDate, manilaDateTime, manilaLongDateTime, CartLine, EMPTY, NO_OPTIONS, SpoilagesPage() (+9 more)

### Community 27 - "StationItemController.php"
Cohesion: 0.11
Nodes (5): {closure#6}(), StationItemController, StoreStationItemRequest, UpdateStationItemRequest, StationItemResource

### Community 28 - "TaxSetting"
Cohesion: 0.14
Nodes (5): TaxStatus, NonVat, VatRegistered, TaxSetting, TaxSettingApiTest

### Community 29 - "getUserFacingApiMessage"
Cohesion: 0.21
Nodes (16): view(), currentManilaDateTimeLocal(), CreditMonitoringPage(), openPayment(), submitPayment(), DashboardPage(), view(), Kpi (+8 more)

### Community 30 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowSyntheticDefaultImports, composite, esModuleInterop, isolatedModules, jsx, lib, module (+9 more)

### Community 31 - "ItemController.php"
Cohesion: 0.11
Nodes (5): ItemController, UpdateItemRequest, ItemResource, Item, 9.6 Item Management (Phase 10.4)

### Community 32 - "PrivilegeAssignmentController.php"
Cohesion: 0.20
Nodes (3): {closure#3}(), PrivilegeAssignmentController, SyncUserPrivilegesRequest

### Community 33 - "SaleRemittancesPage.tsx"
Cohesion: 0.24
Nodes (11): StatusSort, StatusSortHeader(), cents(), EMPTY, money, SaleRemittancesPage(), submit(), loadSaleRemittances() (+3 more)

### Community 34 - "Development Rules"
Cohesion: 0.07
Nodes (30): API-only backend, Cash drawer integration POC, Current module boundary — Consignee removal, Current POS interaction rules (2026-10-01), Developer context architecture, Development Rules, Migration ownership, Phase 10.13 Item Delivery rules (+22 more)

### Community 36 - "Architecture"
Cohesion: 0.07
Nodes (28): API-only backend cleanup (2026-10-07), Architecture, Current module boundary — Consignee removal (2026-10-09), Current POS layout and in-place cashier actions (2026-10-01), Phase 10.13 current Item Delivery architecture, Phase 10.14.1 confirmed legacy-facing sidebar, Phase 10.15 Customer and Credit Monitoring architecture, Phase 10.16.1 compact UI and Station Inventory summary (2026-10-01) (+20 more)

### Community 37 - "HandOff.md"
Cohesion: 0.07
Nodes (27): 10. Consignment Screen Observed, 11. POS Screen Observed, 12. Hardware Scope, 13. Architecture Decision, 14. Database Direction, 15. Naming Decision, 16. Current Scope, 17. Future Idea — Customer Food Menu (+19 more)

### Community 39 - "ItemDeliveryController.php"
Cohesion: 0.09
Nodes (3): ItemDeliveryController, StoreItemDeliveryRequest, ItemDeliveryResource

### Community 41 - "Requirement.md"
Cohesion: 0.09
Nodes (21): 10. Authentication Requirements, 11. POS Requirements, 12. Transaction Requirements, 13. Error Handling, 14. Hardware Compatibility, 15. Testing Requirements, 16. Deployment Requirements, 17. Environment Configuration (+13 more)

### Community 42 - "index.tsx"
Cohesion: 0.09
Nodes (22): Alert(), LoadingState(), AdminPageSize, Select, SelectOption, SelectProps, LoginPage(), ProtectedRoute() (+14 more)

### Community 43 - "MonthlyEndReportApiTest"
Cohesion: 0.21
Nodes (8): MonthlyEndReportApiTest, Deferred / out of scope, Goal, Inputs, Invariants, Phase 10.22B — Monthly End Inventory, Process and outputs, Verification

### Community 44 - "Illuminate\Database\Schema\Blueprint"
Cohesion: 0.23
Nodes (6): {closure#1}(), {closure#2}(), {closure#3}(), {closure#1}(), {closure#2}(), {closure#3}()

### Community 46 - "Phase 10.23H.5 — Reorder Point Activation and Low-Stock Threshold"
Cohesion: 0.40
Nodes (4): Boundaries, Implemented, Phase 10.23H.5 — Reorder Point Activation and Low-Stock Threshold, Verification

### Community 47 - "MonthlyEndReportController.php"
Cohesion: 0.06
Nodes (11): {closure#5}(), {closure#6}(), {closure#7}(), {closure#8}(), MonthlyEndReportController, ReconcileMonthlyEndItemsRequest, StoreMonthlyEndReportRequest, UpdateMonthlyEndCountsRequest (+3 more)

### Community 48 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, allowSyntheticDefaultImports, composite, esModuleInterop, module, moduleResolution, noEmit, resolveJsonModule (+4 more)

### Community 50 - "ItemsPage.tsx"
Cohesion: 0.15
Nodes (19): ItemFieldErrors, ItemForm(), Props, EMPTY_LIST, fieldErrorsFrom(), FormDialog, ItemsPage(), changeStatus() (+11 more)

### Community 51 - "User"
Cohesion: 0.09
Nodes (5): {closure#9}(), Privilege, Station, User, Phase 10.14 current Spoilage architecture

### Community 52 - "EmployeesPage.tsx"
Cohesion: 0.17
Nodes (15): EmployeeFieldErrors, EmployeeFormProps, ROLES, handleSave(), fieldErrorsFrom(), createEmployee(), loadEmployeeOptions(), PaginatedUsersResponse (+7 more)

### Community 54 - "ItemDeliveriesPage.tsx"
Cohesion: 0.21
Nodes (11): CartLine, EMPTY, ItemDeliveriesPage(), confirm(), submitForm(), view(), NO_OPTIONS, validQuantity() (+3 more)

### Community 55 - "StationController.php"
Cohesion: 0.17
Nodes (3): StationController, StoreStationRequest, StationResource

### Community 56 - "University HomeStay POS"
Cohesion: 0.40
Nodes (5): Development Handoff, Phase 10.23A — Accounting/Credit UI and payment-time corrections (2026-10-27), Phase 10.23H.5 — Reorder Point Activation and Low-Stock Threshold (2026-10-26), University HomeStay POS, User Account Deactivation (2026-10-26)

### Community 58 - "EnsureUserIsAdmin"
Cohesion: 0.14
Nodes (20): EnsureUserIsAdmin, 18. Current Phase, Architecture simplification — 2026-09-26, Deferred feature register carried forward, Phase 10.10 — Transaction History, Phase 10.1 deliverables, Phase 10.1 — Employee Management, Phase 10.1 verification — 2026-09-26 (+12 more)

### Community 59 - "Illuminate\Foundation\Http\FormRequest"
Cohesion: 0.05
Nodes (11): LoginRequest, UpdateProfileRequest, CheckoutOrderRequest, StoreItemRequest, StorePriceRequest, StoreSaleRemittanceRequest, StoreUserRequest, UpdateStationRequest (+3 more)

### Community 60 - ".admin"
Cohesion: 0.24
Nodes (9): 9.1 Authentication (Phase 8), Phase 10.23A — Accounting and Credit Architecture, Phase 10.23A Schema, Authentication and User Integrity Context, Stable invariants, 14.1 API layer conventions, 14.2 Success response conventions, 14.3 Error response conventions (+1 more)

### Community 63 - "TestCase"
Cohesion: 0.06
Nodes (6): AccountingCreditApiTest, DashboardApiTest, HealthEndpointTest, PrivilegeApiTest, StationManagementApiTest, TestCase

### Community 64 - "UserRole"
Cohesion: 0.10
Nodes (7): PrivilegeController, EnsureUserHasRole, {closure#1}(), StorePrivilegeRequest, {closure#1}(), UpdatePrivilegeRequest, PrivilegeResource

### Community 66 - "Phase 10.22D — Excel Report Export"
Cohesion: 0.33
Nodes (6): Goal, Inputs, Invariants, Outputs, Phase 10.22D — Excel Report Export, Verification

### Community 68 - "bootstrap/app.php"
Cohesion: 0.28
Nodes (3): {closure#1}(), {closure#2}(), {closure#3}()

### Community 69 - "stationItemService.ts"
Cohesion: 0.27
Nodes (8): assignItemToStation(), PageResponse, removeItemFromStation(), updateStationQuantity(), InventoryItemOption, StationInventoryList, StationItem, StationItemOptions

### Community 70 - "2026_09_30_000000_create_prices_table.php"
Cohesion: 0.25
Nodes (5): backfillPrices(), {closure#1}(), {closure#2}(), {closure#5}(), up()

### Community 72 - ".prices"
Cohesion: 0.20
Nodes (8): Phase 10.11B current schema, Phase 10.12 current pricing architecture, Phase 10.11B current-state note, Project Documentation, Requirements, University HomeStay POS, Phase 10.11B current rules, Phase 10.12 current pricing rules

### Community 75 - "App.tsx"
Cohesion: 0.32
Nodes (5): App(), router, ToastProvider(), appRoutes, react-dom

### Community 76 - "Pagination"
Cohesion: 0.11
Nodes (39): Label(), LabelProps, OrderDetailView(), OrTransactionTable(), TransactionTable(), EMPTY, PosTransactionsDialog(), back() (+31 more)

### Community 77 - "LoginSlideshow.tsx"
Cohesion: 0.18
Nodes (5): LoginSlide, LoginSlideshow(), SLIDES, Phase 10.20A — Admin Dashboard and Cashier landing (2026-10-11), Phase 10.23UI — Sidebar Profile and Navigation (2026-10-22)

### Community 78 - "CustomerController.php"
Cohesion: 0.14
Nodes (3): CustomerController, StoreCustomerRequest, CustomerResource

### Community 79 - "Reporting Context"
Cohesion: 0.67
Nodes (3): Read, Reporting Context, Stable invariants

### Community 80 - "9.2 Role-Aware Application Navigation (Phase 9)"
Cohesion: 0.22
Nodes (9): 9.10 Orders / POS Foundation (Phase 10.8), 9.11 Payment and Order Finalization (Phase 10.9), 9.12 Transaction History (Phase 10.10), 9.2 Role-Aware Application Navigation (Phase 9), 9.3 Employee Management (Phase 10.1), 9.4 Station Management (Phase 10.2), 9.7 Consignee Management (Phase 10.5), 9.8 Consignment Account Management (Phase 10.6) (+1 more)

### Community 81 - "Deferred Work Register"
Cohesion: 0.22
Nodes (8): Accounting, Deferred Work Register, Hardware, Inventory, Other, Phase 10.23A Deferred, Reporting, Tax

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
Cohesion: 0.22
Nodes (7): NavGroupKey, navGroupLabels, navGroupOrder, NavItem, navItems, otherPages, lucide-react

### Community 89 - "Illuminate\Http\Request"
Cohesion: 0.08
Nodes (8): OrderController, OrderDetailResource, OrderHistoryResource, OrderResource, PosItemResource, PosStationInventoryResource, PriceResource, SaleRemittanceResource

### Community 90 - "Phase 10.21 — Non-VAT / Tax Foundation"
Cohesion: 0.17
Nodes (10): Deferred / out of scope, Goal, Inputs, Invariants and process, Outputs, Phase 10.21 — Non-VAT / Tax Foundation, Verification, Read (+2 more)

### Community 91 - "Phase 10.22A — Sales Report"
Cohesion: 0.29
Nodes (7): Deferred / out of scope, Goal, Inputs, Invariants and process, Outputs, Phase 10.22A — Sales Report, Verification

### Community 92 - "Phase 8 — Simple Authentication / Login Foundation"
Cohesion: 0.20
Nodes (9): Development credentials (local only — never use in production), Environment decisions (still in force), Phase 7/8 verification and hardening — 2026-09-26, Phase 8 deliverables, Phase 8 — Simple Authentication / Login Foundation, Phase 9 — Dashboard & Role-Aware Navigation Foundation, Phase 9 deliverables, Phase 9 verification — 2026-09-26 (+1 more)

### Community 100 - "3. Application Layers"
Cohesion: 0.40
Nodes (5): 3.1 Electron, 3.2 React + TypeScript, 3.3 Laravel, 3.4 MySQL, 3. Application Layers

### Community 102 - "apiClient.ts"
Cohesion: 0.17
Nodes (16): AccountingSummary, loadAccountingDashboard(), ApiError, ApiErrorKind, apiRequest(), ApiRequestOptions, currentPricesFrom(), currentStockFrom() (+8 more)

### Community 104 - "itemDeliveryService.ts"
Cohesion: 0.43
Nodes (5): loadDeliveryOptions(), DeliveryItem, DeliveryList, DeliveryOptions, ItemDelivery

### Community 112 - "Architecture.md"
Cohesion: 0.12
Nodes (17): 10. Future Architecture, 11. Architecture Principle, 1. Project Overview, 2. Technology Architecture, 4. Initial Application Flow, 5. POS Order Flow, 6. Hardware Architecture, 7. Database Structure (+9 more)

### Community 115 - "Phase 10.23A — Accounting Role, Customer Normalization, Credit Payments, and O.R Number"
Cohesion: 0.18
Nodes (10): Credit payments, Customer schema and Credit Limit, Deferred, Goal, Invariants, O.R and Order formats, Phase 10.23A — Accounting Role, Customer Normalization, Credit Payments, and O.R Number, Post-phase UI corrections (+2 more)

### Community 116 - "priceService.ts"
Cohesion: 0.43
Nodes (5): activatePrice(), PaginatedPrices, PriceItemOption, PriceList, PriceRecord

### Community 117 - "Phase 10.22C — Inventory Reconciliation"
Cohesion: 0.33
Nodes (6): Critical invariants, Goal, Inputs, Out of scope, Phase 10.22C — Inventory Reconciliation, Verification

### Community 120 - "Phase 10.23H — Security, Data Integrity, and Code Health"
Cohesion: 0.40
Nodes (5): Phase 10.23H — Security, Data Integrity, and Code Health, Preserved boundaries, Read next, Scope completed, Verification

### Community 124 - "spoilageService.ts"
Cohesion: 0.36
Nodes (6): loadSpoilageOptions(), Spoilage, SpoilageItem, SpoilageList, SpoilageOption, SpoilageOptions

### Community 125 - "Phase 10.23UI — Sidebar Profile and Navigation"
Cohesion: 0.40
Nodes (5): Goal, Inputs, Invariants, Outputs, Phase 10.23UI — Sidebar Profile and Navigation

### Community 127 - "assets.d.ts"
Cohesion: 0.50
Nodes (3): *.jpg, *.png, *.webp

### Community 132 - "Checkout Context"
Cohesion: 0.27
Nodes (6): Checkout Context, Read, Stable invariants, Inventory Context, Read, Stable invariants

### Community 135 - "CreditMonitoringController.php"
Cohesion: 0.05
Nodes (8): CreditMonitoringController, {closure#1}(), CreditPaymentController, {closure#10}(), {closure#11}(), StoreCreditPaymentRequest, CreditMonitoringResource, Order

## Knowledge Gaps
- **10 isolated node(s):** `NonVat`, `VatRegistered`, `Admin`, `EndUser`, `Accounting` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 955 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **47 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `18. Current Phase` connect `EnsureUserIsAdmin` to `Illuminate\Database\Eloquent\Relations\BelongsTo`, `Phase 8 — Simple Authentication / Login Foundation`, `HandOff.md`, `CustomerManagementPage.tsx`?**
  _High betweenness centrality (0.319) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `User` (e.g. with `9.3 Employee Management (Phase 10.1)` and `Phase 10.1 deliverables`) actually correct?**
  _`User` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `NonVat`, `VatRegistered`, `Admin` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SpoilageController.php` be split into smaller, more focused modules?**
  _Cohesion score 0.05053191489361702 - nodes in this community are weakly interconnected._
- **Why does `Frontend UI cleanup — 2026-09-27` connect `CustomerManagementPage.tsx` to `EnsureUserIsAdmin`?**
  _High betweenness centrality (0.293) - this node is a cross-community bridge._
- **Should `TestCase` be split into smaller, more focused modules?**
  _Cohesion score 0.07665505226480836 - nodes in this community are weakly interconnected._
- **Why does `Phase 10.9 — Payment & Order Finalization` connect `Illuminate\Database\Eloquent\Relations\BelongsTo` to `EnsureUserIsAdmin`, `CreditMonitoringController.php`?**
  _High betweenness centrality (0.205) - this node is a cross-community bridge._