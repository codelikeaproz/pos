import { InputHTMLAttributes, forwardRef } from 'react'
import './input.css'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className = '', error = false, ...rest }, ref) {
    const classes = ['ui-input', error ? 'ui-input--error' : '', className]
      .filter(Boolean)
      .join(' ')

    return <input ref={ref} className={classes} {...rest} />
  }
)
