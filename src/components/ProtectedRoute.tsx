import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../services/AuthState.ts'
import { LoadingPanel } from './LoadingPanel.tsx'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <LoadingPanel />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
