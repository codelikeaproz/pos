import { HTMLAttributes, ReactNode } from 'react'
import './badge.css'

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'accent'

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone
  children: ReactNode
}

export function Badge({
  tone = 'neutral',
  children,
  className = '',
  ...rest
}: BadgeProps) {
  return (
    <span
      className={['ui-badge', `ui-badge--${tone}`, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </span>
  )
}
