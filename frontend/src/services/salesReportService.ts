import { apiRequest } from './apiClient'
import type { OrderDetail } from '../types/order'
import type { SalesReportData, SalesReportPeriod } from '../types/salesReport'

export type SalesReportFilters = { period: SalesReportPeriod; from: string; to: string; stationId: string; paymentMethod: string; search: string; page: number; perPage: number }

export function loadSalesReport(filters: SalesReportFilters, signal?: AbortSignal): Promise<SalesReportData> {
  const params = new URLSearchParams({ period: filters.period, page: String(filters.page), per_page: String(filters.perPage) })
  if (filters.period === 'custom') { params.set('from', filters.from); params.set('to', filters.to) }
  if (filters.stationId) params.set('station_id', filters.stationId)
  if (filters.paymentMethod) params.set('payment_method', filters.paymentMethod)
  if (filters.search) params.set('search', filters.search)
  return apiRequest(`/api/reports/sales?${params}`, { signal })
}

export async function loadSalesReportDetail(orderId: number, signal?: AbortSignal): Promise<OrderDetail> {
  return (await apiRequest<{ order: OrderDetail }>(`/api/reports/sales/${orderId}`, { signal })).order
}
