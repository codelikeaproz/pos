import { Navigate, RouteObject } from 'react-router-dom'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'
import { useAuth } from '../features/auth/AuthContext'
import { RoleRoute } from '../features/auth/RoleRoute'
import { PosRoute } from '../features/auth/PosRoute'
import { LoginPage } from '../features/auth/LoginPage'
import { AppShell } from '../layouts/AppShell'
import { CreditMonitoringPage } from '../pages/CreditMonitoringPage'
import { CustomerManagementPage } from '../pages/CustomerManagementPage'
import { DashboardPage } from '../pages/DashboardPage'
import { CashierHomePage } from '../pages/CashierHomePage'
import { EmployeesPage } from '../pages/EmployeesPage'
import { ItemsPage } from '../pages/ItemsPage'
import { MonthlyEndInventoryPage } from '../pages/MonthlyEndInventoryPage'
import { ItemDeliveriesPage } from '../pages/ItemDeliveriesPage'
import { OrdersPage } from '../pages/OrdersPage'
import { OrTransactionsPage } from '../pages/OrTransactionsPage'
import { PricesPage } from '../pages/PricesPage'
import { SaleRemittancesPage } from '../pages/SaleRemittancesPage'
import { SalesReportPage } from '../pages/SalesReportPage'
import { PrivilegesPage } from '../pages/PrivilegesPage'
import { PrivilegeAssignmentsPage } from '../pages/PrivilegeAssignmentsPage'
import { StationsPage } from '../pages/StationsPage'
import { StationInventoryPage } from '../pages/StationInventoryPage'
import { SpoilagesPage } from '../pages/SpoilagesPage'
import { TransactionsPage } from '../pages/TransactionsPage'
import { TaxConfigurationPage } from '../pages/TaxConfigurationPage'

export const appRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <RoleLanding /> },
          {
            element: <RoleRoute allowedRoles={['admin']} />,
            children: [
              { path: 'dashboard', element: <DashboardPage /> },
              { path: 'employees', element: <EmployeesPage /> },
              { path: 'items', element: <ItemsPage /> },
              { path: 'monthly-end-inventory', element: <MonthlyEndInventoryPage /> },
              { path: 'prices', element: <PricesPage /> },
              { path: 'tax-configuration', element: <TaxConfigurationPage /> },
              { path: 'privilege', element: <PrivilegesPage /> },
              { path: 'privilege-assignment', element: <PrivilegeAssignmentsPage /> },
              { path: 'sale-remittance', element: <SaleRemittancesPage /> },
              { path: 'sales-report', element: <SalesReportPage /> },
              { path: 'or-transactions', element: <OrTransactionsPage /> },
              { path: 'stations', element: <StationsPage /> },
              { path: 'station-inventory', element: <StationInventoryPage /> },
              { path: 'item-deliveries', element: <ItemDeliveriesPage /> },
              { path: 'spoilages', element: <SpoilagesPage /> },
              { path: 'credit-monitoring', element: <CreditMonitoringPage /> },
              { path: 'customer-management', element: <CustomerManagementPage /> }
            ]
          },
          { path: 'cashier-home', element: <CashierHomePage /> },
          { element: <PosRoute />, children: [{ path: 'orders', element: <OrdersPage /> }] },
          { path: 'transactions', element: <TransactionsPage /> },
          { path: '*', element: <RoleLanding /> }
        ]
      }
    ]
  }
]

function RoleLanding() {
  const { currentUser } = useAuth()
  return <Navigate to={currentUser?.role === 'admin' ? '/dashboard' : '/cashier-home'} replace />
}
