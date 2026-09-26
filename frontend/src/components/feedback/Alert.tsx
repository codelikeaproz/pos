import { ReactNode } from 'react'
import { AppIcons, iconSizeStatus, iconStroke } from '../../lib/icons'
import './alert.css'

export type AlertTone = 'success' | 'warning' | 'error' | 'info'

export type AlertProps = {
  tone: AlertTone
  title?: string
  children: ReactNode
}

const toneIcons = {
  success: AppIcons.success,
  warning: AppIcons.warning,
  error: AppIcons.error,
  info: AppIcons.info
} as const

export function Alert({ tone, title, children }: AlertProps) {
  const Icon = toneIcons[tone]

  return (
    <div className={`ui-alert ui-alert--${tone}`} role="status">
      <Icon
        className="ui-alert__icon"
        size={iconSizeStatus}
        strokeWidth={iconStroke}
        aria-hidden="true"
      />
      <div className="ui-alert__content">
        {title ? <p className="ui-alert__title">{title}</p> : null}
        <div className="ui-alert__message">{children}</div>
      </div>
    </div>
  )
}
