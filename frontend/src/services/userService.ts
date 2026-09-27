import type { Employee, EmployeeInput, EmployeeList, EmployeeOptions } from '../types/user'
import { apiRequest } from './apiClient'

type PaginatedUsersResponse = {
  data: Employee[]
  meta: {
    current_page: number
    last_page: number
    total: number
  }
}

type UserResponse = {
  message: string
  user: Employee
}

type DeleteUserResponse = {
  message: string
}

export async function loadEmployees(
  search: string,
  page: number,
  signal?: AbortSignal
): Promise<EmployeeList> {
  const params = new URLSearchParams({ page: String(page) })
  if (search.trim()) {
    params.set('search', search.trim())
  }

  const response = await apiRequest<PaginatedUsersResponse>(
    `/api/users?${params.toString()}`,
    { signal }
  )

  return {
    employees: response.data,
    currentPage: response.meta.current_page,
    lastPage: response.meta.last_page,
    total: response.meta.total
  }
}

export function createEmployee(input: EmployeeInput): Promise<UserResponse> {
  return apiRequest<UserResponse>('/api/users', {
    method: 'POST',
    body: input
  })
}

export function updateEmployee(
  employeeId: number,
  input: EmployeeInput
): Promise<UserResponse> {
  return apiRequest<UserResponse>(`/api/users/${employeeId}`, {
    method: 'PUT',
    body: input
  })
}

export function deleteEmployee(employeeId: number): Promise<DeleteUserResponse> {
  return apiRequest<DeleteUserResponse>(`/api/users/${employeeId}`, {
    method: 'DELETE'
  })
}

export function loadEmployeeOptions(): Promise<EmployeeOptions> {
  return apiRequest('/api/employee-options')
}
