// src/app/tokenUtils.js

/**
 * Decodifica el payload del JWT sin librerías externas
 */
export function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return decoded
  } catch {
    return null
  }
}

/**
 * Retorna true si el token existe y NO ha expirado
 */
export function isTokenValid(token) {
  if (!token) return false
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return false
  // exp está en segundos, Date.now() en milisegundos
  return decoded.exp * 1000 > Date.now()
}

/**
 * Retorna cuántos ms faltan para que expire el token
 * Retorna 0 si ya expiró
 */
export function msUntilExpiry(token) {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return 0
  return Math.max(0, decoded.exp * 1000 - Date.now())
}

/**
 * Limpia el localStorage y redirige al login
 */
export function forceLogout(returnTo = '') {
  localStorage.removeItem('token')
  localStorage.removeItem('company')
  localStorage.removeItem('user')
  const url = returnTo
    ? `/login?returnTo=${encodeURIComponent(returnTo)}`
    : '/login'
  window.location.href = url
}