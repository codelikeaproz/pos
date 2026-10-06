import { apiRequest } from './apiClient'
import type { Spoilage, SpoilageList, SpoilageOptions } from '../types/spoilage'

export async function loadSpoilages(search: string, stationId: string, page: number, perPage: number, signal?: AbortSignal): Promise<SpoilageList> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  if (search) params.set('search', search)
  if (stationId) params.set('station_id', stationId)
  const result = await apiRequest<{ data: Spoilage[]; meta: { current_page: number; last_page: number; total: number } }>(`/api/spoilages?${params}`, { signal })
  return { spoilages: result.data, currentPage: result.meta.current_page, lastPage: result.meta.last_page, total: result.meta.total }
}

export function loadSpoilageOptions(stationId: string, search: string, signal?: AbortSignal): Promise<SpoilageOptions> {
  const params = new URLSearchParams()
  if (stationId) params.set('station_id', stationId)
  if (search) params.set('item_search', search)
  return apiRequest(`/api/spoilage-options?${params}`, { signal })
}

export async function loadSpoilage(id: number): Promise<Spoilage> {
  const response = await apiRequest<{ spoilage: Spoilage }>(`/api/spoilages/${id}`)
  return response.spoilage
}

export async function createSpoilage(stationId: number, incidentDate: string, reason: string, items: Array<{ itemId: number; quantity: string }>): Promise<Spoilage> {
  const response = await apiRequest<{ spoilage: Spoilage }>('/api/spoilages', { method: 'POST', body: { stationId, incidentDate, reason: reason.trim() || null, items } })
  return response.spoilage
}
