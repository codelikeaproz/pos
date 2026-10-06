import { apiRequest } from './apiClient'
import type { CartItem, CheckoutOrder, PosItem, PosItemList, PosStation, PosStationInventoryList, PosStationInventoryRow, SeniorDiscount } from '../types/pos'

type PosItemsResponse = {
  data: PosItem[]
  station: PosStation
  meta: { current_page: number; last_page: number; total: number }
}

export async function checkoutOrder(items: CartItem[], paymentMethod: 'cash' | 'credit', cashReceived: string, customerId: number | null, discount: SeniorDiscount | null): Promise<CheckoutOrder> {
  const response = await apiRequest<{ message: string; order: CheckoutOrder }>('/api/pos/checkout', {
    method: 'POST',
    body: {
      items: items.map((item) => ({ itemId: item.itemId, quantity: item.quantity, expectedUnitPrice: item.unitPrice })),
      paymentMethod,
      ...(discount ? discount : {}),
      ...(paymentMethod === 'cash' ? { cashReceived } : { customerId })
    },
    timeoutMs: 20_000
  })
  return response.order
}

export async function loadPosItems(search: string, page: number, signal?: AbortSignal): Promise<PosItemList> {
  const params = new URLSearchParams({ page: String(page), per_page: '15' })
  if (search) params.set('search', search)
  const response = await apiRequest<PosItemsResponse>(`/api/pos/items?${params}`, { signal })

  return {
    items: response.data,
    station: response.station,
    currentPage: response.meta.current_page,
    lastPage: response.meta.last_page,
    total: response.meta.total
  }
}

export async function loadPosStationInventory(search: string, page: number, signal?: AbortSignal): Promise<PosStationInventoryList> {
  const params = new URLSearchParams({ page: String(page), per_page: '15' })
  if (search) params.set('search', search)
  const response = await apiRequest<{ data: PosStationInventoryRow[]; station: PosStation; meta: { current_page: number; last_page: number; total: number } }>(`/api/pos/station-inventory?${params}`, { signal })
  return { items: response.data, station: response.station, currentPage: response.meta.current_page, lastPage: response.meta.last_page, total: response.meta.total }
}
