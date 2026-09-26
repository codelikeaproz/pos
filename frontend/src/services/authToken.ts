const TOKEN_STORAGE_KEY = 'pos.auth.token'

export const AUTH_SESSION_INVALIDATED_EVENT = 'pos:auth-session-invalidated'

export type AuthSessionInvalidatedDetail = {
  message: string
}

export function getAuthToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setAuthToken(token: string): void {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearAuthToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    // ignore storage errors
  }
}

export function invalidateAuthSession(
  message = 'Your session is no longer valid. Please sign in again.'
): void {
  clearAuthToken()
  window.dispatchEvent(
    new CustomEvent<AuthSessionInvalidatedDetail>(
      AUTH_SESSION_INVALIDATED_EVENT,
      { detail: { message } }
    )
  )
}
