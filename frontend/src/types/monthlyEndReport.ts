export type MonthlyEndStatus = 'DRAFT' | 'FINALIZED'
export type MonthlyEndResult = 'SHORT' | 'MATCH' | 'OVER' | 'UNCOUNTED'
export type MonthlyEndReportItem = { id: number; itemId: number; itemCode: string; itemName: string; unit: string; systemCount: string; physicalCount: string | null; variance: string | null; result: MonthlyEndResult }
export type MonthlyEndReport = {
  id: number
  reportMonth: number
  reportYear: number
  status: MonthlyEndStatus
  station: { id: number; name: string }
  createdBy: { id: number; name: string }
  createdAt: string
  finalizedBy: { id: number; name: string } | null
  finalizedAt: string | null
  summary: { totalItems: number; matched: number; short: number; over: number; uncounted: number }
  items?: MonthlyEndReportItem[]
}
export type MonthlyEndReportList = { reports: MonthlyEndReport[]; stations: Array<{ id: number; name: string }>; currentPage: number; lastPage: number; total: number }
