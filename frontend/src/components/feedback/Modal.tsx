import { ReactNode, RefObject, useEffect, useId, useRef } from 'react'
import { AppIcons, iconSize, iconStroke } from '../../lib/icons'
import { Button } from '../ui/Button'
import './modal.css'

export type ModalProps = {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
  actions?: ReactNode
  size?: 'default' | 'large'
  initialFocusRef?: RefObject<HTMLElement | null>
}

export function Modal({ open, title, children, onClose, actions, size = 'default', initialFocusRef }: ModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) {
      return
    }

    const previous = document.activeElement as HTMLElement | null
    const frame = window.requestAnimationFrame(() => {
      const firstField = dialogRef.current?.querySelector<HTMLElement>('.ui-modal__body input:not(:disabled), .ui-modal__body select:not(:disabled), .ui-modal__body textarea:not(:disabled), .ui-modal__body button:not(:disabled)')
      ;(initialFocusRef?.current ?? firstField ?? dialogRef.current)?.focus()
    })

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onCloseRef.current()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      window.cancelAnimationFrame(frame)
      previous?.focus()
    }
  }, [open, initialFocusRef])

  if (!open) {
    return null
  }

  return (
    <div className="ui-modal" role="presentation">
      <button
        type="button"
        className="ui-modal__backdrop"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        className={`ui-modal__dialog${size === 'large' ? ' ui-modal__dialog--large' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="ui-modal__header">
          <h2 id={titleId} className="ui-modal__title">
            {title}
          </h2>
          <Button
            variant="ghost"
            aria-label="Close"
            onClick={onClose}
            icon={<AppIcons.close size={iconSize} strokeWidth={iconStroke} />}
          />
        </header>
        <div className="ui-modal__body">{children}</div>
        {actions ? <footer className="ui-modal__actions">{actions}</footer> : null}
      </div>
    </div>
  )
}
