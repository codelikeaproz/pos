import { getAuthToken } from './authToken'

export type ApiErrorKind = 'network' | 'http' | 'invalid' | 'timeout'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number | null

  constructor(kind: ApiErrorKind, message: string, status: number | null = null) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
  }
}

const DEFAULT_TIMEOUT_MS = 10_000

function getApiBaseUrl(): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  if (!baseUrl) {
    throw new ApiError(
      'invalid',
      'API base URL is not configured. Set VITE_API_BASE_URL.'
    )
  }

  return baseUrl.replace(/\/+$/, '')
}

function messageForHttpStatus(status: number, data: unknown): string {
  if (status === 422) {
    if (data && typeof data === 'object' && 'errors' in data) {
      const errors = (data as { errors?: Record<string, unknown> }).errors

      if (errors) {
        for (const fieldErrors of Object.values(errors)) {
          if (Array.isArray(fieldErrors)) {
            const firstMessage = fieldErrors.find(
              (message): message is string => typeof message === 'string'
            )

            if (firstMessage) {
              return firstMessage
            }
          }

          if (typeof fieldErrors === 'string') {
            return fieldErrors
          }
        }
      }
    }

    return 'The submitted information is invalid.'
  }

  if (status === 401) {
    return 'Unauthenticated.'
  }

  if (status === 403) {
    return 'You do not have permission to perform this action.'
  }

  if (status === 404) {
    return 'Requested API endpoint was not found.'
  }

  if (status === 429) {
    return 'Too many attempts. Please wait and try again.'
  }

  if (status >= 500) {
    return 'The backend encountered an unexpected error.'
  }

  return 'Unable to complete the request.'
}

export type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
  timeoutMs?: number
  /** When false, do not send Authorization (e.g. login). Default true. */
  auth?: boolean
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    signal,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    auth = true
  } = options
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`

  const headers: Record<string, string> = {
    Accept: 'application/json'
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (auth) {
    const token = getAuthToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  const onAbort = (): void => {
    controller.abort()
  }

  if (signal) {
    if (signal.aborted) {
      controller.abort()
    } else {
      signal.addEventListener('abort', onAbort, { once: true })
    }
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal
    })

    let data: unknown = null
    const text = await response.text()

    if (text) {
      try {
        data = JSON.parse(text) as unknown
      } catch {
        throw new ApiError(
          'invalid',
          'Unexpected response from the backend.',
          response.status
        )
      }
    }

    if (!response.ok) {
      throw new ApiError(
        'http',
        messageForHttpStatus(response.status, data),
        response.status
      )
    }

    return data as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      if (signal?.aborted) {
        throw new ApiError('network', 'Unable to reach Laravel backend.')
      }

      throw new ApiError('timeout', 'Unable to reach Laravel backend.')
    }

    throw new ApiError('network', 'Unable to reach Laravel backend.')
  } finally {
    window.clearTimeout(timeoutId)
    signal?.removeEventListener('abort', onAbort)
  }
}

export function getUserFacingApiMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.kind === 'network' || error.kind === 'timeout') {
      return 'Unable to connect'
    }

    return error.message
  }

  return 'Unable to connect'
}
