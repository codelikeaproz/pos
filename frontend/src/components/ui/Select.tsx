import { SelectHTMLAttributes, forwardRef } from 'react'
import './select.css'

export type SelectOption = {
  value: string
  label: string
}

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options: SelectOption[]
  error?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ options, error = false, className = '', ...rest }, ref) {
    const classes = ['ui-select', error ? 'ui-select--error' : '', className]
      .filter(Boolean)
      .join(' ')

    return (
      <select ref={ref} className={classes} {...rest}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }
)
