import { useEffect, useState } from 'react'
import { Alert } from '../../components/feedback/Alert'
import { LoadingState } from '../../components/feedback/LoadingState'
import { Modal } from '../../components/feedback/Modal'
import { Pagination } from '../../components/ui/Pagination'
import { SearchField } from '../../components/ui/SearchField'
import { Table, type TableColumn } from '../../components/ui/Table'
import { StockQuantity } from '../../components/ui/StockQuantity'
import { formatQuantity } from '../../lib/posCalculations'
import { getUserFacingApiMessage } from '../../services/apiClient'
import { loadPosStationInventory } from '../../services/posService'
import type { PosStationInventoryList, PosStationInventoryRow } from '../../types/pos'
import './pos-dialogs.css'

const EMPTY: PosStationInventoryList = { items: [], station: { id: 0, name: '' }, currentPage: 1, lastPage: 1, total: 0 }

export function PosStationInventoryDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [list, setList] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { if (!open) return; const timer = window.setTimeout(() => { setPage(1); setSearch(searchInput.trim()) }, 350); return () => window.clearTimeout(timer) }, [open, searchInput])
  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    setLoading(true); setError(null)
    void loadPosStationInventory(search, page, controller.signal).then(setList)
      .catch((failure) => { if (!controller.signal.aborted) setError(getUserFacingApiMessage(failure)) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [open, search, page])

  const columns: TableColumn<PosStationInventoryRow>[] = [
    { key: 'name', header: 'Item', render: (row) => row.name },
    { key: 'code', header: 'Code', render: (row) => row.itemCode },
    { key: 'unit', header: 'Unit', render: (row) => row.unit },
    { key: 'sold', header: 'Sold', align: 'right', render: (row) => formatQuantity(row.recordedSoldQuantity) },
    { key: 'spoilage', header: 'Spoilage', align: 'right', render: (row) => formatQuantity(row.recordedSpoilageQuantity) },
    { key: 'remaining', header: 'Remaining', align: 'right', render: (row) => <StockQuantity quantity={row.currentQuantity} unit={row.unit} isLowStock={row.isLowStock} /> }
  ]

  return <Modal open={open} title="Station Inventory" size="large" onClose={onClose}>
    <div className="pos-dialog-content">
      <p className="pos-dialog-content__note">{list.station.name || 'Your Station'} · Read-only stock balances, including inactive and unpriced Items.</p>
      <SearchField value={searchInput} onChange={setSearchInput} onClear={() => setSearchInput('')} placeholder="Search item name or code..." label="Search Station inventory" />
      {error ? <Alert tone="warning">{error}</Alert> : null}
      {loading ? <LoadingState label="Loading Station inventory…" /> : <><p className="pos-dialog-content__note">{list.total} assigned item{list.total === 1 ? '' : 's'}</p><Table columns={columns} rows={list.items} rowKey={(row) => String(row.itemId)} rowClassName={(row) => row.isLowStock ? 'ui-table__row--danger' : undefined} emptyMessage="No Station inventory items found." /><Pagination currentPage={list.currentPage} lastPage={list.lastPage} label="Station inventory" onPageChange={setPage} /></>}
    </div>
  </Modal>
}
