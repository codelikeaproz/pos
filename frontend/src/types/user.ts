import type { UserRole } from './auth'

export type Employee = {
  id: number
  name: string
  email: string
  role: UserRole
}

export type EmployeeInput = {
  name: string
  email: string
  password?: string
  role: UserRole
}

export type EmployeeList = {
  employees: Employee[]
  currentPage: number
  lastPage: number
  total: number
}
