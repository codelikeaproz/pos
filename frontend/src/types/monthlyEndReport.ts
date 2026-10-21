export type MonthlyEndStatus = 'DRAFT' | 'FINALIZED'
export type MonthlyEndResult = 'SHORT' | 'MATCH' | 'OVER' | 'UNCOUNTED'
export type MonthlyEndReportItem = { id: number; itemId: number; itemCode: string; itemName: string; unit: string; systemCount: string; physicalCount: string | null; variance: string | null; result: MonthlyEndResult; currentStock: string | null; resultingStock: string | null; reconciledAt: string | null; reconciledBy: { id: number; name: string } | null; reconciliationMovement: { id: number; type: string; quantityChange: string } | null }
export type MonthlyEndReport = {
  id: number
  reportMonth: number
  reportYear: number
  status: MonthlyEndStatus
  reconciliationStatus: 'NO_DISCREPANCIES' | 'PENDING_RECONCILIATION' | 'PARTIALLY_RECONCILED' | 'FULLY_RECONCILED' | null
  station: { id: number; name: string }
  createdBy: { id: number; name: string }
  createdAt: string
  finalizedBy: { id: number; name: string } | null
  finalizedAt: string | null
  summary: { totalItems: number; matched: number; short: number; over: number; uncounted: number; pendingReconciliation: number; reconciled: number }
  items?: MonthlyEndReportItem[]
}
export type MonthlyEndReportList = { reports: MonthlyEndReport[]; stations: Array<{ id: number; name: string }>; currentPage: number; lastPage: number; total: number }
