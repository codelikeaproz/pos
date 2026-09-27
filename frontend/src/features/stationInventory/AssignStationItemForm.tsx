import { FormEvent, useEffect, useState } from 'react'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Select } from '../../components/ui/Select'
import type { StationItemOptions } from '../../types/stationItem'

export type StationItemErrors = Partial<Record<'station_id' | 'item_id' | 'quantity', string>>
type Props = { formId: string; stationId: number; options: StationItemOptions; itemSearch: string; errors: StationItemErrors; disabled: boolean; onStationChange: (id: number) => void; onItemSearchChange: (value: string) => void; onSubmit: (stationId: number, itemId: number, quantity: string) => void }

export function AssignStationItemForm({ formId, stationId, options, itemSearch, errors, disabled, onStationChange, onItemSearchChange, onSubmit }: Props) {
  const [itemId, setItemId] = useState(0)
  const [quantity, setQuantity] = useState('0')
  useEffect(() => {
    if (itemId && !options.items.some((item) => item.id === itemId)) setItemId(0)
  }, [itemId, options.items])
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onSubmit(stationId, itemId, quantity.trim()) }
  return <form id={formId} className="station-item-form" onSubmit={submit}>
    <div><Label htmlFor={`${formId}-station`} required>Station</Label><Select id={`${formId}-station`} value={stationId || ''} onChange={(event) => onStationChange(Number(event.target.value))} options={[{ value: '', label: 'Select Station' }, ...options.stations.map((station) => ({ value: String(station.id), label: station.name }))]} required disabled={disabled} error={Boolean(errors.station_id)} />{errors.station_id ? <span className="page__field-error">{errors.station_id}</span> : null}</div>
    <div><Label htmlFor={`${formId}-item-search`}>Find Item</Label><Input id={`${formId}-item-search`} value={itemSearch} onChange={(event) => onItemSearchChange(event.target.value)} placeholder="Search by item name or code..." disabled={disabled} /></div>
    <div><Label htmlFor={`${formId}-item`} required>Item</Label><Select id={`${formId}-item`} value={itemId || ''} onChange={(event) => setItemId(Number(event.target.value))} options={[{ value: '', label: options.items.length ? 'Select Item' : 'No matching items' }, ...options.items.map((item) => ({ value: String(item.id), label: `${item.item_code} — ${item.name} (${item.units_backup})` }))]} required disabled={disabled} error={Boolean(errors.item_id)} />{errors.item_id ? <span className="page__field-error">{errors.item_id}</span> : null}</div>
    <div><Label htmlFor={`${formId}-quantity`} required>Quantity</Label><Input id={`${formId}-quantity`} type="number" inputMode="decimal" min="0" step="0.001" value={quantity} onChange={(event) => setQuantity(event.target.value)} required disabled={disabled} error={Boolean(errors.quantity)} />{errors.quantity ? <span className="page__field-error">{errors.quantity}</span> : null}</div>
  </form>
}
