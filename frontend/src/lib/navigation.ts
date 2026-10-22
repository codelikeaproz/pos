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
  group: NavGroupKey
}

export type NavGroupKey = 'main' | 'inventory' | 'sales' | 'reports' | 'administration'

export const navGroupLabels: Record<NavGroupKey, string> = {
  main: 'Main',
  inventory: 'Inventory & Products',
  sales: 'Sales & Transactions',
  reports: 'Reports',
  administration: 'Administration'
}

const navGroupOrder: NavGroupKey[] = ['main', 'inventory', 'sales', 'reports', 'administration']

export const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: AppIcons.dashboard, title: 'Dashboard', description: 'Admin operational monitoring.', allowedRoles: ['admin'], group: 'main' },
  { path: '/orders', label: 'POS', icon: AppIcons.orders, title: 'POS', description: 'Build sales using inventory from the assigned Station.', allowedRoles: ['admin', 'end_user'], group: 'main' },
  { path: '/items', label: 'Product Management', icon: AppIcons.items, title: 'Product Management', description: 'Manage product and food definitions.', allowedRoles: ['admin'], group: 'inventory' },
  { path: '/station-inventory', label: 'Station Inventory', icon: AppIcons.stationInventory, title: 'Station Inventory', description: 'Manage Station item quantities.', allowedRoles: ['admin'], group: 'inventory' },
  { path: '/prices', label: 'Price', icon: AppIcons.price, title: 'Price', description: 'Manage price history and the current selling price.', allowedRoles: ['admin'], group: 'inventory' },
  { path: '/item-deliveries', label: 'Item Delivery', icon: AppIcons.itemDelivery, title: 'Item Delivery', description: 'Deliver items to Stations and review history.', allowedRoles: ['admin'], group: 'inventory' },
  { path: '/spoilages', label: 'Spoilage', icon: AppIcons.warning, title: 'Spoilage Management', description: 'Record Station spoilage.', allowedRoles: ['admin'], group: 'inventory' },
  { path: '/credit-monitoring', label: 'Credit Monitoring', icon: AppIcons.creditMonitoring, title: 'Credit Monitoring', description: 'View recorded Utang transactions.', allowedRoles: ['admin'], group: 'sales' },
  { path: '/or-transactions', label: 'O.R Transactions', icon: AppIcons.officialReceipt, title: 'O.R Transactions', description: 'View completed POS Orders.', allowedRoles: ['admin'], group: 'sales' },
  { path: '/sale-remittance', label: 'Sale Remittance', icon: AppIcons.payment, title: 'Sale Remittance', description: 'Record completed Cash sales as remitted.', allowedRoles: ['admin'], group: 'sales' },
  { path: '/sales-report', label: 'Sales Report', icon: AppIcons.transactions, title: 'Sales Report', description: 'Review historical sales and transaction activity.', allowedRoles: ['admin'], group: 'reports' },
  { path: '/monthly-end-inventory', label: 'Monthly End Inventory', icon: AppIcons.stationInventory, title: 'Monthly End Inventory', description: 'Record monthly physical inventory counts.', allowedRoles: ['admin'], group: 'reports' },
  { path: '/stations', label: 'Stations', icon: AppIcons.station, title: 'Stations', description: 'Manage POS locations and Stations.', allowedRoles: ['admin'], group: 'administration' },
  { path: '/customer-management', label: 'Customer Management', icon: AppIcons.customerManagement, title: 'Customer Management', description: 'Browse and add Customers.', allowedRoles: ['admin'], group: 'administration' },
  { path: '/privilege-assignment', label: 'Privilege Assignment', icon: AppIcons.privilegeAssignment, title: 'Privilege Assignment', description: 'Assign business classifications to Users.', allowedRoles: ['admin'], group: 'administration' },
  { path: '/privilege', label: 'Privilege', icon: AppIcons.privilege, title: 'Privilege', description: 'Manage business classifications.', allowedRoles: ['admin'], group: 'administration' },
  { path: '/tax-configuration', label: 'Tax Configuration', icon: AppIcons.settings, title: 'Tax Configuration', description: 'Manage the Non-VAT status and reference VAT rate.', allowedRoles: ['admin'], group: 'administration' },
  { path: '/employees', label: 'User Management', icon: AppIcons.employee, title: 'User Management', description: 'Manage users and their access roles.', allowedRoles: ['admin'], group: 'administration' }
]

// Existing pages stay routable without adding entries to the confirmed sidebar.
const otherPages: NavItem[] = [
  { path: '/cashier-home', label: 'Cashier Home', icon: AppIcons.orders, title: 'Cashier Home', description: 'Open POS.', allowedRoles: ['end_user'], group: 'main' },
  { path: '/transactions', label: 'Transactions', icon: AppIcons.transactions, title: 'Transaction History', description: 'View completed sales.', allowedRoles: ['admin', 'end_user'], group: 'sales' }
]

export function getNavGroupsForRole(role: UserRole): { key: NavGroupKey; label: string; items: NavItem[] }[] {
  return navGroupOrder.map((key) => ({ key, label: navGroupLabels[key], items: navItems.filter((item) => item.group === key && item.allowedRoles.includes(role)) })).filter((group) => group.items.length > 0)
}

export function getNavItemByPath(pathname: string): NavItem {
  return [...navItems, ...otherPages].find((item) => item.path === pathname) ?? navItems[0]
}
