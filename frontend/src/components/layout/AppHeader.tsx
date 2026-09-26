import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Button } from '../ui/Button'
import { AppIcons, iconSize, iconStroke } from '../../lib/icons'
import { getNavItemByPath } from '../../lib/navigation'
import { useAuth } from '../../features/auth/AuthContext'
import { roleLabel } from '../../types/auth'
import './app-header.css'

export function AppHeader() {
  const location = useLocation()
  const current = getNavItemByPath(location.pathname)
  const { currentUser, logout } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout(): Promise<void> {
    setLoggingOut(true)
    try {
      await logout()
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__brand-mark" aria-hidden="true" />
        <div>
          <p className="app-header__app-name">University HomeStay POS</p>
          <p className="app-header__page">{current.title}</p>
        </div>
      </div>
      <div className="app-header__user">
        <AppIcons.employee size={iconSize} strokeWidth={iconStroke} aria-hidden="true" />
        <span>
          {currentUser
            ? `${currentUser.name} (${roleLabel(currentUser.role)})`
            : 'Staff'}
        </span>
        <Button
          variant="outline"
          onClick={() => {
            void handleLogout()
          }}
          disabled={loggingOut}
        >
          {loggingOut ? 'Signing out…' : 'Logout'}
        </Button>
      </div>
    </header>
  )
}
