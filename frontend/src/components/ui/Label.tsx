import { LabelHTMLAttributes, ReactNode } from 'react'
import './label.css'

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children: ReactNode
  required?: boolean
}

export function Label({
  children,
  required = false,
  className = '',
  ...rest
}: LabelProps) {
  return (
    <label className={['ui-label', className].filter(Boolean).join(' ')} {...rest}>
      {children}
      {required ? <span className="ui-label__required" aria-hidden="true">*</span> : null}
    </label>
  )
}
