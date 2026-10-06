import { useCallback, useEffect, useState } from 'react'
import { Alert } from '../components/feedback/Alert'
import { LoadingState } from '../components/feedback/LoadingState'
import { Button } from '../components/ui/Button'
import { SearchField } from '../components/ui/SearchField'
import { Pagination, type AdminPageSize } from '../components/ui/Pagination'
import { Label } from '../components/ui/Label'
import { Select } from '../components/ui/Select'
import { useNavigate } from 'react-router-dom'
import { StationInventoryTable } from '../features/stationInventory/StationInventoryTable'
import { AppIcons, iconSize, iconStroke } from '../lib/icons'
import { getUserFacingApiMessage } from '../services/apiClient'
import { loadStationInventory, loadStationItemOptions } from '../services/stationItemService'
import type { StationInventoryList, StationItemOptions } from '../types/stationItem'
import './station-inventory-page.css'

const EMPTY_LIST: StationInventoryList = { stationItems: [], currentPage: 1, lastPage: 1, total: 0 }
const EMPTY_OPTIONS: StationItemOptions = { stations: [], items: [] }

export function StationInventoryPage() {
  const navigate = useNavigate()
  const [options, setOptions] = useState(EMPTY_OPTIONS)
  const [list, setList] = useState(EMPTY_LIST)
  const [stationId, setStationId] = useState(0)
  const [searchInput, setSearchInput] = useState(''); const [search, setSearch] = useState(''); const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<AdminPageSize>(10)
  const [loading, setLoading] = useState(true); const [pageError, setPageError] = useState<string | null>(null)

  const refresh = useCallback(async (signal?: AbortSignal) => { if (!stationId) { setList(EMPTY_LIST); setLoading(false); return } setLoading(true); setPageError(null); try { setList(await loadStationInventory(stationId, search, page, pageSize, signal)) } catch (error) { if (!signal?.aborted) setPageError(getUserFacingApiMessage(error)) } finally { if (!signal?.aborted) setLoading(false) } }, [stationId, search, page, pageSize])
  useEffect(() => { const controller = new AbortController(); loadStationItemOptions('', controller.signal).then((value) => { setOptions(value); setStationId((current) => current || value.stations[0]?.id || 0) }).catch((error) => { if (!controller.signal.aborted) setPageError(getUserFacingApiMessage(error)) }); return () => controller.abort() }, [])
  useEffect(() => { const timeout = window.setTimeout(() => { setPage(1); setSearch(searchInput.trim()) }, 350); return () => window.clearTimeout(timeout) }, [searchInput])
  useEffect(() => { const controller = new AbortController(); void refresh(controller.signal); return () => controller.abort() }, [refresh])

  function selectStation(value: number) { setStationId(value); setSearchInput(''); setSearch(''); setPage(1) }

  const emptyMessage = search ? 'No station inventory items found.' : 'No items assigned to this station.'
  return <section className="page station-inventory-page">
    <header className="page__header station-inventory-page__header"><div><h1 className="page__title">Station Inventory</h1><p className="page__description">Monitor current stock and recorded inventory activity for each Station.</p></div><Button variant="outline" disabled={!stationId} onClick={() => navigate(`/spoilages?stationId=${stationId}`)} icon={<AppIcons.view size={iconSize} strokeWidth={iconStroke} />}>View Spoilage</Button></header>
    <div className="station-inventory-page__toolbar">
      <SearchField className="station-inventory-page__search" value={searchInput} onChange={setSearchInput} onClear={() => { setSearchInput(''); setSearch(''); setPage(1) }} placeholder="Search assigned items..." label="Search station inventory" />
      <div className="station-inventory-page__station"><Label htmlFor="inventory-station" required>Station</Label><Select id="inventory-station" value={stationId || ''} onChange={(event) => selectStation(Number(event.target.value))} options={[{ value: '', label: 'Select Station' }, ...options.stations.map((station) => ({ value: String(station.id), label: station.name }))]} /></div>
    </div>
    {pageError ? <Alert tone="error" title="Station inventory could not be loaded">{pageError}</Alert> : null}
    {loading ? <LoadingState label="Loading station inventory…" /> : <><div className="station-inventory-page__summary">{list.total} inventory item{list.total === 1 ? '' : 's'}</div><StationInventoryTable rows={list.stationItems} emptyMessage={emptyMessage} /><Pagination currentPage={list.currentPage} lastPage={list.lastPage} label="Station inventory" onPageChange={setPage} pageSize={pageSize} onPageSizeChange={(value) => { setPageSize(value); setPage(1) }} /></>}
  </section>
}
