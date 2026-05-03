// src/app/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const token   = localStorage.getItem('token')
  const company = localStorage.getItem('company')
  const location = useLocation()

  if (!token || !company) {
    // Guardar la URL actual para redirigir después del login
    const returnUrl = location.pathname + location.search
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnUrl)}`} replace />
  }

  return children
}