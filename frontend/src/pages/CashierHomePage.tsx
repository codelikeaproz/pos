import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useAuth } from '../features/auth/AuthContext'
import '../components/layout/page.css'
import './cashier-home-page.css'

export function CashierHomePage() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  if (currentUser?.role === 'admin') return <Navigate to="/dashboard" replace />
  const canOpenPos = Boolean(currentUser?.station && currentUser.privileges.some((privilege) => privilege.description.toLowerCase() === 'cashier'))

  async function handleLogout(): Promise<void> {
    setLoggingOut(true)
    try { await logout() } finally { setLoggingOut(false) }
  }

  return (
    <section className="cashier-home">
      <p className="cashier-home__brand">University HomeStay POS</p>
      <div className="cashier-home__heading"><div><h1>Cashier Home</h1><p>Ready for the next transaction.</p></div></div>
      <h2 className="cashier-home__section-title">Cashier Information</h2>
      <dl className="cashier-home__identity">
        <div><dt>Full Name</dt><dd>{currentUser?.name ?? '—'}</dd></div>
        <div><dt>Privilege</dt><dd>{currentUser?.privileges.map((privilege) => privilege.description).join(', ') || 'Not assigned'}</dd></div>
        <div><dt>Assigned Station</dt><dd>{currentUser?.station?.name ?? 'Not assigned'}</dd></div>
      </dl>
      {!canOpenPos ? <p className="cashier-home__notice">Cashier privilege and a Station assignment are required to open POS. Ask an administrator to update this account.</p> : null}
      <div className="cashier-home__actions">
        <Button disabled={!canOpenPos || loggingOut} onClick={() => navigate('/orders')}>Open POS</Button>
        <Button variant="outline" disabled={loggingOut} onClick={() => void handleLogout()}>{loggingOut ? 'Signing out…' : 'Logout'}</Button>
      </div>
    </section>
  )
}
