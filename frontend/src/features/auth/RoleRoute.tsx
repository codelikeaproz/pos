import { Navigate, Outlet } from 'react-router-dom'
import type { UserRole } from '../../types/auth'
import { useAuth } from './AuthContext'

export function RoleRoute({ allowedRoles }: { allowedRoles: UserRole[] }) {
  const { currentUser } = useAuth()

  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    return <Navigate to={currentUser?.role === 'admin' ? '/dashboard' : '/cashier-home'} replace />
  }

  return <Outlet />
}
