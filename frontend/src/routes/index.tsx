import { Navigate, RouteObject } from 'react-router-dom'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'
import { RoleRoute } from '../features/auth/RoleRoute'
import { LoginPage } from '../features/auth/LoginPage'
import { AppShell } from '../layouts/AppShell'
import { ConsigneesPage } from '../pages/ConsigneesPage'
import { ConsignmentsPage } from '../pages/ConsignmentsPage'
import { CreditMonitoringPage } from '../pages/CreditMonitoringPage'
import { CustomerManagementPage } from '../pages/CustomerManagementPage'
import { DashboardPage } from '../pages/DashboardPage'
import { EmployeesPage } from '../pages/EmployeesPage'
import { ItemsPage } from '../pages/ItemsPage'
import { ItemDeliveriesPage } from '../pages/ItemDeliveriesPage'
import { OrdersPage } from '../pages/OrdersPage'
import { PricesPage } from '../pages/PricesPage'
import { StationsPage } from '../pages/StationsPage'
import { StationInventoryPage } from '../pages/StationInventoryPage'
import { SpoilagesPage } from '../pages/SpoilagesPage'
import { SuppliersPage } from '../pages/SuppliersPage'
import { TransactionsPage } from '../pages/TransactionsPage'

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
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          {
            element: <RoleRoute allowedRoles={['admin']} />,
            children: [
              { path: 'employees', element: <EmployeesPage /> },
              { path: 'items', element: <ItemsPage /> },
              { path: 'prices', element: <PricesPage /> },
              { path: 'stations', element: <StationsPage /> },
              { path: 'station-inventory', element: <StationInventoryPage /> },
              { path: 'item-deliveries', element: <ItemDeliveriesPage /> },
              { path: 'spoilages', element: <SpoilagesPage /> },
              { path: 'credit-monitoring', element: <CreditMonitoringPage /> },
              { path: 'customer-management', element: <CustomerManagementPage /> },
              { path: 'consignees', element: <ConsigneesPage /> },
              { path: 'consignments', element: <ConsignmentsPage /> },
              { path: 'suppliers', element: <SuppliersPage /> }
            ]
          },
          { path: 'orders', element: <OrdersPage /> },
          { path: 'transactions', element: <TransactionsPage /> },
          { path: '*', element: <Navigate to="/dashboard" replace /> }
        ]
      }
    ]
  }
]
