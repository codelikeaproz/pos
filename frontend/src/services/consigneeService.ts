import type { Consignee, ConsigneeInput, ConsigneeList } from '../types/consignee'
import { apiRequest } from './apiClient'

type ConsigneeDto = { id: number; name: string; contact_number: string | null; email: string | null; address: string | null }
type PaginatedResponse = { data: ConsigneeDto[]; meta: { current_page: number; last_page: number; total: number } }
type ResponseDto = { message: string; consignee: ConsigneeDto }

const fromDto = (value: ConsigneeDto): Consignee => ({ id: value.id, name: value.name, contactNumber: value.contact_number, email: value.email, address: value.address })
const toDto = (value: ConsigneeInput) => ({ name: value.name, contact_number: value.contactNumber, email: value.email, address: value.address })

export async function loadConsignees(search: string, page: number, signal?: AbortSignal): Promise<ConsigneeList> {
  const params = new URLSearchParams({ page: String(page) }); if (search.trim()) params.set('search', search.trim())
  const response = await apiRequest<PaginatedResponse>(`/api/consignees?${params.toString()}`, { signal })
  return { consignees: response.data.map(fromDto), currentPage: response.meta.current_page, lastPage: response.meta.last_page, total: response.meta.total }
}
export async function createConsignee(input: ConsigneeInput) { const response = await apiRequest<ResponseDto>('/api/consignees', { method: 'POST', body: toDto(input) }); return { message: response.message, consignee: fromDto(response.consignee) } }
export async function updateConsignee(id: number, input: ConsigneeInput) { const response = await apiRequest<ResponseDto>(`/api/consignees/${id}`, { method: 'PUT', body: toDto(input) }); return { message: response.message, consignee: fromDto(response.consignee) } }
export function deleteConsignee(id: number): Promise<{ message: string }> { return apiRequest(`/api/consignees/${id}`, { method: 'DELETE' }) }
