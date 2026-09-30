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
import { ApiError, getUserFacingApiMessage } from '../services/apiClient'
import { createSpoilage, loadSpoilage, loadSpoilageOptions, loadSpoilages } from '../services/spoilageService'
import type { Spoilage, SpoilageList, SpoilageOption, SpoilageOptions } from '../types/spoilage'
import './spoilages-page.css'

type CartLine = SpoilageOption & { quantity: string }
const EMPTY: SpoilageList = { spoilages: [], currentPage: 1, lastPage: 1, total: 0 }
const NO_OPTIONS: SpoilageOptions = { stations: [], items: [] }
const validQuantity = (value: string) => /^\d{1,9}(\.\d{1,3})?$/.test(value) && Number(value) > 0

export function SpoilagesPage() {
  const [list, setList] = useState(EMPTY)
  const [options, setOptions] = useState(NO_OPTIONS)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [filterStation, setFilterStation] = useState('')
  const [stationId, setStationId] = useState('')
  const [reason, setReason] = useState('')
  const [itemSearchInput, setItemSearchInput] = useState('')
  const [itemSearch, setItemSearch] = useState('')
  const [optionsRevision, setOptionsRevision] = useState(0)
  const [cart, setCart] = useState<CartLine[]>([])
  const [creating, setCreating] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [result, setResult] = useState<Spoilage | null>(null)
  const [detail, setDetail] = useState<Spoilage | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError(null)
    try { setList(await loadSpoilages(search, filterStation, page, signal)) }
    catch (failure) { if (!signal?.aborted) setError(getUserFacingApiMessage(failure)) }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [search, filterStation, page])
  useEffect(() => { const timer = window.setTimeout(() => { setPage(1); setSearch(searchInput.trim()) }, 350); return () => window.clearTimeout(timer) }, [searchInput])
  useEffect(() => { const controller = new AbortController(); void refresh(controller.signal); return () => controller.abort() }, [refresh])
  useEffect(() => { const timer = window.setTimeout(() => setItemSearch(itemSearchInput.trim()), 350); return () => window.clearTimeout(timer) }, [itemSearchInput])
  useEffect(() => {
    const controller = new AbortController()
    void loadSpoilageOptions(creating ? stationId : '', creating ? itemSearch : '', controller.signal).then((value) => {
      setOptions(value)
      if (creating && stationId) setCart((lines) => lines.map((line) => {
        const refreshed = value.items.find((item) => item.id === line.id)
        return refreshed ? { ...line, available: refreshed.available } : line
      }))
    }).catch((failure) => { if (!controller.signal.aborted) setError(getUserFacingApiMessage(failure)) })
    return () => controller.abort()
  }, [creating, stationId, itemSearch, optionsRevision])

  function openForm() { setStationId(''); setReason(''); setCart([]); setItemSearchInput(''); setError(null); setCreating(true) }
  function submitForm() {
    if (!stationId || cart.length === 0 || cart.some((line) => !validQuantity(line.quantity) || Number(line.quantity) > Number(line.available))) {
      setError('Choose a Station and enter a positive quantity up to three decimal places, within the available stock, for each Item.')
      return
    }
    setError(null); setConfirming(true)
  }
  async function confirm() {
    setSubmitting(true); setError(null)
    try {
      const spoilage = await createSpoilage(Number(stationId), reason, cart.map((line) => ({ itemId: line.id, quantity: line.quantity })))
      setConfirming(false); setCreating(false); setResult(spoilage); setCart([]); setStationId(''); setReason(''); setPage(1); await refresh()
    } catch (failure) {
      setConfirming(false); setError(getUserFacingApiMessage(failure))
      if (failure instanceof ApiError && failure.status === 409) {
        setCart((lines) => lines.map((line) => {
          const current = failure.currentStock.find((item) => item.itemId === line.id)
          return current ? { ...line, available: current.available } : line
        }))
        setOptionsRevision((revision) => revision + 1)
      }
    } finally { setSubmitting(false) }
  }
  async function view(row: Spoilage) {
    setError(null)
    try { setDetail(await loadSpoilage(row.id)) }
    catch (failure) { setError(getUserFacingApiMessage(failure)) }
  }

  const columns: TableColumn<Spoilage>[] = [
    { key: 'number', header: 'Spoilage No.', render: (row) => <strong>{row.spoilageNumber}</strong> },
    { key: 'station', header: 'Station', render: (row) => row.station.name },
    { key: 'recordedBy', header: 'Recorded By', render: (row) => row.recordedBy.name },
    { key: 'reason', header: 'Reason', render: (row) => row.reason || '—' },
    { key: 'date', header: 'Date', render: (row) => new Date(row.spoiledAt).toLocaleString() },
    { key: 'action', header: 'Actions', render: (row) => <Button variant="outline" onClick={() => void view(row)} icon={<AppIcons.info size={iconSize} />}>View Details</Button> }
  ]

  return <section className="page spoilages-page">
    <header className="page__header"><div><h1 className="page__title">Spoilage Management</h1><p className="page__description">Record unusable Station stock and review completed Spoilage.</p></div><Button onClick={openForm} icon={<AppIcons.add size={iconSize} />}>Record Spoilage</Button></header>
    <div className="spoilage-filters"><SearchField value={searchInput} onChange={setSearchInput} onClear={() => { setSearchInput(''); setSearch(''); setPage(1) }} placeholder="Search Spoilage number, Station, or employee..." label="Search Spoilage" /><div><Label htmlFor="spoilage-filter-station">Station</Label><select id="spoilage-filter-station" className="ui-input" value={filterStation} onChange={(event) => { setFilterStation(event.target.value); setPage(1) }}><option value="">All Stations</option>{options.stations.map((station) => <option key={station.id} value={station.id}>{station.name}</option>)}</select></div></div>
    {!creating && error ? <Alert tone="error">{error}</Alert> : null}
    {loading ? <LoadingState label="Loading Spoilage…" /> : <><p className="page__description">{list.total} Spoilage record{list.total === 1 ? '' : 's'}</p><Table columns={columns} rows={list.spoilages} rowKey={(row) => String(row.id)} emptyMessage="No Spoilage found." /><Pagination currentPage={list.currentPage} lastPage={list.lastPage} label="Spoilage" onPageChange={setPage} /></>}

    <Modal open={creating} size="large" title="Record Spoilage" onClose={() => { if (!submitting) setCreating(false) }} actions={<><Button variant="outline" disabled={submitting} onClick={() => setCreating(false)}>Cancel</Button><Button disabled={submitting} onClick={submitForm} icon={<AppIcons.save size={iconSize} />}>Record Spoilage</Button></>}>
      <div className="spoilage-form"><div><Label htmlFor="spoilage-station" required>Station</Label><select id="spoilage-station" className="ui-input" value={stationId} onChange={(event) => { setStationId(event.target.value); setCart([]); setError(null) }}><option value="">Select Station</option>{options.stations.map((station) => <option key={station.id} value={station.id}>{station.name}</option>)}</select></div><div><Label htmlFor="spoilage-reason">Reason (optional)</Label><textarea id="spoilage-reason" className="ui-input" maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} /></div></div>
      <h3>Available Station Items</h3>{stationId ? <SearchField value={itemSearchInput} onChange={setItemSearchInput} onClear={() => setItemSearchInput('')} placeholder="Search Item code or name..." label="Search Station Items" /> : <p>Select a Station to see its available stock.</p>}
      <div className="spoilage-items">{stationId && options.items.map((item) => <div className="spoilage-item" key={item.id}><span><strong>{item.itemCode}</strong> — {item.name} ({item.unit}) · Available {item.available}</span><Button variant="outline" disabled={cart.some((line) => line.id === item.id)} onClick={() => setCart((lines) => [...lines, { ...item, quantity: '1.000' }])} icon={<AppIcons.add size={iconSize} />}>Add</Button></div>)}</div>
      <h3>Spoilage Cart</h3>{cart.length === 0 ? <p>No Items added yet.</p> : <div className="spoilage-items">{cart.map((line) => <div className="spoilage-item" key={line.id}><span><strong>{line.itemCode}</strong> — {line.name} ({line.unit})<br />Available: {line.available}</span><div className="spoilage-quantity"><Label htmlFor={`spoilage-qty-${line.id}`}>Spoilage Qty</Label><Input id={`spoilage-qty-${line.id}`} type="number" min="0.001" max={line.available} step="0.001" value={line.quantity} onChange={(event) => setCart((lines) => lines.map((current) => current.id === line.id ? { ...current, quantity: event.target.value } : current))} /><Button variant="ghost" aria-label={`Remove ${line.name}`} onClick={() => setCart((lines) => lines.filter((current) => current.id !== line.id))} icon={<AppIcons.delete size={iconSize} />}>Remove</Button></div></div>)}</div>}
      {error ? <Alert tone="error">{error}</Alert> : null}
    </Modal>
    <Modal open={confirming} title="Confirm Spoilage" onClose={() => { if (!submitting) setConfirming(false) }} actions={<><Button variant="outline" disabled={submitting} onClick={() => setConfirming(false)}>Cancel</Button><Button disabled={submitting} onClick={() => void confirm()} icon={<AppIcons.warning size={iconSize} />}>Confirm Spoilage</Button></>}><p>Station: <strong>{options.stations.find((station) => String(station.id) === stationId)?.name}</strong></p><p>Items: <strong>{cart.length}</strong></p><p>Reason: {reason.trim() || 'None provided'}</p><p>This will permanently reduce Station inventory.</p></Modal>
    <Modal open={result !== null} title="Spoilage Recorded" onClose={() => setResult(null)} actions={<Button onClick={() => setResult(null)}>Close</Button>}>{result ? <><p><strong>{result.spoilageNumber}</strong></p><p>Station: {result.station.name}</p><p>Items: {result.itemCount}</p><p>Date: {new Date(result.spoiledAt).toLocaleString()}</p></> : null}</Modal>
    <Modal open={detail !== null} size="large" title="Spoilage Details" onClose={() => setDetail(null)} actions={<Button variant="outline" onClick={() => setDetail(null)}>Close</Button>}>{detail ? <><p><strong>{detail.spoilageNumber}</strong> · {detail.station.name}</p><p>Recorded by {detail.recordedBy.name}</p><p>Reason: {detail.reason || 'None provided'}</p><p>{new Date(detail.spoiledAt).toLocaleString()}</p><div className="spoilage-items">{detail.items?.map((line) => <div className="spoilage-item" key={line.id}><span>{line.itemCode} — {line.itemName} ({line.unit})</span><strong>{line.quantity}</strong></div>)}</div></> : null}</Modal>
  </section>
}
