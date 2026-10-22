import { NavLink } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { iconSizeNav, iconStroke } from '../../lib/icons'
import { getNavGroupsForRole } from '../../lib/navigation'
import './app-sidebar.css'

export function AppSidebar() {
  const { currentUser } = useAuth()
  const navGroups = currentUser ? getNavGroupsForRole(currentUser.role) : []

  return <aside className="app-sidebar" aria-label="Main navigation">
    <nav className="app-sidebar__nav" aria-label="Modules">
      {navGroups.map((group) => <section className="app-sidebar__group" key={group.key} aria-labelledby={`nav-${group.key}`}>
        <h2 id={`nav-${group.key}`} className="app-sidebar__group-label">{group.label}</h2>
        {group.items.map((item) => {
          const Icon = item.icon
          const content = <><Icon size={iconSizeNav} strokeWidth={iconStroke} aria-hidden="true" /><span className="app-sidebar__label">{item.label}</span></>
          return <NavLink key={item.path} to={item.path} end className={({ isActive }) => `app-sidebar__link${isActive ? ' is-active' : ''}`}>{content}</NavLink>
        })}
      </section>)}
    </nav>
  </aside>
}
