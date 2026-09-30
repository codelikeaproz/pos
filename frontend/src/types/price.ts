export type PriceRecord = {
  id: number
  item: { id: number; itemCode: string; name: string }
  amount: string
  isActive: boolean
  createdAt: string | null
}

export type PriceList = {
  prices: PriceRecord[]
  currentPage: number
  lastPage: number
  total: number
}

export type PriceItemOption = { id: number; item_code: string; name: string }
