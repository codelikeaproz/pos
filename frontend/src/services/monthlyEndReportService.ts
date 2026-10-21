import { apiRequest } from './apiClient'
import type { MonthlyEndReport, MonthlyEndReportList } from '../types/monthlyEndReport'

export type MonthlyEndFilters = { month: string; year: string; stationId: string; status: string; page: number; perPage: number }

export async function loadMonthlyEndReports(filters: MonthlyEndFilters, signal?: AbortSignal): Promise<MonthlyEndReportList> {
  const params = new URLSearchParams({ page: String(filters.page), per_page: String(filters.perPage) })
  if (filters.month) params.set('report_month', filters.month)
  if (filters.year) params.set('report_year', filters.year)
  if (filters.stationId) params.set('station_id', filters.stationId)
  if (filters.status) params.set('status', filters.status)
  const response = await apiRequest<{ data: MonthlyEndReport[]; stations: MonthlyEndReportList['stations']; meta: { current_page: number; last_page: number; total: number } }>(`/api/monthly-end-reports?${params}`, { signal })
  return { reports: response.data, stations: response.stations, currentPage: response.meta.current_page, lastPage: response.meta.last_page, total: response.meta.total }
}

export async function createMonthlyEndReport(stationId: number, reportMonth: number, reportYear: number): Promise<MonthlyEndReport> {
  return (await apiRequest<{ report: MonthlyEndReport }>('/api/monthly-end-reports', { method: 'POST', body: { stationId, reportMonth, reportYear } })).report
}

export async function loadMonthlyEndReport(id: number): Promise<MonthlyEndReport> {
  return (await apiRequest<{ report: MonthlyEndReport }>(`/api/monthly-end-reports/${id}`)).report
}

export async function saveMonthlyEndCounts(id: number, counts: Array<{ id: number; physicalCount: string | null }>): Promise<MonthlyEndReport> {
  return (await apiRequest<{ report: MonthlyEndReport }>(`/api/monthly-end-reports/${id}/physical-counts`, { method: 'PUT', body: { counts } })).report
}

export async function finalizeMonthlyEndReport(id: number): Promise<MonthlyEndReport> {
  return (await apiRequest<{ report: MonthlyEndReport }>(`/api/monthly-end-reports/${id}/finalize`, { method: 'POST' })).report
}
