// src/app/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import { getRefreshToken } from './session'

/**
 * Exige una sesión del panel. El access token dura 15 minutos y se renueva solo
 * con el refresh token; si la sesión se revocó, la primera petición lleva al login.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation()
  const hasSession = Boolean(getRefreshToken() && localStorage.getItem('company'))

  if (!hasSession) {
    ;['token', 'refreshToken', 'sessionId', 'company', 'user'].forEach((key) => localStorage.removeItem(key))
    const returnUrl = location.pathname + location.search
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnUrl)}`} replace />
  }
  return children
}
