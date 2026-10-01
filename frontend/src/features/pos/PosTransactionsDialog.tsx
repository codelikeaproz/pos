import { useEffect, useRef, useState } from 'react'
import { Alert } from '../../components/feedback/Alert'
import { LoadingState } from '../../components/feedback/LoadingState'
import { Modal } from '../../components/feedback/Modal'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Pagination } from '../../components/ui/Pagination'
import { SearchField } from '../../components/ui/SearchField'
import { OrderDetailView } from '../orders/OrderDetailView'
import { TransactionTable } from '../orders/TransactionTable'
import { getUserFacingApiMessage } from '../../services/apiClient'
import { loadOrderDetail, loadOrderHistory } from '../../services/orderService'
import type { OrderDetail, OrderHistoryList, OrderHistoryRow } from '../../types/order'
import './pos-dialogs.css'

const EMPTY: OrderHistoryList = { orders: [], currentPage: 1, lastPage: 1, total: 0 }

export function PosTransactionsDialog({ open, stationId, onClose }: { open: boolean; stationId: number; onClose: () => void }) {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
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
    void loadOrderHistory({ search, fromDate, toDate, stationId: String(stationId), page }, controller.signal)
      .then(setList).catch((failure) => { if (!controller.signal.aborted) setError(getUserFacingApiMessage(failure)) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [open, stationId, search, fromDate, toDate, page])

  async function view(order: OrderHistoryRow): Promise<void> {
    detailAbort.current?.abort()
    const controller = new AbortController()
    detailAbort.current = controller
    setDetailLoading(true); setError(null)
    try { const orderDetail = await loadOrderDetail(order.id, controller.signal); if (!controller.signal.aborted) setDetail(orderDetail) }
    catch (failure) { if (!controller.signal.aborted) setError(getUserFacingApiMessage(failure)) }
    finally { if (!controller.signal.aborted) setDetailLoading(false) }
  }

  function back(): void { detailAbort.current?.abort(); setDetailLoading(false); setDetail(null) }
  function close(): void { back(); onClose() }
  const showingDetail = detail !== null || detailLoading

  return <Modal open={open} title={showingDetail ? 'Order Details' : 'Station Transactions'} size="large" onClose={close} actions={showingDetail ? <Button variant="outline" onClick={back}>Back to Transactions</Button> : undefined}>
    {showingDetail ? detailLoading ? <LoadingState label="Loading Order details…" /> : detail ? <OrderDetailView order={detail} /> : null : <div className="pos-dialog-content">
      <p className="pos-dialog-content__note">Read-only sales from the current Station.</p>
      <div className="pos-dialog-content__filters"><SearchField value={searchInput} onChange={setSearchInput} onClear={() => setSearchInput('')} placeholder="Search Order number or Cashier..." label="Search Station transactions" /><div><Label htmlFor="pos-transactions-from">From</Label><Input id="pos-transactions-from" type="date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setPage(1) }} /></div><div><Label htmlFor="pos-transactions-to">To</Label><Input id="pos-transactions-to" type="date" min={fromDate || undefined} value={toDate} onChange={(event) => { setToDate(event.target.value); setPage(1) }} /></div></div>
      {error ? <Alert tone="warning">{error}</Alert> : null}
      {loading ? <LoadingState label="Loading Station transactions…" /> : <><p className="pos-dialog-content__note">{list.total} transaction{list.total === 1 ? '' : 's'}</p><TransactionTable orders={list.orders} emptyMessage="No Station transactions found." onView={(order) => void view(order)} /><Pagination currentPage={list.currentPage} lastPage={list.lastPage} label="Transaction" onPageChange={setPage} /></>}
    </div>}
  </Modal>
}
