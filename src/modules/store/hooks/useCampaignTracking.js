// src/modules/store/hooks/useCampaignTracking.js
// Medición de campañas de Marketing en la tienda. Solo se activa si el comprador entró por un
// enlace de campaña (?cmp=código): guarda el código unos días y avisa los pasos del embudo.
// Usa un identificador aleatorio del navegador; nunca datos del comprador.
import { useCallback, useEffect, useRef, useState } from 'react'
import { trackCampaignEvent } from '@/modules/store/api/storeApi'

const CODE = /^[A-Za-z0-9]{8,24}$/
const SESSION = /^[A-Za-z0-9_-]{16,64}$/
const DAY = 86400000

const storageKey = (slug, name) => `fluxy_${name}:${slug}`

function read(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null }
}

function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* sin almacenamiento: se mide solo esta visita */ }
}

/** Vigente dentro de la ventana de atribución que informó el servidor. */
export function activeRef(ref, now = Date.now()) {
  if (!ref || !CODE.test(ref.code || '') || !ref.at) return null
  const days = Number(ref.days) || 7
  return now - ref.at < days * DAY ? ref : null
}

function randomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
}

function sessionId(slug) {
  const key = storageKey(slug, 'sid')
  let id = null
  try { id = localStorage.getItem(key) } catch { /* modo privado */ }
  if (!id || !SESSION.test(id)) {
    id = randomId()
    try { localStorage.setItem(key, id) } catch { /* modo privado */ }
  }
  return id
}

export function useCampaignTracking(company, slug, params) {
  const [ref, setRef] = useState(() => (slug ? activeRef(read(storageKey(slug, 'cmp'))) : null))
  const handled = useRef('')
  const sent = useRef(new Set())
  const companyId = company?.id
  const code = params.get('cmp')
  const source = params.get('utm_source')

  // Entrada por un enlace de campaña.
  useEffect(() => {
    if (!companyId || !slug || !code || !CODE.test(code) || handled.current === code) return
    handled.current = code
    trackCampaignEvent(companyId, { type: 'VIEW', code, sessionId: sessionId(slug), source: source || undefined })
      .then((result) => {
        if (!result?.accepted) return
        const next = { code, at: Date.now(), days: result.attributionDays || 7, coupon: result.couponCode || null }
        write(storageKey(slug, 'cmp'), next)
        setRef(next)
      })
  }, [companyId, slug, code, source])

  const current = activeRef(ref)

  const track = useCallback((type, productId) => {
    const active = activeRef(ref)
    if (!active || !companyId || !slug) return
    // El servidor ya deduplica por día; esto ahorra pedidos repetidos en la misma visita.
    const key = `${type}:${productId || ''}`
    if (sent.current.has(key)) return
    sent.current.add(key)
    trackCampaignEvent(companyId, { type, code: active.code, sessionId: sessionId(slug), productId: productId || undefined })
  }, [ref, companyId, slug])

  return {
    track,
    /** Para el pedido: el servidor lo atribuye a la última campaña vigente que vio esta sesión. */
    orderSessionId: current && slug ? sessionId(slug) : null,
    coupon: current?.coupon || null,
  }
}
