// src/app/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { isTokenValid, msUntilExpiry, forceLogout } from './tokenUtils'

export default function ProtectedRoute({ children }) {
  const token    = localStorage.getItem('token')
  const company  = localStorage.getItem('company')
  const location = useLocation()

  const returnUrl = location.pathname + location.search
  const hasValidSession = Boolean(token && company && isTokenValid(token))

  useEffect(() => {
    if (!hasValidSession) return

    const ms = msUntilExpiry(token)
    if (ms <= 0) {
      forceLogout(returnUrl)
      return
    }

    // Cuando falten 30 segundos para expirar, mostrar aviso y cerrar sesión
    const warningTime = Math.max(0, ms - 30_000)
    const warningTimer = setTimeout(() => {
      const confirmed = window.confirm(
        'Tu sesión expirará en 30 segundos.\n\nAceptá para volver a iniciar sesión.'
      )
      if (confirmed) {
        // Redirigir al login para que vuelva a autenticarse
        forceLogout(returnUrl)
      }
    }, warningTime)

    // Timer de cierre definitivo cuando expire
    const logoutTimer = setTimeout(() => {
      forceLogout(returnUrl)
    }, ms)

    return () => {
      clearTimeout(warningTimer)
      clearTimeout(logoutTimer)
    }
  }, [hasValidSession, returnUrl, token])

  // ─── Si el token no existe o ya expiró → redirigir al login ─────────────
  if (!hasValidSession) {
    localStorage.removeItem('token')
    localStorage.removeItem('company')
    localStorage.removeItem('user')
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnUrl)}`} replace />
  }

  return children
}
