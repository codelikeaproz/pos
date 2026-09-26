export type UserRole = 'admin' | 'end_user'

export type CurrentUser = {
  id: number
  name: string
  email: string
  role: UserRole
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
  return role === 'admin' ? 'Admin' : 'End User'
}
