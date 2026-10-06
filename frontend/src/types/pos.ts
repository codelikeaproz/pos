export type PosStation = { id: number; name: string }

export type PosItem = {
  id: number
  item_code: string
  name: string
  unit: string
  price: string
  available_quantity: string
  is_low_stock: boolean
}

export type PosItemList = {
  items: PosItem[]
  station: PosStation
  currentPage: number
  lastPage: number
  total: number
}

export type PosStationInventoryRow = {
  itemId: number
  itemCode: string
  name: string
  unit: string
  quantity: string
  currentQuantity: string
  recordedDeliveredQuantity: string
  recordedSoldQuantity: string
  recordedSpoilageQuantity: string
  isActive: boolean
  isLowStock: boolean
}

export type PosStationInventoryList = {
  items: PosStationInventoryRow[]
  station: PosStation
  currentPage: number
  lastPage: number
  total: number
}

export type CartItem = {
  itemId: number
  itemCode: string
  name: string
  unit: string
  unitPrice: string
  quantity: string
  availableQuantity: string
}

export type CheckoutOrder = {
  id: number
  orderNumber: string
  orderedAt: string
  station: PosStation
  cashier: { id: number; name: string }
  paymentMethod: 'cash' | 'credit'
  customer: { id: number; name: string; address: string } | null
  customerCount: number | null
  seniorCount: number | null
  subtotalAmount: string
  discountAmount: string
  totalAmount: string
  cashReceived: string | null
  changeAmount: string | null
  items: Array<{ itemId: number; itemCode: string; itemName: string; unit: string; quantity: string; unitPrice: string; subtotal: string }>
}

export type SeniorDiscount = { customerCount: number; seniorCount: number }
