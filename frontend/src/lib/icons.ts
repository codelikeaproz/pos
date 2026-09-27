import {
  Archive,
  ArrowLeft,
  Banknote,
  Boxes,
  CircleCheck,
  CircleX,
  ClipboardList,
  Contact,
  Info,
  LayoutDashboard,
  LogOut,
  Package,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShoppingCart,
  Store,
  Trash2,
  TriangleAlert,
  Truck,
  Users,
  X,
  type LucideIcon
} from 'lucide-react'

export const iconStroke = 2
export const iconSize = 20
export const iconSizeNav = 20
export const iconSizeStatus = 24

export const AppIcons = {
  dashboard: LayoutDashboard,
  employee: Users,
  items: Package,
  station: Store,
  stationInventory: Boxes,
  orders: ShoppingCart,
  consignee: Contact,
  consignment: ClipboardList,
  supplier: Truck,
  search: Search,
  add: Plus,
  edit: Pencil,
  delete: Trash2,
  save: Save,
  logout: LogOut,
  settings: Settings,
  success: CircleCheck,
  warning: TriangleAlert,
  error: CircleX,
  info: Info,
  close: X,
  back: ArrowLeft,
  print: Printer,
  payment: Banknote,
  cashDrawer: Archive,
  refresh: RefreshCw
} as const satisfies Record<string, LucideIcon>

export type AppIconName = keyof typeof AppIcons
