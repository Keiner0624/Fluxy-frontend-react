// src/app/authFetch.js
import { isTokenValid, forceLogout } from './tokenUtils'

/**
 * Wrapper de fetch que:
 * 1. Inyecta el Authorization header automáticamente
 * 2. Si el token expiró antes de hacer la llamada → redirige al login
 * 3. Si el backend responde 401 → redirige al login
 */
export async function authFetch(url, options = {}) {
  const token = localStorage.getItem('token')

  // Verificar antes de hacer la llamada
  if (!isTokenValid(token)) {
    forceLogout(window.location.pathname)
    return
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  }

  const res = await fetch(url, { ...options, headers })

  // Si el backend devuelve 401, el token fue rechazado
  if (res.status === 401) {
    forceLogout(window.location.pathname)
    return
  }

  return res
}

/**
 * Helper para peticiones JSON autenticadas
 */
export async function authJson(url, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body) options.body = JSON.stringify(body)
  return authFetch(url, options)
}