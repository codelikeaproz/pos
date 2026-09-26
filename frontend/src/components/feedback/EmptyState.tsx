import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { iconSizeStatus, iconStroke } from '../../lib/icons'
import './empty-state.css'

export type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="ui-empty">
      <Icon
        className="ui-empty__icon"
        size={iconSizeStatus}
        strokeWidth={iconStroke}
        aria-hidden="true"
      />
      <h3 className="ui-empty__title">{title}</h3>
      {description ? <p className="ui-empty__description">{description}</p> : null}
      {action ? <div className="ui-empty__action">{action}</div> : null}
    </div>
  )
}
