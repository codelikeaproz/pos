export type InventoryOption = { id: number; name: string }
export type InventoryItemOption = { id: number; item_code: string; name: string; units_backup: string; unit: string; reorder_point: string }
export type StationItem = {
  id: number
  quantity: string
  is_low_stock: boolean
  station: InventoryOption
  item: InventoryItemOption
}
export type StationInventoryList = { stationItems: StationItem[]; currentPage: number; lastPage: number; total: number }
export type StationItemOptions = { stations: InventoryOption[]; items: InventoryItemOption[] }
