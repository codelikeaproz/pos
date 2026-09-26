import { NavLink } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { iconSizeNav, iconStroke } from '../../lib/icons'
import { getNavItemsForRole } from '../../lib/navigation'
import './app-sidebar.css'

export function AppSidebar() {
  const { currentUser } = useAuth()
  const navItems = currentUser ? getNavItemsForRole(currentUser.role) : []

  return (
    <aside className="app-sidebar" aria-label="Main navigation">
      <nav className="app-sidebar__nav">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                ['app-sidebar__link', isActive ? 'is-active' : '']
                  .filter(Boolean)
                  .join(' ')
              }
            >
              <Icon size={iconSizeNav} strokeWidth={iconStroke} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
