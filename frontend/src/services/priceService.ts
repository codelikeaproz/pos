import { apiRequest } from './apiClient'
import type { PriceItemOption, PriceList, PriceRecord } from '../types/price'

type PaginatedPrices = {
  data: PriceRecord[]
  meta: { current_page: number; last_page: number; total: number }
}

export async function loadPrices(search: string, page: number, signal?: AbortSignal): Promise<PriceList> {
  const params = new URLSearchParams({ page: String(page) })
  if (search) params.set('search', search)
  const result = await apiRequest<PaginatedPrices>(`/api/prices?${params}`, { signal })
  return { prices: result.data, currentPage: result.meta.current_page, lastPage: result.meta.last_page, total: result.meta.total }
}

export async function loadPriceItemOptions(search: string, signal?: AbortSignal): Promise<PriceItemOption[]> {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  const result = await apiRequest<{ items: PriceItemOption[] }>(`/api/price-item-options?${params}`, { signal })
  return result.items
}

export function addPrice(itemId: number, amount: string): Promise<{ message: string; price: PriceRecord }> {
  return apiRequest('/api/prices', { method: 'POST', body: { item_id: itemId, amount } })
}

export function activatePrice(id: number): Promise<{ message: string; price: PriceRecord }> {
  return apiRequest(`/api/prices/${id}/activate`, { method: 'POST' })
}
