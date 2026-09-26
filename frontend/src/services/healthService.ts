import { apiRequest } from './apiClient'
import type { HealthResponse } from '../types/health'
import { ApiError } from './apiClient'

function isHealthResponse(value: unknown): value is HealthResponse {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as Record<string, unknown>
  return (
    typeof record.status === 'string' && typeof record.application === 'string'
  )
}

export async function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const data = await apiRequest<unknown>('/api/health', {
    method: 'GET',
    signal
  })

  if (!isHealthResponse(data)) {
    throw new ApiError('invalid', 'Unexpected response from the backend.')
  }

  return data
}
