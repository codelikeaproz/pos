import { apiRequest } from './apiClient'
import type { OrderHistoryRow } from '../types/order'

export type DashboardData = {
  date: string
  stations: { id: number; name: string }[]
  summary: { sales: string; transactions: number; cash: string; credit: string; unremittedCash: string; lowStock: number; outOfStock: number }
  orders: { data: OrderHistoryRow[]; meta: { current_page: number; last_page: number; total: number } }
}

export function loadDashboard(filters: { stationId: string; paymentMethod: string; page: number; perPage: number }, signal?: AbortSignal): Promise<DashboardData> {
  const params = new URLSearchParams({ page: String(filters.page), per_page: String(filters.perPage) })
  if (filters.stationId) params.set('station_id', filters.stationId)
  if (filters.paymentMethod) params.set('payment_method', filters.paymentMethod)
  return apiRequest<DashboardData>(`/api/dashboard?${params}`, { signal })
}
