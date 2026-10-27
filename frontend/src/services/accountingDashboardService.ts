import { apiRequest } from './apiClient'

export type AccountingSummary = {
  totalCreditSales: string
  unpaidCredit: string
  partiallyPaidCredit: string
  paidCredit: number
  collectionsToday: string
  collectionsThisMonth: string
  totalCustomers: number
  customersWithOutstandingBalance: number
}

export function loadAccountingDashboard(signal?: AbortSignal): Promise<{ summary: AccountingSummary }> {
  return apiRequest('/api/accounting-dashboard', { signal })
}
