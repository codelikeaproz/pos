import { AppIcons } from '../lib/icons'
import type { LucideIcon } from 'lucide-react'
import type { UserRole } from '../types/auth'

export type NavItem = {
  path: string
  label: string
  icon: LucideIcon
  title: string
  description: string
  allowedRoles: UserRole[]
  comingSoon?: boolean
}

// The visible Admin order and names follow the confirmed legacy sidebar.
export const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: AppIcons.dashboard, title: 'Dashboard', description: 'Application overview and quick access.', allowedRoles: ['admin', 'end_user'] },
  { path: '/orders', label: 'POS', icon: AppIcons.orders, title: 'POS', description: 'Build sales using inventory from the assigned Station.', allowedRoles: ['admin', 'end_user'] },
  { path: '/items', label: 'Product Management', icon: AppIcons.items, title: 'Product Management', description: 'Manage product and food definitions.', allowedRoles: ['admin'] },
  { path: '/station-inventory', label: 'Station Inventory', icon: AppIcons.stationInventory, title: 'Station Inventory', description: 'Manage Station item quantities.', allowedRoles: ['admin'] },
  { path: '/credit-monitoring', label: 'Credit Monitoring', icon: AppIcons.creditMonitoring, title: 'Credit Monitoring', description: 'View recorded Utang transactions.', allowedRoles: ['admin'] },
  { path: '/or-transactions', label: 'O.R Transactions', icon: AppIcons.officialReceipt, title: 'O.R Transactions', description: 'View completed POS Orders.', allowedRoles: ['admin'] },
  { path: '/stations', label: 'Stations', icon: AppIcons.station, title: 'Stations', description: 'Manage POS locations and Stations.', allowedRoles: ['admin'] },
  { path: '/privilege-assignment', label: 'Privilege Assignment', icon: AppIcons.privilegeAssignment, title: 'Privilege Assignment', description: 'Assign business classifications to Users.', allowedRoles: ['admin'] },
  { path: '/customer-management', label: 'Customer Management', icon: AppIcons.customerManagement, title: 'Customer Management', description: 'Browse and add Customers.', allowedRoles: ['admin'] },
  { path: '/privilege', label: 'Privilege', icon: AppIcons.privilege, title: 'Privilege', description: 'Manage business classifications.', allowedRoles: ['admin'] },
  { path: '/prices', label: 'Price', icon: AppIcons.price, title: 'Price', description: 'Manage price history and the current selling price.', allowedRoles: ['admin'] },
  { path: '/sale-remittance', label: 'Sale Remittance', icon: AppIcons.payment, title: 'Sale Remittance', description: 'Record completed Cash sales as remitted.', allowedRoles: ['admin'] },
  { path: '/item-deliveries', label: 'Item Delivery', icon: AppIcons.itemDelivery, title: 'Item Delivery', description: 'Deliver items to Stations and review history.', allowedRoles: ['admin'] },
  { path: '/employees', label: 'User Management', icon: AppIcons.employee, title: 'User Management', description: 'Manage users and their access roles.', allowedRoles: ['admin'] }
]

// Existing pages stay routable without adding entries to the confirmed sidebar.
const otherPages: NavItem[] = [
  { path: '/spoilages', label: 'Spoilage', icon: AppIcons.warning, title: 'Spoilage Management', description: 'Record Station spoilage.', allowedRoles: ['admin'] },
  { path: '/transactions', label: 'Transactions', icon: AppIcons.transactions, title: 'Transaction History', description: 'View completed sales.', allowedRoles: ['admin', 'end_user'] }
]

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return navItems.filter((item) => item.allowedRoles.includes(role))
}

export function getNavItemByPath(pathname: string): NavItem {
  return [...navItems, ...otherPages].find((item) => item.path === pathname) ?? navItems[0]
}
