// src/app/session.js
// Sesión del panel: access token de 15 minutos y refresh token rotativo.
//
// Todas las llamadas al backend pasan por el interceptor de fetch: renueva el
// access token antes de que venza, reintenta una vez ante un 401 y, si la
// sesión ya no sirve, lleva al login. Así las páginas no manejan tokens.

import { API_URL } from '@/app/config'
import { invalidateAccount } from '@/app/account'
import { decodeToken } from '@/app/tokenUtils'

const KEYS = ['token', 'refreshToken', 'sessionId']
/** Se renueva un poco antes de vencer, para no perder la petición en curso. */
const RENEW_BEFORE_MS = 60_000
const PUBLIC_PREFIXES = ['/auth/', '/store/', '/coupons/validate', '/payments/webhook', '/actuator/']

let nativeFetch = typeof window !== 'undefined' ? window.fetch.bind(window) : fetch
let inflight = null

export class SessionExpiredError extends Error {
  constructor(code) {
    super('La sesión venció.')
    this.name = 'SessionExpiredError'
    this.code = code
  }
}

export const getAccessToken = () => localStorage.getItem('token') || ''
export const getRefreshToken = () => localStorage.getItem('refreshToken') || ''
export const getSessionId = () => localStorage.getItem('sessionId') || ''
export const hasSession = () => Boolean(getRefreshToken() || getAccessToken())

function accessExpiresAt(token = getAccessToken()) {
  const exp = decodeToken(token)?.exp
  return exp ? exp * 1000 : 0
}

/** Guarda la sesión emitida por login, registro, invitación o renovación. */
export function saveSession(auth) {
  if (!auth?.token) return
  localStorage.setItem('token', auth.token)
  if (auth.refreshToken) localStorage.setItem('refreshToken', auth.refreshToken)
  if (auth.sessionId) localStorage.setItem('sessionId', auth.sessionId)
}

export function clearSession() {
  ;[...KEYS, 'user', 'company'].forEach((key) => localStorage.removeItem(key))
  invalidateAccount()
}

/** Cierra la sesión local y lleva al login con el motivo. */
export function endSession(reason = 'expired') {
  clearSession()
  if (window.location.pathname.startsWith('/login')) return
  const params = new URLSearchParams({ reason })
  if (reason === 'expired') params.set('returnTo', window.location.pathname + window.location.search)
  window.location.assign(`/login?${params}`)
}

/** Cierre de sesión pedido por la persona: revoca el refresh token en el servidor. */
export async function logout() {
  const token = getAccessToken()
  if (token) {
    try {
      await nativeFetch(`${API_URL}/me/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    } catch {
      // Sin conexión igual se cierra localmente; el refresh vence solo.
    }
  }
  clearSession()
}

/**
 * Renueva el access token. Una sola renovación a la vez, también entre
 * pestañas (Web Locks): si otra pestaña ya rotó el refresh token, se usa el suyo.
 */
export function refreshSession() {
  if (inflight) return inflight
  const startedWith = getRefreshToken()

  const run = async () => {
    const current = getRefreshToken()
    if (!current) throw new SessionExpiredError('NO_REFRESH')
    if (current !== startedWith && accessExpiresAt() - Date.now() > RENEW_BEFORE_MS) return getAccessToken()

    const response = await nativeFetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: current }),
    })
    if (response.ok) {
      saveSession(await response.json())
      return getAccessToken()
    }
    const data = await response.json().catch(() => ({}))
    if (response.status === 409) {
      // Otra pestaña renovó en el mismo instante: su token llega por localStorage.
      await new Promise((resolve) => setTimeout(resolve, 700))
      if (getRefreshToken() !== current) return getAccessToken()
    }
    if (response.status === 429 || response.status >= 500) {
      throw new Error('No se pudo renovar la sesión. Intentá de nuevo.')
    }
    ;['token', 'refreshToken', 'sessionId'].forEach((key) => localStorage.removeItem(key))
    throw new SessionExpiredError(data.code)
  }

  const locked = navigator.locks?.request
    ? navigator.locks.request('fluxy-session-refresh', run)
    : run()
  inflight = locked.finally(() => { inflight = null })
  return inflight
}

function isPrivateApiCall(url) {
  if (!url.startsWith(API_URL)) return false
  const path = url.slice(API_URL.length)
  return !PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix))
}

function unauthorized() {
  return new Response(JSON.stringify({ status: 401, code: 'SESSION_EXPIRED', message: 'Tu sesión venció.' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })
}

/** Instala el interceptor una sola vez, antes del primer render. */
export function installSessionInterceptor() {
  if (window.__fluxySessionInterceptor) return
  window.__fluxySessionInterceptor = true
  nativeFetch = window.fetch.bind(window)

  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url || String(input)
    // Sin refresh token (tienda pública, administrador, visitante) no hay nada que renovar.
    if (!isPrivateApiCall(url) || !getRefreshToken()) return nativeFetch(input, init)

    const send = (token) => {
      const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined))
      headers.set('Authorization', `Bearer ${token}`)
      return nativeFetch(input, { ...init, headers })
    }

    let token = getAccessToken()
    try {
      if (!token || accessExpiresAt(token) - Date.now() < RENEW_BEFORE_MS) token = await refreshSession()
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        endSession('expired')
        return unauthorized()
      }
      // Error de red o servidor: se intenta con el token que haya; el backend decide.
    }

    let response = await send(token)
    if (response.status !== 401) return response

    try {
      token = await refreshSession()
      response = await send(token)
      if (response.status === 401) endSession('expired')
      return response
    } catch (error) {
      if (error instanceof SessionExpiredError) endSession('expired')
      return response
    }
  }

  // Si otra pestaña cierra la sesión, esta también.
  window.addEventListener('storage', (event) => {
    if (event.key === 'refreshToken' && !event.newValue && event.oldValue && window.location.pathname.startsWith('/dashboard')) {
      endSession('expired')
    }
  })
}

/** Clave de idempotencia para operaciones que no deben repetirse (pedidos, cobros). */
export function newIdempotencyKey(prefix = 'op') {
  const random = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `${prefix}-${random}`
}
