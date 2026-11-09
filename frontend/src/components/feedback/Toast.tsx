import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react'
import { AppIcons, iconSize, iconStroke } from '../../lib/icons'
import './toast.css'

export type ToastTone = 'success' | 'info' | 'warning' | 'error'

type ToastItem = {
  id: number
  title?: string
  message: string
  tone: ToastTone
}

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone, title?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const toneIcons = {
  success: AppIcons.success,
  info: AppIcons.info,
  warning: AppIcons.warning,
  error: AppIcons.error
} as const

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, tone: ToastTone = 'success', title?: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((current) => [...current, { id, title, message, tone }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 2800)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="ui-toast-region" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => {
          const Icon = toneIcons[toast.tone]
          return (
            <div key={toast.id} className={`ui-toast ui-toast--${toast.tone}`}>
              <div className="ui-toast__icon">
                <Icon size={iconSize} strokeWidth={iconStroke} aria-hidden="true" />
              </div>
              <div className="ui-toast__content">
                {toast.title ? <p className="ui-toast__title">{toast.title}</p> : null}
                <p className="ui-toast__message">{toast.message}</p>
              </div>
              <button
                className="ui-toast__close"
                onClick={() => dismissToast(toast.id)}
                aria-label="Close notification"
              >
                <AppIcons.close size={iconSize} strokeWidth={iconStroke} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
