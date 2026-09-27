export type PosStation = { id: number; name: string }

export type PosItem = {
  id: number
  item_code: string
  name: string
  unit: string
  price: string
  available_quantity: string
}

export type PosItemList = {
  items: PosItem[]
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
  paymentMethod: 'cash'
  totalAmount: string
  cashReceived: string
  changeAmount: string
  items: Array<{ itemId: number; itemCode: string; itemName: string; unit: string; quantity: string; unitPrice: string; subtotal: string }>
}
