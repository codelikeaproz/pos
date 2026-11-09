# Graph Report - frontend  (2026-10-27)

## Corpus Check
- 125 files · ~58,296 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 49 file(s) not represented in the graph (top: .css 47, .example 1, (none) 1)

## Summary
- 741 nodes · 2696 edges · 19 communities (18 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fe3fd4cc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- getUserFacingApiMessage
- react
- index.tsx
- OrdersPage.tsx
- SalesReportPage.tsx
- apiClient.ts
- printing.ts
- package.json
- MonthlyEndInventoryPage.tsx
- EmployeesPage.tsx
- ItemsPage.tsx
- SpoilagesPage.tsx
- compilerOptions
- ItemDeliveriesPage.tsx
- SaleRemittancesPage.tsx
- compilerOptions
- vite-env.d.ts
- assets.d.ts
- tsconfig.json

## God Nodes (most connected - your core abstractions)
1. `getUserFacingApiMessage()` - 85 edges
2. `Button` - 69 edges
3. `apiRequest()` - 58 edges
4. `Alert()` - 55 edges
5. `LoadingState()` - 49 edges
6. `Modal()` - 49 edges
7. `OrdersPage()` - 48 edges
8. `Input` - 46 edges
9. `Label()` - 46 edges
10. `react` - 45 edges

## Surprising Connections (you probably didn't know these)
- `create()` --indirect_call--> `createStation()`  [INFERRED]
  src/pages/MonthlyEndInventoryPage.tsx → src/services/stationService.ts
- `LoginPage()` --calls--> `Alert()`  [EXTRACTED]
  src/features/auth/LoginPage.tsx → src/components/feedback/Alert.tsx
- `CashReceivedDialog()` --calls--> `Alert()`  [EXTRACTED]
  src/features/pos/CashReceivedDialog.tsx → src/components/feedback/Alert.tsx
- `PaymentPanel()` --calls--> `Alert()`  [EXTRACTED]
  src/features/pos/PaymentPanel.tsx → src/components/feedback/Alert.tsx
- `PosItemSearch()` --calls--> `Alert()`  [EXTRACTED]
  src/features/pos/PosItemSearch.tsx → src/components/feedback/Alert.tsx

## Import Cycles
- None detected.

## Communities (19 total, 1 thin omitted)

### Community 0 - "getUserFacingApiMessage"
Cohesion: 0.07
Nodes (70): Alert(), LoadingState(), Modal(), useToast(), SidebarProfileMenu(), saveProfile(), Button, Input (+62 more)

### Community 1 - "react"
Cohesion: 0.05
Nodes (59): react, AlertProps, toneIcons, LoadingStateProps, ModalProps, ToastContext, ToastContextValue, ToastItem (+51 more)

### Community 2 - "index.tsx"
Cohesion: 0.05
Nodes (51): lucide-react, react-dom, react-router-dom, App(), router, AlertTone, ToastProvider(), AppHeader() (+43 more)

### Community 3 - "OrdersPage.tsx"
Cohesion: 0.07
Nodes (61): Props, StockQuantity(), CashReceivedDialog(), confirm(), CurrentOrderTable(), PaymentPanel(), Props, PaymentReceipt() (+53 more)

### Community 4 - "SalesReportPage.tsx"
Cohesion: 0.08
Nodes (49): Badge(), BadgeProps, BadgeTone, CustomerSort, CustomerSortHeader(), Table(), TableColumn, TableProps (+41 more)

### Community 5 - "apiClient.ts"
Cohesion: 0.08
Nodes (36): money, EMPTY, money, AccountingSummary, loadAccountingDashboard(), ApiError, ApiErrorKind, apiRequest() (+28 more)

### Community 6 - "printing.ts"
Cohesion: 0.10
Nodes (28): AppInfo, registerAppIpc(), CashDrawerResult, openCashDrawer(), registerCashDrawerIpc(), APP_GET_INFO, AppIpcChannel, CASH_DRAWER_OPEN (+20 more)

### Community 7 - "package.json"
Cohesion: 0.06
Nodes (32): dependencies, lucide-react, react, react-dom, react-router-dom, description, devDependencies, electron (+24 more)

### Community 8 - "MonthlyEndInventoryPage.tsx"
Cohesion: 0.13
Nodes (30): cents(), currentManila(), EMPTY, filterSelects(), MonthlyEndInventoryPage(), create(), exportExcel(), finalize() (+22 more)

### Community 9 - "EmployeesPage.tsx"
Cohesion: 0.12
Nodes (24): EmployeeFieldErrors, EmployeeForm(), EmployeeFormProps, ROLES, EmployeesPage(), handleSave(), handleStatusChange(), EMPTY_LIST (+16 more)

### Community 10 - "ItemsPage.tsx"
Cohesion: 0.14
Nodes (21): ItemFieldErrors, ItemForm(), Props, ItemTable(), pesoFormatter, Props, EMPTY_LIST, fieldErrorsFrom() (+13 more)

### Community 11 - "SpoilagesPage.tsx"
Cohesion: 0.16
Nodes (20): formatManilaDate(), CartLine, EMPTY, NO_OPTIONS, SpoilagesPage(), confirm(), openForm(), submitForm() (+12 more)

### Community 12 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowSyntheticDefaultImports, composite, esModuleInterop, isolatedModules, jsx, lib, module (+9 more)

### Community 13 - "ItemDeliveriesPage.tsx"
Cohesion: 0.20
Nodes (13): CartLine, EMPTY, submitForm(), NO_OPTIONS, validQuantity(), createDelivery(), loadDeliveries(), loadDelivery() (+5 more)

### Community 14 - "SaleRemittancesPage.tsx"
Cohesion: 0.26
Nodes (9): StatusSort, StatusSortHeader(), cents(), EMPTY, money, loadSaleRemittances(), remitSales(), SaleRemittanceList (+1 more)

### Community 15 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, allowSyntheticDefaultImports, composite, esModuleInterop, module, moduleResolution, noEmit, resolveJsonModule (+4 more)

### Community 16 - "vite-env.d.ts"
Cohesion: 0.38
Nodes (5): AppInfo, ElectronAPI, ImportMeta, ImportMetaEnv, Window

### Community 17 - "assets.d.ts"
Cohesion: 0.50
Nodes (3): *.jpg, *.png, *.webp

## Knowledge Gaps
- **5 isolated node(s):** `@types/node`, `@types/react`, `@types/react-dom`, `typescript`, `vite`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 240 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `getUserFacingApiMessage`, `index.tsx`, `OrdersPage.tsx`, `SalesReportPage.tsx`, `apiClient.ts`, `package.json`, `MonthlyEndInventoryPage.tsx`, `EmployeesPage.tsx`, `ItemsPage.tsx`, `SpoilagesPage.tsx`, `ItemDeliveriesPage.tsx`, `SaleRemittancesPage.tsx`?**
  _High betweenness centrality (0.177) - this node is a cross-community bridge._
- **What connects `@types/node`, `@types/react`, `@types/react-dom` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `getUserFacingApiMessage` be split into smaller, more focused modules?**
  _Cohesion score 0.0663659793814433 - nodes in this community are weakly interconnected._
- **Why does `getUserFacingApiMessage()` connect `getUserFacingApiMessage` to `react`, `OrdersPage.tsx`, `SalesReportPage.tsx`, `apiClient.ts`, `MonthlyEndInventoryPage.tsx`, `EmployeesPage.tsx`, `ItemsPage.tsx`, `SpoilagesPage.tsx`, `ItemDeliveriesPage.tsx`, `SaleRemittancesPage.tsx`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.05446727185857621 - nodes in this community are weakly interconnected._
- **Why does `electron` connect `printing.ts` to `package.json`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Should `index.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05171907140758154 - nodes in this community are weakly interconnected._