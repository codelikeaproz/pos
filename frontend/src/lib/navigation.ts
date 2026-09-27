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
    title: 'Items Management',
    description: 'Manage inventory items, prices, and stock. CRUD comes in a later phase.',
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
    path: '/orders',
    label: 'Orders / POS',
    icon: AppIcons.orders,
    title: 'Orders / POS',
    description: 'Point of sale access. The POS workflow comes in a later phase.',
    allowedRoles: ['admin', 'end_user']
  },
  {
    path: '/consignees',
    label: 'Consignee',
    icon: AppIcons.consignee,
    title: 'Consignee Management',
    description: 'Manage consignees. Business rules will be confirmed later.',
    allowedRoles: ['admin']
  },
  {
    path: '/consignments',
    label: 'Consignment',
    icon: AppIcons.consignment,
    title: 'Consignment Management',
    description: 'Manage consignments. Exact rules are not finalized yet.',
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
