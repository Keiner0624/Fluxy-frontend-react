// src/app/api.js
// Cliente del panel para el backend: token, JSON, mensajes de error legibles y
// cierre de sesión cuando el acceso ya no es válido.

import { API_URL } from '@/app/config'
import { endSession as closeSession, getAccessToken } from '@/app/session'

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
  423: 'El negocio está archivado. Reactivalo para seguir operando.',
  429: 'Demasiados intentos. Esperá un momento y probá de nuevo.',
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
export const endSession = closeSession

/**
 * idempotencyKey: para crear pedidos y registrar o reembolsar cobros. Reintentar
 * con la misma clave devuelve el resultado original en lugar de duplicarlo.
 */
export async function api(path, { method = 'GET', body, params, signal, idempotencyKey } = {}) {
  const headers = { Authorization: `Bearer ${getAccessToken()}` }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey

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
    // El interceptor de sesión ya intentó renovar: un 401 acá es definitivo.
    if (response.status === 401) {
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
