// src/app/consent.js
// Consentimiento de cookies de medición del sitio de Fluxy. Google Analytics se carga
// solo si el visitante lo acepta; las tiendas usan la medición que conecta cada comercio.

const KEY = 'fluxy_cookie_consent'
const GA_ID = 'G-ES9389WMW0'
export const OPEN_PREFERENCES_EVENT = 'fluxy:cookie-preferences'

export function getConsent() {
  try {
    const value = localStorage.getItem(KEY)
    return value === 'granted' || value === 'denied' ? value : null
  } catch {
    return null
  }
}

export function setConsent(value) {
  try { localStorage.setItem(KEY, value) } catch { /* sin almacenamiento: se vuelve a preguntar */ }
  if (value === 'granted') loadAnalytics()
  else disableAnalytics()
}

export function openCookiePreferences() {
  window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT))
}

/** Páginas de una tienda: su medición la decide el comercio, no Fluxy. */
export function isStorePage(location = window.location) {
  return location.pathname.startsWith('/store/') || new URLSearchParams(location.search).has('store')
}

export function loadAnalytics() {
  if (typeof document === 'undefined' || import.meta.env.DEV) return
  window[`ga-disable-${GA_ID}`] = false
  if (document.getElementById('fluxy-ga')) return
  const script = document.createElement('script')
  script.id = 'fluxy-ga'
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)
  window.dataLayer = window.dataLayer || []
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { anonymize_ip: true })
}

function disableAnalytics() {
  window[`ga-disable-${GA_ID}`] = true
}
