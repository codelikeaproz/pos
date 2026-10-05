import { AppIcons } from '../../lib/icons'

export type CustomerSort = '' | 'asc' | 'desc'

export function CustomerSortHeader({ value, onChange }: { value: CustomerSort; onChange: (value: CustomerSort) => void }) {
  return <span className="ui-table-sort">
    <span>Customer</span>
    <button type="button" className={value === 'asc' ? 'is-active' : ''} aria-label="Sort Customers A to Z" title="Sort Customers A to Z" aria-pressed={value === 'asc'} onClick={() => onChange(value === 'asc' ? '' : 'asc')}><AppIcons.sortAscending size={14} /></button>
    <button type="button" className={value === 'desc' ? 'is-active' : ''} aria-label="Sort Customers Z to A" title="Sort Customers Z to A" aria-pressed={value === 'desc'} onClick={() => onChange(value === 'desc' ? '' : 'desc')}><AppIcons.sortDescending size={14} /></button>
  </span>
}
