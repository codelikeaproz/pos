import { apiRequest } from './apiClient'
import type { OrderDetail, OrderHistoryList, OrderHistoryRow } from '../types/order'

type Filters = { search: string; fromDate: string; toDate: string; stationId: string; page: number }

export async function loadOrderHistory(filters: Filters, signal?: AbortSignal): Promise<OrderHistoryList> {
  const params = new URLSearchParams({ page: String(filters.page) })
  if (filters.search) params.set('search', filters.search)
  if (filters.fromDate) params.set('from_date', filters.fromDate)
  if (filters.toDate) params.set('to_date', filters.toDate)
  if (filters.stationId) params.set('station_id', filters.stationId)
  const response = await apiRequest<{ data: OrderHistoryRow[]; meta: { current_page: number; last_page: number; total: number } }>(`/api/orders?${params}`, { signal })
  return { orders: response.data, currentPage: response.meta.current_page, lastPage: response.meta.last_page, total: response.meta.total }
}

export async function loadOrderDetail(orderId: number, signal?: AbortSignal): Promise<OrderDetail> {
  return (await apiRequest<{ order: OrderDetail }>(`/api/orders/${orderId}`, { signal })).order
}
