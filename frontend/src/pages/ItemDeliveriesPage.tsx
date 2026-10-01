import { useCallback, useEffect, useState } from 'react'
import { Alert } from '../components/feedback/Alert'
import { LoadingState } from '../components/feedback/LoadingState'
import { Modal } from '../components/feedback/Modal'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Pagination } from '../components/ui/Pagination'
import { SearchField } from '../components/ui/SearchField'
import { Table, type TableColumn } from '../components/ui/Table'
import { AppIcons, iconSize } from '../lib/icons'
import { formatQuantity } from '../lib/posCalculations'
import { getUserFacingApiMessage } from '../services/apiClient'
import { createDelivery, loadDeliveries, loadDelivery, loadDeliveryOptions } from '../services/itemDeliveryService'
import type { DeliveryList, DeliveryOptions, ItemDelivery } from '../types/itemDelivery'
import './item-deliveries-page.css'

type CartLine = DeliveryOptions['items'][number] & { quantity: string }
const EMPTY: DeliveryList = { deliveries: [], currentPage: 1, lastPage: 1, total: 0 }
const NO_OPTIONS: DeliveryOptions = { stations: [], receivers: [], items: [] }
const validQuantity = (value: string) => /^\d{1,9}(\.\d{1,2})?$/.test(value) && Number(value) > 0

export function ItemDeliveriesPage() {
  const [list, setList] = useState(EMPTY)
  const [options, setOptions] = useState(NO_OPTIONS)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [filterStation, setFilterStation] = useState('')
  const [stationId, setStationId] = useState('')
  const [receiverId, setReceiverId] = useState('')
  const [itemSearchInput, setItemSearchInput] = useState('')
  const [itemSearch, setItemSearch] = useState('')
  const [cart, setCart] = useState<CartLine[]>([])
  const [creating, setCreating] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [result, setResult] = useState<ItemDelivery | null>(null)
  const [detail, setDetail] = useState<ItemDelivery | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError(null)
    try { setList(await loadDeliveries(search, filterStation, page, signal)) }
    catch (failure) { if (!signal?.aborted) setError(getUserFacingApiMessage(failure)) }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [search, filterStation, page])

  useEffect(() => { const timer = window.setTimeout(() => { setPage(1); setSearch(searchInput.trim()) }, 350); return () => window.clearTimeout(timer) }, [searchInput])
  useEffect(() => { const controller = new AbortController(); void refresh(controller.signal); return () => controller.abort() }, [refresh])
  useEffect(() => { const timer = window.setTimeout(() => setItemSearch(itemSearchInput.trim()), 350); return () => window.clearTimeout(timer) }, [itemSearchInput])
  useEffect(() => {
    const controller = new AbortController()
    void loadDeliveryOptions(creating ? stationId : '', creating ? itemSearch : '', controller.signal).then(setOptions).catch((failure) => {
      if (!controller.signal.aborted) setError(getUserFacingApiMessage(failure))
    })
    return () => controller.abort()
  }, [creating, stationId, itemSearch])

  function openForm() { setStationId(''); setReceiverId(''); setCart([]); setItemSearchInput(''); setError(null); setCreating(true) }
  function submitForm() {
    if (!stationId || !receiverId || cart.length === 0 || cart.some((line) => !validQuantity(line.quantity))) {
      setError('Choose a Station and Receiver, then enter a positive quantity (up to two decimal places) for each item.')
      return
    }
    setError(null); setConfirming(true)
  }
  async function confirm() {
    setSubmitting(true); setError(null)
    try {
      const delivery = await createDelivery(Number(stationId), Number(receiverId), cart.map((line) => ({ itemId: line.id, quantity: line.quantity })))
      setConfirming(false); setCreating(false); setResult(delivery); setCart([]); setStationId(''); setReceiverId(''); setPage(1); await refresh()
    } catch (failure) { setConfirming(false); setError(getUserFacingApiMessage(failure)) }
    finally { setSubmitting(false) }
  }
  async function view(row: ItemDelivery) {
    setError(null)
    try { setDetail(await loadDelivery(row.id)) }
    catch (failure) { setError(getUserFacingApiMessage(failure)) }
  }

  const columns: TableColumn<ItemDelivery>[] = [
    { key: 'number', header: 'Delivery No.', render: (row) => row.deliveryNumber },
    { key: 'station', header: 'Station', render: (row) => row.station.name },
    { key: 'deliveredBy', header: 'Delivered By', render: (row) => row.deliveredBy.name },
    { key: 'receivedBy', header: 'Received By', render: (row) => row.receivedBy.name },
    { key: 'date', header: 'Date', render: (row) => new Date(row.deliveredAt).toLocaleString() },
    { key: 'details', header: 'Details', align: 'center', render: (row) => <Button className="table-icon-action" variant="outline" aria-label={`View ${row.deliveryNumber}`} title={`View ${row.deliveryNumber}`} onClick={() => void view(row)} icon={<AppIcons.view size={iconSize} />} /> }
  ]

  const availableColumns: TableColumn<DeliveryOptions['items'][number]>[] = [
    { key: 'item', header: <label className="delivery-item-checkbox"><input type="checkbox" disabled={options.items.length === 0} checked={options.items.length > 0 && options.items.every((item) => cart.some((line) => line.id === item.id))} aria-label="Select or unselect all listed delivery items" onChange={(event) => {
      const listedIds = new Set(options.items.map((item) => item.id))
      setCart((lines) => event.target.checked
        ? [...lines, ...options.items.filter((item) => !lines.some((line) => line.id === item.id)).map((item) => ({ ...item, quantity: '1' }))]
        : lines.filter((line) => !listedIds.has(line.id)))
    }} /><span>Item</span></label>, render: (row) => {
      const selected = cart.some((line) => line.id === row.id)
      return <label className="delivery-item-checkbox"><input type="checkbox" checked={selected} aria-label={`${selected ? 'Remove' : 'Add'} ${row.name} ${selected ? 'from' : 'to'} delivery`} onChange={(event) => setCart((lines) => event.target.checked ? [...lines, { ...row, quantity: '1' }] : lines.filter((line) => line.id !== row.id))} /><span>{row.name}</span></label>
    } },
    { key: 'code', header: 'Item Code', render: (row) => row.item_code },
    { key: 'unit', header: 'Unit', render: (row) => row.units_backup }
  ]

  const selectedColumns: TableColumn<CartLine>[] = [
    { key: 'item', header: 'Item', render: (row) => row.name },
    { key: 'code', header: 'Item Code', render: (row) => row.item_code },
    { key: 'unit', header: 'Unit', render: (row) => row.units_backup },
    { key: 'quantity', header: 'Qty', render: (row) => <Input className="delivery-quantity-input" aria-label={`Quantity for ${row.name}`} inputMode="decimal" value={row.quantity} onChange={(event) => setCart((lines) => lines.map((current) => current.id === row.id ? { ...current, quantity: event.target.value } : current))} /> },
    { key: 'remove', header: '', align: 'right', render: (row) => <Button className="table-icon-action" variant="ghost" aria-label={`Remove ${row.name} from delivery`} title={`Remove ${row.name}`} onClick={() => setCart((lines) => lines.filter((current) => current.id !== row.id))} icon={<AppIcons.delete size={iconSize} />} /> }
  ]

  const detailColumns: TableColumn<NonNullable<ItemDelivery['items']>[number]>[] = [
    { key: 'item', header: 'Item', render: (row) => row.itemName },
    { key: 'code', header: 'Item Code', render: (row) => row.itemCode },
    { key: 'unit', header: 'Unit', render: (row) => row.unit },
    { key: 'quantity', header: 'Delivered Qty', align: 'right', render: (row) => formatQuantity(row.quantity) }
  ]

  return <section className="page item-deliveries-page">
    <header className="page__header"><div><h1 className="page__title">Item Delivery</h1><p className="page__description">Deliver items to Stations and review completed deliveries.</p></div><Button onClick={openForm} icon={<AppIcons.add size={iconSize} />}>Deliver Items</Button></header>
    <div className="delivery-filters"><SearchField value={searchInput} onChange={setSearchInput} onClear={() => { setSearchInput(''); setSearch(''); setPage(1) }} placeholder="Search delivery number, Station, or employee..." label="Search deliveries" /><div><Label htmlFor="delivery-filter-station">Station</Label><select id="delivery-filter-station" className="ui-input" value={filterStation} onChange={(event) => { setFilterStation(event.target.value); setPage(1) }}><option value="">All Stations</option>{options.stations.map((station) => <option key={station.id} value={station.id}>{station.name}</option>)}</select></div></div>
    {!creating && error ? <Alert tone="error">{error}</Alert> : null}
    {loading ? <LoadingState label="Loading deliveries…" /> : <><p className="page__description">{list.total} deliver{list.total === 1 ? 'y' : 'ies'}</p><Table columns={columns} rows={list.deliveries} rowKey={(row) => String(row.id)} emptyMessage="No deliveries found." /><Pagination currentPage={list.currentPage} lastPage={list.lastPage} label="Delivery" onPageChange={setPage} /></>}

    <Modal open={creating} size="large" title="Deliver Items" onClose={() => { if (!submitting) setCreating(false) }} actions={<><Button variant="outline" disabled={submitting} onClick={() => setCreating(false)}>Cancel</Button><Button disabled={submitting} onClick={submitForm} icon={<AppIcons.save size={iconSize} />}>Submit Delivery</Button></>}>
      <div className="delivery-form"><div><Label htmlFor="delivery-station" required>Destination Station</Label><select id="delivery-station" className="ui-input" value={stationId} onChange={(event) => { setStationId(event.target.value); setReceiverId('') }}><option value="">Select Station</option>{options.stations.map((station) => <option key={station.id} value={station.id}>{station.name}</option>)}</select></div><div><Label htmlFor="delivery-receiver" required>Receiver</Label><select id="delivery-receiver" className="ui-input" value={receiverId} disabled={!stationId} onChange={(event) => setReceiverId(event.target.value)}><option value="">Select Receiver</option>{options.receivers.map((user) => <option key={user.id} value={user.id}>{user.name} — {user.email}</option>)}</select></div></div>
      <div className="delivery-item-search"><Label>Search Items</Label><SearchField value={itemSearchInput} onChange={setItemSearchInput} onClear={() => setItemSearchInput('')} placeholder="Search item code or name..." label="Search available items" /></div>
      <div className="delivery-workspace">
        <section className="delivery-workspace__available"><h3>Available Items</h3><Table columns={availableColumns} rows={options.items} rowKey={(row) => String(row.id)} emptyMessage={stationId ? 'No available items found.' : 'Select a Station to view Items.'} /></section>
        <section className="delivery-workspace__selected"><h3>Selected Delivery Items</h3><Table columns={selectedColumns} rows={cart} rowKey={(row) => String(row.id)} emptyMessage="No items selected." /></section>
      </div>
      {error ? <Alert tone="error">{error}</Alert> : null}
    </Modal>
    <Modal open={confirming} title="Confirm Item Delivery" onClose={() => { if (!submitting) setConfirming(false) }} actions={<><Button variant="outline" disabled={submitting} onClick={() => setConfirming(false)}>Cancel</Button><Button disabled={submitting} onClick={() => void confirm()} icon={<AppIcons.save size={iconSize} />}>Confirm Delivery</Button></>}><p>Station: <strong>{options.stations.find((station) => String(station.id) === stationId)?.name}</strong></p><p>Receiver: <strong>{options.receivers.find((user) => String(user.id) === receiverId)?.name}</strong></p><p>Items: <strong>{cart.length}</strong></p><p>Confirm delivery?</p></Modal>
    <Modal open={result !== null} title="Delivery Completed" onClose={() => setResult(null)} actions={<Button onClick={() => setResult(null)}>Close</Button>}>{result ? <><p><strong>{result.deliveryNumber}</strong></p><p>Station: {result.station.name}</p><p>Receiver: {result.receivedBy.name}</p><p>Items: {result.itemCount}</p><p>Date: {new Date(result.deliveredAt).toLocaleString()}</p></> : null}</Modal>
    <Modal open={detail !== null} size="large" title="Delivery Details" onClose={() => setDetail(null)}>{detail ? <><div className="delivery-detail-meta"><p><span>Delivery No.</span>{detail.deliveryNumber}</p><p><span>Station</span>{detail.station.name}</p><p><span>Delivered By</span>{detail.deliveredBy.name}</p><p><span>Received By</span>{detail.receivedBy.name}</p><p><span>Date</span>{new Date(detail.deliveredAt).toLocaleString()}</p></div><Table columns={detailColumns} rows={detail.items ?? []} rowKey={(row) => String(row.id)} emptyMessage="No delivery items recorded." /></> : null}</Modal>
  </section>
}
