import { useEffect, useRef, useState } from 'react'
import { Alert } from '../components/feedback/Alert'
import { LoadingState } from '../components/feedback/LoadingState'
import { Modal } from '../components/feedback/Modal'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Pagination, type AdminPageSize } from '../components/ui/Pagination'
import { Table, type TableColumn } from '../components/ui/Table'
import { OrderDetailView } from '../features/orders/OrderDetailView'
import { AppIcons, iconStroke } from '../lib/icons'
import { getUserFacingApiMessage } from '../services/apiClient'
import { loadDashboard, type DashboardData } from '../services/dashboardService'
import { loadOrTransactionDetail } from '../services/orderService'
import type { OrderDetail, OrderHistoryRow } from '../types/order'
import '../components/layout/page.css'
import './dashboard-page.css'

type Kpi = { label: string; value: string | number; context: string; tone?: 'warning' | 'danger' }

function peso(value: string): string {
  return `₱${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function DashboardPage() {
  const [stationId, setStationId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<AdminPageSize>(10)
  const [data, setData] = useState<DashboardData | null>(null)
  const [stations, setStations] = useState<DashboardData['stations']>([])
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [salesLoading, setSalesLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detail, setDetail] = useState<OrderDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const detailAbort = useRef<AbortController | null>(null)
  const previousStationId = useRef(stationId)

  useEffect(() => {
    const controller = new AbortController()
    const stationChanged = previousStationId.current !== stationId
    previousStationId.current = stationId
    setSalesLoading(true)
    if (stationChanged || !data) setSummaryLoading(true)
    setError(null)

    void loadDashboard({ stationId, paymentMethod, page, perPage: pageSize }, controller.signal)
      .then((result) => { setStations(result.stations); setData(result) })
      .catch((failure) => { if (!controller.signal.aborted) setError(getUserFacingApiMessage(failure)) })
      .finally(() => {
        if (!controller.signal.aborted) { setSummaryLoading(false); setSalesLoading(false) }
      })
    return () => controller.abort()
    // Keep the current response visible while its replacement is loading.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationId, paymentMethod, page, pageSize])

  async function view(order: OrderHistoryRow): Promise<void> {
    detailAbort.current?.abort()
    const controller = new AbortController()
    detailAbort.current = controller
    setDetailLoading(true); setError(null)
    try {
      const result = await loadOrTransactionDetail(order.id, controller.signal)
      if (!controller.signal.aborted) setDetail(result)
    } catch (failure) {
      if (!controller.signal.aborted) setError(getUserFacingApiMessage(failure))
    } finally {
      if (!controller.signal.aborted) setDetailLoading(false)
    }
  }

  const summary = data?.summary
  const selectedStation = stations.find((station) => String(station.id) === stationId)?.name ?? 'All Stations'
  const date = data?.date ? new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(`${data.date}T12:00:00+08:00`)) : 'Today'
  const primaryKpis: Kpi[] = [
    { label: 'Today’s Sales', value: peso(summary?.sales ?? '0'), context: 'Persisted sales today' },
    { label: 'Transactions', value: summary?.transactions ?? 0, context: 'Completed today' },
    { label: 'Cash Sales', value: peso(summary?.cash ?? '0'), context: 'Cash payments today' },
    { label: 'Credit / Utang', value: peso(summary?.credit ?? '0'), context: 'Credit orders today' }
  ]
  const operationalKpis: Kpi[] = [
    { label: 'Unremitted Cash', value: peso(summary?.unremittedCash ?? '0'), context: 'Awaiting remittance', tone: 'warning' },
    { label: 'Low Stock', value: summary?.lowStock ?? 0, context: 'Items need attention', tone: 'warning' },
    { label: 'Out of Stock', value: summary?.outOfStock ?? 0, context: 'Unavailable items', tone: 'danger' }
  ]
  const columns: TableColumn<OrderHistoryRow>[] = [
    { key: 'number', header: 'Order Number', render: (row) => row.orderNumber },
    { key: 'time', header: 'Time', render: (row) => new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit' }).format(new Date(row.orderedAt)) },
    { key: 'customer', header: 'Customer', render: (row) => row.customer?.name ?? 'Walk-in' },
    { key: 'method', header: 'Payment Method', render: (row) => <Badge tone={row.paymentMethod === 'cash' ? 'success' : 'info'}>{row.paymentMethod === 'cash' ? 'Cash' : 'Credit / Utang'}</Badge> },
    { key: 'station', header: 'Station', render: (row) => row.station.name },
    { key: 'cashier', header: 'Cashier', render: (row) => row.cashier.name },
    { key: 'total', header: 'Total', align: 'right', render: (row) => peso(row.totalAmount) },
    { key: 'remittance', header: 'Remittance Status', render: (row) => row.paymentMethod === 'credit' ? 'Not applicable' : <Badge tone={row.remittedAt ? 'success' : 'warning'}>{row.remittedAt ? 'Remitted' : 'Unremitted'}</Badge> },
    { key: 'view', header: 'View', align: 'right', render: (row) => <Button variant="outline" className="table-icon-action" icon={<AppIcons.view size={18} strokeWidth={iconStroke} />} aria-label={`View ${row.orderNumber}`} title={`View ${row.orderNumber}`} onClick={() => void view(row)} /> }
  ]

  return (
    <section className="page dashboard-page">
      <header className="page__header dashboard-page__header">
        <div><h1 className="page__title">Dashboard</h1><p className="page__description">{date} • {selectedStation}</p></div>
        <label className="dashboard-page__station"><span>Station</span><select className="ui-input" value={stationId} onChange={(event) => { setStationId(event.target.value); setPage(1) }}><option value="">All Stations</option>{stations.map((station) => <option key={station.id} value={station.id}>{station.name}</option>)}</select></label>
      </header>

      {error ? <Alert tone="warning">{error}</Alert> : null}

      <div className={`dashboard-page__kpis${summaryLoading ? ' is-refreshing' : ''}`} aria-busy={summaryLoading}>
        {primaryKpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}
      </div>

      <section className="dashboard-page__operations" aria-labelledby="operational-attention-title">
        <h2 id="operational-attention-title">Operational Attention</h2>
        <div className="dashboard-page__secondary">{operationalKpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} compact />)}</div>
      </section>

      <section className="dashboard-page__sales">
        <div className="dashboard-page__sales-head">
          <div><div className="dashboard-page__sales-title"><h2>Today’s Sales</h2>{salesLoading && data ? <span className="dashboard-page__refreshing" role="status">Refreshing…</span> : null}</div><p>{data?.orders.meta.total ?? 0} transaction{data?.orders.meta.total === 1 ? '' : 's'} today</p></div>
          <div className="dashboard-page__filters">
            <label><span>Payment Method</span><select className="ui-input" value={paymentMethod} onChange={(event) => { setPaymentMethod(event.target.value); setPage(1) }}><option value="">All</option><option value="cash">Cash</option><option value="credit">Credit / Utang</option></select></label>
          </div>
        </div>

        {!data ? <LoadingState label="Loading dashboard…" /> : <div className={`dashboard-sales-table${salesLoading ? ' is-refreshing' : ''}${data.orders.data.length === 0 ? ' is-empty' : ''}`} aria-busy={salesLoading}><Table columns={columns} rows={data.orders.data} rowKey={(row) => String(row.id)} emptyMessage="No transactions recorded today." /></div>}
        {data ? <Pagination currentPage={data.orders.meta.current_page} lastPage={data.orders.meta.last_page} label="Today's Sales" onPageChange={setPage} pageSize={pageSize} onPageSizeChange={(size) => { setPageSize(size); setPage(1) }} /> : null}
      </section>

      <Modal open={detail !== null || detailLoading} title="Order Details" size="large" onClose={() => { detailAbort.current?.abort(); setDetailLoading(false); setDetail(null) }}>
        {detailLoading ? <LoadingState label="Loading order…" /> : detail ? <OrderDetailView order={detail} showOrNumber /> : null}
      </Modal>
    </section>
  )
}

function KpiCard({ kpi, compact = false }: { kpi: Kpi; compact?: boolean }) {
  const classes = ['dashboard-page__kpi', compact ? 'dashboard-page__kpi--small' : '', kpi.tone ? `dashboard-page__kpi--${kpi.tone}` : ''].filter(Boolean).join(' ')
  return <article className={classes}><span className="dashboard-page__kpi-label">{kpi.label}</span><strong>{kpi.value}</strong><small>{kpi.context}</small></article>
}
