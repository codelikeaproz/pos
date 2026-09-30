import { useCallback, useEffect, useState } from 'react'
import { Alert } from '../components/feedback/Alert'
import { LoadingState } from '../components/feedback/LoadingState'
import { Modal } from '../components/feedback/Modal'
import { useToast } from '../components/feedback/Toast'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Pagination } from '../components/ui/Pagination'
import { SearchField } from '../components/ui/SearchField'
import { Table, type TableColumn } from '../components/ui/Table'
import { AppIcons, iconSize, iconStroke } from '../lib/icons'
import { ApiError, getUserFacingApiMessage } from '../services/apiClient'
import { activatePrice, addPrice, loadPriceItemOptions, loadPrices } from '../services/priceService'
import type { PriceItemOption, PriceList, PriceRecord } from '../types/price'
import './prices-page.css'

const EMPTY: PriceList = { prices: [], currentPage: 1, lastPage: 1, total: 0 }
const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })

export function PricesPage() {
  const { showToast } = useToast()
  const [list, setList] = useState<PriceList>(EMPTY)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [itemSearchInput, setItemSearchInput] = useState('')
  const [itemSearch, setItemSearch] = useState('')
  const [options, setOptions] = useState<PriceItemOption[]>([])
  const [itemId, setItemId] = useState('')
  const [amount, setAmount] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [amountError, setAmountError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [activateTarget, setActivateTarget] = useState<PriceRecord | null>(null)

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setPageError(null)
    try { setList(await loadPrices(search, page, signal)) }
    catch (error) { if (!signal?.aborted) setPageError(getUserFacingApiMessage(error)) }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [search, page])

  useEffect(() => {
    const timeout = window.setTimeout(() => { setPage(1); setSearch(searchInput.trim()) }, 350)
    return () => window.clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    const controller = new AbortController()
    void refresh(controller.signal)
    return () => controller.abort()
  }, [refresh])

  useEffect(() => {
    const timeout = window.setTimeout(() => setItemSearch(itemSearchInput.trim()), 350)
    return () => window.clearTimeout(timeout)
  }, [itemSearchInput])

  useEffect(() => {
    if (!addOpen) return
    const controller = new AbortController()
    void loadPriceItemOptions(itemSearch, controller.signal).then(setOptions).catch((error) => {
      if (!controller.signal.aborted) setFormError(getUserFacingApiMessage(error))
    })
    return () => controller.abort()
  }, [addOpen, itemSearch])

  function openAdd(): void {
    setItemId(''); setAmount(''); setItemSearchInput(''); setItemSearch(''); setFormError(null); setAmountError(null); setAddOpen(true)
  }

  async function save(): Promise<void> {
    if (!itemId) { setFormError('Select an item.'); return }
    setSubmitting(true); setFormError(null); setAmountError(null)
    try {
      const result = await addPrice(Number(itemId), amount.trim())
      setAddOpen(false); showToast(result.message); setPage(1); await refresh()
    } catch (error) {
      setFormError(getUserFacingApiMessage(error))
      if (error instanceof ApiError) setAmountError(error.errors.amount?.[0] ?? null)
    } finally { setSubmitting(false) }
  }

  async function confirmActivation(): Promise<void> {
    if (!activateTarget) return
    setSubmitting(true); setFormError(null)
    try {
      const result = await activatePrice(activateTarget.id)
      setActivateTarget(null); showToast(result.message); await refresh()
    } catch (error) { setFormError(getUserFacingApiMessage(error)) }
    finally { setSubmitting(false) }
  }

  const columns: TableColumn<PriceRecord>[] = [
    { key: 'code', header: 'Item Code', render: (row) => <strong>{row.item.itemCode}</strong> },
    { key: 'name', header: 'Item Name', render: (row) => row.item.name },
    { key: 'amount', header: 'Price', align: 'right', render: (row) => money.format(Number(row.amount)) },
    { key: 'status', header: 'Status', render: (row) => <span className={`price-status price-status--${row.isActive ? 'active' : 'inactive'}`}>{row.isActive ? 'Active' : 'Inactive'}</span> },
    { key: 'date', header: 'Date', render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleString() : '—' },
    { key: 'action', header: 'Action', align: 'right', render: (row) => row.isActive ? '—' : <Button variant="outline" onClick={() => { setFormError(null); setActivateTarget(row) }}>Activate</Button> }
  ]

  return <section className="page prices-page">
    <header className="page__header"><div><h1 className="page__title">Price Management</h1><p className="page__description">Review price history and choose the current selling price.</p></div><Button onClick={openAdd} icon={<AppIcons.add size={iconSize} strokeWidth={iconStroke} />}>Add Price</Button></header>
    <SearchField value={searchInput} onChange={setSearchInput} onClear={() => { setSearchInput(''); setSearch(''); setPage(1) }} placeholder="Search by item code or name..." label="Search prices" />
    {pageError ? <Alert tone="error" title="Prices could not be loaded">{pageError}<Button variant="outline" onClick={() => void refresh()}>Try Again</Button></Alert> : null}
    {loading ? <LoadingState label="Loading prices…" /> : <><p className="page__description">{list.total} price record{list.total === 1 ? '' : 's'}</p><Table columns={columns} rows={list.prices} rowKey={(row) => String(row.id)} emptyMessage="No prices found." /><Pagination currentPage={list.currentPage} lastPage={list.lastPage} label="Price" onPageChange={setPage} /></>}
    <Modal open={addOpen} title="Add Price" onClose={() => !submitting && setAddOpen(false)} actions={<><Button variant="outline" disabled={submitting} onClick={() => setAddOpen(false)}>Cancel</Button><Button disabled={submitting} onClick={() => void save()} icon={<AppIcons.save size={iconSize} strokeWidth={iconStroke} />}>Add Price</Button></>}>
      <div className="price-form"><p>Adding a new price will make it the active price for this item.</p><SearchField value={itemSearchInput} onChange={(value) => { setItemSearchInput(value); setItemId('') }} onClear={() => { setItemSearchInput(''); setItemId('') }} placeholder="Search item code or name..." label="Find item" /><Label htmlFor="price-item" required>Item</Label><select id="price-item" className="ui-input" value={itemId} onChange={(event) => setItemId(event.target.value)} disabled={submitting}><option value="">Select an item</option>{options.map((item) => <option key={item.id} value={item.id}>{item.item_code} — {item.name}</option>)}</select><Label htmlFor="price-amount" required>Price</Label><Input id="price-amount" type="number" inputMode="decimal" min="0" step="0.01" value={amount} onChange={(event) => { setAmount(event.target.value); setAmountError(null) }} disabled={submitting} error={Boolean(amountError)} placeholder="0.00" />{amountError ? <span className="page__field-error">{amountError}</span> : null}{formError ? <Alert tone="error">{formError}</Alert> : null}</div>
    </Modal>
    <Modal open={activateTarget !== null} title="Activate Historical Price?" onClose={() => !submitting && setActivateTarget(null)} actions={<><Button variant="outline" disabled={submitting} onClick={() => setActivateTarget(null)}>Cancel</Button><Button disabled={submitting} onClick={() => void confirmActivation()}>Activate Price</Button></>}>
      <p>Make <strong>{activateTarget ? money.format(Number(activateTarget.amount)) : ''}</strong> the active price for <strong>{activateTarget?.item.itemCode} — {activateTarget?.item.name}</strong>?</p>{formError ? <Alert tone="error">{formError}</Alert> : null}
    </Modal>
  </section>
}
