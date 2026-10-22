# Graph Report - pos  (2026-10-22)

## Corpus Check
- 289 files · ~184,804 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 68 file(s) not represented in the graph (top: .css 46, (none) 18, .example 2)

## Summary
- 2112 nodes · 5284 edges · 119 communities (67 shown, 52 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 90 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d7d7f81d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- LoadingState
- Item
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
- Illuminate\Http\Resources\Json\JsonResource
- Button
- EmployeeForm.tsx
- PRD.md
- MonthlyEndReport
- UserManagementApiTest
- OrderController.php
- PosCheckoutApiTest
- AuthContext.tsx
- MonthlyEndInventoryPage
- ReportExportService
- Illuminate\Foundation\Http\FormRequest
- AppSidebar.tsx
- SpoilagesPage.tsx
- Illuminate\Http\JsonResponse
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
- SalesReportController.php
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
- SpoilageApiTest
- UserRole
- StationController.php
- UserFactory.php
- OrderHistoryApiTest
- EnsureUserIsAdmin
- PrivilegeApiTest.php
- CustomerCreditMonitoringApiTest
- ItemDeliveryApiTest.php
- OrTransactionApiTest
- PriceManagementApiTest
- Illuminate\Http\Request
- OrdersPage.tsx
- Phase 10.22D — Excel Report Export
- AppServiceProvider.php
- bootstrap/app.php
- Illuminate\Support\Facades\Schema
- 2026_09_30_000000_create_prices_table.php
- Illuminate\Database\Migrations\Migration
- .prices
- SchemaReconciliationTest
- StationItemApiTest
- App.tsx
- UserRole
- Pagination
- ItemDeliveriesPage.tsx
- 2026_09_30_050000_create_spoilage_items_table.php
- 9.2 Role-Aware Application Navigation (Phase 9)
- Deferred Work Register
- 🧩 Icon System
- University HomeStay POS
- University HomeStay POS Context Router
- 0001_01_01_000001_create_cache_table.php
- 2026_10_01_000000_create_privileges_table.php
- 2026_10_21_010000_create_monthly_end_reports_tables.php
- Phase 10.21 — Non-VAT / Tax Foundation
- Phase 10.22A — Sales Report
- Phase 8 — Simple Authentication / Login Foundation
- 2026_09_27_020000_create_items_table.php
- 2026_09_27_045000_create_customers_table.php
- 2026_09_27_050000_create_orders_table.php
- 2026_09_30_010000_create_inventory_movements_table.php
- 2026_09_30_020000_create_item_deliveries_table.php
- 2026_09_30_030000_create_item_delivery_items_table.php
- 3. Application Layers
- apiClient.ts
- PrivilegeController.php
- tsconfig.json
- Architecture.md
- AGENTS.md
- Phase 10.22C — Inventory Reconciliation
- StoreItemDeliveryRequest
- 2026_09_25_162514_create_personal_access_tokens_table.php
- UpdateStationRequest
- StoreSpoilageRequest
- StoreSaleRemittanceRequest
- UpdateItemRequest
- 2026_09_27_060000_create_order_items_table.php

## God Nodes (most connected - your core abstractions)
1. `getUserFacingApiMessage()` - 77 edges
2. `Button` - 65 edges
3. `User` - 57 edges
4. `apiRequest()` - 53 edges
5. `Alert()` - 51 edges
6. `TestCase` - 48 edges
7. `OrdersPage()` - 48 edges
8. `LoadingState()` - 47 edges
9. `Item` - 46 edges
10. `Station` - 46 edges

## Surprising Connections (you probably didn't know these)
- `9.6 Item Management (Phase 10.4)` --references--> `ItemResource`  [INFERRED]
  POS Memory/Architecture.md → backend/app/Http/Resources/ItemResource.php
- `Phase 10.20A — Admin Dashboard and Cashier landing (2026-10-11)` --references--> `LoginPage()`  [INFERRED]
  POS Memory/Architecture.md → frontend/src/features/auth/LoginPage.tsx
- `14.1 API layer conventions` --references--> `ItemController`  [INFERRED]
  POS Memory/Rules.md → backend/app/Http/Controllers/Api/ItemController.php
- `14.1 API layer conventions` --references--> `OrderController`  [INFERRED]
  POS Memory/Rules.md → backend/app/Http/Controllers/Api/OrderController.php
- `Architecture simplification — 2026-09-26` --references--> `EnsureUserIsAdmin`  [INFERRED]
  POS Memory/HandOff.md → backend/app/Http/Middleware/EnsureUserIsAdmin.php

## Import Cycles
- None detected.

## Communities (119 total, 52 thin omitted)

### Community 0 - "LoadingState"
Cohesion: 0.11
Nodes (24): LoadingState(), ToastContext, ToastContextValue, ToastItem, ToastTone, useToast(), Panel(), PanelProps (+16 more)

### Community 1 - "Item"
Cohesion: 0.06
Nodes (8): Customer, InventoryMovement, Item, Price, Station, StationItem, DashboardApiTest, Phase 10.14 current Spoilage architecture

### Community 2 - "OrdersPage.tsx"
Cohesion: 0.07
Nodes (49): PaymentReceipt(), PosItemSearch(), add(), addExactCode(), onSearchKeyDown(), addOneToQuantity(), cartTotalCents(), formatPosQuantity() (+41 more)

### Community 3 - "composer.json"
Cohesion: 0.04
Nodes (46): pestphp/pest-plugin, php-http/discovery, autoload, autoload-dev, psr-4, psr-4, dev-master, config (+38 more)

### Community 4 - "MonthlyEndInventoryPage.tsx"
Cohesion: 0.07
Nodes (41): AlertProps, toneIcons, LoadingStateProps, Badge(), BadgeProps, BadgeTone, Props, TableColumn (+33 more)

### Community 5 - "Illuminate\Database\Eloquent\Relations\BelongsTo"
Cohesion: 0.07
Nodes (9): {closure#9}(), ItemDelivery, ItemDeliveryItem, MonthlyEndReportItem, {closure#1}(), OrderItem, Spoilage, SpoilageItem (+1 more)

### Community 6 - "Development Handoff"
Cohesion: 0.06
Nodes (34): Consignee and Consignment Account removal (2026-10-09), Current development status (2026-10-07), Development Handoff, Development log — 2026-09-30 (Phase 10.16 and POS follow-up), Development log — 2026-10-01 (POS F3/F4 payment controls), Phase 10.12 current-state note, Phase 10.13 current-state note, Phase 10.14.1 current-state note (+26 more)

### Community 7 - "StationItemController.php"
Cohesion: 0.16
Nodes (3): {closure#6}(), StationItemController, StationItemResource

### Community 8 - "Rules.md"
Cohesion: 0.07
Nodes (26): 10. PHP Variable Naming, 11. React Component Naming, 12. React Function Naming, 13. React Variable Naming, 15. Page Naming, 16. Eloquent Rules, 17. Money Rules, 18 Order Processing Rule (+18 more)

### Community 9 - "printing.ts"
Cohesion: 0.09
Nodes (31): AppInfo, registerAppIpc(), CashDrawerResult, openCashDrawer(), registerCashDrawerIpc(), APP_GET_INFO, AppIpcChannel, CASH_DRAWER_OPEN (+23 more)

### Community 10 - "package.json"
Cohesion: 0.06
Nodes (32): dependencies, lucide-react, react, react-dom, react-router-dom, description, devDependencies, electron (+24 more)

### Community 11 - "Illuminate\Http\JsonResponse"
Cohesion: 0.07
Nodes (8): CreditMonitoringController, DashboardController, HealthController, PosItemController, PrivilegeAssignmentController, {closure#1}(), TaxSettingController, Controller

### Community 12 - "ItemDeliveryController.php"
Cohesion: 0.10
Nodes (3): {closure#1}(), PosCheckoutController, OrderResource

### Community 13 - "Illuminate\Http\Resources\Json\JsonResource"
Cohesion: 0.11
Nodes (4): OrderHistoryResource, PosItemResource, PosStationInventoryResource, SaleRemittanceResource

### Community 14 - "Button"
Cohesion: 0.08
Nodes (55): CustomerSort, CustomerSortHeader(), Props, StockQuantity(), Table(), OrderDetailView(), OrTransactionTable(), TransactionTable() (+47 more)

### Community 15 - "EmployeeForm.tsx"
Cohesion: 0.10
Nodes (27): Select, SelectOption, SelectProps, EmployeeFieldErrors, EmployeeForm(), EmployeeFormProps, ROLES, EmployeesPage() (+19 more)

### Community 16 - "PRD.md"
Cohesion: 0.06
Nodes (30): 10. Consignee Requirements, 11. Consignment Requirements, 12. Orders / POS Requirements, 13. Payment Flow, 14. Hardware Requirements, 15. Initial Release Boundary, 16. Future Expansion, 1. Product Overview (+22 more)

### Community 17 - "MonthlyEndReport"
Cohesion: 0.24
Nodes (5): {closure#5}(), {closure#6}(), {closure#7}(), {closure#8}(), MonthlyEndReport

### Community 19 - "OrderController.php"
Cohesion: 0.06
Nodes (4): {closure#10}(), {closure#11}(), CreditMonitoringResource, Order

### Community 21 - "AuthContext.tsx"
Cohesion: 0.18
Nodes (21): AlertTone, AuthContext, AuthContextValue, AuthNotice, AuthProvider(), bootstrap(), extractLoginErrorMessage(), fetchCurrentUser() (+13 more)

### Community 22 - "MonthlyEndInventoryPage"
Cohesion: 0.12
Nodes (27): cents(), currentManila(), MonthlyEndInventoryPage(), create(), exportExcel(), finalize(), prepareFinalize(), reconcile() (+19 more)

### Community 24 - "Illuminate\Foundation\Http\FormRequest"
Cohesion: 0.06
Nodes (10): LoginRequest, ReconcileMonthlyEndItemsRequest, StoreCustomerRequest, StoreItemRequest, StoreMonthlyEndReportRequest, StorePriceRequest, StoreStationRequest, SyncUserPrivilegesRequest (+2 more)

### Community 25 - "AppSidebar.tsx"
Cohesion: 0.15
Nodes (13): AppHeader(), AppSidebar(), EmployeeTable(), AppShell(), iconSizeNav, getNavItemByPath(), getNavItemsForRole(), NavItem (+5 more)

### Community 26 - "SpoilagesPage.tsx"
Cohesion: 0.13
Nodes (24): formatManilaDate(), formatManilaDateTime(), manilaDate, manilaDateTime, manilaLongDateTime, CartLine, EMPTY, NO_OPTIONS (+16 more)

### Community 27 - "Illuminate\Http\JsonResponse"
Cohesion: 0.16
Nodes (4): AuthController, SaleRemittanceController, UserController, UserResource

### Community 28 - "User"
Cohesion: 0.13
Nodes (4): {closure#3}(), Privilege, User, MonthlyEndReconciliationApiTest

### Community 29 - "SalesReportApiTest"
Cohesion: 0.20
Nodes (5): {closure#4}(), ReportExcelExportApiTest, SalesReportApiTest, Phase 10.17 Privilege and Privilege Assignment (2026-10-01), Phase 10.17 status — Complete (2026-10-01)

### Community 30 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowSyntheticDefaultImports, composite, esModuleInterop, isolatedModules, jsx, lib, module (+9 more)

### Community 31 - "PrivilegeController.php"
Cohesion: 0.18
Nodes (4): {closure#1}(), StorePrivilegeRequest, {closure#1}(), UpdatePrivilegeRequest

### Community 32 - "index.tsx"
Cohesion: 0.21
Nodes (6): useAuth(), PosRoute(), ProtectedRoute(), RoleRoute(), CashierHomePage(), RoleLanding()

### Community 33 - "SaleRemittancesPage.tsx"
Cohesion: 0.24
Nodes (11): StatusSort, StatusSortHeader(), cents(), EMPTY, money, SaleRemittancesPage(), submit(), loadSaleRemittances() (+3 more)

### Community 34 - "Development Rules"
Cohesion: 0.07
Nodes (29): API-only backend, Cash drawer integration POC, Current module boundary — Consignee removal, Current POS interaction rules (2026-10-01), Developer context architecture, Development Rules, Migration ownership, Phase 10.13 Item Delivery rules (+21 more)

### Community 36 - "Architecture"
Cohesion: 0.08
Nodes (26): API-only backend cleanup (2026-10-07), Architecture, Current module boundary — Consignee removal (2026-10-09), Current POS layout and in-place cashier actions (2026-10-01), Phase 10.13 current Item Delivery architecture, Phase 10.14.1 confirmed legacy-facing sidebar, Phase 10.15 Customer and Credit Monitoring architecture, Phase 10.16.1 compact UI and Station Inventory summary (2026-10-01) (+18 more)

### Community 37 - "HandOff.md"
Cohesion: 0.08
Nodes (24): 10. Consignment Screen Observed, 11. POS Screen Observed, 12. Hardware Scope, 13. Architecture Decision, 14. Database Direction, 15. Naming Decision, 16. Current Scope, 17. Future Idea — Customer Food Menu (+16 more)

### Community 40 - "TaxSetting"
Cohesion: 0.14
Nodes (5): TaxStatus, NonVat, VatRegistered, TaxSetting, TaxSettingApiTest

### Community 41 - "Requirement.md"
Cohesion: 0.10
Nodes (20): 10. Authentication Requirements, 11. POS Requirements, 12. Transaction Requirements, 13. Error Handling, 14. Hardware Compatibility, 15. Testing Requirements, 16. Deployment Requirements, 17. Environment Configuration (+12 more)

### Community 43 - "MonthlyEndReportApiTest"
Cohesion: 0.21
Nodes (8): MonthlyEndReportApiTest, Deferred / out of scope, Goal, Inputs, Invariants, Phase 10.22B — Monthly End Inventory, Process and outputs, Verification

### Community 44 - "Illuminate\Database\Schema\Blueprint"
Cohesion: 0.23
Nodes (6): {closure#1}(), {closure#2}(), {closure#3}(), {closure#1}(), {closure#2}(), {closure#3}()

### Community 46 - "StationsPage.tsx"
Cohesion: 0.15
Nodes (19): StationFieldErrors, StationForm(), StationFormProps, StationTable(), EMPTY_LIST, fieldErrorsFrom(), FormDialog, StationsPage() (+11 more)

### Community 47 - "Architecture.md"
Cohesion: 0.21
Nodes (10): Database Schema — legacy field notes, Phase 10.22C reconciliation additions, Obsidian + Graphify + ICM, POS Memory Context Router, Inventory Context, Read, Stable invariants, Read (+2 more)

### Community 48 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, allowSyntheticDefaultImports, composite, esModuleInterop, module, moduleResolution, noEmit, resolveJsonModule (+4 more)

### Community 52 - "TestCase"
Cohesion: 0.10
Nodes (4): HealthEndpointTest, SaleRemittanceApiTest, StationManagementApiTest, TestCase

### Community 54 - "UserRole"
Cohesion: 0.08
Nodes (6): UserRole, Admin, EndUser, DatabaseSeeder, DevelopmentUserSeeder, AuthApiTest

### Community 55 - "StationController.php"
Cohesion: 0.16
Nodes (6): StationController, StationResource, 14.1 API layer conventions, 14.2 Success response conventions, 14.3 Error response conventions, 14. URL / API Naming

### Community 58 - "EnsureUserIsAdmin"
Cohesion: 0.10
Nodes (24): EnsureUserIsAdmin, 9.1 Authentication (Phase 8), 9.3 Employee Management (Phase 10.1), 18. Current Phase, Deferred feature register carried forward, Phase 10.10 — Transaction History, Phase 10.1 deliverables, Phase 10.1 — Employee Management (+16 more)

### Community 64 - "Illuminate\Http\Request"
Cohesion: 0.16
Nodes (4): CustomerController, OrderController, CustomerResource, OrderDetailResource

### Community 65 - "OrdersPage.tsx"
Cohesion: 0.11
Nodes (34): Alert(), Modal(), ModalProps, Button, ButtonProps, ButtonVariant, Input, InputProps (+26 more)

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

### Community 76 - "UserRole"
Cohesion: 0.08
Nodes (6): CheckoutOrderRequest, StoreStationItemRequest, StoreUserRequest, UpdateTaxSettingRequest, UpdateUserRequest, Architecture simplification — 2026-09-26

### Community 77 - "Pagination"
Cohesion: 0.10
Nodes (27): AdminPageSize, Pagination(), Props, SearchField(), CreditMonitoringPage(), EMPTY, money, EMPTY (+19 more)

### Community 78 - "ItemDeliveriesPage.tsx"
Cohesion: 0.18
Nodes (16): CartLine, EMPTY, ItemDeliveriesPage(), confirm(), submitForm(), view(), NO_OPTIONS, validQuantity() (+8 more)

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

### Community 90 - "Phase 10.21 — Non-VAT / Tax Foundation"
Cohesion: 0.17
Nodes (10): Deferred / out of scope, Goal, Inputs, Invariants and process, Outputs, Phase 10.21 — Non-VAT / Tax Foundation, Verification, Read (+2 more)

### Community 91 - "Phase 10.22A — Sales Report"
Cohesion: 0.29
Nodes (7): Deferred / out of scope, Goal, Inputs, Invariants and process, Outputs, Phase 10.22A — Sales Report, Verification

### Community 92 - "Phase 8 — Simple Authentication / Login Foundation"
Cohesion: 0.33
Nodes (6): Development credentials (local only — never use in production), Environment decisions (still in force), Phase 7/8 verification and hardening — 2026-09-26, Phase 8 deliverables, Phase 8 — Simple Authentication / Login Foundation, Prior phases

### Community 100 - "3. Application Layers"
Cohesion: 0.40
Nodes (5): 3.1 Electron, 3.2 React + TypeScript, 3.3 Laravel, 3.4 MySQL, 3. Application Layers

### Community 102 - "apiClient.ts"
Cohesion: 0.10
Nodes (27): EMPTY_LIST, EMPTY_OPTIONS, StationInventoryPage(), ApiError, ApiErrorKind, apiRequest(), ApiRequestOptions, currentPricesFrom() (+19 more)

### Community 112 - "Architecture.md"
Cohesion: 0.10
Nodes (18): 10. Future Architecture, 11. Architecture Principle, 1. Project Overview, 2. Technology Architecture, 4. Initial Application Flow, 5. POS Order Flow, 6. Hardware Architecture, 7. Database Structure (+10 more)

### Community 117 - "Phase 10.22C — Inventory Reconciliation"
Cohesion: 0.33
Nodes (6): Critical invariants, Goal, Inputs, Out of scope, Phase 10.22C — Inventory Reconciliation, Verification

## Knowledge Gaps
- **9 isolated node(s):** `NonVat`, `VatRegistered`, `Admin`, `EndUser`, `@types/node` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 863 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **52 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `18. Current Phase` connect `EnsureUserIsAdmin` to `Illuminate\Database\Eloquent\Relations\BelongsTo`, `Pagination`, `HandOff.md`, `Phase 8 — Simple Authentication / Login Foundation`?**
  _High betweenness centrality (0.322) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `User` (e.g. with `9.3 Employee Management (Phase 10.1)` and `Phase 10.1 deliverables`) actually correct?**
  _`User` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `NonVat`, `VatRegistered`, `Admin` to the rest of the system?**
  _9 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `LoadingState` be split into smaller, more focused modules?**
  _Cohesion score 0.10588235294117647 - nodes in this community are weakly interconnected._
- **Why does `Frontend UI cleanup — 2026-09-27` connect `Pagination` to `EnsureUserIsAdmin`?**
  _High betweenness centrality (0.305) - this node is a cross-community bridge._
- **Should `Item` be split into smaller, more focused modules?**
  _Cohesion score 0.05553923009109609 - nodes in this community are weakly interconnected._
- **Why does `Phase 10.9 — Payment & Order Finalization` connect `Illuminate\Database\Eloquent\Relations\BelongsTo` to `EnsureUserIsAdmin`, `OrderController.php`?**
  _High betweenness centrality (0.191) - this node is a cross-community bridge._