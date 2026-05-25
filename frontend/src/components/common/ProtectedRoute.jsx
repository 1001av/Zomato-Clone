// src/components/common/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function ProtectedRoute({ role }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (role && user && user.role !== role && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}