export type Item = {
  id: number
  item_code: string
  name: string
  quantity: string
  units_backup: string
  unit: string
  reorder_point: string
  price: string | null
  is_active: boolean
}

export const ITEM_UNITS = ['pcs', 'pack', 'box', 'bottle', 'can', 'cup', 'serving', 'kg', 'g', 'L', 'mL'] as const

export type ItemInput = Omit<Item, 'id' | 'price'> & { price?: string }

export type ItemList = {
  items: Item[]
  currentPage: number
  lastPage: number
  total: number
}
