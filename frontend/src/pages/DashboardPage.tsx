import { NavLink } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Panel } from '../components/ui/Panel'
import { useAuth } from '../features/auth/AuthContext'
import { iconSizeNav, iconStroke } from '../lib/icons'
import { getNavItemsForRole } from '../lib/navigation'
import { roleLabel } from '../types/auth'
import '../components/layout/page.css'
import './dashboard-page.css'

export function DashboardPage() {
  const { currentUser } = useAuth()
  const quickAccessItems = currentUser
    ? getNavItemsForRole(currentUser.role).filter(
        (item) => item.path !== '/dashboard' && !item.comingSoon
      )
    : []

  return (
    <div className="page page__stack">
      <header className="page__header">
        <p className="dashboard-page__eyebrow">Dashboard</p>
        <h1 className="page__title">
          Welcome, {currentUser?.name ?? 'User'}
        </h1>
        <p className="page__description">
          Choose an available module to continue.
        </p>
      </header>

      <Panel title="Current User">
        <dl className="dashboard-page__user-details">
          <div>
            <dt>Name</dt>
            <dd>{currentUser?.name ?? '—'}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{currentUser?.email ?? '—'}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>
              {currentUser ? (
                <Badge tone="accent">{roleLabel(currentUser.role)}</Badge>
              ) : (
                '—'
              )}
            </dd>
          </div>
        </dl>
      </Panel>

      <section className="dashboard-page__quick-access" aria-labelledby="quick-access-title">
        <div>
          <h2 id="quick-access-title">Quick Access</h2>
          <p>Only modules available to your role are shown.</p>
        </div>

        <div className="dashboard-page__quick-grid">
          {quickAccessItems.map((item) => {
            const Icon = item.icon
            const actionLabel =
              currentUser?.role === 'end_user' && item.path === '/orders'
                ? 'Open POS'
                : item.label

            return (
              <NavLink
                className="dashboard-page__quick-link"
                key={item.path}
                to={item.path}
              >
                <Icon
                  size={iconSizeNav}
                  strokeWidth={iconStroke}
                  aria-hidden="true"
                />
                <span>
                  <strong>{actionLabel}</strong>
                  <small>{item.description}</small>
                </span>
              </NavLink>
            )
          })}
        </div>
      </section>
    </div>
  )
}
