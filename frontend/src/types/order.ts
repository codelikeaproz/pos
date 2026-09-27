export type OrderParty = { id: number; name: string }
export type OrderHistoryRow = { id: number; orderNumber: string; orderedAt: string; station: OrderParty; cashier: OrderParty; paymentMethod: string; totalAmount: string }
export type OrderHistoryList = { orders: OrderHistoryRow[]; currentPage: number; lastPage: number; total: number }
export type OrderDetail = OrderHistoryRow & {
  cashReceived: string
  changeAmount: string
  items: Array<{ itemId: number; itemCode: string; itemName: string; unit: string; quantity: string; unitPrice: string; subtotal: string }>
}
