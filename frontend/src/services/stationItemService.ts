import type { StationInventoryList, StationItem, StationItemOptions } from '../types/stationItem'
import { apiRequest } from './apiClient'

type PageResponse = { data: StationItem[]; meta: { current_page: number; last_page: number; total: number } }

export async function loadStationInventory(stationId: number, search: string, page: number, signal?: AbortSignal): Promise<StationInventoryList> {
  const params = new URLSearchParams({ station_id: String(stationId), page: String(page) })
  if (search) params.set('search', search)
  const response = await apiRequest<PageResponse>(`/api/station-items?${params}`, { signal })
  return { stationItems: response.data, currentPage: response.meta.current_page, lastPage: response.meta.last_page, total: response.meta.total }
}

export function loadStationItemOptions(itemSearch = '', signal?: AbortSignal): Promise<StationItemOptions> {
  const params = new URLSearchParams()
  if (itemSearch) params.set('item_search', itemSearch)
  return apiRequest(`/api/station-item-options?${params}`, { signal })
}

export function assignItemToStation(stationId: number, itemId: number, quantity: string) {
  return apiRequest<{ message: string; station_item: StationItem }>('/api/station-items', { method: 'POST', body: { station_id: stationId, item_id: itemId, quantity } })
}
export function updateStationQuantity(id: number, quantity: string) {
  return apiRequest<{ message: string; station_item: StationItem }>(`/api/station-items/${id}`, { method: 'PUT', body: { quantity } })
}
export function removeItemFromStation(id: number) { return apiRequest<{ message: string }>(`/api/station-items/${id}`, { method: 'DELETE' }) }
