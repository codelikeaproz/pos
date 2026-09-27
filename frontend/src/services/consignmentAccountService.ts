import type { ConsignmentAccount, ConsignmentAccountInput, ConsignmentAccountList, ConsignmentAccountOptions } from '../types/consignmentAccount'
import { apiRequest } from './apiClient'

type Page = { data: ConsignmentAccount[]; meta: { current_page: number; last_page: number; total: number } }
const body = (input: ConsignmentAccountInput) => ({ name: input.name, email: input.email, station_id: input.stationId, consignee_id: input.consigneeId, password: input.password || null, password_confirmation: input.passwordConfirmation || null })
export async function loadConsignmentAccounts(search: string, page: number, signal?: AbortSignal): Promise<ConsignmentAccountList> { const params = new URLSearchParams({ page: String(page) }); if (search) params.set('search', search); const response = await apiRequest<Page>(`/api/consignment-accounts?${params}`, { signal }); return { accounts: response.data, currentPage: response.meta.current_page, lastPage: response.meta.last_page, total: response.meta.total } }
export const loadConsignmentAccountOptions = () => apiRequest<ConsignmentAccountOptions>('/api/consignment-account-options')
export const createConsignmentAccount = (input: ConsignmentAccountInput) => apiRequest<{ message: string; account: ConsignmentAccount }>('/api/consignment-accounts', { method: 'POST', body: body(input) })
export const updateConsignmentAccount = (id: number, input: ConsignmentAccountInput) => apiRequest<{ message: string; account: ConsignmentAccount }>(`/api/consignment-accounts/${id}`, { method: 'PUT', body: body(input) })
export const deleteConsignmentAccount = (id: number) => apiRequest<{ message: string }>(`/api/consignment-accounts/${id}`, { method: 'DELETE' })
