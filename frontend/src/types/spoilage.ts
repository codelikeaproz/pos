export type SpoilageItem = { id: number; itemId: number; itemCode: string; itemName: string; unit: string; quantity: string }
export type Spoilage = {
  id: number
  spoilageNumber: string
  station: { id: number; name: string }
  recordedBy: { id: number; name: string }
  reason: string | null
  spoiledAt: string
  itemCount: number
  items?: SpoilageItem[]
}
export type SpoilageList = { spoilages: Spoilage[]; currentPage: number; lastPage: number; total: number }
export type SpoilageOption = { id: number; itemCode: string; name: string; unit: string; available: string }
export type SpoilageOptions = { stations: Array<{ id: number; name: string }>; items: SpoilageOption[] }
