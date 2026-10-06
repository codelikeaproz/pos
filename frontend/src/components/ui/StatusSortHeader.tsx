import { AppIcons } from '../../lib/icons'

export type StatusSort = '' | 'asc' | 'desc'

export function StatusSortHeader({ value, onChange }: { value: StatusSort; onChange: (value: StatusSort) => void }) {
  return <span className="ui-table-sort">
    <span>Status</span>
    <button type="button" className={value === 'asc' ? 'is-active' : ''} aria-label="Show Not Remitted first" title="Show Not Remitted first" aria-pressed={value === 'asc'} onClick={() => onChange(value === 'asc' ? '' : 'asc')}><AppIcons.sortAscending size={14} /></button>
    <button type="button" className={value === 'desc' ? 'is-active' : ''} aria-label="Show Remitted first" title="Show Remitted first" aria-pressed={value === 'desc'} onClick={() => onChange(value === 'desc' ? '' : 'desc')}><AppIcons.sortDescending size={14} /></button>
  </span>
}
