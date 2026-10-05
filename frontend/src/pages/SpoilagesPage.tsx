import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Alert } from '../components/feedback/Alert'
import { LoadingState } from '../components/feedback/LoadingState'
import { Modal } from '../components/feedback/Modal'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Pagination } from '../components/ui/Pagination'
import { SearchField } from '../components/ui/SearchField'
import { Table, type TableColumn } from '../components/ui/Table'
import { formatManilaDate, formatManilaDateTime } from '../lib/dateTime'
import { AppIcons, iconSize } from '../lib/icons'
import { formatQuantity } from '../lib/posCalculations'
import { ApiError, getUserFacingApiMessage } from '../services/apiClient'
import { createSpoilage, loadSpoilage, loadSpoilageOptions, loadSpoilages } from '../services/spoilageService'
import type { Spoilage, SpoilageList, SpoilageOption, SpoilageOptions } from '../types/spoilage'
import './spoilages-page.css'

type CartLine = SpoilageOption & { quantity: string }
const EMPTY: SpoilageList = { spoilages: [], currentPage: 1, lastPage: 1, total: 0 }
const NO_OPTIONS: SpoilageOptions = { stations: [], items: [] }
const validQuantity = (value: string) => /^\d{1,9}(\.\d{1,2})?$/.test(value) && Number(value) > 0
const todayInManila = () => new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Manila' }).format(new Date())

export function SpoilagesPage() {
  const [searchParams] = useSearchParams()
  const [list, setList] = useState(EMPTY)
  const [options, setOptions] = useState(NO_OPTIONS)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [filterStation, setFilterStation] = useState(() => searchParams.get('stationId') ?? '')
  const [stationId, setStationId] = useState('')
  const [reason, setReason] = useState('')
  const [incidentDate, setIncidentDate] = useState(todayInManila)
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

  function openForm() { setStationId(filterStation); setIncidentDate(todayInManila()); setReason(''); setCart([]); setItemSearchInput(''); setError(null); setCreating(true) }
  function submitForm() {
    if (!stationId || cart.length === 0 || cart.some((line) => !validQuantity(line.quantity) || Number(line.quantity) > Number(line.available))) {
      setError('Choose a Station and enter a positive quantity up to two decimal places, within the available stock, for each Item.')
      return
    }
    setError(null); setConfirming(true)
  }
  async function confirm() {
    setSubmitting(true); setError(null)
    try {
      const spoilage = await createSpoilage(Number(stationId), incidentDate, reason, cart.map((line) => ({ itemId: line.id, quantity: line.quantity })))
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
    { key: 'number', header: 'Spoilage No.', render: (row) => row.spoilageNumber },
    { key: 'station', header: 'Station', render: (row) => row.station.name },
    { key: 'recordedBy', header: 'Recorded By', render: (row) => row.recordedBy.name },
    { key: 'reason', header: 'Reason', render: (row) => row.reason || '—' },
    { key: 'date', header: 'Date', render: (row) => formatManilaDateTime(row.spoiledAt) },
    { key: 'action', header: 'Action', align: 'center', render: (row) => <Button className="table-icon-action" variant="outline" aria-label={`View ${row.spoilageNumber}`} title={`View ${row.spoilageNumber}`} onClick={() => void view(row)} icon={<AppIcons.view size={iconSize} />} /> }
  ]
  const detailColumns: TableColumn<NonNullable<Spoilage['items']>[number]>[] = [
    { key: 'code', header: 'Item Code', render: (row) => row.itemCode },
    { key: 'item', header: 'Item', render: (row) => row.itemName },
    { key: 'unit', header: 'Unit', render: (row) => row.unit },
    { key: 'quantity', header: 'Spoilage Qty', align: 'right', render: (row) => formatQuantity(row.quantity) }
  ]
  const availableColumns: TableColumn<SpoilageOption>[] = [
    { key: 'item', header: <label className="spoilage-item-checkbox"><input type="checkbox" disabled={options.items.length === 0} checked={options.items.length > 0 && options.items.every((item) => cart.some((line) => line.id === item.id))} aria-label="Select or unselect all listed Spoilage items" onChange={(event) => {
      const listedIds = new Set(options.items.map((item) => item.id))
      setCart((lines) => event.target.checked
        ? [...lines, ...options.items.filter((item) => !lines.some((line) => line.id === item.id)).map((item) => ({ ...item, quantity: '1' }))]
        : lines.filter((line) => !listedIds.has(line.id)))
    }} /><span>Item</span></label>, render: (row) => {
      const selected = cart.some((line) => line.id === row.id)
      return <label className="spoilage-item-checkbox"><input type="checkbox" checked={selected} aria-label={`${selected ? 'Remove' : 'Add'} ${row.name} ${selected ? 'from' : 'to'} Spoilage`} onChange={(event) => setCart((lines) => event.target.checked ? [...lines, { ...row, quantity: '1' }] : lines.filter((line) => line.id !== row.id))} /><span>{row.name}</span></label>
    } },
    { key: 'code', header: 'Item Code', render: (row) => row.itemCode },
    { key: 'unit', header: 'Unit', render: (row) => row.unit },
    { key: 'available', header: 'Available', align: 'right', render: (row) => formatQuantity(row.available) }
  ]
  const selectedColumns: TableColumn<CartLine>[] = [
    { key: 'item', header: 'Item', render: (row) => row.name },
    { key: 'code', header: 'Item Code', render: (row) => row.itemCode },
    { key: 'unit', header: 'Unit', render: (row) => row.unit },
    { key: 'quantity', header: 'Qty', render: (row) => <Input className="spoilage-quantity-input" aria-label={`Spoilage quantity for ${row.name}`} inputMode="decimal" value={row.quantity} onChange={(event) => setCart((lines) => lines.map((line) => line.id === row.id ? { ...line, quantity: event.target.value } : line))} /> },
    { key: 'remove', header: '', align: 'right', render: (row) => <Button className="table-icon-action" variant="ghost" aria-label={`Remove ${row.name} from Spoilage`} title={`Remove ${row.name}`} onClick={() => setCart((lines) => lines.filter((line) => line.id !== row.id))} icon={<AppIcons.delete size={iconSize} />} /> }
  ]

  return <section className="page spoilages-page">
    <header className="page__header"><div><h1 className="page__title">Spoilage Management</h1><p className="page__description">Record unusable Station stock and review completed Spoilage.</p></div><Button onClick={openForm} icon={<AppIcons.add size={iconSize} />}>Record Spoilage</Button></header>
    <div className="spoilage-filters"><SearchField value={searchInput} onChange={setSearchInput} onClear={() => { setSearchInput(''); setSearch(''); setPage(1) }} placeholder="Search Spoilage number, Station, or employee..." label="Search Spoilage" /><div><Label htmlFor="spoilage-filter-station">Station</Label><select id="spoilage-filter-station" className="ui-input" value={filterStation} onChange={(event) => { setFilterStation(event.target.value); setPage(1) }}><option value="">All Stations</option>{options.stations.map((station) => <option key={station.id} value={station.id}>{station.name}</option>)}</select></div></div>
    {!creating && error ? <Alert tone="error">{error}</Alert> : null}
    {loading ? <LoadingState label="Loading Spoilage…" /> : <><p className="page__description">{list.total} Spoilage record{list.total === 1 ? '' : 's'}</p><Table columns={columns} rows={list.spoilages} rowKey={(row) => String(row.id)} emptyMessage="No Spoilage found." /><Pagination currentPage={list.currentPage} lastPage={list.lastPage} label="Spoilage" onPageChange={setPage} /></>}

    <Modal open={creating} size="large" title="Report Spoilage" onClose={() => { if (!submitting) setCreating(false) }} actions={<Button disabled={submitting} onClick={submitForm} icon={<AppIcons.save size={iconSize} />}>Submit Spoilage</Button>}>
      <div className="spoilage-report-header">
        <div><Label htmlFor="spoilage-station" required>Station</Label><select id="spoilage-station" className="ui-input" value={stationId} onChange={(event) => { setStationId(event.target.value); setFilterStation(event.target.value); setPage(1); setCart([]); setError(null) }}><option value="">Select Station</option>{options.stations.map((station) => <option key={station.id} value={station.id}>{station.name}</option>)}</select></div>
        <div><Label htmlFor="spoilage-incident-date" required>Incident Date</Label><Input id="spoilage-incident-date" type="date" max={todayInManila()} value={incidentDate} onChange={(event) => setIncidentDate(event.target.value)} /></div>
      </div>
      <div className="spoilage-item-search"><Label>Search Items</Label><SearchField value={itemSearchInput} onChange={setItemSearchInput} onClear={() => setItemSearchInput('')} placeholder="Search Item code or name..." label="Search Station Items" /></div>
      <div className="spoilage-selection-workspace">
        <section className="spoilage-selection-workspace__available"><h3>Available Station Items</h3><Table columns={availableColumns} rows={stationId ? options.items : []} rowKey={(row) => String(row.id)} emptyMessage={stationId ? 'No Station Items found.' : 'Select a Station to view Items.'} /></section>
        <section className="spoilage-selection-workspace__selected"><h3>Selected Spoilage Items</h3><Table columns={selectedColumns} rows={cart} rowKey={(row) => String(row.id)} emptyMessage="No Items selected." /></section>
      </div>
      <div className="spoilage-remarks"><Label htmlFor="spoilage-reason">Remarks</Label><textarea id="spoilage-reason" className="ui-input" maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} /></div>
      {error ? <Alert tone="error">{error}</Alert> : null}
    </Modal>
    <Modal open={confirming} title="Confirm Spoilage" onClose={() => { if (!submitting) setConfirming(false) }} actions={<Button disabled={submitting} onClick={() => void confirm()} icon={<AppIcons.warning size={iconSize} />}>Confirm Spoilage</Button>}>
      <div className="modal-summary">
        <div className="modal-summary__grid">
          <div className="modal-summary__field"><span>Station</span><strong>{options.stations.find((station) => String(station.id) === stationId)?.name}</strong></div>
          <div className="modal-summary__field"><span>Selected Items</span><strong>{cart.length}</strong></div>
          <div className="modal-summary__field"><span>Remarks</span><strong>{reason.trim() || 'None provided'}</strong></div>
        </div>
        <p className="modal-summary__notice">Review the details before confirming. The selected quantities will be deducted from Station inventory.</p>
      </div>
    </Modal>
    <Modal open={result !== null} title="Spoilage Recorded" onClose={() => setResult(null)}>{result ? <div className="modal-summary">
      <p className="modal-summary__reference">{result.spoilageNumber}</p>
      <div className="modal-summary__grid">
        <div className="modal-summary__field"><span>Station</span><strong>{result.station.name}</strong></div>
        <div className="modal-summary__field"><span>Spoiled Items</span><strong>{result.itemCount}</strong></div>
        <div className="modal-summary__field"><span>Date Recorded</span><strong>{formatManilaDateTime(result.spoiledAt)}</strong></div>
      </div>
    </div> : null}</Modal>
    <Modal open={detail !== null} size="large" title="Spoilage Details" onClose={() => setDetail(null)}>{detail ? <><div className="spoilage-detail-summary"><div><span>Spoilage No.</span><p>{detail.spoilageNumber}</p></div><div><span>Station</span><p>{detail.station.name}</p></div><div><span>Recorded By</span><p>{detail.recordedBy.name}</p></div><div><span>Incident Date</span><p>{formatManilaDate(detail.spoiledAt)}</p></div><div className="spoilage-detail-summary__remarks"><span>Remarks</span><p>{detail.reason || 'None provided'}</p></div></div><section className="spoilage-detail-items"><h3>Spoiled Items</h3><Table columns={detailColumns} rows={detail.items ?? []} rowKey={(row) => String(row.id)} emptyMessage="No Spoilage Items recorded." /></section></> : null}</Modal>
  </section>
}
