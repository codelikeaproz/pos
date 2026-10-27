import { useCallback, useEffect, useState } from 'react'
import { Alert } from '../components/feedback/Alert'
import { LoadingState } from '../components/feedback/LoadingState'
import { Modal } from '../components/feedback/Modal'
import { useToast } from '../components/feedback/Toast'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Pagination, type AdminPageSize } from '../components/ui/Pagination'
import { SearchField } from '../components/ui/SearchField'
import { Table, type TableColumn } from '../components/ui/Table'
import { CustomerSortHeader, type CustomerSort } from '../components/ui/CustomerSortHeader'
import { currentManilaDateTimeLocal, formatManilaDateTime } from '../lib/dateTime'
import { AppIcons, iconSize, iconStroke } from '../lib/icons'
import { getUserFacingApiMessage } from '../services/apiClient'
import { loadCreditMonitoring, loadCreditOrder, recordCreditPayment } from '../services/creditMonitoringService'
import type { CreditMonitoringList, CreditOrder } from '../types/creditMonitoring'
import './credit-monitoring-page.css'

const EMPTY: CreditMonitoringList = { orders: [], currentPage: 1, lastPage: 1, total: 0, totalOutstanding: '0.00' }
const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })

export function CreditMonitoringPage() {
  const { showToast } = useToast()
  const [list, setList] = useState(EMPTY)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<AdminPageSize>(10)
  const [customerSort, setCustomerSort] = useState<CustomerSort>('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<CreditOrder | null>(null)
  const [amount, setAmount] = useState(''), [paidAt, setPaidAt] = useState(''), [description, setDescription] = useState('')
  const [paymentError, setPaymentError] = useState<string | null>(null), [submitting, setSubmitting] = useState(false)

  useEffect(() => { const timer = window.setTimeout(() => { setPage(1); setSearch(searchInput.trim()) }, 350); return () => window.clearTimeout(timer) }, [searchInput])
  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError(null)
    try { setList(await loadCreditMonitoring(search, fromDate, toDate, customerSort, status, page, pageSize, signal)) }
    catch (failure) { if (!signal?.aborted) { setList(EMPTY); setError(getUserFacingApiMessage(failure)) } }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [customerSort, status, search, fromDate, toDate, page, pageSize])
  useEffect(() => { const controller = new AbortController(); void refresh(controller.signal); return () => controller.abort() }, [refresh])

  const columns: TableColumn<CreditOrder>[] = [
    { key: 'or', header: 'O.R Number', render: (row) => row.orNumber ?? '—' },
    { key: 'order', header: 'Order No.', render: (row) => row.orderNumber },
    { key: 'date', header: 'Date', render: (row) => formatManilaDateTime(row.orderedAt) },
    { key: 'customer', header: <CustomerSortHeader value={customerSort} onChange={(value) => { setCustomerSort(value); setPage(1) }} />, render: (row) => row.customer?.name ?? '—' },
    { key: 'total', header: 'Credit Amount', align: 'right', render: (row) => money.format(Number(row.totalAmount)) },
    { key: 'paid', header: 'Total Paid', align: 'right', render: (row) => money.format(Number(row.totalPaid)) },
    { key: 'outstanding', header: 'Outstanding', align: 'right', render: (row) => money.format(Number(row.outstandingBalance)) },
    { key: 'age', header: 'Age', align: 'right', render: (row) => row.ageDays },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={row.status === 'PAID' ? 'success' : row.status === 'UNPAID' ? 'error' : 'warning'}>{row.status.replace('_', ' ')}</Badge> },
    { key: 'action', header: 'Actions', align: 'right', render: (row) => row.status === 'PAID' ? <Button className="table-icon-action" variant="outline" aria-label={`View payment history for ${row.orNumber ?? row.orderNumber}`} title="View payment history" onClick={() => void openPayment(row)} icon={<AppIcons.view size={iconSize} strokeWidth={iconStroke} />} /> : <Button variant="outline" onClick={() => void openPayment(row)}>Record Payment</Button> }
  ]

  async function openPayment(row: CreditOrder) { setPaymentError(null); setAmount(''); setDescription(''); setPaidAt(currentManilaDateTimeLocal()); try { setSelected(await loadCreditOrder(row.id)) } catch (failure) { setError(getUserFacingApiMessage(failure)) } }
  async function submitPayment() { if (!selected) return; setSubmitting(true); setPaymentError(null); try { const response = await recordCreditPayment(selected.id, amount, paidAt, description); setSelected(response.order); setAmount(''); setDescription(''); showToast(response.message); await refresh() } catch (failure) { setPaymentError(getUserFacingApiMessage(failure)) } finally { setSubmitting(false) } }

  return <section className="page credit-monitoring-page">
    <header className="page__header"><div><h1 className="page__title">Credit Monitoring</h1><p className="page__description">Monitor balances and record immutable Credit payments.</p></div></header>
    <div className="credit-monitoring-page__filters"><SearchField value={searchInput} onChange={setSearchInput} onClear={() => { setSearchInput(''); setSearch(''); setPage(1) }} placeholder="Search O.R, order, Customer, or employee number..." label="Search Credit transactions" /><div><Label htmlFor="credit-status">Status</Label><select id="credit-status" className="ui-input" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}><option value="">All</option><option value="unpaid">Unpaid</option><option value="partially_paid">Partially Paid</option><option value="paid">Paid</option></select></div><div><Label htmlFor="credit-from">From</Label><Input id="credit-from" type="date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setPage(1) }} /></div><div><Label htmlFor="credit-to">To</Label><Input id="credit-to" type="date" min={fromDate || undefined} value={toDate} onChange={(event) => { setToDate(event.target.value); setPage(1) }} /></div></div>
    {error ? <Alert tone="error">{error}</Alert> : null}
    {loading ? <LoadingState label="Loading Credit transactions…" /> : <><Table columns={columns} rows={list.orders} rowKey={(row) => String(row.id)} emptyMessage="No Credit transactions found." /><Pagination currentPage={list.currentPage} lastPage={list.lastPage} label="Credit transaction" onPageChange={setPage} pageSize={pageSize} onPageSizeChange={(value) => { setPageSize(value); setPage(1) }} /><div className="credit-monitoring-page__total"><span>Total Outstanding:</span><strong>{money.format(Number(list.totalOutstanding))}</strong></div></>}
    <Modal open={selected !== null} title="Record Credit Payment" size="large" onClose={() => !submitting && setSelected(null)} actions={selected?.status === 'PAID' ? undefined : <Button disabled={submitting} onClick={() => void submitPayment()}>{submitting ? 'Recording…' : 'Record Payment'}</Button>}>
      {selected ? <div className="modal-summary"><div className="modal-summary__grid"><div className="modal-summary__field"><span>Customer</span><strong>{selected.customer?.name}</strong></div><div className="modal-summary__field"><span>Employee Number</span><strong>{selected.customer?.employeeNumber ?? '—'}</strong></div><div className="modal-summary__field"><span>O.R Number</span><strong>{selected.orNumber ?? '—'}</strong></div><div className="modal-summary__field"><span>Order Number</span><strong>{selected.orderNumber}</strong></div><div className="modal-summary__field"><span>Credit Amount</span><strong>{money.format(Number(selected.totalAmount))}</strong></div><div className="modal-summary__field"><span>Total Paid</span><strong>{money.format(Number(selected.totalPaid))}</strong></div><div className="modal-summary__field"><span>Outstanding</span><strong>{money.format(Number(selected.outstandingBalance))}</strong></div><div className="modal-summary__field"><span>Status</span><strong>{selected.status.replace('_', ' ')}</strong></div></div>{selected.status !== 'PAID' ? <><Label htmlFor="credit-payment-amount" required>Payment Amount</Label><Input id="credit-payment-amount" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} /><Label htmlFor="credit-payment-date" required>Date Paid</Label><Input id="credit-payment-date" type="datetime-local" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} /><Label htmlFor="credit-payment-description">Description</Label><textarea id="credit-payment-description" className="ui-input" value={description} onChange={(event) => setDescription(event.target.value)} />{paymentError ? <Alert tone="error">{paymentError}</Alert> : null}</> : null}<h3>Payment History</h3>{selected.payments?.length ? <Table columns={[{ key: 'number', header: 'Payment Number', render: (p) => p.paymentNumber }, { key: 'amount', header: 'Amount', render: (p) => money.format(Number(p.amount)) }, { key: 'date', header: 'Date Paid', render: (p) => formatManilaDateTime(p.paidAt) }, { key: 'by', header: 'Recorded By', render: (p) => p.recordedBy.name }, { key: 'description', header: 'Description', render: (p) => p.description ?? '—' }]} rows={selected.payments} rowKey={(p) => String(p.id)} /> : <p>No payments recorded.</p>}</div> : null}
    </Modal>
  </section>
}
