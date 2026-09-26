import {
  ButtonHTMLAttributes,
  ReactNode,
  forwardRef
} from 'react'
import './button.css'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'ghost'
  | 'outline'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  icon?: ReactNode
  children?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = 'primary', icon, children, className = '', type = 'button', ...rest },
    ref
  ) {
    const classes = ['ui-btn', `ui-btn--${variant}`, className]
      .filter(Boolean)
      .join(' ')

    return (
      <button ref={ref} type={type} className={classes} {...rest}>
        {icon ? <span className="ui-btn__icon">{icon}</span> : null}
        {children ? <span className="ui-btn__label">{children}</span> : null}
      </button>
    )
  }
)
