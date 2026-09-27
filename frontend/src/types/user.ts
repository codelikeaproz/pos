import type { UserRole } from './auth'

export type Employee = {
  id: number
  name: string
  email: string
  role: UserRole
  station: { id: number; name: string } | null
}

export type EmployeeInput = {
  name: string
  email: string
  password?: string
  role: UserRole
  station_id: number | null
}

export type EmployeeOptions = { stations: { id: number; name: string }[] }

export type EmployeeList = {
  employees: Employee[]
  currentPage: number
  lastPage: number
  total: number
}
