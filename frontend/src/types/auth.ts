export type UserRole = 'admin' | 'cashier' | 'accounting'
export type UserSex = 'male' | 'female'

export type CurrentUser = {
  id: number
  name: string
  email: string
  sex: UserSex
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

export type ProfileInput = Pick<CurrentUser, 'name' | 'email' | 'sex'> & {
  password?: string
  password_confirmation?: string
}

export function roleLabel(role: UserRole): string {
  return role === 'admin' ? 'Admin' : role === 'accounting' ? 'Accounting' : 'Cashier'
}
