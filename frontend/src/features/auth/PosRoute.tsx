import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function PosRoute() {
  const { currentUser } = useAuth()
  if (currentUser?.role === 'admin') return <Outlet />
  if (currentUser?.role === 'cashier' && currentUser.station && currentUser.privileges.some((privilege) => privilege.description.toLowerCase() === 'cashier')) return <Outlet />
  return <Navigate to="/cashier-home" replace />
}
