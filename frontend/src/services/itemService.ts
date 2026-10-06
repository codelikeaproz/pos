import type { Item, ItemInput, ItemList } from '../types/item'
import { apiRequest } from './apiClient'

type PaginatedItemsResponse = {
  data: Item[]
  meta: { current_page: number; last_page: number; total: number }
}

type ItemResponse = { message: string; item: Item }

export async function loadItems(search: string, page: number, perPage: number, signal?: AbortSignal): Promise<ItemList> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  if (search.trim()) params.set('search', search.trim())
  const response = await apiRequest<PaginatedItemsResponse>(`/api/items?${params.toString()}`, { signal })
  return { items: response.data, currentPage: response.meta.current_page, lastPage: response.meta.last_page, total: response.meta.total }
}

export function createItem(input: ItemInput): Promise<ItemResponse> {
  return apiRequest('/api/items', { method: 'POST', body: input })
}

export function updateItem(id: number, input: ItemInput): Promise<ItemResponse> {
  return apiRequest(`/api/items/${id}`, { method: 'PUT', body: input })
}

export function deleteItem(id: number): Promise<{ message: string }> {
  return apiRequest(`/api/items/${id}`, { method: 'DELETE' })
}
