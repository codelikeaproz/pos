import { AppIcons } from '../lib/icons'
import type { LucideIcon } from 'lucide-react'

export type NavItem = {
  path: string
  label: string
  icon: LucideIcon
  title: string
  description: string
}

export const navItems: NavItem[] = [
  {
    path: '/',
    label: 'Dashboard',
    icon: AppIcons.dashboard,
    title: 'Dashboard',
    description: 'Application overview and foundation preview.'
  },
  {
    path: '/employees',
    label: 'Employee',
    icon: AppIcons.employee,
    title: 'Employee Management',
    description: 'Manage employees and station assignments. CRUD comes in a later phase.'
  },
  {
    path: '/items',
    label: 'Items',
    icon: AppIcons.items,
    title: 'Items Management',
    description: 'Manage inventory items, prices, and stock. CRUD comes in a later phase.'
  },
  {
    path: '/stations',
    label: 'Station',
    icon: AppIcons.station,
    title: 'Station Management',
    description: 'Manage sales stations and locations. CRUD comes in a later phase.'
  },
  {
    path: '/orders',
    label: 'Orders',
    icon: AppIcons.orders,
    title: 'Orders / POS',
    description: 'Point of sale and transaction history. POS workflow comes later.'
  },
  {
    path: '/consignees',
    label: 'Consignee',
    icon: AppIcons.consignee,
    title: 'Consignee Management',
    description: 'Manage consignees. Business rules will be confirmed later.'
  },
  {
    path: '/consignments',
    label: 'Consignment',
    icon: AppIcons.consignment,
    title: 'Consignment Management',
    description: 'Manage consignments. Exact rules are not finalized yet.'
  },
  {
    path: '/suppliers',
    label: 'Supplier',
    icon: AppIcons.supplier,
    title: 'Supplier Management',
    description: 'Manage suppliers. CRUD comes in a later phase.'
  }
]

export function getNavItemByPath(pathname: string): NavItem {
  const exact = navItems.find((item) => item.path === pathname)
  if (exact) {
    return exact
  }
  return navItems[0]
}
