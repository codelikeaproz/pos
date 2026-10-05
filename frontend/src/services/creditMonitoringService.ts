import { apiRequest } from './apiClient'
import type { CreditMonitoringList, CreditOrder } from '../types/creditMonitoring'

export async function loadCreditMonitoring(search: string, fromDate: string, toDate: string, customerSort: 'asc' | 'desc' | '', page: number, signal?: AbortSignal): Promise<CreditMonitoringList> {
  const params = new URLSearchParams({ page: String(page) })
  if (search) params.set('search', search)
  if (fromDate) params.set('from_date', fromDate)
  if (toDate) params.set('to_date', toDate)
  if (customerSort) params.set('customer_sort', customerSort)
  const response = await apiRequest<{ data: CreditOrder[]; meta: { current_page: number; last_page: number; total: number }; totalAmount: string }>(`/api/credit-monitoring?${params}`, { signal })
  return { orders: response.data, currentPage: response.meta.current_page, lastPage: response.meta.last_page, total: response.meta.total, totalAmount: response.totalAmount }
}
