export type CreditOrder = {
  id: number
  orderNumber: string
  orNumber: string | null
  orderedAt: string
  customer: { id: number; name: string; employeeNumber: string | null } | null
  paymentMethod: 'credit'
  station: { id: number; name: string }
  cashier: { id: number; name: string }
  totalAmount: string
  totalPaid: string
  outstandingBalance: string
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID'
  ageDays: number
  payments?: Array<{ id: number; paymentNumber: string; amount: string; paidAt: string; description: string | null; recordedBy: { id: number; name: string } }>
}
export type CreditMonitoringList = {
  orders: CreditOrder[]
  currentPage: number
  lastPage: number
  total: number
  totalOutstanding: string
}
