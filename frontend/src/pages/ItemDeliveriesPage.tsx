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
import { getUserFacingApiMessage } from '../services/apiClient'
import { createDelivery, loadDeliveries, loadDelivery, loadDeliveryOptions } from '../services/itemDeliveryService'
import type { DeliveryList, DeliveryOptions, ItemDelivery } from '../types/itemDelivery'
import './item-deliveries-page.css'

type CartLine = DeliveryOptions['items'][number] & { quantity: string }
const EMPTY: DeliveryList = { deliveries: [], currentPage: 1, lastPage: 1, total: 0 }
const NO_OPTIONS: DeliveryOptions = { stations: [], receivers: [], items: [] }
const validQuantity = (value: string) => /^\d{1,9}(\.\d{1,3})?$/.test(value) && Number(value) > 0

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
      setError('Choose a Station and Receiver, then enter a positive quantity (up to three decimal places) for each item.')
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
    { key: 'number', header: 'Delivery No.', render: (row) => <strong>{row.deliveryNumber}</strong> },
    { key: 'station', header: 'Station', render: (row) => row.station.name },
    { key: 'deliveredBy', header: 'Delivered By', render: (row) => row.deliveredBy.name },
    { key: 'receivedBy', header: 'Received By', render: (row) => row.receivedBy.name },
    { key: 'date', header: 'Date', render: (row) => new Date(row.deliveredAt).toLocaleString() },
    { key: 'action', header: 'Actions', render: (row) => <Button variant="outline" onClick={() => void view(row)} icon={<AppIcons.info size={iconSize} />}>View Details</Button> }
  ]

  return <section className="page item-deliveries-page">
    <header className="page__header"><div><h1 className="page__title">Item Delivery</h1><p className="page__description">Deliver items to Stations and review completed deliveries.</p></div><Button onClick={openForm} icon={<AppIcons.add size={iconSize} />}>Deliver Items</Button></header>
    <div className="delivery-filters"><SearchField value={searchInput} onChange={setSearchInput} onClear={() => { setSearchInput(''); setSearch(''); setPage(1) }} placeholder="Search delivery number, Station, or employee..." label="Search deliveries" /><div><Label htmlFor="delivery-filter-station">Station</Label><select id="delivery-filter-station" className="ui-input" value={filterStation} onChange={(event) => { setFilterStation(event.target.value); setPage(1) }}><option value="">All Stations</option>{options.stations.map((station) => <option key={station.id} value={station.id}>{station.name}</option>)}</select></div></div>
    {!creating && error ? <Alert tone="error">{error}</Alert> : null}
    {loading ? <LoadingState label="Loading deliveries…" /> : <><p className="page__description">{list.total} deliver{list.total === 1 ? 'y' : 'ies'}</p><Table columns={columns} rows={list.deliveries} rowKey={(row) => String(row.id)} emptyMessage="No deliveries found." /><Pagination currentPage={list.currentPage} lastPage={list.lastPage} label="Delivery" onPageChange={setPage} /></>}

    <Modal open={creating} size="large" title="Deliver Items" onClose={() => { if (!submitting) setCreating(false) }} actions={<><Button variant="outline" disabled={submitting} onClick={() => setCreating(false)}>Cancel</Button><Button disabled={submitting} onClick={submitForm} icon={<AppIcons.save size={iconSize} />}>Submit Delivery</Button></>}>
      <div className="delivery-form"><div><Label htmlFor="delivery-station" required>Destination Station</Label><select id="delivery-station" className="ui-input" value={stationId} onChange={(event) => { setStationId(event.target.value); setReceiverId('') }}><option value="">Select Station</option>{options.stations.map((station) => <option key={station.id} value={station.id}>{station.name}</option>)}</select></div><div><Label htmlFor="delivery-receiver" required>Receiver</Label><select id="delivery-receiver" className="ui-input" value={receiverId} disabled={!stationId} onChange={(event) => setReceiverId(event.target.value)}><option value="">Select Receiver</option>{options.receivers.map((user) => <option key={user.id} value={user.id}>{user.name} — {user.email}</option>)}</select></div></div>
      <h3>Available Items</h3><SearchField value={itemSearchInput} onChange={setItemSearchInput} onClear={() => setItemSearchInput('')} placeholder="Search item code or name..." label="Search available items" />
      <div className="delivery-items">{options.items.map((item) => <div className="delivery-item" key={item.id}><span><strong>{item.item_code}</strong> — {item.name} ({item.units_backup})</span><Button variant="outline" disabled={cart.some((line) => line.id === item.id)} onClick={() => setCart((lines) => [...lines, { ...item, quantity: '1.000' }])} icon={<AppIcons.add size={iconSize} />}>Add</Button></div>)}</div>
      <h3>Delivery Cart</h3>{cart.length === 0 ? <p>No items added yet.</p> : <div className="delivery-items">{cart.map((line) => <div className="delivery-item" key={line.id}><span><strong>{line.item_code}</strong> — {line.name} ({line.units_backup})</span><div className="delivery-quantity"><Label htmlFor={`delivery-qty-${line.id}`}>Qty</Label><Input id={`delivery-qty-${line.id}`} type="number" min="0.001" step="0.001" value={line.quantity} onChange={(event) => setCart((lines) => lines.map((current) => current.id === line.id ? { ...current, quantity: event.target.value } : current))} /><Button variant="ghost" aria-label={`Remove ${line.name}`} onClick={() => setCart((lines) => lines.filter((current) => current.id !== line.id))} icon={<AppIcons.delete size={iconSize} />}>Remove</Button></div></div>)}</div>}
      {error ? <Alert tone="error">{error}</Alert> : null}
    </Modal>
    <Modal open={confirming} title="Confirm Item Delivery" onClose={() => { if (!submitting) setConfirming(false) }} actions={<><Button variant="outline" disabled={submitting} onClick={() => setConfirming(false)}>Cancel</Button><Button disabled={submitting} onClick={() => void confirm()} icon={<AppIcons.save size={iconSize} />}>Confirm Delivery</Button></>}><p>Station: <strong>{options.stations.find((station) => String(station.id) === stationId)?.name}</strong></p><p>Receiver: <strong>{options.receivers.find((user) => String(user.id) === receiverId)?.name}</strong></p><p>Items: <strong>{cart.length}</strong></p><p>Confirm delivery?</p></Modal>
    <Modal open={result !== null} title="Delivery Completed" onClose={() => setResult(null)} actions={<Button onClick={() => setResult(null)}>Close</Button>}>{result ? <><p><strong>{result.deliveryNumber}</strong></p><p>Station: {result.station.name}</p><p>Receiver: {result.receivedBy.name}</p><p>Items: {result.itemCount}</p><p>Date: {new Date(result.deliveredAt).toLocaleString()}</p></> : null}</Modal>
    <Modal open={detail !== null} size="large" title="Delivery Details" onClose={() => setDetail(null)} actions={<Button variant="outline" onClick={() => setDetail(null)}>Close</Button>}>{detail ? <><p><strong>{detail.deliveryNumber}</strong> · {detail.station.name}</p><p>Delivered by {detail.deliveredBy.name} · Received by {detail.receivedBy.name}</p><p>{new Date(detail.deliveredAt).toLocaleString()}</p><div className="delivery-items">{detail.items?.map((line) => <div className="delivery-item" key={line.id}><span>{line.itemCode} — {line.itemName} ({line.unit})</span><strong>{line.quantity}</strong></div>)}</div></> : null}</Modal>
  </section>
}
