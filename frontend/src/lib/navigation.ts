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
}

export const navItems: NavItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: AppIcons.dashboard,
    title: 'Dashboard',
    description: 'Application overview and quick access.',
    allowedRoles: ['admin', 'end_user']
  },
  {
    path: '/employees',
    label: 'Employee',
    icon: AppIcons.employee,
    title: 'Employee Management',
    description: 'Manage employees and their POS access roles.',
    allowedRoles: ['admin']
  },
  {
    path: '/items',
    label: 'Items',
    icon: AppIcons.items,
    title: 'Item Management',
    description: 'Manage product and food definitions.',
    allowedRoles: ['admin']
  },
  {
    path: '/prices',
    label: 'Prices',
    icon: AppIcons.items,
    title: 'Price Management',
    description: 'Manage current selling prices and price history.',
    allowedRoles: ['admin']
  },
  {
    path: '/stations',
    label: 'Station',
    icon: AppIcons.station,
    title: 'Station Management',
    description: 'Manage POS locations and business stations.',
    allowedRoles: ['admin']
  },
  {
    path: '/station-inventory',
    label: 'Station Inventory',
    icon: AppIcons.stationInventory,
    title: 'Station Inventory',
    description: 'Manage item quantities assigned to each Station.',
    allowedRoles: ['admin']
  },
  {
    path: '/orders',
    label: 'Orders / POS',
    icon: AppIcons.orders,
    title: 'Orders / POS',
    description: 'Build current orders using inventory from the assigned Station.',
    allowedRoles: ['admin', 'end_user']
  },
  {
    path: '/transactions',
    label: 'Transactions',
    icon: AppIcons.consignment,
    title: 'Transaction History',
    description: 'View completed sales and payment details.',
    allowedRoles: ['admin', 'end_user']
  },
  {
    path: '/consignees',
    label: 'Consignee',
    icon: AppIcons.consignee,
    title: 'Consignee Management',
    description: 'Manage consignee contact information for future consignment workflows.',
    allowedRoles: ['admin']
  },
  {
    path: '/consignments',
    label: 'Consignment',
    icon: AppIcons.consignment,
    title: 'Consignment Account Management',
    description: 'Manage accounts associated with Stations and Consignees.',
    allowedRoles: ['admin']
  },
  {
    path: '/suppliers',
    label: 'Supplier',
    icon: AppIcons.supplier,
    title: 'Supplier Management',
    description: 'Manage suppliers and their contact information.',
    allowedRoles: ['admin']
  }
]

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return navItems.filter((item) => item.allowedRoles.includes(role))
}

export function getNavItemByPath(pathname: string): NavItem {
  const exact = navItems.find((item) => item.path === pathname)
  if (exact) {
    return exact
  }
  return navItems[0]
}
