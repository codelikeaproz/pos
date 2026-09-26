import { FormEvent, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Alert } from '../../components/feedback/Alert'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { useAuth } from './AuthContext'
import './login-page.css'

export function LoginPage() {
  const { status, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (status === 'authenticated') {
    return <Navigate to="/" replace />
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
        <div className="login-page__brand">
          <span className="login-page__brand-mark" aria-hidden="true" />
          <div>
            <p className="login-page__eyebrow">University HomeStay</p>
            <h1 className="login-page__title">POS Login</h1>
          </div>
        </div>

        <p className="login-page__subtitle">
          Sign in with your email and password to continue.
        </p>

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
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isBusy}
              required
            />
          </div>

          <Button type="submit" variant="primary" disabled={isBusy}>
            {isBusy ? 'Signing in…' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  )
}
