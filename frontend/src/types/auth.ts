export type UserRole = 'admin' | 'end_user'

export type CurrentUser = {
  id: number
  name: string
  email: string
  role: UserRole
  station: { id: number; name: string } | null
  privileges: { id: number; description: string }[]
}

export type AuthStatus = 'unauthenticated' | 'authenticating' | 'authenticated'

export type LoginResponse = {
  message: string
  user: CurrentUser
  token: string
}

export type CurrentUserResponse = {
  user: CurrentUser
}

export function roleLabel(role: UserRole): string {
  return role === 'admin' ? 'Admin' : 'Cashier'
}
