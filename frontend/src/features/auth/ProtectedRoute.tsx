import { Navigate, Outlet } from 'react-router-dom'
import { LoadingState } from '../../components/feedback/LoadingState'
import { useAuth } from './AuthContext'

export function ProtectedRoute() {
  const { status } = useAuth()

  if (status === 'authenticating') {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <LoadingState label="Checking session…" />
      </div>
    )
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
