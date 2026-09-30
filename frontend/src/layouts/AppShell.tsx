import { Outlet, useLocation } from 'react-router-dom'
import { AppHeader } from '../components/layout/AppHeader'
import { AppSidebar } from '../components/layout/AppSidebar'
import './app-shell.css'

export function AppShell() {
  const isPos = useLocation().pathname === '/orders'
  return (
    <div className={`app-shell${isPos ? ' app-shell--pos' : ''}`}>
      <AppHeader />
      <div className="app-shell__body">
        {!isPos ? <AppSidebar /> : null}
        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
