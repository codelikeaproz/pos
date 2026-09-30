export type CreditOrder = {
  id: number
  orderNumber: string
  orderedAt: string
  customer: { id: number; name: string } | null
  paymentMethod: 'credit'
  station: { id: number; name: string }
  cashier: { id: number; name: string }
  totalAmount: string
  ageDays: number
}
export type CreditMonitoringList = {
  orders: CreditOrder[]
  currentPage: number
  lastPage: number
  total: number
  totalAmount: string
}
