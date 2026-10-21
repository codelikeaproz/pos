import { apiRequest } from './apiClient'
import type { TaxSetting } from '../types/taxSetting'

export async function loadTaxSetting(signal?: AbortSignal): Promise<TaxSetting> {
  return (await apiRequest<{ taxSetting: TaxSetting }>('/api/tax-settings', { signal })).taxSetting
}

export function updateTaxSetting(vatRate: string): Promise<{ message: string; taxSetting: TaxSetting }> {
  return apiRequest('/api/tax-settings', { method: 'PUT', body: { taxStatus: 'NON_VAT', vatRate } })
}
