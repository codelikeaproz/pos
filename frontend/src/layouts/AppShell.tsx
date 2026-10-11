import { Outlet, useLocation } from 'react-router-dom'
import { AppHeader } from '../components/layout/AppHeader'
import { AppSidebar } from '../components/layout/AppSidebar'
import { useAuth } from '../features/auth/AuthContext'
import './app-shell.css'

export function AppShell() {
  const pathname = useLocation().pathname
  const isPos = pathname === '/orders'
  const isCashierHome = pathname === '/cashier-home'
  const { currentUser } = useAuth()
  return (
    <div className={`app-shell${isPos ? ' app-shell--pos' : ''}`}>
      {!isPos ? <AppHeader /> : null}
      <div className="app-shell__body">
        {!isPos && currentUser?.role === 'admin' ? <AppSidebar /> : null}
        <main className={`app-shell__content${isCashierHome ? ' app-shell__content--centered' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
