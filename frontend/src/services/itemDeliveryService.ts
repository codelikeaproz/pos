import { apiRequest } from './apiClient'
import type { DeliveryList, DeliveryOptions, ItemDelivery } from '../types/itemDelivery'

export async function loadDeliveries(search: string, stationId: string, page: number, perPage: number, signal?: AbortSignal): Promise<DeliveryList> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  if (search) params.set('search', search)
  if (stationId) params.set('station_id', stationId)
  const result = await apiRequest<{ data: ItemDelivery[]; meta: { current_page: number; last_page: number; total: number } }>(`/api/item-deliveries?${params}`, { signal })
  return { deliveries: result.data, currentPage: result.meta.current_page, lastPage: result.meta.last_page, total: result.meta.total }
}

export async function loadDeliveryOptions(stationId: string, search: string, signal?: AbortSignal): Promise<DeliveryOptions> {
  const params = new URLSearchParams()
  if (stationId) params.set('station_id', stationId)
  if (search) params.set('item_search', search)
  return apiRequest(`/api/item-delivery-options?${params}`, { signal })
}

export async function loadDelivery(id: number): Promise<ItemDelivery> {
  const result = await apiRequest<{ delivery: ItemDelivery }>(`/api/item-deliveries/${id}`)
  return result.delivery
}

export async function createDelivery(stationId: number, receivedById: number, items: Array<{ itemId: number; quantity: string }>): Promise<ItemDelivery> {
  const result = await apiRequest<{ delivery: ItemDelivery }>('/api/item-deliveries', { method: 'POST', body: { stationId, receivedById, items } })
  return result.delivery
}
