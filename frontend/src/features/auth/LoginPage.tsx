import { FormEvent, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Alert } from '../../components/feedback/Alert'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { AppIcons, iconStroke } from '../../lib/icons'
import { useAuth } from './AuthContext'
import './login-page.css'

export function LoginPage() {
  const { status, currentUser, login, authNotice } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (status === 'authenticated') {
    return <Navigate to={currentUser?.role === 'admin' ? '/dashboard' : currentUser?.station && currentUser.privileges.some((privilege) => privilege.description.toLowerCase() === 'cashier') ? '/orders' : '/cashier-home'} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await login(email.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  const isBusy = submitting

  return (
    <div className="login-page">
      <div className="login-page__panel">
        <p className="login-page__brand">University HomeStay POS</p>

        <div className="login-page__heading">
          <h1 className="login-page__title">Sign in</h1>
          <p className="login-page__subtitle">Enter your account details to continue.</p>
        </div>

        {authNotice ? (
          <Alert tone={authNotice.tone} title={authNotice.title}>
            {authNotice.message}
          </Alert>
        ) : null}

        {error ? (
          <Alert tone="error" title="Sign in failed">
            {error}
          </Alert>
        ) : null}

        <form className="login-page__form" onSubmit={handleSubmit}>
          <div className="login-page__field">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isBusy}
              required
            />
          </div>

          <div className="login-page__field">
            <Label htmlFor="login-password">Password</Label>
            <div className="login-page__password">
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isBusy}
                required
              />
              <button
                type="button"
                className="login-page__password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                title={showPassword ? 'Hide password' : 'Show password'}
                disabled={isBusy}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword
                  ? <AppIcons.view size={18} strokeWidth={iconStroke} aria-hidden="true" />
                  : <AppIcons.visibilityOff size={18} strokeWidth={iconStroke} aria-hidden="true" />}
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" disabled={isBusy}>
            {isBusy ? 'Signing in…' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  )
}
