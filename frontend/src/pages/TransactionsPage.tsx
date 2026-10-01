import { useCallback, useEffect, useState } from 'react'
import { Alert } from '../components/feedback/Alert'
import { LoadingState } from '../components/feedback/LoadingState'
import { Modal } from '../components/feedback/Modal'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { SearchField } from '../components/ui/SearchField'
import { Pagination } from '../components/ui/Pagination'
import { useAuth } from '../features/auth/AuthContext'
import { OrderDetailView } from '../features/orders/OrderDetailView'
import { TransactionTable } from '../features/orders/TransactionTable'
import { getUserFacingApiMessage } from '../services/apiClient'
import { loadOrderDetail, loadOrderHistory } from '../services/orderService'
import { loadStationItemOptions } from '../services/stationItemService'
import type { OrderDetail, OrderHistoryList, OrderHistoryRow } from '../types/order'
import type { InventoryOption } from '../types/stationItem'
import './transactions-page.css'

const EMPTY: OrderHistoryList = { orders: [], currentPage: 1, lastPage: 1, total: 0 }

export function TransactionsPage() {
  const { currentUser } = useAuth()
  const [list, setList] = useState(EMPTY)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [stationId, setStationId] = useState('')
  const [stations, setStations] = useState<InventoryOption[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detail, setDetail] = useState<OrderDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    const timeout = window.setTimeout(() => { setPage(1); setSearch(searchInput.trim()) }, 350)
    return () => window.clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    if (currentUser?.role !== 'admin') return
    const controller = new AbortController()
    void loadStationItemOptions('', controller.signal).then((options) => setStations(options.stations)).catch(() => setStations([]))
    return () => controller.abort()
  }, [currentUser?.role])

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError(null)
    try { setList(await loadOrderHistory({ search, fromDate, toDate, stationId, page }, signal)) }
    catch (loadError) { if (!signal?.aborted) { setList(EMPTY); setError(getUserFacingApiMessage(loadError)) } }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [fromDate, page, search, stationId, toDate])

  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort() }, [load])

  async function view(order: OrderHistoryRow): Promise<void> {
    setDetailLoading(true); setError(null)
    try { setDetail(await loadOrderDetail(order.id)) }
    catch (loadError) { setError(getUserFacingApiMessage(loadError)) }
    finally { setDetailLoading(false) }
  }

  const filtered = Boolean(search || fromDate || toDate || stationId)

  return <section className="page transactions-page">
    <header className="page__header"><div><h1 className="page__title">Transaction History</h1><p className="page__description">View completed, read-only sales transactions.</p></div></header>
    <div className="transaction-filters">
      <SearchField value={searchInput} onChange={setSearchInput} onClear={() => { setSearchInput(''); setSearch(''); setPage(1) }} placeholder="Search order number, cashier, or Station..." label="Search transactions" className="transaction-search" />
      <div><Label htmlFor="from-date">From</Label><Input id="from-date" type="date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setPage(1) }} /></div>
      <div><Label htmlFor="to-date">To</Label><Input id="to-date" type="date" min={fromDate || undefined} value={toDate} onChange={(event) => { setToDate(event.target.value); setPage(1) }} /></div>
      {currentUser?.role === 'admin' ? <div><Label htmlFor="history-station">Station</Label><select id="history-station" className="ui-input" value={stationId} onChange={(event) => { setStationId(event.target.value); setPage(1) }}><option value="">All Stations</option>{stations.map((station) => <option key={station.id} value={station.id}>{station.name}</option>)}</select></div> : null}
    </div>
    {error ? <Alert tone="warning">{error}</Alert> : null}
    <div className="transaction-summary">{list.total} transaction{list.total === 1 ? '' : 's'}</div>
    {loading ? <LoadingState label="Loading transactions…" /> : <TransactionTable orders={list.orders} emptyMessage={filtered ? 'No transactions found.' : 'No transactions yet.'} onView={(order) => void view(order)} />}
    {!loading && <Pagination currentPage={list.currentPage} lastPage={list.lastPage} label="Transaction" onPageChange={setPage} />}
    <Modal open={detail !== null || detailLoading} title="Order Details" size="large" onClose={() => { if (!detailLoading) setDetail(null) }}>{detailLoading ? <LoadingState label="Loading order details…" /> : detail ? <OrderDetailView order={detail} /> : null}</Modal>
  </section>
}
