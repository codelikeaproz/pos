export type OrderParty = { id: number; name: string }
export type OrderHistoryRow = { id: number; orderNumber: string; orderedAt: string; station: OrderParty; cashier: OrderParty; customer: OrderParty | null; paymentMethod: string; discountAmount: string; totalAmount: string; remittedAt: string | null }
export type OrderHistoryList = { orders: OrderHistoryRow[]; currentPage: number; lastPage: number; total: number }
export type OrderDetail = OrderHistoryRow & {
  customer: OrderParty | null
  customerCount: number | null
  seniorCount: number | null
  subtotalAmount: string
  discountAmount: string
  taxStatusSnapshot: 'NON_VAT' | 'VAT_REGISTERED' | null
  vatRateSnapshot: string | null
  vatExemptSales: string | null
  cashReceived: string | null
  changeAmount: string | null
  items: Array<{ itemId: number; itemCode: string; itemName: string; unit: string; quantity: string; unitPrice: string; subtotal: string }>
}
