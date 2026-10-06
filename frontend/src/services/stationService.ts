import type { Station, StationInput, StationList } from '../types/station'
import { apiRequest } from './apiClient'

type PaginatedStationsResponse = {
  data: Station[]
  meta: { current_page: number; last_page: number; total: number }
}

type StationResponse = { message: string; station: Station }
type DeleteStationResponse = { message: string }

export async function loadStations(
  search: string,
  page: number,
  perPage: number,
  signal?: AbortSignal
): Promise<StationList> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  if (search.trim()) params.set('search', search.trim())

  const response = await apiRequest<PaginatedStationsResponse>(
    `/api/stations?${params.toString()}`,
    { signal }
  )

  return {
    stations: response.data,
    currentPage: response.meta.current_page,
    lastPage: response.meta.last_page,
    total: response.meta.total
  }
}

export function createStation(input: StationInput): Promise<StationResponse> {
  return apiRequest<StationResponse>('/api/stations', { method: 'POST', body: input })
}

export function updateStation(
  stationId: number,
  input: StationInput
): Promise<StationResponse> {
  return apiRequest<StationResponse>(`/api/stations/${stationId}`, {
    method: 'PUT',
    body: input
  })
}

export function deleteStation(stationId: number): Promise<DeleteStationResponse> {
  return apiRequest<DeleteStationResponse>(`/api/stations/${stationId}`, {
    method: 'DELETE'
  })
}
