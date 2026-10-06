import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Alert } from '../../components/feedback/Alert'
import { LoadingState } from '../../components/feedback/LoadingState'
import { Pagination } from '../../components/ui/Pagination'
import { SearchField } from '../../components/ui/SearchField'
import { Button } from '../../components/ui/Button'
import { Table, type TableColumn } from '../../components/ui/Table'
import { StockQuantity } from '../../components/ui/StockQuantity'
import { AppIcons, iconSize, iconStroke } from '../../lib/icons'
import { formatPrice, quantityToThousandths } from '../../lib/posCalculations'
import { getUserFacingApiMessage } from '../../services/apiClient'
import { loadPosItems } from '../../services/posService'
import type { PosItem, PosItemList } from '../../types/pos'
import './pos-item-search.css'

type Props = {
  value: string
  search: string
  list: PosItemList
  loading: boolean
  error: string | null
  suspended: boolean
  inline?: boolean
  onChange: (value: string) => void
  onClear: () => void
  onPageChange: (page: number) => void
  onAdd: (item: PosItem) => boolean
}

export function PosItemSearch({ value, search, list, loading, error, suspended, inline = false, onChange, onClear, onPageChange, onAdd }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const latestValue = useRef(value)
  const latestOnAdd = useRef(onAdd)
  const [open, setOpen] = useState(false)
  const [checkingCode, setCheckingCode] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  latestValue.current = value
  latestOnAdd.current = onAdd

  useEffect(() => {
    function onPointerDown(event: PointerEvent): void {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  useEffect(() => { if (suspended) setOpen(false) }, [suspended])

  function add(item: PosItem): void {
    if (!latestOnAdd.current(item)) return
    setNotice(null)
    rootRef.current?.querySelector('input')?.focus()
    setOpen(false)
  }

  async function addExactCode(): Promise<void> {
    const code = value.trim()
    if (!code || checkingCode) return
    setCheckingCode(true)
    setNotice(null)
    try {
      const matches = await loadPosItems(code, 1)
      if (latestValue.current.trim() !== code) return
      const exact = matches.items.find((item) => item.item_code.toLocaleLowerCase() === code.toLocaleLowerCase())
      if (exact) add(exact)
      else { setNotice('No exact item code found. Choose an item from the results.'); setOpen(true) }
    } catch (failure) {
      if (latestValue.current.trim() === code) { setNotice(getUserFacingApiMessage(failure)); setOpen(true) }
    } finally {
      setCheckingCode(false)
    }
  }

  function onSearchKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); setOpen(false); return }
    if (event.key === 'Enter' && event.target === rootRef.current?.querySelector('input')) {
      event.preventDefault()
      void addExactCode()
    }
  }

  const resultsReady = search === value.trim() && !loading
  const columns: TableColumn<PosItem>[] = [
    { key: 'name', header: 'Name', render: (item) => item.name },
    { key: 'code', header: 'Item Code', render: (item) => item.item_code },
    { key: 'available', header: 'Available', render: (item) => <StockQuantity quantity={item.available_quantity} unit={item.unit} isLowStock={item.is_low_stock} /> },
    { key: 'price', header: 'Unit Price', align: 'right', render: (item) => formatPrice(item.price) },
    { key: 'action', header: 'Action', align: 'center', render: (item) => {
      const outOfStock = (quantityToThousandths(item.available_quantity) ?? 0n) <= 0n
      return <span title={outOfStock ? `${item.name} is out of stock` : `Add ${item.name} to the order`}>
        <Button className="table-icon-action" disabled={outOfStock} aria-label={outOfStock ? `${item.name} is out of stock` : `Add ${item.name} to the order`} onClick={() => add(item)} icon={<AppIcons.add size={iconSize} strokeWidth={iconStroke} />} />
      </span>
    } }
  ]

  return <div ref={rootRef} className={`pos-item-search${inline ? ' pos-item-search--inline' : ''}`} onFocusCapture={() => { if (!suspended) setOpen(true) }} onKeyDown={onSearchKeyDown}>
    <SearchField value={value} onChange={(next) => { setNotice(null); onChange(next); setOpen(true) }} onClear={() => { setNotice(null); onClear(); setOpen(true); rootRef.current?.querySelector('input')?.focus() }} placeholder="Search item name or code..." label="Search available items" />
    {error ? <Alert tone="warning">{error}</Alert> : null}
    {(open || inline) ? <div className="pos-item-search__results" role="region" aria-label="Available item results">
      {checkingCode || !resultsReady ? <LoadingState label="Searching items…" /> : <>
        <Table columns={columns} rows={list.items} rowKey={(item) => String(item.id)} rowClassName={(item) => item.is_low_stock ? 'ui-table__row--danger' : undefined} emptyMessage="No sellable items found for this Station." />
        <Pagination currentPage={list.currentPage} lastPage={list.lastPage} label="Available Item" onPageChange={onPageChange} />
      </>}
      {notice ? <p className="pos-item-search__notice" role="status">{notice}</p> : null}
    </div> : null}
  </div>
}
