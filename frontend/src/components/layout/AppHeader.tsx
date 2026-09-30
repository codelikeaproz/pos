import { useLocation } from 'react-router-dom'
import { getNavItemByPath } from '../../lib/navigation'
import './app-header.css'

export function AppHeader() {
  const location = useLocation()
  const current = getNavItemByPath(location.pathname)

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__brand-mark" aria-hidden="true" />
        <div>
          <p className="app-header__app-name">University HomeStay POS</p>
          {location.pathname !== '/orders' ? <p className="app-header__page">{current.title}</p> : null}
        </div>
      </div>
    </header>
  )
}
