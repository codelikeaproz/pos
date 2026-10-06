import { useEffect, useRef, useState } from 'react'
import { Alert } from '../../components/feedback/Alert'
import { LoadingState } from '../../components/feedback/LoadingState'
import { Modal } from '../../components/feedback/Modal'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Pagination } from '../../components/ui/Pagination'
import { SearchField } from '../../components/ui/SearchField'
import type { CustomerSort } from '../../components/ui/CustomerSortHeader'
import { OrderDetailView } from '../orders/OrderDetailView'
import { OrTransactionTable } from '../orders/OrTransactionTable'
import { TransactionTable } from '../orders/TransactionTable'
import { getUserFacingApiMessage } from '../../services/apiClient'
import { loadOrderDetail, loadOrderHistory, loadPosOrTransactionDetail, loadPosOrTransactions } from '../../services/orderService'
import type { OrderDetail, OrderHistoryList, OrderHistoryRow } from '../../types/order'
import './pos-dialogs.css'

const EMPTY: OrderHistoryList = { orders: [], currentPage: 1, lastPage: 1, total: 0 }

export function PosTransactionsDialog({ open, stationId, mode = 'station', onClose }: { open: boolean; stationId: number; mode?: 'station' | 'or'; onClose: () => void }) {
  const isOr = mode === 'or'
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [customerSort, setCustomerSort] = useState<CustomerSort>('')
  const [page, setPage] = useState(1)
  const [list, setList] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<OrderDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const detailAbort = useRef<AbortController | null>(null)

  useEffect(() => { if (!open) return; const timer = window.setTimeout(() => { setPage(1); setSearch(searchInput.trim()) }, 350); return () => window.clearTimeout(timer) }, [open, searchInput])
  useEffect(() => {
    if (!open || !stationId) return
    const controller = new AbortController()
    setLoading(true); setError(null)
    const loader = mode === 'or' ? loadPosOrTransactions : loadOrderHistory
    void loader({ search, fromDate, toDate, stationId: String(stationId), customerSort: isOr ? customerSort : '', page, perPage: 15 }, controller.signal)
      .then(setList).catch((failure) => { if (!controller.signal.aborted) setError(getUserFacingApiMessage(failure)) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [open, stationId, search, fromDate, toDate, page, mode, customerSort, isOr])

  async function view(order: OrderHistoryRow): Promise<void> {
    detailAbort.current?.abort()
    const controller = new AbortController()
    detailAbort.current = controller
    setDetailLoading(true); setError(null)
    try { const orderDetail = await (mode === 'or' ? loadPosOrTransactionDetail : loadOrderDetail)(order.id, controller.signal); if (!controller.signal.aborted) setDetail(orderDetail) }
    catch (failure) { if (!controller.signal.aborted) setError(getUserFacingApiMessage(failure)) }
    finally { if (!controller.signal.aborted) setDetailLoading(false) }
  }

  function back(): void { detailAbort.current?.abort(); setDetailLoading(false); setDetail(null) }
  function close(): void { back(); onClose() }
  const showingDetail = detail !== null || detailLoading

  const table = isOr
    ? <OrTransactionTable orders={list.orders} emptyMessage="No O.R transactions found." customerSort={customerSort} onCustomerSort={(value) => { setCustomerSort(value); setPage(1) }} onView={(order) => void view(order)} />
    : <TransactionTable orders={list.orders} emptyMessage="No Station transactions found." showDateRemitted onView={(order) => void view(order)} />

  return <Modal open={open} title={showingDetail ? (isOr ? 'O.R Transaction Details' : 'Order Details') : (isOr ? 'O.R Transactions' : 'Station Transactions')} size="large" onClose={close} actions={showingDetail ? <Button variant="outline" onClick={back}>Back to Transactions</Button> : undefined}>
    {showingDetail ? detailLoading ? <LoadingState label="Loading Order details…" /> : detail ? <OrderDetailView order={detail} showOrNumber={isOr} /> : null : <div className="pos-dialog-content">
      <p className="pos-dialog-content__note">Read-only {isOr ? 'O.R transactions' : 'sales'} from the current Station.</p>
      <div className="pos-dialog-content__filters"><SearchField value={searchInput} onChange={setSearchInput} onClear={() => setSearchInput('')} placeholder={isOr ? 'Search Order number, Customer, Station, or Cashier...' : 'Search Order number or Cashier...'} label={isOr ? 'Search O.R transactions' : 'Search Station transactions'} /><div><Label htmlFor={`pos-${mode}-from`}>From</Label><Input id={`pos-${mode}-from`} type="date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setPage(1) }} /></div><div><Label htmlFor={`pos-${mode}-to`}>To</Label><Input id={`pos-${mode}-to`} type="date" min={fromDate || undefined} value={toDate} onChange={(event) => { setToDate(event.target.value); setPage(1) }} /></div></div>
      {error ? <Alert tone="warning">{error}</Alert> : null}
      {loading ? <LoadingState label={`Loading ${isOr ? 'O.R' : 'Station'} transactions…`} /> : <><p className="pos-dialog-content__note">{list.total} transaction{list.total === 1 ? '' : 's'}</p>{table}<Pagination currentPage={list.currentPage} lastPage={list.lastPage} label="Transaction" onPageChange={setPage} /></>}
    </div>}
  </Modal>
}
