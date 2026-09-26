import { apiRequest, ApiError } from './apiClient'
import { clearAuthToken, setAuthToken } from './authToken'
import type {
  CurrentUser,
  CurrentUserResponse,
  LoginResponse
} from '../types/auth'

function isCurrentUser(value: unknown): value is CurrentUser {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as Record<string, unknown>
  return (
    typeof record.id === 'number' &&
    typeof record.name === 'string' &&
    typeof record.email === 'string' &&
    (record.role === 'admin' || record.role === 'end_user')
  )
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const data = await apiRequest<LoginResponse>('/api/login', {
    method: 'POST',
    body: { email, password },
    auth: false
  })

  if (!data?.token || !isCurrentUser(data.user)) {
    throw new ApiError('invalid', 'Unexpected response from the backend.')
  }

  setAuthToken(data.token)
  return data
}

export async function fetchCurrentUser(
  signal?: AbortSignal
): Promise<CurrentUser> {
  const data = await apiRequest<CurrentUserResponse>('/api/current-user', {
    method: 'GET',
    signal
  })

  if (!isCurrentUser(data?.user)) {
    throw new ApiError('invalid', 'Unexpected response from the backend.')
  }

  return data.user
}

export async function logout(): Promise<void> {
  try {
    await apiRequest<{ message?: string }>('/api/logout', {
      method: 'POST',
      invalidateSessionOnUnauthorized: false
    })
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 401)) {
      throw error
    }
  } finally {
    clearAuthToken()
  }
}

export function extractLoginErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.kind === 'network' || error.kind === 'timeout') {
      return 'Unable to connect to the server.'
    }

    if (error.status === 422) {
      return 'Invalid credentials.'
    }

    if (error.status === 401) {
      return 'Invalid credentials.'
    }

    if (error.status !== null && error.status >= 500) {
      return 'The backend encountered an unexpected error.'
    }

    return error.message || 'Unable to sign in.'
  }

  return 'Unable to sign in.'
}
