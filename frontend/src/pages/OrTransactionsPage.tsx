import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert } from '../components/feedback/Alert'
import { LoadingState } from '../components/feedback/LoadingState'
import { Modal } from '../components/feedback/Modal'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Pagination, type AdminPageSize } from '../components/ui/Pagination'
import { SearchField } from '../components/ui/SearchField'
import type { CustomerSort } from '../components/ui/CustomerSortHeader'
import { OrderDetailView } from '../features/orders/OrderDetailView'
import { OrTransactionTable } from '../features/orders/OrTransactionTable'
import { getUserFacingApiMessage } from '../services/apiClient'
import { loadOrTransactionDetail, loadOrTransactions } from '../services/orderService'
import { loadStationItemOptions } from '../services/stationItemService'
import type { OrderDetail, OrderHistoryList, OrderHistoryRow } from '../types/order'
import type { InventoryOption } from '../types/stationItem'
import './transactions-page.css'

const EMPTY: OrderHistoryList = { orders: [], currentPage: 1, lastPage: 1, total: 0 }

export function OrTransactionsPage() {
  const [list, setList] = useState(EMPTY)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [stationId, setStationId] = useState('')
  const [customerSort, setCustomerSort] = useState<CustomerSort>('')
  const [stations, setStations] = useState<InventoryOption[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<AdminPageSize>(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detail, setDetail] = useState<OrderDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const detailAbort = useRef<AbortController | null>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => { setPage(1); setSearch(searchInput.trim()) }, 350)
    return () => window.clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    const controller = new AbortController()
    void loadStationItemOptions('', controller.signal).then((options) => setStations(options.stations)).catch(() => setStations([]))
    return () => controller.abort()
  }, [])

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError(null)
    try { setList(await loadOrTransactions({ search, fromDate, toDate, stationId, customerSort, page, perPage: pageSize }, signal)) }
    catch (failure) { if (!signal?.aborted) { setList(EMPTY); setError(getUserFacingApiMessage(failure)) } }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [customerSort, fromDate, page, pageSize, search, stationId, toDate])

  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort() }, [load])

  async function view(order: OrderHistoryRow): Promise<void> {
    detailAbort.current?.abort()
    const controller = new AbortController()
    detailAbort.current = controller
    setDetailLoading(true); setError(null)
    try { const value = await loadOrTransactionDetail(order.id, controller.signal); if (!controller.signal.aborted) setDetail(value) }
    catch (failure) { if (!controller.signal.aborted) setError(getUserFacingApiMessage(failure)) }
    finally { if (!controller.signal.aborted) setDetailLoading(false) }
  }

  const filtered = Boolean(search || fromDate || toDate || stationId)

  return <section className="page transactions-page">
    <header className="page__header"><div><h1 className="page__title">O.R Transactions</h1><p className="page__description">View completed POS Orders as read-only O.R transactions.</p></div></header>
    <div className="transaction-filters">
      <SearchField value={searchInput} onChange={setSearchInput} onClear={() => { setSearchInput(''); setSearch(''); setPage(1) }} placeholder="Search Order number, Customer, Station, or Cashier..." label="Search O.R transactions" className="transaction-search" />
      <div><Label htmlFor="or-from-date">From</Label><Input id="or-from-date" type="date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setPage(1) }} /></div>
      <div><Label htmlFor="or-to-date">To</Label><Input id="or-to-date" type="date" min={fromDate || undefined} value={toDate} onChange={(event) => { setToDate(event.target.value); setPage(1) }} /></div>
      <div><Label htmlFor="or-station">Station</Label><select id="or-station" className="ui-input" value={stationId} onChange={(event) => { setStationId(event.target.value); setPage(1) }}><option value="">All Stations</option>{stations.map((station) => <option key={station.id} value={station.id}>{station.name}</option>)}</select></div>
    </div>
    {error ? <Alert tone="warning">{error}</Alert> : null}
    <div className="transaction-summary">{list.total} O.R transaction{list.total === 1 ? '' : 's'}</div>
    {loading ? <LoadingState label="Loading O.R transactions…" /> : <OrTransactionTable orders={list.orders} emptyMessage={filtered ? 'No O.R transactions found.' : 'No completed transactions yet.'} customerSort={customerSort} onCustomerSort={(value) => { setCustomerSort(value); setPage(1) }} onView={(order) => void view(order)} />}
    {!loading ? <Pagination currentPage={list.currentPage} lastPage={list.lastPage} label="O.R Transaction" onPageChange={setPage} pageSize={pageSize} onPageSizeChange={(value) => { setPageSize(value); setPage(1) }} /> : null}
    <Modal open={detail !== null || detailLoading} title="O.R Transaction Details" size="large" onClose={() => { detailAbort.current?.abort(); setDetailLoading(false); setDetail(null) }}>{detailLoading ? <LoadingState label="Loading transaction details…" /> : detail ? <OrderDetailView order={detail} showOrNumber /> : null}</Modal>
  </section>
}
