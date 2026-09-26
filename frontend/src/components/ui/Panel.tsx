import { HTMLAttributes, ReactNode } from 'react'
import './panel.css'

export type PanelProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode
  title?: string
}

export function Panel({ children, title, className = '', ...rest }: PanelProps) {
  return (
    <section className={['ui-panel', className].filter(Boolean).join(' ')} {...rest}>
      {title ? <h2 className="ui-panel__title">{title}</h2> : null}
      <div className="ui-panel__body">{children}</div>
    </section>
  )
}
