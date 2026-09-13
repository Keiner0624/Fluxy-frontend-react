// src/app/api.js
// Cliente del panel para el backend: token, JSON, mensajes de error legibles y
// cierre de sesión cuando el acceso ya no es válido.

import { API_URL } from '@/app/config'
import { invalidateAccount } from '@/app/account'
import { isTokenValid } from '@/app/tokenUtils'

export class ApiError extends Error {
  constructor(message, status, code, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.data = data
  }
}

const FALLBACK = {
  400: 'Revisá los datos ingresados.',
  403: 'No tenés permiso para esta acción.',
  404: 'No encontramos lo que buscabas.',
  409: 'La acción entra en conflicto con otro dato.',
  500: 'El servidor tuvo un problema. Intentá de nuevo en unos segundos.',
}

function buildQuery(params) {
  if (!params) return ''
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    search.set(key, String(value))
  })
  const text = search.toString()
  return text ? `?${text}` : ''
}

/** Cierra la sesión y lleva al login con el motivo. */
export function endSession(reason) {
  invalidateAccount()
  ;['token', 'user', 'company'].forEach((key) => localStorage.removeItem(key))
  const returnTo = window.location.pathname + window.location.search
  const params = new URLSearchParams({ reason })
  if (reason === 'expired') params.set('returnTo', returnTo)
  window.location.assign(`/login?${params}`)
}

export async function api(path, { method = 'GET', body, params, signal } = {}) {
  const token = localStorage.getItem('token') || ''
  const headers = { Authorization: `Bearer ${token}` }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response
  try {
    response = await fetch(`${API_URL}${path}${buildQuery(params)}`, {
      method,
      headers,
      signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError('No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.', 0)
  }

  const text = await response.text()
  let data = null
  if (text) {
    try { data = JSON.parse(text) } catch { data = text }
  }

  if (!response.ok) {
    const code = data && typeof data === 'object' ? data.code : undefined
    // Spring responde 403 sin cuerpo cuando el token venció o no es válido.
    if (response.status === 401 || (response.status === 403 && !code && !isTokenValid(token))) {
      endSession('expired')
    } else if (code === 'ACCESS_DISABLED') {
      endSession('disabled')
    }
    const message = (data && typeof data === 'object' && (data.message || data.error))
      || FALLBACK[response.status]
      || 'No se pudo completar la acción.'
    throw new ApiError(message, response.status, code, data)
  }
  return data
}

api.get = (path, params, options) => api(path, { ...options, params })
api.post = (path, body, options) => api(path, { ...options, method: 'POST', body })
api.put = (path, body, options) => api(path, { ...options, method: 'PUT', body })
api.patch = (path, body, options) => api(path, { ...options, method: 'PATCH', body })
api.del = (path, options) => api(path, { ...options, method: 'DELETE' })
