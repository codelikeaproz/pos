import { apiRequest } from './apiClient'
import type { OrderDetail, OrderHistoryList, OrderHistoryRow } from '../types/order'

export type OrderFilters = { search: string; fromDate: string; toDate: string; stationId: string; customerSort?: 'asc' | 'desc' | ''; page: number }

function query(filters: OrderFilters): URLSearchParams {
  const params = new URLSearchParams({ page: String(filters.page) })
  if (filters.search) params.set('search', filters.search)
  if (filters.fromDate) params.set('from_date', filters.fromDate)
  if (filters.toDate) params.set('to_date', filters.toDate)
  if (filters.stationId) params.set('station_id', filters.stationId)
  if (filters.customerSort) params.set('customer_sort', filters.customerSort)
  return params
}

async function loadHistory(endpoint: string, filters: OrderFilters, signal?: AbortSignal): Promise<OrderHistoryList> {
  const response = await apiRequest<{ data: OrderHistoryRow[]; meta: { current_page: number; last_page: number; total: number } }>(`${endpoint}?${query(filters)}`, { signal })
  return { orders: response.data, currentPage: response.meta.current_page, lastPage: response.meta.last_page, total: response.meta.total }
}

export function loadOrderHistory(filters: OrderFilters, signal?: AbortSignal): Promise<OrderHistoryList> {
  return loadHistory('/api/orders', filters, signal)
}

export function loadOrTransactions(filters: OrderFilters, signal?: AbortSignal): Promise<OrderHistoryList> {
  return loadHistory('/api/or-transactions', filters, signal)
}

export function loadPosOrTransactions(filters: OrderFilters, signal?: AbortSignal): Promise<OrderHistoryList> {
  return loadHistory('/api/pos/or-transactions', filters, signal)
}

export async function loadOrderDetail(orderId: number, signal?: AbortSignal): Promise<OrderDetail> {
  return (await apiRequest<{ order: OrderDetail }>(`/api/orders/${orderId}`, { signal })).order
}

export async function loadOrTransactionDetail(orderId: number, signal?: AbortSignal): Promise<OrderDetail> {
  return (await apiRequest<{ order: OrderDetail }>(`/api/or-transactions/${orderId}`, { signal })).order
}

export async function loadPosOrTransactionDetail(orderId: number, signal?: AbortSignal): Promise<OrderDetail> {
  return (await apiRequest<{ order: OrderDetail }>(`/api/pos/or-transactions/${orderId}`, { signal })).order
}
