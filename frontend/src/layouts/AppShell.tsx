import { Outlet } from 'react-router-dom'
import { AppHeader } from '../components/layout/AppHeader'
import { AppSidebar } from '../components/layout/AppSidebar'
import './app-shell.css'

export function AppShell() {
  return (
    <div className="app-shell">
      <AppHeader />
      <div className="app-shell__body">
        <AppSidebar />
        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
