// src/modules/auth/oauth.js
// Acceso con Google (Google Identity Services) y Apple (Sign in with Apple JS).
// El proveedor devuelve un ID token con el nonce que emitió el backend; el
// backend verifica firma, audiencia y nonce, y emite la sesión de Fluxy.

import { API_URL } from '@/app/config'

const GOOGLE_SCRIPT = 'https://accounts.google.com/gsi/client'
const APPLE_SCRIPT = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/es_ES/appleid.auth.js'

let configPromise = null
const scripts = new Map()

export function getOAuthConfig() {
  if (!configPromise) {
    configPromise = fetch(`${API_URL}/auth/oauth/config`)
      .then((res) => (res.ok ? res.json() : {}))
      .catch(() => {
        configPromise = null
        return {}
      })
  }
  return configPromise
}

function loadScript(src) {
  if (!scripts.has(src)) {
    scripts.set(src, new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.async = true
      script.onload = resolve
      script.onerror = () => {
        scripts.delete(src)
        reject(new Error('No se pudo cargar el acceso con el proveedor. Revisá tu conexión.'))
      }
      document.head.appendChild(script)
    }))
  }
  return scripts.get(src)
}

export async function newNonce() {
  const res = await fetch(`${API_URL}/auth/oauth/nonce`, { method: 'POST' })
  if (!res.ok) throw new Error('No se pudo iniciar el acceso. Intentá de nuevo.')
  return (await res.json()).nonce
}

/**
 * Dibuja el botón oficial de Google en el contenedor. Google no permite abrir su
 * selector desde un botón propio, así que el botón visible es el suyo.
 */
export async function renderGoogleButton(container, { clientId, onCredential, text = 'continue_with' }) {
  await loadScript(GOOGLE_SCRIPT)
  const nonce = await newNonce()
  window.google.accounts.id.initialize({
    client_id: clientId,
    nonce,
    ux_mode: 'popup',
    auto_select: false,
    itp_support: true,
    callback: ({ credential }) => onCredential({ idToken: credential, nonce }),
  })
  container.innerHTML = ''
  window.google.accounts.id.renderButton(container, {
    type: 'standard',
    theme: document.documentElement.dataset.theme === 'dark' ? 'filled_black' : 'outline',
    size: 'large',
    shape: 'rectangular',
    text,
    logo_alignment: 'center',
    width: Math.min(400, Math.max(180, Math.round(container.getBoundingClientRect().width))),
  })
}

/** Abre el popup de Apple y devuelve el ID token y el nombre (Apple lo manda solo la primera vez). */
export async function signInWithApple({ clientId, redirectUri }) {
  await loadScript(APPLE_SCRIPT)
  const nonce = await newNonce()
  window.AppleID.auth.init({
    clientId,
    scope: 'name email',
    redirectURI: redirectUri || window.location.origin + '/login',
    usePopup: true,
    nonce,
  })
  try {
    const response = await window.AppleID.auth.signIn()
    const name = response.user?.name
    return {
      idToken: response.authorization?.id_token,
      nonce,
      name: name ? [name.firstName, name.lastName].filter(Boolean).join(' ') : '',
    }
  } catch (error) {
    if (error?.error === 'popup_closed_by_user' || error?.error === 'user_cancelled_authorize') return null
    throw new Error('Apple no completó el acceso. Intentá de nuevo.', { cause: error })
  }
}

/** Envía el ID token al backend. status LOGGED_IN trae la sesión; ONBOARDING_REQUIRED, el registro. */
export async function exchangeIdToken(provider, { idToken, nonce, name }, rememberMe = true) {
  const res = await fetch(`${API_URL}/auth/oauth/${provider}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken, nonce, name, rememberMe }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const error = new Error(data.message || 'No se pudo completar el acceso.')
    error.code = data.code
    error.status = res.status
    throw error
  }
  return data
}
