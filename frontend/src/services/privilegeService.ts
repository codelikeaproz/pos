import { apiRequest } from './apiClient'
import type { Privilege, PrivilegeAssignmentList, PrivilegeList, AssignmentUser } from '../types/privilege'

type PaginatedPrivileges = { data: Privilege[]; meta: { current_page: number; last_page: number; total: number } }

export async function loadPrivileges(search: string, page: number, signal?: AbortSignal): Promise<PrivilegeList> {
  const params = new URLSearchParams({ page: String(page) })
  if (search) params.set('search', search)
  const result = await apiRequest<PaginatedPrivileges>(`/api/privileges?${params}`, { signal })
  return { privileges: result.data, currentPage: result.meta.current_page, lastPage: result.meta.last_page, total: result.meta.total }
}

export function createPrivilege(description: string): Promise<{ message: string; privilege: Privilege }> {
  return apiRequest('/api/privileges', { method: 'POST', body: { description } })
}

export function updatePrivilege(id: number, description: string): Promise<{ message: string; privilege: Privilege }> {
  return apiRequest(`/api/privileges/${id}`, { method: 'PUT', body: { description } })
}

export async function loadPrivilegeAssignments(search: string, page: number, signal?: AbortSignal): Promise<PrivilegeAssignmentList> {
  const params = new URLSearchParams({ page: String(page) })
  if (search) params.set('search', search)
  const result = await apiRequest<{ data: AssignmentUser[]; privileges: Privilege[]; meta: { current_page: number; last_page: number; total: number } }>(`/api/privilege-assignments?${params}`, { signal })
  return { users: result.data, privileges: result.privileges, currentPage: result.meta.current_page, lastPage: result.meta.last_page, total: result.meta.total }
}

export function savePrivilegeAssignments(userId: number, privilegeIds: number[]): Promise<{ message: string }> {
  return apiRequest(`/api/privilege-assignments/${userId}`, { method: 'PUT', body: { privilege_ids: privilegeIds } })
}
