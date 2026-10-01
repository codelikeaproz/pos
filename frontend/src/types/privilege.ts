export type Privilege = { id: number; description: string }

export type PrivilegeList = {
  privileges: Privilege[]
  currentPage: number
  lastPage: number
  total: number
}

export type AssignmentUser = {
  id: number
  name: string
  email: string
  role: 'admin' | 'end_user'
  privilegeIds: number[]
}

export type PrivilegeAssignmentList = {
  users: AssignmentUser[]
  privileges: Privilege[]
  currentPage: number
  lastPage: number
  total: number
}
