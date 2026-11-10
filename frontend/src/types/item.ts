export type Item = {
  id: number
  item_code: string
  name: string
  units_backup: string
  unit: string
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
  usedUnits: string[]
}

/** Merge default and saved unit labels with case-insensitive dedupe (first-seen casing wins). */
export function mergeUnitSuggestions(...groups: readonly (readonly string[])[]): string[] {
  const seen = new Set<string>()
  const merged: string[] = []

  for (const group of groups) {
    for (const value of group) {
      const trimmed = value.trim()
      if (!trimmed) continue
      const key = trimmed.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      merged.push(trimmed)
    }
  }

  return merged.sort((left, right) => left.localeCompare(right, undefined, { sensitivity: 'base' }))
}
