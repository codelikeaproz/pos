# Graph Report - pos  (2026-10-26)

## Corpus Check
- 294 files · ~451,478 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 69 file(s) not represented in the graph (top: .css 47, (none) 18, .example 2)

## Summary
- 2155 nodes · 5384 edges · 127 communities (82 shown, 45 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 94 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fd538bad`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- TestCase
- OrdersPage.tsx
- composer.json
- privilegeService.ts
- Illuminate\Database\Eloquent\Relations\BelongsTo
- Development Handoff
- OrdersPage.tsx
- Rules.md
- printing.ts
- package.json
- Illuminate\Http\JsonResponse
- StationItem
- Button
- Button
- getUserFacingApiMessage
- PRD.md
- EmployeesPage.tsx
- UserManagementApiTest
- StationItem
- PosCheckoutApiTest
- AuthContext.tsx
- MonthlyEndInventoryPage
- MonthlyEndReportController
- StationsPage.tsx
- useAuth
- SpoilagesPage.tsx
- UserController.php
- MonthlyEndReportController.php
- ReportExportService
- compilerOptions
- ItemController.php
- SaleRemittanceController.php
- SaleRemittancesPage.tsx
- Development Rules
- TaxSetting
- Architecture
- HandOff.md
- ItemManagementApiTest
- ItemDeliveryController.php
- PriceController.php
- Requirement.md
- AuthApiTest
- MonthlyEndReportApiTest
- Illuminate\Database\Schema\Blueprint
- PosItemApiTest
- SpoilageController
- Architecture.md
- compilerOptions
- Illuminate\Foundation\Http\FormRequest
- ItemsPage.tsx
- Station
- EmployeeForm.tsx
- SpoilageApiTest
- EmployeesPage
- StationController.php
- UserRole
- OrderHistoryApiTest
- EnsureUserIsAdmin
- CustomerCreditMonitoringApiTest
- ItemDeliveryApiTest.php
- OrTransactionApiTest
- PriceManagementApiTest
- PrivilegeController.php
- Alert
- Phase 10.22D — Excel Report Export
- AppServiceProvider.php
- bootstrap/app.php
- Illuminate\Support\Facades\Schema
- 2026_09_30_000000_create_prices_table.php
- Illuminate\Support\Facades\Schema
- .prices
- SchemaReconciliationTest
- StationItemApiTest
- App.tsx
- TaxSetting
- LoginSlideshow.tsx
- ItemDeliveriesPage.tsx
- stationItemService.ts
- 9.2 Role-Aware Application Navigation (Phase 9)
- Deferred Work Register
- 🧩 Icon System
- University HomeStay POS
- University HomeStay POS Context Router
- 0001_01_01_000001_create_cache_table.php
- SalesReportController
- 2026_10_21_010000_create_monthly_end_reports_tables.php
- Illuminate\Http\Request
- Phase 10.21 — Non-VAT / Tax Foundation
- Phase 10.22A — Sales Report
- Phase 8 — Simple Authentication / Login Foundation
- 2026_09_27_020000_create_items_table.php
- 2026_09_27_045000_create_customers_table.php
- 2026_09_27_050000_create_orders_table.php
- itemDeliveryService.ts
- 2026_09_30_010000_create_inventory_movements_table.php
- 2026_09_30_020000_create_item_deliveries_table.php
- 2026_09_30_030000_create_item_delivery_items_table.php
- 3. Application Layers
- apiClient.ts
- salesReportService.ts
- tsconfig.json
- Architecture.md
- AGENTS.md
- 18. Current Phase
- vite-env.d.ts
- priceService.ts
- Phase 10.22C — Inventory Reconciliation
- ReconcileMonthlyEndItemsRequest
- PosCheckoutController.php
- 2026_09_27_040000_create_station_items_table.php
- 2026_09_30_040000_create_spoilages_table.php
- navigation.ts
- SalesReportApiTest
- Phase 10.23UI — Sidebar Profile and Navigation
- assets.d.ts
- 2026_09_27_060000_create_order_items_table.php

## God Nodes (most connected - your core abstractions)
1. `getUserFacingApiMessage()` - 80 edges
2. `Button` - 67 edges
3. `User` - 57 edges
4. `Alert()` - 53 edges
5. `apiRequest()` - 53 edges
6. `TestCase` - 48 edges
7. `OrdersPage()` - 48 edges
8. `LoadingState()` - 47 edges
9. `Modal()` - 47 edges
10. `Item` - 46 edges

## Surprising Connections (you probably didn't know these)
- `Phase 10.19.3 58 mm HTML receipt preview (2026-10-06)` --references--> `PaymentReceipt()`  [INFERRED]
  POS Memory/Architecture.md → frontend/src/features/pos/PaymentReceipt.tsx
- `14.1 API layer conventions` --references--> `OrderController`  [INFERRED]
  POS Memory/Rules.md → backend/app/Http/Controllers/Api/OrderController.php
- `14.1 API layer conventions` --references--> `StationController`  [INFERRED]
  POS Memory/Rules.md → backend/app/Http/Controllers/Api/StationController.php
- `Phase 10.1 verification — 2026-09-26` --references--> `EnsureUserIsAdmin`  [INFERRED]
  POS Memory/HandOff.md → backend/app/Http/Middleware/EnsureUserIsAdmin.php
- `Phase 10.2 verification — 2026-09-27` --references--> `EnsureUserIsAdmin`  [INFERRED]
  POS Memory/HandOff.md → backend/app/Http/Middleware/EnsureUserIsAdmin.php

## Import Cycles
- None detected.

## Communities (127 total, 45 thin omitted)

### Community 1 - "TestCase"
Cohesion: 0.05
Nodes (6): Privilege, HealthEndpointTest, MonthlyEndReconciliationApiTest, PrivilegeApiTest, StationManagementApiTest, TestCase

### Community 2 - "OrdersPage.tsx"
Cohesion: 0.11
Nodes (38): Props, StockQuantity(), PaymentReceipt(), PosItemSearch(), add(), addExactCode(), onSearchKeyDown(), StationInventoryTable() (+30 more)

### Community 3 - "composer.json"
Cohesion: 0.04
Nodes (46): pestphp/pest-plugin, php-http/discovery, autoload, autoload-dev, psr-4, psr-4, dev-master, config (+38 more)

### Community 4 - "privilegeService.ts"
Cohesion: 0.31
Nodes (8): save(), createPrivilege(), PaginatedPrivileges, updatePrivilege(), AssignmentUser, Privilege, PrivilegeAssignmentList, PrivilegeList

### Community 5 - "Illuminate\Database\Eloquent\Relations\BelongsTo"
Cohesion: 0.06
Nodes (10): InventoryMovement, ItemDelivery, ItemDeliveryItem, MonthlyEndReportItem, {closure#1}(), Order, OrderItem, Spoilage (+2 more)

### Community 6 - "Development Handoff"
Cohesion: 0.06
Nodes (34): Consignee and Consignment Account removal (2026-10-09), Current development status (2026-10-07), Development Handoff, Development log — 2026-09-30 (Phase 10.16 and POS follow-up), Development log — 2026-10-01 (POS F3/F4 payment controls), Phase 10.12 current-state note, Phase 10.13 current-state note, Phase 10.14.1 current-state note (+26 more)

### Community 7 - "OrdersPage.tsx"
Cohesion: 0.12
Nodes (25): Modal(), Button, CashReceivedDialog(), confirm(), Props, CurrentOrderTable(), PaymentPanel(), Props (+17 more)

### Community 8 - "Rules.md"
Cohesion: 0.06
Nodes (29): Read, Stable invariants, Tax Context, 10. PHP Variable Naming, 11. React Component Naming, 12. React Function Naming, 13. React Variable Naming, 15. Page Naming (+21 more)

### Community 9 - "printing.ts"
Cohesion: 0.09
Nodes (31): AppInfo, registerAppIpc(), CashDrawerResult, openCashDrawer(), registerCashDrawerIpc(), APP_GET_INFO, AppIpcChannel, CASH_DRAWER_OPEN (+23 more)

### Community 10 - "package.json"
Cohesion: 0.06
Nodes (32): dependencies, lucide-react, react, react-dom, react-router-dom, description, devDependencies, electron (+24 more)

### Community 11 - "Illuminate\Http\JsonResponse"
Cohesion: 0.07
Nodes (12): CreditMonitoringController, CustomerController, DashboardController, HealthController, PosItemController, {closure#3}(), PrivilegeAssignmentController, SaleRemittanceController (+4 more)

### Community 12 - "StationItem"
Cohesion: 0.09
Nodes (5): {closure#9}(), Item, Price, Station, Phase 10.14 current Spoilage architecture

### Community 13 - "Button"
Cohesion: 0.11
Nodes (21): SidebarProfileMenu(), saveProfile(), Badge(), BadgeProps, BadgeTone, CustomerSort, CustomerSortHeader(), Table() (+13 more)

### Community 14 - "Button"
Cohesion: 0.13
Nodes (36): Input, Label(), LabelProps, SearchField(), LoginPage(), OrderDetailView(), TransactionTable(), EMPTY (+28 more)

### Community 15 - "getUserFacingApiMessage"
Cohesion: 0.07
Nodes (41): LoadingState(), AdminPageSize, Pagination(), Props, Select, SelectOption, SelectProps, ItemForm() (+33 more)

### Community 16 - "PRD.md"
Cohesion: 0.06
Nodes (30): 10. Consignee Requirements, 11. Consignment Requirements, 12. Orders / POS Requirements, 13. Payment Flow, 14. Hardware Requirements, 15. Initial Release Boundary, 16. Future Expansion, 1. Product Overview (+22 more)

### Community 17 - "EmployeesPage.tsx"
Cohesion: 0.10
Nodes (29): AlertProps, toneIcons, LoadingStateProps, ModalProps, ToastContext, ToastContextValue, ToastItem, ToastTone (+21 more)

### Community 21 - "AuthContext.tsx"
Cohesion: 0.19
Nodes (21): AlertTone, AuthContext, AuthContextValue, AuthNotice, AuthProvider(), bootstrap(), extractLoginErrorMessage(), fetchCurrentUser() (+13 more)

### Community 22 - "MonthlyEndInventoryPage"
Cohesion: 0.13
Nodes (30): cents(), currentManila(), EMPTY, filterSelects(), MonthlyEndInventoryPage(), create(), exportExcel(), finalize() (+22 more)

### Community 23 - "MonthlyEndReportController"
Cohesion: 0.12
Nodes (4): MonthlyEndReportController, StoreMonthlyEndReportRequest, UpdateMonthlyEndCountsRequest, MonthlyEndReportResource

### Community 24 - "StationsPage.tsx"
Cohesion: 0.12
Nodes (23): ButtonProps, ButtonVariant, StationFieldErrors, StationForm(), StationFormProps, StationTable(), StationTableProps, EMPTY_LIST (+15 more)

### Community 25 - "useAuth"
Cohesion: 0.14
Nodes (13): AppHeader(), AppSidebar(), useAuth(), PosRoute(), ProtectedRoute(), RoleRoute(), AppShell(), iconSizeNav (+5 more)

### Community 26 - "SpoilagesPage.tsx"
Cohesion: 0.13
Nodes (23): formatManilaDate(), manilaDate, manilaDateTime, manilaLongDateTime, CartLine, EMPTY, NO_OPTIONS, SpoilagesPage() (+15 more)

### Community 27 - "UserController.php"
Cohesion: 0.07
Nodes (8): AuthController, UserController, LoginRequest, UpdateProfileRequest, StoreUserRequest, UpdateUserRequest, UserResource, 14.3 Error response conventions

### Community 28 - "MonthlyEndReportController.php"
Cohesion: 0.18
Nodes (5): {closure#5}(), {closure#6}(), {closure#7}(), {closure#8}(), MonthlyEndReport

### Community 30 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowSyntheticDefaultImports, composite, esModuleInterop, isolatedModules, jsx, lib, module (+9 more)

### Community 31 - "ItemController.php"
Cohesion: 0.11
Nodes (8): ItemController, StoreItemRequest, UpdateItemRequest, ItemResource, 9.6 Item Management (Phase 10.4), 14.1 API layer conventions, 14.2 Success response conventions, 14. URL / API Naming

### Community 32 - "SaleRemittanceController.php"
Cohesion: 0.12
Nodes (3): {closure#10}(), {closure#11}(), {closure#1}()

### Community 33 - "SaleRemittancesPage.tsx"
Cohesion: 0.24
Nodes (11): StatusSort, StatusSortHeader(), cents(), EMPTY, money, SaleRemittancesPage(), submit(), loadSaleRemittances() (+3 more)

### Community 34 - "Development Rules"
Cohesion: 0.07
Nodes (30): API-only backend, Cash drawer integration POC, Current module boundary — Consignee removal, Current POS interaction rules (2026-10-01), Developer context architecture, Development Rules, Migration ownership, Phase 10.13 Item Delivery rules (+22 more)

### Community 35 - "TaxSetting"
Cohesion: 0.14
Nodes (5): TaxStatus, NonVat, VatRegistered, TaxSetting, TaxSettingApiTest

### Community 36 - "Architecture"
Cohesion: 0.07
Nodes (27): API-only backend cleanup (2026-10-07), Architecture, Current module boundary — Consignee removal (2026-10-09), Current POS layout and in-place cashier actions (2026-10-01), Phase 10.13 current Item Delivery architecture, Phase 10.14.1 confirmed legacy-facing sidebar, Phase 10.15 Customer and Credit Monitoring architecture, Phase 10.16.1 compact UI and Station Inventory summary (2026-10-01) (+19 more)

### Community 37 - "HandOff.md"
Cohesion: 0.08
Nodes (24): 10. Consignment Screen Observed, 11. POS Screen Observed, 12. Hardware Scope, 13. Architecture Decision, 14. Database Direction, 15. Naming Decision, 16. Current Scope, 17. Future Idea — Customer Food Menu (+16 more)

### Community 39 - "ItemDeliveryController.php"
Cohesion: 0.09
Nodes (3): ItemDeliveryController, StoreItemDeliveryRequest, ItemDeliveryResource

### Community 40 - "PriceController.php"
Cohesion: 0.12
Nodes (3): PriceController, StorePriceRequest, PriceResource

### Community 41 - "Requirement.md"
Cohesion: 0.10
Nodes (20): 10. Authentication Requirements, 11. POS Requirements, 12. Transaction Requirements, 13. Error Handling, 14. Hardware Compatibility, 15. Testing Requirements, 16. Deployment Requirements, 17. Environment Configuration (+12 more)

### Community 43 - "MonthlyEndReportApiTest"
Cohesion: 0.21
Nodes (8): MonthlyEndReportApiTest, Deferred / out of scope, Goal, Inputs, Invariants, Phase 10.22B — Monthly End Inventory, Process and outputs, Verification

### Community 44 - "Illuminate\Database\Schema\Blueprint"
Cohesion: 0.23
Nodes (6): {closure#1}(), {closure#2}(), {closure#3}(), {closure#1}(), {closure#2}(), {closure#3}()

### Community 46 - "SpoilageController"
Cohesion: 0.10
Nodes (3): SpoilageController, StoreSpoilageRequest, SpoilageResource

### Community 47 - "Architecture.md"
Cohesion: 0.20
Nodes (10): Database Schema — legacy field notes, Phase 10.22C reconciliation additions, Obsidian + Graphify + ICM, POS Memory Context Router, Inventory Context, Read, Stable invariants, Read (+2 more)

### Community 48 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, allowSyntheticDefaultImports, composite, esModuleInterop, module, moduleResolution, noEmit, resolveJsonModule (+4 more)

### Community 49 - "Illuminate\Foundation\Http\FormRequest"
Cohesion: 0.09
Nodes (5): StoreCustomerRequest, StoreSaleRemittanceRequest, StoreStationItemRequest, SyncUserPrivilegesRequest, UpdateStationItemRequest

### Community 50 - "ItemsPage.tsx"
Cohesion: 0.18
Nodes (13): ItemFieldErrors, Props, fieldErrorsFrom(), save(), createItem(), deleteItem(), ItemResponse, PaginatedItemsResponse (+5 more)

### Community 51 - "Station"
Cohesion: 0.09
Nodes (4): Customer, User, DashboardApiTest, ReportExcelExportApiTest

### Community 52 - "EmployeeForm.tsx"
Cohesion: 0.21
Nodes (12): EmployeeFieldErrors, EmployeeFormProps, ROLES, DeleteUserResponse, loadEmployeeOptions(), PaginatedUsersResponse, UserResponse, UserSex (+4 more)

### Community 54 - "EmployeesPage"
Cohesion: 0.19
Nodes (9): EmployeeForm(), EmployeesPage(), handleDelete(), handleSave(), fieldErrorsFrom(), createEmployee(), deleteEmployee(), loadEmployees() (+1 more)

### Community 55 - "StationController.php"
Cohesion: 0.14
Nodes (4): StationController, StoreStationRequest, UpdateStationRequest, StationResource

### Community 56 - "UserRole"
Cohesion: 0.11
Nodes (6): UserRole, Admin, EndUser, UserFactory, DatabaseSeeder, DevelopmentUserSeeder

### Community 58 - "EnsureUserIsAdmin"
Cohesion: 0.17
Nodes (17): EnsureUserIsAdmin, 9.1 Authentication (Phase 8), 9.3 Employee Management (Phase 10.1), Architecture simplification — 2026-09-26, Deferred feature register carried forward, Phase 10.1 deliverables, Phase 10.1 — Employee Management, Phase 10.1 verification — 2026-09-26 (+9 more)

### Community 64 - "PrivilegeController.php"
Cohesion: 0.11
Nodes (6): PrivilegeController, {closure#1}(), StorePrivilegeRequest, {closure#1}(), UpdatePrivilegeRequest, PrivilegeResource

### Community 65 - "Alert"
Cohesion: 0.19
Nodes (12): Alert(), CustomerSelector(), EMPTY, Props, CustomerManagementPage(), save(), EMPTY, money (+4 more)

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

### Community 75 - "App.tsx"
Cohesion: 0.32
Nodes (5): App(), router, ToastProvider(), appRoutes, react-dom

### Community 76 - "TaxSetting"
Cohesion: 0.29
Nodes (3): {closure#1}(), TaxSettingController, UpdateTaxSettingRequest

### Community 77 - "LoginSlideshow.tsx"
Cohesion: 0.18
Nodes (5): LoginSlide, LoginSlideshow(), SLIDES, Phase 10.20A — Admin Dashboard and Cashier landing (2026-10-11), Phase 10.23UI — Sidebar Profile and Navigation (2026-10-22)

### Community 78 - "ItemDeliveriesPage.tsx"
Cohesion: 0.21
Nodes (11): CartLine, EMPTY, ItemDeliveriesPage(), confirm(), submitForm(), view(), NO_OPTIONS, validQuantity() (+3 more)

### Community 79 - "stationItemService.ts"
Cohesion: 0.27
Nodes (8): assignItemToStation(), PageResponse, removeItemFromStation(), updateStationQuantity(), InventoryItemOption, StationInventoryList, StationItem, StationItemOptions

### Community 80 - "9.2 Role-Aware Application Navigation (Phase 9)"
Cohesion: 0.25
Nodes (8): 9.10 Orders / POS Foundation (Phase 10.8), 9.11 Payment and Order Finalization (Phase 10.9), 9.12 Transaction History (Phase 10.10), 9.2 Role-Aware Application Navigation (Phase 9), 9.4 Station Management (Phase 10.2), 9.7 Consignee Management (Phase 10.5), 9.8 Consignment Account Management (Phase 10.6), 9.9 Station Inventory Foundation (Phase 10.7)

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

### Community 89 - "Illuminate\Http\Request"
Cohesion: 0.05
Nodes (9): OrderController, CreditMonitoringResource, CustomerResource, OrderDetailResource, OrderHistoryResource, OrderResource, PosItemResource, PosStationInventoryResource (+1 more)

### Community 90 - "Phase 10.21 — Non-VAT / Tax Foundation"
Cohesion: 0.29
Nodes (7): Deferred / out of scope, Goal, Inputs, Invariants and process, Outputs, Phase 10.21 — Non-VAT / Tax Foundation, Verification

### Community 91 - "Phase 10.22A — Sales Report"
Cohesion: 0.29
Nodes (7): Deferred / out of scope, Goal, Inputs, Invariants and process, Outputs, Phase 10.22A — Sales Report, Verification

### Community 92 - "Phase 8 — Simple Authentication / Login Foundation"
Cohesion: 0.33
Nodes (6): Development credentials (local only — never use in production), Environment decisions (still in force), Phase 7/8 verification and hardening — 2026-09-26, Phase 8 deliverables, Phase 8 — Simple Authentication / Login Foundation, Prior phases

### Community 96 - "itemDeliveryService.ts"
Cohesion: 0.43
Nodes (5): loadDeliveryOptions(), DeliveryItem, DeliveryList, DeliveryOptions, ItemDelivery

### Community 100 - "3. Application Layers"
Cohesion: 0.40
Nodes (5): 3.1 Electron, 3.2 React + TypeScript, 3.3 Laravel, 3.4 MySQL, 3. Application Layers

### Community 102 - "apiClient.ts"
Cohesion: 0.16
Nodes (17): ApiError, ApiErrorKind, apiRequest(), ApiRequestOptions, currentPricesFrom(), currentStockFrom(), downloadApiFile(), getApiBaseUrl() (+9 more)

### Community 104 - "salesReportService.ts"
Cohesion: 0.38
Nodes (5): loadSalesReport(), SalesReportFilters, OrderParty, SalesReportData, SalesReportPeriod

### Community 112 - "Architecture.md"
Cohesion: 0.10
Nodes (18): 10. Future Architecture, 11. Architecture Principle, 1. Project Overview, 2. Technology Architecture, 4. Initial Application Flow, 5. POS Order Flow, 6. Hardware Architecture, 7. Database Structure (+10 more)

### Community 114 - "18. Current Phase"
Cohesion: 0.25
Nodes (8): 18. Current Phase, Phase 10.10 — Transaction History, Phase 10.6 — Consignment Account Management, Phase 10.7 — Station Inventory Foundation, Phase 10.8 — Orders / POS Foundation, Phase 9 — Dashboard & Role-Aware Navigation Foundation, Phase 9 deliverables, Phase 9 verification — 2026-09-26

### Community 115 - "vite-env.d.ts"
Cohesion: 0.38
Nodes (5): AppInfo, ElectronAPI, ImportMeta, ImportMetaEnv, Window

### Community 116 - "priceService.ts"
Cohesion: 0.43
Nodes (5): activatePrice(), PaginatedPrices, PriceItemOption, PriceList, PriceRecord

### Community 117 - "Phase 10.22C — Inventory Reconciliation"
Cohesion: 0.33
Nodes (6): Critical invariants, Goal, Inputs, Out of scope, Phase 10.22C — Inventory Reconciliation, Verification

### Community 119 - "PosCheckoutController.php"
Cohesion: 0.16
Nodes (3): {closure#1}(), PosCheckoutController, CheckoutOrderRequest

### Community 122 - "navigation.ts"
Cohesion: 0.22
Nodes (7): NavGroupKey, navGroupLabels, navGroupOrder, NavItem, navItems, otherPages, lucide-react

### Community 124 - "SalesReportApiTest"
Cohesion: 0.29
Nodes (4): {closure#4}(), SalesReportApiTest, Phase 10.17 Privilege and Privilege Assignment (2026-10-01), Phase 10.17 status — Complete (2026-10-01)

### Community 125 - "Phase 10.23UI — Sidebar Profile and Navigation"
Cohesion: 0.40
Nodes (5): Goal, Inputs, Invariants, Outputs, Phase 10.23UI — Sidebar Profile and Navigation

## Knowledge Gaps
- **9 isolated node(s):** `NonVat`, `VatRegistered`, `Admin`, `EndUser`, `@types/node` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 891 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **45 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `18. Current Phase` connect `18. Current Phase` to `Illuminate\Database\Eloquent\Relations\BelongsTo`, `HandOff.md`, `getUserFacingApiMessage`, `EnsureUserIsAdmin`, `Phase 8 — Simple Authentication / Login Foundation`?**
  _High betweenness centrality (0.330) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `User` (e.g. with `9.3 Employee Management (Phase 10.1)` and `Phase 10.1 deliverables`) actually correct?**
  _`User` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `NonVat`, `VatRegistered`, `Admin` to the rest of the system?**
  _9 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `DashboardController.php` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Why does `Frontend UI cleanup — 2026-09-27` connect `getUserFacingApiMessage` to `18. Current Phase`, `Button`?**
  _High betweenness centrality (0.308) - this node is a cross-community bridge._
- **Should `TestCase` be split into smaller, more focused modules?**
  _Cohesion score 0.05245901639344262 - nodes in this community are weakly interconnected._
- **Why does `Phase 10.9 — Payment & Order Finalization` connect `Illuminate\Database\Eloquent\Relations\BelongsTo` to `18. Current Phase`?**
  _High betweenness centrality (0.182) - this node is a cross-community bridge._