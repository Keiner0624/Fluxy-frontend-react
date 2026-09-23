// src/hooks/useBadges.js
// Contadores del menú del panel. Se piden cada minuto mientras la pestaña está a la vista,
// al volver a ella y al cambiar de sección. "Clientes" y "Actividad" cuentan lo nuevo desde la
// última visita a esa sección (guardada en este dispositivo).
import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/app/api'

const EVERY_MS = 60_000
const SEEN_SECTIONS = { customers: '/dashboard/customers', activity: '/dashboard/activity' }

const seenKey = (scope, section) => `fluxy_seen_${section}_${scope}`

function readSeen(scope, section) {
  try {
    const value = Number(localStorage.getItem(seenKey(scope, section)))
    return Number.isFinite(value) && value > 0 ? value : null
  } catch {
    return null
  }
}

function writeSeen(scope, section, time = Date.now()) {
  try { localStorage.setItem(seenKey(scope, section), String(time)) } catch { /* sin almacenamiento */ }
}

export default function useBadges({ scope, pathname, enabled = true }) {
  const [badges, setBadges] = useState({})
  const inFlight = useRef(false)
  const pathRef = useRef(pathname)
  useEffect(() => { pathRef.current = pathname })

  const refresh = useCallback(async () => {
    if (!enabled || !scope || inFlight.current || document.visibilityState === 'hidden') return
    inFlight.current = true
    try {
      const params = {}
      for (const [section, path] of Object.entries(SEEN_SECTIONS)) {
        // Quien está mirando la sección ya ve lo nuevo.
        if (pathRef.current.startsWith(path)) writeSeen(scope, section)
        let since = readSeen(scope, section)
        // Primera vez en este dispositivo: se empieza a contar desde ahora, sin arrastrar historia.
        if (since === null) {
          since = Date.now()
          writeSeen(scope, section, since)
        }
        params[`${section}Since`] = since
      }
      setBadges(await api.get('/dashboard/badges', params))
    } catch {
      // Los contadores son una ayuda: si fallan, el panel sigue igual.
    } finally {
      inFlight.current = false
    }
  }, [enabled, scope])

  // Estar en la sección marca lo nuevo como visto.
  useEffect(() => {
    if (!scope) return
    for (const [section, path] of Object.entries(SEEN_SECTIONS)) {
      if (pathname.startsWith(path)) {
        writeSeen(scope, section)
        setBadges((current) => (current[section] ? { ...current, [section]: 0 } : current))
      }
    }
  }, [scope, pathname])

  useEffect(() => {
    refresh()
  }, [refresh, pathname])

  useEffect(() => {
    const timer = setInterval(refresh, EVERY_MS)
    const onVisible = () => { if (document.visibilityState === 'visible') refresh() }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', refresh)
    window.addEventListener('fluxy:badges', refresh)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', refresh)
      window.removeEventListener('fluxy:badges', refresh)
    }
  }, [refresh])

  return badges
}

/** Pide actualizar los contadores ya (por ejemplo, después de confirmar un pedido). */
export function refreshBadges() {
  window.dispatchEvent(new Event('fluxy:badges'))
}
