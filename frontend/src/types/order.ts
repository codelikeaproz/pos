export type OrderParty = { id: number; name: string }
export type OrderHistoryRow = { id: number; orderNumber: string; orderedAt: string; station: OrderParty; cashier: OrderParty; paymentMethod: string; totalAmount: string }
export type OrderHistoryList = { orders: OrderHistoryRow[]; currentPage: number; lastPage: number; total: number }
export type OrderDetail = OrderHistoryRow & {
  customer: OrderParty | null
  cashReceived: string | null
  changeAmount: string | null
  items: Array<{ itemId: number; itemCode: string; itemName: string; unit: string; quantity: string; unitPrice: string; subtotal: string }>
}
