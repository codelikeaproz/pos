import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert } from '../components/feedback/Alert'
import { LoadingState } from '../components/feedback/LoadingState'
import { Modal } from '../components/feedback/Modal'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Pagination, type AdminPageSize } from '../components/ui/Pagination'
import { SearchField } from '../components/ui/SearchField'
import { Table, type TableColumn } from '../components/ui/Table'
import { formatManilaDateTime } from '../lib/dateTime'
import { AppIcons, iconSize, iconStroke } from '../lib/icons'
import { formatQuantity } from '../lib/posCalculations'
import { getUserFacingApiMessage } from '../services/apiClient'
import { createMonthlyEndReport, finalizeMonthlyEndReport, loadMonthlyEndReport, loadMonthlyEndReports, reconcileMonthlyEndItems, saveMonthlyEndCounts } from '../services/monthlyEndReportService'
import type { MonthlyEndReport, MonthlyEndReportItem, MonthlyEndReportList } from '../types/monthlyEndReport'
import './monthly-end-inventory-page.css'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const currentManila = () => { const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', year: 'numeric', month: 'numeric' }).formatToParts(new Date()); return { month: Number(parts.find((part) => part.type === 'month')?.value), year: Number(parts.find((part) => part.type === 'year')?.value) } }
const EMPTY: MonthlyEndReportList = { reports: [], stations: [], currentPage: 1, lastPage: 1, total: 0 }
const validCount = (value: string) => /^\d{1,10}(\.\d{1,2})?$/.test(value)
const cents = (value: string) => Math.round(Number(value) * 100)
const varianceText = (value: number) => `${value > 0 ? '+' : value < 0 ? '-' : ''}${(Math.abs(value) / 100).toFixed(2)}`
const reconciliationStatusText = { NO_DISCREPANCIES: 'No Discrepancies', PENDING_RECONCILIATION: 'Pending Reconciliation', PARTIALLY_RECONCILED: 'Partially Reconciled', FULLY_RECONCILED: 'Fully Reconciled' }

export function MonthlyEndInventoryPage() {
  const now = useMemo(currentManila, [])
  const [list, setList] = useState(EMPTY)
  const [filterMonth, setFilterMonth] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterStation, setFilterStation] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<AdminPageSize>(10)
  const [creating, setCreating] = useState(false)
  const [createMonth, setCreateMonth] = useState(String(now.month))
  const [createYear, setCreateYear] = useState(String(now.year))
  const [createStation, setCreateStation] = useState('')
  const [detail, setDetail] = useState<MonthlyEndReport | null>(null)
  const [counts, setCounts] = useState<Record<number, string>>({})
  const [itemSearch, setItemSearch] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [confirmingReconciliation, setConfirmingReconciliation] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError(null)
    try { setList(await loadMonthlyEndReports({ month: filterMonth, year: filterYear, stationId: filterStation, status: filterStatus, page, perPage: pageSize }, signal)) }
    catch (failure) { if (!signal?.aborted) setError(getUserFacingApiMessage(failure)) }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [filterMonth, filterYear, filterStation, filterStatus, page, pageSize])
  useEffect(() => { const controller = new AbortController(); void refresh(controller.signal); return () => controller.abort() }, [refresh])

  function setDetailState(report: MonthlyEndReport) {
    setDetail(report); setCounts(Object.fromEntries((report.items ?? []).map((item) => [item.id, item.physicalCount ?? '']))); setItemSearch(''); setSelectedItems([])
  }
  async function view(report: MonthlyEndReport) { setSubmitting(true); setError(null); try { setDetailState(await loadMonthlyEndReport(report.id)) } catch (failure) { setError(getUserFacingApiMessage(failure)) } finally { setSubmitting(false) } }
  async function create() {
    if (!createStation) { setError('Select a Station.'); return }
    setSubmitting(true); setError(null)
    try { const report = await createMonthlyEndReport(Number(createStation), Number(createMonth), Number(createYear)); setCreating(false); setPage(1); setDetailState(report); await refresh() }
    catch (failure) { setError(getUserFacingApiMessage(failure)) } finally { setSubmitting(false) }
  }
  async function save(showMessage = true): Promise<MonthlyEndReport | null> {
    if (!detail?.items) return null
    if (Object.values(counts).some((value) => value !== '' && !validCount(value))) { setError('Physical Counts must be zero or positive numbers with up to two decimal places.'); return null }
    setSubmitting(true); setError(null)
    try { const saved = await saveMonthlyEndCounts(detail.id, detail.items.map((item) => ({ id: item.id, physicalCount: counts[item.id] === '' ? null : counts[item.id] }))); setDetailState(saved); if (showMessage) setError(null); await refresh(); return saved }
    catch (failure) { setError(getUserFacingApiMessage(failure)); return null } finally { setSubmitting(false) }
  }
  async function prepareFinalize() {
    const uncounted = Object.values(counts).filter((value) => value === '').length
    if (uncounted) { setError(`Cannot finalize report. ${uncounted} items still require a physical count.`); return }
    if (await save(false)) setConfirming(true)
  }
  async function finalize() {
    if (!detail) return
    setSubmitting(true); setError(null)
    try { const finalized = await finalizeMonthlyEndReport(detail.id); setDetailState(finalized); setConfirming(false); await refresh() }
    catch (failure) { setConfirming(false); setError(getUserFacingApiMessage(failure)) } finally { setSubmitting(false) }
  }
  async function reconcile() {
    if (!detail || selectedItems.length === 0) return
    setSubmitting(true); setError(null)
    try { setDetailState(await reconcileMonthlyEndItems(detail.id, selectedItems)); setConfirmingReconciliation(false); await refresh() }
    catch (failure) { setConfirmingReconciliation(false); setError(getUserFacingApiMessage(failure)) } finally { setSubmitting(false) }
  }

  const listColumns: TableColumn<MonthlyEndReport>[] = [
    { key: 'period', header: 'Period', render: (row) => `${MONTHS[row.reportMonth - 1]} ${row.reportYear}` },
    { key: 'station', header: 'Station', render: (row) => row.station.name },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={row.status === 'FINALIZED' ? 'success' : 'warning'}>{row.status === 'FINALIZED' ? 'Finalized' : 'Draft'}</Badge> },
    { key: 'createdBy', header: 'Created By', render: (row) => row.createdBy.name },
    { key: 'createdAt', header: 'Created At', render: (row) => formatManilaDateTime(row.createdAt) },
    { key: 'finalizedBy', header: 'Finalized By', render: (row) => row.finalizedBy?.name ?? '—' },
    { key: 'finalizedAt', header: 'Finalized At', render: (row) => row.finalizedAt ? formatManilaDateTime(row.finalizedAt) : '—' },
    { key: 'view', header: 'View', align: 'center', render: (row) => <Button className="table-icon-action" variant="outline" aria-label={`View ${MONTHS[row.reportMonth - 1]} ${row.reportYear} report`} onClick={() => void view(row)} icon={<AppIcons.view size={iconSize} strokeWidth={iconStroke} />} /> }
  ]
  const visibleItems = (detail?.items ?? []).filter((item) => `${item.itemName} ${item.itemCode}`.toLowerCase().includes(itemSearch.toLowerCase()))
  const currentSummary = (detail?.items ?? []).reduce((summary, item) => {
    const value = counts[item.id] ?? ''
    if (value === '' || !validCount(value)) summary.uncounted++
    else { const difference = cents(value) - cents(item.systemCount); summary[difference < 0 ? 'short' : difference > 0 ? 'over' : 'matched']++ }
    return summary
  }, { totalItems: detail?.items?.length ?? 0, matched: 0, short: 0, over: 0, uncounted: 0 })
  const pendingItems = (detail?.items ?? []).filter((item) => item.variance !== null && Number(item.variance) !== 0 && !item.reconciledAt)
  const itemColumns: TableColumn<MonthlyEndReportItem>[] = [
    ...(detail?.status === 'FINALIZED' ? [{ key: 'select', header: 'Select', align: 'center' as const, render: (row: MonthlyEndReportItem) => row.variance !== null && Number(row.variance) !== 0 && !row.reconciledAt ? <input type="checkbox" aria-label={`Select ${row.itemName} for reconciliation`} checked={selectedItems.includes(row.id)} onChange={(event) => setSelectedItems((current) => event.target.checked ? [...current, row.id] : current.filter((id) => id !== row.id))} /> : null }] : []),
    { key: 'item', header: 'Item', render: (row) => row.itemName },
    { key: 'code', header: 'Item Code', render: (row) => row.itemCode },
    { key: 'unit', header: 'Unit', render: (row) => row.unit },
    { key: 'system', header: 'System Count', align: 'right', render: (row) => formatQuantity(row.systemCount) },
    { key: 'physical', header: 'Physical Count', render: (row) => detail?.status === 'DRAFT' ? <Input className="monthly-end__count" inputMode="decimal" aria-label={`Physical Count for ${row.itemName}`} value={counts[row.id] ?? ''} error={(counts[row.id] ?? '') !== '' && !validCount(counts[row.id])} onChange={(event) => setCounts((current) => ({ ...current, [row.id]: event.target.value }))} /> : formatQuantity(row.physicalCount ?? '0') },
    { key: 'variance', header: 'Variance', align: 'right', render: (row) => { const value = counts[row.id] ?? ''; return value !== '' && validCount(value) ? varianceText(cents(value) - cents(row.systemCount)) : '—' } },
    { key: 'result', header: 'Result', render: (row) => { const value = counts[row.id] ?? ''; if (value === '' || !validCount(value)) return <Badge tone="info">Uncounted</Badge>; const difference = cents(value) - cents(row.systemCount); return <Badge tone={difference < 0 ? 'error' : difference > 0 ? 'warning' : 'success'}>{difference < 0 ? 'Short' : difference > 0 ? 'Over' : 'Match'}</Badge> } },
    ...(detail?.status === 'FINALIZED' ? [{ key: 'reconciliation', header: 'Reconciliation', render: (row: MonthlyEndReportItem) => Number(row.variance) === 0 ? 'No adjustment required' : row.reconciledAt ? <span><Badge tone="success">Reconciled</Badge> {row.reconciliationMovement ? `${row.reconciliationMovement.quantityChange} by ${row.reconciledBy?.name ?? 'Admin'} on ${formatManilaDateTime(row.reconciledAt)}` : ''}</span> : <Badge tone="warning">Pending</Badge> }] : [])
  ]

  return <section className="page monthly-end-page">
    <header className="page__header"><div><h1 className="page__title">Monthly End Inventory</h1><p className="page__description">Record and review monthly physical inventory counts by Station.</p></div><Button onClick={() => { setCreating(true); setError(null) }} icon={<AppIcons.add size={iconSize} />}>Create Inventory Count</Button></header>
    <div className="monthly-end__filters">{filterSelects(filterMonth, setFilterMonth, filterYear, setFilterYear, filterStation, setFilterStation, filterStatus, setFilterStatus, list.stations, () => setPage(1))}</div>
    {error && !detail && !creating ? <Alert tone="error">{error}</Alert> : null}
    {loading ? <LoadingState label="Loading Monthly End Inventory…" /> : <><p className="page__description">{list.total} monthly inventory report{list.total === 1 ? '' : 's'}</p><Table columns={listColumns} rows={list.reports} rowKey={(row) => String(row.id)} emptyMessage="No monthly inventory reports found." /><Pagination currentPage={list.currentPage} lastPage={list.lastPage} label="Monthly End Inventory" onPageChange={setPage} pageSize={pageSize} onPageSizeChange={(value) => { setPageSize(value); setPage(1) }} /></>}

    <Modal open={creating} title="Create Inventory Count" onClose={() => { if (!submitting) setCreating(false) }} actions={<Button disabled={submitting} onClick={() => void create()} icon={<AppIcons.save size={iconSize} />}>Create Inventory Count</Button>}><div className="monthly-end__create"><div><Label htmlFor="monthly-create-month" required>Month</Label><select id="monthly-create-month" className="ui-input" value={createMonth} onChange={(event) => setCreateMonth(event.target.value)}>{MONTHS.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select></div><div><Label htmlFor="monthly-create-year" required>Year</Label><Input id="monthly-create-year" type="number" min="2000" max="2100" value={createYear} onChange={(event) => setCreateYear(event.target.value)} /></div><div><Label htmlFor="monthly-create-station" required>Station</Label><select id="monthly-create-station" className="ui-input" value={createStation} onChange={(event) => setCreateStation(event.target.value)}><option value="">Select Station</option>{list.stations.map((station) => <option key={station.id} value={station.id}>{station.name}</option>)}</select></div></div>{creating && error ? <Alert tone="error">{error}</Alert> : null}<p className="page__note">System Count will snapshot the Station inventory when this report is created.</p></Modal>

    <Modal open={detail !== null} title={detail ? `${MONTHS[detail.reportMonth - 1]} ${detail.reportYear} Inventory` : 'Monthly End Inventory'} size="large" onClose={() => { if (!submitting && !confirming && !confirmingReconciliation) { setDetail(null); setError(null) } }} actions={detail?.status === 'DRAFT' ? <><Button variant="outline" disabled={submitting} onClick={() => void save()}>Save Draft</Button><Button disabled={submitting} onClick={() => void prepareFinalize()}>Finalize Report</Button></> : detail?.summary.pendingReconciliation ? <><Button variant="outline" disabled={submitting} onClick={() => setSelectedItems(pendingItems.map((item) => item.id))}>Select All Pending</Button><Button disabled={submitting || selectedItems.length === 0} onClick={() => setConfirmingReconciliation(true)}>Reconcile Selected</Button></> : undefined}>
      {detail ? <div className="monthly-end__detail"><dl className="monthly-end__meta"><div><dt>Station</dt><dd>{detail.station.name}</dd></div><div><dt>Status</dt><dd>{detail.status === 'DRAFT' ? 'Draft' : 'Finalized'}</dd></div>{detail.reconciliationStatus ? <div><dt>Reconciliation</dt><dd>{reconciliationStatusText[detail.reconciliationStatus]}</dd></div> : null}<div><dt>Created By</dt><dd>{detail.createdBy.name}</dd></div><div><dt>Created</dt><dd>{formatManilaDateTime(detail.createdAt)}</dd></div>{detail.finalizedBy ? <div><dt>Finalized By</dt><dd>{detail.finalizedBy.name}</dd></div> : null}{detail.finalizedAt ? <div><dt>Finalized</dt><dd>{formatManilaDateTime(detail.finalizedAt)}</dd></div> : null}</dl><div className="monthly-end__summary">{Object.entries(detail.status === 'FINALIZED' ? { 'Total Items': detail.summary.totalItems, Matches: detail.summary.matched, Pending: detail.summary.pendingReconciliation, Reconciled: detail.summary.reconciled } : { 'Total Items': currentSummary.totalItems, Matched: currentSummary.matched, Short: currentSummary.short, Over: currentSummary.over, Uncounted: currentSummary.uncounted }).map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</div><SearchField value={itemSearch} onChange={setItemSearch} onClear={() => setItemSearch('')} placeholder="Search Item name or code..." label="Search report items" />{error ? <Alert tone="error">{error}</Alert> : null}<Table columns={itemColumns} rows={visibleItems} rowKey={(row) => String(row.id)} emptyMessage="No report items match the search." /></div> : null}
    </Modal>
    <Modal open={confirming && detail !== null} title="Finalize Monthly Inventory?" onClose={() => { if (!submitting) setConfirming(false) }} actions={<Button disabled={submitting} onClick={() => void finalize()}>Finalize Report</Button>}><p>Finalize the {detail ? `${MONTHS[detail.reportMonth - 1]} ${detail.reportYear}` : ''} inventory count for <strong>{detail?.station.name}</strong>?</p><p className="page__note">Once finalized, this report can no longer be edited. Inventory quantities will not be adjusted.</p></Modal>
    <Modal open={confirmingReconciliation && detail !== null} title="Reconcile Selected Items?" onClose={() => { if (!submitting) setConfirmingReconciliation(false) }} actions={<Button disabled={submitting} onClick={() => void reconcile()}>Reconcile Selected</Button>}><p>The signed Monthly End variance will be applied to the current live stock.</p><div className="monthly-end__preview">{(detail?.items ?? []).filter((item) => selectedItems.includes(item.id)).map((item) => <div key={item.id}><strong>{item.itemName}</strong><span>Variance {item.variance}</span><span>Current {item.currentStock ?? 'Unavailable'}</span><span>Result {item.resultingStock ?? 'Unavailable'}</span></div>)}</div><p className="page__note">This adjustment cannot be undone from this report.</p></Modal>
  </section>
}

function filterSelects(month: string, setMonth: (value: string) => void, year: string, setYear: (value: string) => void, station: string, setStation: (value: string) => void, status: string, setStatus: (value: string) => void, stations: Array<{ id: number; name: string }>, reset: () => void) {
  return <><div><Label htmlFor="monthly-filter-month">Month</Label><select id="monthly-filter-month" className="ui-input" value={month} onChange={(event) => { setMonth(event.target.value); reset() }}><option value="">All Months</option>{MONTHS.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}</select></div><div><Label htmlFor="monthly-filter-year">Year</Label><Input id="monthly-filter-year" type="number" min="2000" max="2100" placeholder="All Years" value={year} onChange={(event) => { setYear(event.target.value); reset() }} /></div><div><Label htmlFor="monthly-filter-station">Station</Label><select id="monthly-filter-station" className="ui-input" value={station} onChange={(event) => { setStation(event.target.value); reset() }}><option value="">All Stations</option>{stations.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}</select></div><div><Label htmlFor="monthly-filter-status">Status</Label><select id="monthly-filter-status" className="ui-input" value={status} onChange={(event) => { setStatus(event.target.value); reset() }}><option value="">All</option><option value="DRAFT">Draft</option><option value="FINALIZED">Finalized</option></select></div></>
}
