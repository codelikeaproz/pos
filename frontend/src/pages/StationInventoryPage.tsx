import { useCallback, useEffect, useState } from 'react'
import { Alert } from '../components/feedback/Alert'
import { LoadingState } from '../components/feedback/LoadingState'
import { Modal } from '../components/feedback/Modal'
import { useToast } from '../components/feedback/Toast'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Select } from '../components/ui/Select'
import { AssignStationItemForm, type StationItemErrors } from '../features/stationInventory/AssignStationItemForm'
import { StationInventoryTable } from '../features/stationInventory/StationInventoryTable'
import { AppIcons, iconSize, iconStroke } from '../lib/icons'
import { ApiError, getUserFacingApiMessage } from '../services/apiClient'
import { assignItemToStation, loadStationInventory, loadStationItemOptions, removeItemFromStation, updateStationQuantity } from '../services/stationItemService'
import type { StationInventoryList, StationItem, StationItemOptions } from '../types/stationItem'
import './station-inventory-page.css'

const EMPTY_LIST: StationInventoryList = { stationItems: [], currentPage: 1, lastPage: 1, total: 0 }
const EMPTY_OPTIONS: StationItemOptions = { stations: [], items: [] }
function errorsFrom(error: unknown): StationItemErrors { return error instanceof ApiError ? { station_id: error.errors.station_id?.[0], item_id: error.errors.item_id?.[0], quantity: error.errors.quantity?.[0] } : {} }

export function StationInventoryPage() {
  const { showToast } = useToast()
  const [options, setOptions] = useState(EMPTY_OPTIONS)
  const [list, setList] = useState(EMPTY_LIST)
  const [stationId, setStationId] = useState(0)
  const [searchInput, setSearchInput] = useState(''); const [search, setSearch] = useState(''); const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true); const [pageError, setPageError] = useState<string | null>(null)
  const [assignOpen, setAssignOpen] = useState(false); const [itemSearch, setItemSearch] = useState(''); const [editing, setEditing] = useState<StationItem | null>(null); const [removeTarget, setRemoveTarget] = useState<StationItem | null>(null)
  const [quantity, setQuantity] = useState(''); const [submitting, setSubmitting] = useState(false); const [formError, setFormError] = useState<string | null>(null); const [fieldErrors, setFieldErrors] = useState<StationItemErrors>({})

  const refresh = useCallback(async (signal?: AbortSignal) => { if (!stationId) { setList(EMPTY_LIST); setLoading(false); return } setLoading(true); setPageError(null); try { setList(await loadStationInventory(stationId, search, page, signal)) } catch (error) { if (!signal?.aborted) setPageError(getUserFacingApiMessage(error)) } finally { if (!signal?.aborted) setLoading(false) } }, [stationId, search, page])
  useEffect(() => { const controller = new AbortController(); loadStationItemOptions('', controller.signal).then((value) => { setOptions(value); setStationId((current) => current || value.stations[0]?.id || 0) }).catch((error) => { if (!controller.signal.aborted) setPageError(getUserFacingApiMessage(error)) }); return () => controller.abort() }, [])
  useEffect(() => { const timeout = window.setTimeout(() => { setPage(1); setSearch(searchInput.trim()) }, 350); return () => window.clearTimeout(timeout) }, [searchInput])
  useEffect(() => { const controller = new AbortController(); void refresh(controller.signal); return () => controller.abort() }, [refresh])
  useEffect(() => { if (!assignOpen) return; const controller = new AbortController(); const timeout = window.setTimeout(() => { loadStationItemOptions(itemSearch.trim(), controller.signal).then(setOptions).catch((error) => { if (!controller.signal.aborted) setFormError(getUserFacingApiMessage(error)) }) }, 350); return () => { window.clearTimeout(timeout); controller.abort() } }, [assignOpen, itemSearch])

  function selectStation(value: number) { setStationId(value); setSearchInput(''); setSearch(''); setPage(1) }
  async function assign(selectedStation: number, itemId: number, value: string) { setSubmitting(true); setFieldErrors({}); setFormError(null); try { const response = await assignItemToStation(selectedStation, itemId, value); setAssignOpen(false); showToast(response.message); if (selectedStation !== stationId) { setStationId(selectedStation); setPage(1) } else await refresh() } catch (error) { setFieldErrors(errorsFrom(error)); setFormError(getUserFacingApiMessage(error)) } finally { setSubmitting(false) } }
  async function update() { if (!editing) return; setSubmitting(true); setFormError(null); try { const response = await updateStationQuantity(editing.id, quantity); setEditing(null); showToast(response.message); await refresh() } catch (error) { setFieldErrors(errorsFrom(error)); setFormError(getUserFacingApiMessage(error)) } finally { setSubmitting(false) } }
  async function remove() { if (!removeTarget) return; setSubmitting(true); setFormError(null); try { const response = await removeItemFromStation(removeTarget.id); setRemoveTarget(null); showToast(response.message); if (list.stationItems.length === 1 && page > 1) setPage((value) => value - 1); else await refresh() } catch (error) { setFormError(getUserFacingApiMessage(error)) } finally { setSubmitting(false) } }

  const emptyMessage = search ? 'No station inventory items found.' : 'No items assigned to this station.'
  return <section className="page station-inventory-page">
    <header className="page__header station-inventory-page__header"><div><h1 className="page__title">Station Inventory</h1><p className="page__description">Manage item quantities assigned to each Station.</p></div><Button disabled={!options.stations.length} onClick={() => { setAssignOpen(true); setItemSearch(''); setFieldErrors({}); setFormError(null) }} icon={<AppIcons.add size={iconSize} strokeWidth={iconStroke} />}>Assign Item</Button></header>
    <div className="station-inventory-page__station"><Label htmlFor="inventory-station" required>Station</Label><Select id="inventory-station" value={stationId || ''} onChange={(event) => selectStation(Number(event.target.value))} options={[{ value: '', label: 'Select Station' }, ...options.stations.map((station) => ({ value: String(station.id), label: station.name }))]} /></div>
    <div className="station-inventory-page__search"><AppIcons.search size={iconSize} /><Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search assigned items..." aria-label="Search station inventory" />{searchInput ? <button type="button" aria-label="Clear inventory search" onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }}><AppIcons.close size={iconSize} /></button> : null}</div>
    {pageError ? <Alert tone="error" title="Station inventory could not be loaded">{pageError}</Alert> : null}
    {loading ? <LoadingState label="Loading station inventory…" /> : <><div className="station-inventory-page__summary">{list.total} assigned item{list.total === 1 ? '' : 's'}</div><StationInventoryTable rows={list.stationItems} emptyMessage={emptyMessage} onEdit={(row) => { setEditing(row); setQuantity(row.quantity); setFieldErrors({}); setFormError(null) }} onRemove={(row) => { setRemoveTarget(row); setFormError(null) }} />{list.lastPage > 1 ? <nav className="station-inventory-page__pagination"><Button variant="outline" disabled={list.currentPage <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><span>Page {list.currentPage} of {list.lastPage}</span><Button variant="outline" disabled={list.currentPage >= list.lastPage} onClick={() => setPage((value) => value + 1)}>Next</Button></nav> : null}</>}
    <Modal open={assignOpen} title="Assign Item to Station" onClose={() => !submitting && setAssignOpen(false)} actions={<><Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button><Button type="submit" form="assign-station-item" disabled={submitting} icon={<AppIcons.save size={iconSize} />}>Assign Item</Button></>}>{formError ? <Alert tone="error" title="Item could not be assigned">{formError}</Alert> : null}<AssignStationItemForm formId="assign-station-item" stationId={stationId} options={options} itemSearch={itemSearch} errors={fieldErrors} disabled={submitting} onStationChange={setStationId} onItemSearchChange={setItemSearch} onSubmit={(selectedStation, itemId, value) => void assign(selectedStation, itemId, value)} /></Modal>
    <Modal open={editing !== null} title="Update Station Quantity" onClose={() => !submitting && setEditing(null)} actions={<><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={() => void update()} disabled={submitting} icon={<AppIcons.save size={iconSize} />}>Save Changes</Button></>}><p><strong>{editing?.item.name}</strong> at {editing?.station.name}</p><Label htmlFor="edit-station-quantity" required>Quantity</Label><Input id="edit-station-quantity" type="number" min="0" step="0.001" value={quantity} onChange={(event) => setQuantity(event.target.value)} error={Boolean(fieldErrors.quantity)} />{fieldErrors.quantity ? <span className="page__field-error">{fieldErrors.quantity}</span> : null}{formError ? <Alert tone="error">{formError}</Alert> : null}</Modal>
    <Modal open={removeTarget !== null} title="Remove Item From Station?" onClose={() => !submitting && setRemoveTarget(null)} actions={<><Button variant="outline" onClick={() => setRemoveTarget(null)}>Cancel</Button><Button variant="danger" onClick={() => void remove()} disabled={submitting} icon={<AppIcons.delete size={iconSize} />}>Remove</Button></>}><div className="station-inventory-remove"><AppIcons.warning size={24} /><p><strong>{removeTarget?.item.name}</strong> will be removed from {removeTarget?.station.name} inventory. The Item itself will not be deleted.</p></div>{formError ? <Alert tone="error">{formError}</Alert> : null}</Modal>
  </section>
}
