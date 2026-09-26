import { AppIcons, iconSize, iconStroke } from '../../lib/icons'
import './loading-state.css'

export type LoadingStateProps = {
  label?: string
}

export function LoadingState({ label = 'Loading…' }: LoadingStateProps) {
  return (
    <div className="ui-loading" role="status" aria-live="polite">
      <AppIcons.refresh
        className="ui-loading__icon"
        size={iconSize}
        strokeWidth={iconStroke}
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  )
}
