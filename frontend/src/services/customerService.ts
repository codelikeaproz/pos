import { apiRequest } from './apiClient'
import type { Customer, CustomerList } from '../types/customer'

export async function loadCustomers(search: string, page: number, signal?: AbortSignal): Promise<CustomerList> {
  const params = new URLSearchParams({ page: String(page) })
  if (search) params.set('search', search)
  const response = await apiRequest<{ data: Customer[]; meta: { current_page: number; last_page: number; total: number } }>(`/api/customers?${params}`, { signal })
  return { customers: response.data, currentPage: response.meta.current_page, lastPage: response.meta.last_page, total: response.meta.total }
}

export function addCustomer(name: string, address: string): Promise<{ message: string; customer: Customer }> {
  return apiRequest('/api/customers', { method: 'POST', body: { name, address } })
}
