import { Input } from './Input'
import { AppIcons, iconSize, iconStroke } from '../../lib/icons'
import './search-field.css'

type Props = {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder: string
  label: string
  className?: string
}

export function SearchField({ value, onChange, onClear, placeholder, label, className = '' }: Props) {
  return (
    <div className={`ui-search-field ${className}`.trim()} role="search">
      <AppIcons.search size={iconSize} strokeWidth={iconStroke} aria-hidden="true" />
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={label} />
      {value && <button type="button" className="ui-search-field__clear" aria-label={`Clear ${label.toLowerCase()}`} onClick={onClear}>
        <AppIcons.close size={iconSize} strokeWidth={iconStroke} aria-hidden="true" />
      </button>}
    </div>
  )
}
