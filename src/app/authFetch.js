// src/app/authFetch.js
import { getAccessToken } from './session'

/**
 * fetch con el token de la sesión. La renovación y el reintento ante un 401 los
 * hace el interceptor de session.js.
 */
export async function authFetch(url, options = {}) {
  return fetch(url, { ...options, headers: { ...options.headers, Authorization: `Bearer ${getAccessToken()}` } })
}

/** Petición JSON autenticada. */
export async function authJson(url, method = 'GET', body = null) {
  const options = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) options.body = JSON.stringify(body)
  return authFetch(url, options)
}
