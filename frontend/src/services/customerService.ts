import { apiRequest } from './apiClient'
import type { Customer, CustomerInput, CustomerList } from '../types/customer'

export async function loadCustomers(search: string, page: number, perPage: number, signal?: AbortSignal): Promise<CustomerList> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  if (search) params.set('search', search)
  const response = await apiRequest<{ data: Customer[]; meta: { current_page: number; last_page: number; total: number } }>(`/api/customers?${params}`, { signal })
  return { customers: response.data, currentPage: response.meta.current_page, lastPage: response.meta.last_page, total: response.meta.total }
}

export function addCustomer(input: CustomerInput): Promise<{ message: string; customer: Customer }> {
  return apiRequest('/api/customers', { method: 'POST', body: input })
}

export function updateCustomer(id: number, input: CustomerInput): Promise<{ message: string; customer: Customer }> {
  return apiRequest(`/api/customers/${id}`, { method: 'PUT', body: input })
}

export function updateCustomerStatus(id: number, isActive: boolean): Promise<{ message: string; customer: Customer }> {
  return apiRequest(`/api/customers/${id}/status`, { method: 'PATCH', body: { is_active: isActive } })
}
