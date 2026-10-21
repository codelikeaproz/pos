# Graph Report - pos  (2026-10-21)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1679 nodes · 4619 edges · 112 communities (48 shown, 64 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `52b59e1b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 101
- Community 102
- Community 104
- Community 105

## God Nodes (most connected - your core abstractions)
1. `getUserFacingApiMessage()` - 74 edges
2. `Button` - 65 edges
3. `apiRequest()` - 53 edges
4. `User` - 52 edges
5. `Alert()` - 51 edges
6. `OrdersPage()` - 48 edges
7. `LoadingState()` - 47 edges
8. `Modal()` - 45 edges
9. `TestCase` - 44 edges
10. `Controller` - 44 edges

## Surprising Connections (you probably didn't know these)
- `{closure#10}()` --references--> `Order`  [EXTRACTED]
  backend/app/Http/Controllers/Api/SaleRemittanceController.php → backend/app/Models/Order.php
- `{closure#11}()` --references--> `Order`  [EXTRACTED]
  backend/app/Http/Controllers/Api/SaleRemittanceController.php → backend/app/Models/Order.php
- `create()` --indirect_call--> `createStation()`  [INFERRED]
  frontend/src/pages/MonthlyEndInventoryPage.tsx → frontend/src/services/stationService.ts
- `deleteItem()` --calls--> `apiRequest()`  [EXTRACTED]
  frontend/src/services/itemService.ts → frontend/src/services/apiClient.ts
- `activatePrice()` --calls--> `apiRequest()`  [EXTRACTED]
  frontend/src/services/priceService.ts → frontend/src/services/apiClient.ts

## Import Cycles
- None detected.

## Communities (112 total, 64 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (53): Alert(), LoadingState(), Modal(), Pagination(), SearchField(), CustomerSelector(), EMPTY, PosStationInventoryDialog() (+45 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (4): Price, HealthEndpointTest, StationManagementApiTest, TestCase

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (47): PosItemSearch(), add(), addExactCode(), onSearchKeyDown(), addOneToQuantity(), cartTotalCents(), formatPosQuantity(), formatScaledInteger() (+39 more)

### Community 3 - "Community 3"
Cohesion: 0.04
Nodes (45): pestphp/pest-plugin, php-http/discovery, autoload, autoload-dev, psr-4, psr-4, dev-master, config (+37 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (29): ToastContext, ToastContextValue, ToastItem, ToastTone, useToast(), Input, InputProps, Label() (+21 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (7): InventoryMovement, ItemDelivery, ItemDeliveryItem, MonthlyEndReportItem, OrderItem, Spoilage, SpoilageItem

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (24): AlertProps, toneIcons, LoadingStateProps, CustomerSort, CustomerSortHeader(), AdminPageSize, Props, Props (+16 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (27): EMPTY, Kpi, KpiCard(), peso(), EMPTY, ApiErrorKind, ApiRequestOptions, DashboardData (+19 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (22): ModalProps, Button, ButtonProps, ButtonVariant, TransactionTable(), CashReceivedDialog(), confirm(), Props (+14 more)

### Community 9 - "Community 9"
Cohesion: 0.10
Nodes (28): AppInfo, registerAppIpc(), CashDrawerResult, openCashDrawer(), registerCashDrawerIpc(), APP_GET_INFO, AppIpcChannel, CASH_DRAWER_OPEN (+20 more)

### Community 10 - "Community 10"
Cohesion: 0.06
Nodes (32): dependencies, lucide-react, react, react-dom, react-router-dom, description, devDependencies, electron (+24 more)

### Community 11 - "Community 11"
Cohesion: 0.08
Nodes (7): CreditMonitoringController, HealthController, PosItemController, PrivilegeAssignmentController, {closure#1}(), TaxSettingController, Controller

### Community 12 - "Community 12"
Cohesion: 0.07
Nodes (3): {closure#1}(), PosCheckoutController, {closure#9}()

### Community 13 - "Community 13"
Cohesion: 0.13
Nodes (7): OrderController, OrderDetailResource, OrderHistoryResource, OrderResource, PosItemResource, PosStationInventoryResource, SaleRemittanceResource

### Community 14 - "Community 14"
Cohesion: 0.14
Nodes (21): Badge(), BadgeProps, BadgeTone, Props, StockQuantity(), Table(), TableColumn, TableProps (+13 more)

### Community 15 - "Community 15"
Cohesion: 0.11
Nodes (21): SelectOption, SelectProps, EmployeeFieldErrors, EmployeeFormProps, ROLES, EmployeesPage(), handleDelete(), handleSave() (+13 more)

### Community 16 - "Community 16"
Cohesion: 0.15
Nodes (20): StationFieldErrors, StationForm(), StationFormProps, StationTable(), EMPTY_LIST, fieldErrorsFrom(), FormDialog, StationsPage() (+12 more)

### Community 21 - "Community 21"
Cohesion: 0.18
Nodes (21): AlertTone, AuthContext, AuthContextValue, AuthNotice, AuthProvider(), bootstrap(), extractLoginErrorMessage(), fetchCurrentUser() (+13 more)

### Community 22 - "Community 22"
Cohesion: 0.14
Nodes (22): cents(), currentManila(), MonthlyEndInventoryPage(), create(), finalize(), prepareFinalize(), save(), setDetailState() (+14 more)

### Community 23 - "Community 23"
Cohesion: 0.17
Nodes (3): AuthController, UserController, UserResource

### Community 24 - "Community 24"
Cohesion: 0.12
Nodes (5): LoginRequest, StoreItemRequest, StoreMonthlyEndReportRequest, StoreSaleRemittanceRequest, SyncUserPrivilegesRequest

### Community 25 - "Community 25"
Cohesion: 0.15
Nodes (12): AppHeader(), AppSidebar(), AppShell(), iconSizeNav, getNavItemByPath(), getNavItemsForRole(), NavItem, navItems (+4 more)

### Community 26 - "Community 26"
Cohesion: 0.15
Nodes (17): formatManilaDate(), manilaDate, manilaDateTime, manilaLongDateTime, CartLine, EMPTY, NO_OPTIONS, SpoilagesPage() (+9 more)

### Community 27 - "Community 27"
Cohesion: 0.15
Nodes (3): {closure#1}(), Order, SaleRemittanceApiTest

### Community 28 - "Community 28"
Cohesion: 0.17
Nodes (4): {closure#3}(), {closure#4}(), Privilege, User

### Community 29 - "Community 29"
Cohesion: 0.20
Nodes (3): Customer, DashboardApiTest, SalesReportApiTest

### Community 30 - "Community 30"
Cohesion: 0.11
Nodes (17): compilerOptions, allowSyntheticDefaultImports, composite, esModuleInterop, isolatedModules, jsx, lib, module (+9 more)

### Community 31 - "Community 31"
Cohesion: 0.15
Nodes (5): EnsureUserIsAdmin, {closure#1}(), StorePrivilegeRequest, {closure#1}(), UpdatePrivilegeRequest

### Community 32 - "Community 32"
Cohesion: 0.25
Nodes (8): useAuth(), LoginPage(), PosRoute(), ProtectedRoute(), RoleRoute(), CashierHomePage(), RoleLanding(), react-router-dom

### Community 33 - "Community 33"
Cohesion: 0.24
Nodes (11): StatusSort, StatusSortHeader(), cents(), EMPTY, money, SaleRemittancesPage(), submit(), loadSaleRemittances() (+3 more)

### Community 34 - "Community 34"
Cohesion: 0.18
Nodes (4): {closure#5}(), {closure#6}(), {closure#7}(), MonthlyEndReport

### Community 36 - "Community 36"
Cohesion: 0.16
Nodes (3): {closure#6}(), StationItemController, StationItemResource

### Community 37 - "Community 37"
Cohesion: 0.13
Nodes (3): {closure#10}(), {closure#11}(), SaleRemittanceController

### Community 39 - "Community 39"
Cohesion: 0.19
Nodes (13): apiRequest(), currentPricesFrom(), currentStockFrom(), messageForHttpStatus(), validationErrorsFrom(), assignItemToStation(), PageResponse, removeItemFromStation() (+5 more)

### Community 40 - "Community 40"
Cohesion: 0.14
Nodes (5): TaxStatus, NonVat, VatRegistered, TaxSetting, TaxSettingApiTest

### Community 41 - "Community 41"
Cohesion: 0.15
Nodes (5): UserRole, Admin, EndUser, StoreUserRequest, UpdateUserRequest

### Community 43 - "Community 43"
Cohesion: 0.14
Nodes (3): UpdateItemRequest, UpdateStationRequest, UpdateTaxSettingRequest

### Community 44 - "Community 44"
Cohesion: 0.23
Nodes (6): {closure#1}(), {closure#2}(), {closure#3}(), {closure#1}(), {closure#2}(), {closure#3}()

### Community 47 - "Community 47"
Cohesion: 0.29
Nodes (7): EMPTY, EMPTY, money, addCustomer(), loadCustomers(), Customer, CustomerList

### Community 48 - "Community 48"
Cohesion: 0.15
Nodes (12): compilerOptions, allowSyntheticDefaultImports, composite, esModuleInterop, module, moduleResolution, noEmit, resolveJsonModule (+4 more)

### Community 53 - "Community 53"
Cohesion: 0.26
Nodes (9): ItemFieldErrors, Props, deleteItem(), ItemResponse, PaginatedItemsResponse, Item, ITEM_UNITS, ItemInput (+1 more)

### Community 64 - "Community 64"
Cohesion: 0.31
Nodes (8): save(), createPrivilege(), PaginatedPrivileges, updatePrivilege(), AssignmentUser, Privilege, PrivilegeAssignmentList, PrivilegeList

### Community 68 - "Community 68"
Cohesion: 0.28
Nodes (3): {closure#1}(), {closure#2}(), {closure#3}()

### Community 70 - "Community 70"
Cohesion: 0.25
Nodes (5): backfillPrices(), {closure#1}(), {closure#2}(), {closure#5}(), up()

### Community 75 - "Community 75"
Cohesion: 0.32
Nodes (5): App(), router, ToastProvider(), appRoutes, react-dom

### Community 76 - "Community 76"
Cohesion: 0.36
Nodes (6): loadSpoilageOptions(), Spoilage, SpoilageItem, SpoilageList, SpoilageOption, SpoilageOptions

### Community 78 - "Community 78"
Cohesion: 0.43
Nodes (5): loadDeliveryOptions(), DeliveryItem, DeliveryList, DeliveryOptions, ItemDelivery

### Community 79 - "Community 79"
Cohesion: 0.43
Nodes (5): activatePrice(), PaginatedPrices, PriceItemOption, PriceList, PriceRecord

## Knowledge Gaps
- **9 isolated node(s):** `@types/node`, `@types/react`, `@types/react-dom`, `typescript`, `vite` (+4 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 584 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **64 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Station` connect `Community 17` to `Community 1`, `Community 34`, `Community 36`, `Community 5`, `Community 74`, `Community 12`, `Community 28`, `Community 46`, `Community 18`, `Community 19`, `Community 23`, `Community 54`, `Community 55`, `Community 57`, `Community 27`, `Community 60`, `Community 29`, `Community 62`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `@types/node`, `@types/react`, `@types/react-dom` to the rest of the system?**
  _9 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08391608391608392 - nodes in this community are weakly interconnected._
- **Why does `User` connect `Community 28` to `Community 1`, `Community 27`, `Community 40`, `Community 11`, `Community 12`, `Community 77`, `Community 17`, `Community 23`, `Community 56`, `Community 57`, `Community 59`, `Community 60`, `Community 29`, `Community 62`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06015037593984962 - nodes in this community are weakly interconnected._
- **Why does `TestCase` connect `Community 1` to `Community 18`, `Community 20`, `Community 27`, `Community 28`, `Community 29`, `Community 38`, `Community 40`, `Community 45`, `Community 46`, `Community 52`, `Community 57`, `Community 59`, `Community 60`, `Community 61`, `Community 62`, `Community 63`, `Community 72`, `Community 73`, `Community 74`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06966618287373004 - nodes in this community are weakly interconnected._