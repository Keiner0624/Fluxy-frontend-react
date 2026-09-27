// src/app/storeHost.js
// ¿La app se abrió en Fluxy o en el dominio propio de una tienda (mitienda.com)? En un dominio
// propio solo se muestra esa tienda; el panel y el resto viven en la dirección de Fluxy.

const env = import.meta.env || {}

/** Direcciones de Fluxy. VITE_PLATFORM_HOSTS agrega otras, separadas por coma. */
const FLUXY_HOSTS = ['fluxyweb.vercel.app', 'fluxyweb.com', 'www.fluxyweb.com']

function hostOf(url) {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return ''
  }
}

export function platformHosts() {
  return new Set([
    ...FLUXY_HOSTS,
    hostOf(env.VITE_STORE_APP_URL),
    hostOf(env.VITE_SELLER_APP_URL),
    ...String(env.VITE_PLATFORM_HOSTS || '').split(',').map((h) => h.trim().toLowerCase()),
  ].filter(Boolean))
}

/**
 * El dominio de la tienda si la app se abrió en uno propio; null en Fluxy, en las vistas previas
 * de Vercel y en desarrollo. En desarrollo, mitienda.com.localhost simula mitienda.com.
 */
export function customStoreHost(hostname, { hosts = platformHosts(), dev = Boolean(env.DEV) } = {}) {
  const host = String(hostname ?? (typeof window === 'undefined' ? '' : window.location.hostname))
    .toLowerCase().replace(/\.$/, '')
  if (!host || host.startsWith('[') || /^[\d.]+$/.test(host)) return null
  if (host === 'localhost') return null
  if (host.endsWith('.localhost')) return dev ? host.slice(0, -'.localhost'.length) || null : null
  if (host === 'vercel.app' || host.endsWith('.vercel.app') || hosts.has(host)) return null
  return host.includes('.') ? host : null
}
