import type { OrderHistoryRow, OrderParty } from './order'

export type SalesReportPeriod = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom'
export type SalesReportData = {
  filters: { period: SalesReportPeriod; from: string; to: string }
  stations: OrderParty[]
  summary: { totalSales: string; transactions: number; cashSales: string; creditSales: string; seniorDiscounts: string }
  orders: { data: OrderHistoryRow[]; meta: { current_page: number; last_page: number; total: number } }
}
