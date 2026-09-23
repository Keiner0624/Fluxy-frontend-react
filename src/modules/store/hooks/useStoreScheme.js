// src/modules/store/hooks/useStoreScheme.js
// Esquema que se ve en pantalla: el que fijó el vendedor, o el del dispositivo si eligió "auto".
import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-color-scheme: dark)'

function subscribe(callback) {
  const media = window.matchMedia?.(QUERY)
  media?.addEventListener?.('change', callback)
  return () => media?.removeEventListener?.('change', callback)
}

const deviceIsDark = () => Boolean(window.matchMedia?.(QUERY).matches)

export function useStoreScheme(mode) {
  const systemDark = useSyncExternalStore(subscribe, deviceIsDark, () => false)
  if (mode === 'dark') return 'dark'
  if (mode === 'auto') return systemDark ? 'dark' : 'light'
  return 'light'
}
