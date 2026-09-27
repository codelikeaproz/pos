export type Item = {
  id: number
  item_code: string
  name: string
  description: string | null
  quantity: string
  unit: string
  price: string
}

export const ITEM_UNITS = ['pcs', 'pack', 'box', 'bottle', 'can', 'cup', 'serving', 'kg', 'g', 'L', 'mL'] as const

export type ItemInput = Omit<Item, 'id'>

export type ItemList = {
  items: Item[]
  currentPage: number
  lastPage: number
  total: number
}
