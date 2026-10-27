import { apiRequest } from './apiClient'
import type { CreditMonitoringList, CreditOrder } from '../types/creditMonitoring'

export async function loadCreditMonitoring(search: string, fromDate: string, toDate: string, customerSort: 'asc' | 'desc' | '', status: string, page: number, perPage: number, signal?: AbortSignal): Promise<CreditMonitoringList> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  if (search) params.set('search', search)
  if (fromDate) params.set('from_date', fromDate)
  if (toDate) params.set('to_date', toDate)
  if (customerSort) params.set('customer_sort', customerSort)
  if (status) params.set('status', status)
  const response = await apiRequest<{ data: CreditOrder[]; meta: { current_page: number; last_page: number; total: number }; totalOutstanding: string }>(`/api/credit-monitoring?${params}`, { signal })
  return { orders: response.data, currentPage: response.meta.current_page, lastPage: response.meta.last_page, total: response.meta.total, totalOutstanding: response.totalOutstanding }
}

export async function loadCreditOrder(id: number): Promise<CreditOrder> { return (await apiRequest<{ order: CreditOrder }>(`/api/credit-orders/${id}`)).order }
export async function recordCreditPayment(id: number, amount: string, paidAt: string, description: string): Promise<{ message: string; order: CreditOrder }> { return apiRequest(`/api/credit-orders/${id}/payments`, { method: 'POST', body: { amount, paid_at: paidAt, description: description || null } }) }
