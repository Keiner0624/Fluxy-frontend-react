// src/components/CookieConsent.jsx
// Aviso de cookies del sitio de Fluxy. No aparece en las tiendas.
import { useEffect, useState, useSyncExternalStore } from 'react'
import { router } from '@/app/router'
import { OPEN_PREFERENCES_EVENT, getConsent, isStorePage, loadAnalytics, setConsent } from '@/app/consent'
import { CURRENT_LEGAL_VERSION } from '@/modules/landing/legal/documents'

const subscribe = (callback) => router.subscribe(callback)
const getLocation = () => router.state.location

export default function CookieConsent() {
  const location = useSyncExternalStore(subscribe, getLocation)
  const [open, setOpen] = useState(() => getConsent() === null)
  const onStore = isStorePage(location)

  useEffect(() => {
    if (!onStore && getConsent() === 'granted') loadAnalytics()
  }, [onStore])

  useEffect(() => {
    const show = () => setOpen(true)
    window.addEventListener(OPEN_PREFERENCES_EVENT, show)
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, show)
  }, [])

  if (!open || onStore) return null

  const choose = (value) => {
    setConsent(value)
    setOpen(false)
  }

  return (
    <div className="fx fx-cookies" role="dialog" aria-live="polite" aria-label="Preferencias de cookies">
      <p>
        Usamos almacenamiento necesario para que Fluxy funcione y, si lo aceptás, Google Analytics para medir el uso del sitio.{' '}
        <a href={`/terms?doc=privacy&version=${CURRENT_LEGAL_VERSION}#sec-p11`}>Más información</a>
      </p>
      <div className="fx-cookies__actions">
        <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" onClick={() => choose('denied')}>Solo necesarias</button>
        <button type="button" className="fx-btn fx-btn--primary fx-btn--sm" onClick={() => choose('granted')}>Aceptar medición</button>
      </div>
    </div>
  )
}
