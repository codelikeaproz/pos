import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { AppIcons, iconSizeNav, iconStroke } from '../../lib/icons'
import { getNavItemsForRole } from '../../lib/navigation'
import { roleLabel } from '../../types/auth'
import './app-sidebar.css'

export function AppSidebar() {
  const { currentUser, logout } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)
  const navItems = currentUser ? getNavItemsForRole(currentUser.role) : []

  async function handleLogout(): Promise<void> {
    setLoggingOut(true)
    try { await logout() }
    finally { setLoggingOut(false) }
  }

  return <aside className="app-sidebar" aria-label="Main navigation">
    <div className="app-sidebar__identity">
      <div className="app-sidebar__logo" role="img" aria-label="University HomeStay logo area" />
      <div className="app-sidebar__user">
        <p><span>Username:</span> <strong>{currentUser?.name ?? '—'}</strong></p>
        <p><span>System Role:</span> <strong>{currentUser ? roleLabel(currentUser.role) : '—'}</strong></p>
        <p><span>Privileges:</span> <strong>{currentUser?.privileges.length ? currentUser.privileges.map((privilege) => privilege.description).join(', ') : 'None assigned'}</strong></p>
      </div>
    </div>
    <nav className="app-sidebar__nav" aria-label="Modules">
      {navItems.map((item) => {
        const Icon = item.icon
        const content = <><Icon size={iconSizeNav} strokeWidth={iconStroke} aria-hidden="true" /><span className="app-sidebar__label">{item.label}</span>{item.comingSoon ? <small className="app-sidebar__soon">Coming Soon</small> : null}</>
        return item.comingSoon
          ? <button key={item.path} type="button" className="app-sidebar__link app-sidebar__link--disabled" disabled aria-label={`${item.label}, Coming Soon`}>{content}</button>
          : <NavLink key={item.path} to={item.path} end className={({ isActive }) => `app-sidebar__link${isActive ? ' is-active' : ''}`}>{content}</NavLink>
      })}
    </nav>
    <button className="app-sidebar__logout" type="button" onClick={() => void handleLogout()} disabled={loggingOut}>
      <AppIcons.logout size={iconSizeNav} strokeWidth={iconStroke} aria-hidden="true" />
      <span>{loggingOut ? 'Signing out…' : 'Logout'}</span>
    </button>
  </aside>
}
