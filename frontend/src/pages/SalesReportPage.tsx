import { useEffect, useRef, useState } from 'react'
import { Alert } from '../components/feedback/Alert'
import { LoadingState } from '../components/feedback/LoadingState'
import { Modal } from '../components/feedback/Modal'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Pagination, type AdminPageSize } from '../components/ui/Pagination'
import { SearchField } from '../components/ui/SearchField'
import { Table, type TableColumn } from '../components/ui/Table'
import { OrderDetailView } from '../features/orders/OrderDetailView'
import { formatManilaDateTime } from '../lib/dateTime'
import { AppIcons, iconStroke } from '../lib/icons'
import { formatPrice } from '../lib/posCalculations'
import { getUserFacingApiMessage } from '../services/apiClient'
import { loadSalesReport, loadSalesReportDetail } from '../services/salesReportService'
import type { OrderDetail, OrderHistoryRow } from '../types/order'
import type { SalesReportData, SalesReportPeriod } from '../types/salesReport'
import './sales-report-page.css'

function displayDate(value: string): string {
  const [year, month, day] = value.split('-')
  return year && month && day ? `${month}/${day}/${year}` : ''
}

function isoDate(value: string): string {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  if (!match) return ''
  const [, month, day, year] = match
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  return date.getUTCFullYear() === Number(year) && date.getUTCMonth() === Number(month) - 1 && date.getUTCDate() === Number(day) ? `${year}-${month}-${day}` : ''
}

export function SalesReportPage() {
  const [period, setPeriod] = useState<SalesReportPeriod>('this_month')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [fromInput, setFromInput] = useState('')
  const [toInput, setToInput] = useState('')
  const [stationId, setStationId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<AdminPageSize>(10)
  const [data, setData] = useState<SalesReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detail, setDetail] = useState<OrderDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const detailAbort = useRef<AbortController | null>(null)

  useEffect(() => { const timeout = window.setTimeout(() => { setSearch(searchInput.trim()); setPage(1) }, 350); return () => window.clearTimeout(timeout) }, [searchInput])
  useEffect(() => {
    if (period === 'custom' && (!from || !to)) { setData(null); setLoading(false); return }
    const controller = new AbortController(); setLoading(true); setError(null)
    void loadSalesReport({ period, from, to, stationId, paymentMethod, search, page, perPage: pageSize }, controller.signal)
      .then(setData).catch((failure) => { if (!controller.signal.aborted) { setData(null); setError(getUserFacingApiMessage(failure)) } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [from, page, pageSize, paymentMethod, period, search, stationId, to])

  async function view(order: OrderHistoryRow) {
    detailAbort.current?.abort(); const controller = new AbortController(); detailAbort.current = controller; setDetailLoading(true); setError(null)
    try { const result = await loadSalesReportDetail(order.id, controller.signal); if (!controller.signal.aborted) setDetail(result) }
    catch (failure) { if (!controller.signal.aborted) setError(getUserFacingApiMessage(failure)) }
    finally { if (!controller.signal.aborted) setDetailLoading(false) }
  }

  const columns: TableColumn<OrderHistoryRow>[] = [
    { key: 'date', header: 'Date', render: (row) => formatManilaDateTime(row.orderedAt) },
    { key: 'order', header: 'Order No.', render: (row) => row.orderNumber },
    { key: 'customer', header: 'Customer', render: (row) => row.customer?.name ?? 'Walk-in' },
    { key: 'mop', header: 'MOP', render: (row) => row.paymentMethod === 'credit' ? 'Credit / Utang' : 'Cash' },
    { key: 'station', header: 'Station', render: (row) => row.station.name },
    { key: 'cashier', header: 'Cashier', render: (row) => row.cashier.name },
    { key: 'discount', header: 'Discount', align: 'right', render: (row) => formatPrice(row.discountAmount) },
    { key: 'total', header: 'Total', align: 'right', render: (row) => formatPrice(row.totalAmount) },
    { key: 'view', header: 'View', align: 'center', render: (row) => <Button variant="outline" className="table-icon-action" icon={<AppIcons.view size={18} strokeWidth={iconStroke} />} aria-label={`View ${row.orderNumber}`} title={`View ${row.orderNumber}`} onClick={() => void view(row)} /> }
  ]
  const summary = data?.summary

  return <section className="page sales-report-page">
    <header className="page__header"><div><h1 className="page__title">Sales Report</h1><p className="page__description">Review historical sales and transaction activity.</p></div></header>
    <div className="sales-report__filters">
      <div><Label htmlFor="report-period">Period</Label><select id="report-period" className="ui-input" value={period} onChange={(event) => { setPeriod(event.target.value as SalesReportPeriod); setPage(1) }}><option value="today">Today</option><option value="yesterday">Yesterday</option><option value="this_week">This Week</option><option value="this_month">This Month</option><option value="custom">Custom Range</option></select></div>
      <div><Label htmlFor="report-from">From</Label><Input id="report-from" type="text" inputMode="numeric" placeholder="MM/DD/YYYY" maxLength={10} disabled={period !== 'custom'} value={period === 'custom' ? fromInput : displayDate(data?.filters.from ?? '')} error={period === 'custom' && fromInput.length === 10 && !from} onChange={(event) => { setFromInput(event.target.value); setFrom(isoDate(event.target.value)); setPage(1) }} /></div>
      <div><Label htmlFor="report-to">To</Label><Input id="report-to" type="text" inputMode="numeric" placeholder="MM/DD/YYYY" maxLength={10} disabled={period !== 'custom'} value={period === 'custom' ? toInput : displayDate(data?.filters.to ?? '')} error={period === 'custom' && toInput.length === 10 && (!to || Boolean(from && to < from))} onChange={(event) => { setToInput(event.target.value); setTo(isoDate(event.target.value)); setPage(1) }} /></div>
      <div><Label htmlFor="report-station">Station</Label><select id="report-station" className="ui-input" value={stationId} onChange={(event) => { setStationId(event.target.value); setPage(1) }}><option value="">All Stations</option>{data?.stations.map((station) => <option key={station.id} value={station.id}>{station.name}</option>)}</select></div>
      <div><Label htmlFor="report-payment">Payment Method</Label><select id="report-payment" className="ui-input" value={paymentMethod} onChange={(event) => { setPaymentMethod(event.target.value); setPage(1) }}><option value="">All</option><option value="cash">Cash</option><option value="credit">Credit / Utang</option></select></div>
    </div>
    {error ? <Alert tone="warning">{error}</Alert> : null}
    <div className="sales-report__summary" aria-busy={loading}>{[
      ['Total Sales', formatPrice(summary?.totalSales ?? '0')], ['Transactions', summary?.transactions ?? 0], ['Cash Sales', formatPrice(summary?.cashSales ?? '0')], ['Credit / Utang', formatPrice(summary?.creditSales ?? '0')], ['Senior Discounts', formatPrice(summary?.seniorDiscounts ?? '0')]
    ].map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>
    <section className="sales-report__transactions">
      <div className="sales-report__transactions-head"><div><h2>Sales Transactions</h2><p>{data?.orders.meta.total ?? 0} transaction{data?.orders.meta.total === 1 ? '' : 's'}</p></div><SearchField value={searchInput} onChange={setSearchInput} onClear={() => { setSearchInput(''); setSearch(''); setPage(1) }} placeholder="Search Order, Customer, Cashier, or Station..." label="Search sales transactions" /></div>
      {loading ? <LoadingState label="Loading sales report…" /> : <Table columns={columns} rows={data?.orders.data ?? []} rowKey={(row) => String(row.id)} emptyMessage="No sales transactions found for the selected filters." />}
      {data && !loading ? <Pagination currentPage={data.orders.meta.current_page} lastPage={data.orders.meta.last_page} label="Sales Report" onPageChange={setPage} pageSize={pageSize} onPageSizeChange={(size) => { setPageSize(size); setPage(1) }} /> : null}
    </section>
    <Modal open={detail !== null || detailLoading} title="Order Details" size="large" onClose={() => { detailAbort.current?.abort(); setDetailLoading(false); setDetail(null) }}>{detailLoading ? <LoadingState label="Loading order…" /> : detail ? <OrderDetailView order={detail} /> : null}</Modal>
  </section>
}
