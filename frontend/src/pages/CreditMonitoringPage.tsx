import { useCallback, useEffect, useState } from 'react'
import { Alert } from '../components/feedback/Alert'
import { LoadingState } from '../components/feedback/LoadingState'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Pagination } from '../components/ui/Pagination'
import { SearchField } from '../components/ui/SearchField'
import { Table, type TableColumn } from '../components/ui/Table'
import { formatManilaDateTime } from '../lib/dateTime'
import { getUserFacingApiMessage } from '../services/apiClient'
import { loadCreditMonitoring } from '../services/creditMonitoringService'
import type { CreditMonitoringList, CreditOrder } from '../types/creditMonitoring'
import './credit-monitoring-page.css'

const EMPTY: CreditMonitoringList = { orders: [], currentPage: 1, lastPage: 1, total: 0, totalAmount: '0.00' }
const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })

export function CreditMonitoringPage() {
  const [list, setList] = useState(EMPTY)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { const timer = window.setTimeout(() => { setPage(1); setSearch(searchInput.trim()) }, 350); return () => window.clearTimeout(timer) }, [searchInput])
  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError(null)
    try { setList(await loadCreditMonitoring(search, fromDate, toDate, page, signal)) }
    catch (failure) { if (!signal?.aborted) { setList(EMPTY); setError(getUserFacingApiMessage(failure)) } }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [search, fromDate, toDate, page])
  useEffect(() => { const controller = new AbortController(); void refresh(controller.signal); return () => controller.abort() }, [refresh])

  const columns: TableColumn<CreditOrder>[] = [
    { key: 'order', header: 'Order No.', render: (row) => row.orderNumber },
    { key: 'date', header: 'Date', render: (row) => formatManilaDateTime(row.orderedAt) },
    { key: 'customer', header: 'Customer', render: (row) => row.customer?.name ?? '—' },
    { key: 'mop', header: 'MOP', render: () => 'Utang' },
    { key: 'station', header: 'Station', render: (row) => row.station.name },
    { key: 'cashier', header: 'Cashier', render: (row) => row.cashier.name },
    { key: 'total', header: 'Total', align: 'right', render: (row) => money.format(Number(row.totalAmount)) },
    { key: 'age', header: 'Age', align: 'right', render: (row) => row.ageDays }
  ]

  return <section className="page credit-monitoring-page">
    <header className="page__header"><div><h1 className="page__title">Credit Monitoring</h1><p className="page__description">Read-only record of Utang sales. The Accounting Office handles settlement.</p></div></header>
    <div className="credit-monitoring-page__filters"><SearchField value={searchInput} onChange={setSearchInput} onClear={() => { setSearchInput(''); setSearch(''); setPage(1) }} placeholder="Search order, Customer, Station, or Cashier..." label="Search Credit transactions" /><div><Label htmlFor="credit-from">From</Label><Input id="credit-from" type="date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setPage(1) }} /></div><div><Label htmlFor="credit-to">To</Label><Input id="credit-to" type="date" min={fromDate || undefined} value={toDate} onChange={(event) => { setToDate(event.target.value); setPage(1) }} /></div></div>
    {error ? <Alert tone="error">{error}</Alert> : null}
    {loading ? <LoadingState label="Loading Credit transactions…" /> : <><Table columns={columns} rows={list.orders} rowKey={(row) => String(row.id)} emptyMessage="No Credit transactions found." /><Pagination currentPage={list.currentPage} lastPage={list.lastPage} label="Credit transaction" onPageChange={setPage} /><div className="credit-monitoring-page__total"><span>Total Amount:</span><strong>{money.format(Number(list.totalAmount))}</strong></div><p className="credit-monitoring-page__note">Total Amount covers all matching recorded Credit sales, not an outstanding balance.</p></>}
  </section>
}
