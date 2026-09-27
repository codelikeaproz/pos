import type { Supplier, SupplierInput, SupplierList } from '../types/supplier'
import { apiRequest } from './apiClient'

type SupplierDto = {
  id: number
  name: string
  contact_person: string | null
  contact_number: string | null
  email: string | null
  address: string | null
}

type PaginatedSuppliersResponse = {
  data: SupplierDto[]
  meta: { current_page: number; last_page: number; total: number }
}

type SupplierResponseDto = { message: string; supplier: SupplierDto }
type SupplierResponse = { message: string; supplier: Supplier }

function fromDto(supplier: SupplierDto): Supplier {
  return {
    id: supplier.id,
    name: supplier.name,
    contactPerson: supplier.contact_person,
    contactNumber: supplier.contact_number,
    email: supplier.email,
    address: supplier.address
  }
}

function toDto(input: SupplierInput): Omit<SupplierDto, 'id'> {
  return {
    name: input.name,
    contact_person: input.contactPerson,
    contact_number: input.contactNumber,
    email: input.email,
    address: input.address
  }
}

export async function loadSuppliers(
  search: string,
  page: number,
  signal?: AbortSignal
): Promise<SupplierList> {
  const params = new URLSearchParams({ page: String(page) })
  if (search.trim()) params.set('search', search.trim())
  const response = await apiRequest<PaginatedSuppliersResponse>(
    `/api/suppliers?${params.toString()}`,
    { signal }
  )
  return {
    suppliers: response.data.map(fromDto),
    currentPage: response.meta.current_page,
    lastPage: response.meta.last_page,
    total: response.meta.total
  }
}

export async function createSupplier(input: SupplierInput): Promise<SupplierResponse> {
  const response = await apiRequest<SupplierResponseDto>('/api/suppliers', {
    method: 'POST', body: toDto(input)
  })
  return { message: response.message, supplier: fromDto(response.supplier) }
}

export async function updateSupplier(id: number, input: SupplierInput): Promise<SupplierResponse> {
  const response = await apiRequest<SupplierResponseDto>(`/api/suppliers/${id}`, {
    method: 'PUT', body: toDto(input)
  })
  return { message: response.message, supplier: fromDto(response.supplier) }
}

export function deleteSupplier(id: number): Promise<{ message: string }> {
  return apiRequest(`/api/suppliers/${id}`, { method: 'DELETE' })
}
