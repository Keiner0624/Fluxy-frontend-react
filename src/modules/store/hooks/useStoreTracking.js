// src/modules/store/hooks/useStoreTracking.js
// Carga Google Analytics y Meta Pixel cuando el vendedor los conectó en Integraciones.
import { useEffect } from 'react'

// El backend ya valida el formato; se repite acá porque el valor termina dentro de un script.
const GA_ID = /^G-[A-Z0-9]{4,20}$/
const PIXEL_ID = /^\d{8,20}$/

function loadGoogleAnalytics(id) {
  if (document.getElementById(`ga-${id}`)) return
  const script = document.createElement('script')
  script.id = `ga-${id}`
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
  document.head.appendChild(script)
  window.dataLayer = window.dataLayer || []
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  window.gtag('config', id)
}

function loadMetaPixel(id) {
  if (window.fbq?.loadedIds?.includes(id)) return
  if (!window.fbq) {
    const fbq = function fbq(...args) {
      if (fbq.callMethod) fbq.callMethod(...args)
      else fbq.queue.push(args)
    }
    fbq.queue = []
    fbq.loaded = true
    fbq.version = '2.0'
    fbq.loadedIds = []
    window.fbq = fbq
    window._fbq = fbq
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(script)
  }
  window.fbq('init', id)
  window.fbq('track', 'PageView')
  window.fbq.loadedIds?.push(id)
}

export function useStoreTracking(company) {
  const gaId = company?.googleAnalyticsId
  const pixelId = company?.metaPixelId

  useEffect(() => {
    if (gaId && GA_ID.test(gaId)) loadGoogleAnalytics(gaId)
  }, [gaId])

  useEffect(() => {
    if (pixelId && PIXEL_ID.test(pixelId)) loadMetaPixel(pixelId)
  }, [pixelId])
}

/** Registra la compra en las herramientas conectadas, para medir conversiones. */
export function trackPurchase({ orderId, total, items = [] }) {
  const value = Number(total) || 0
  try {
    window.gtag?.('event', 'purchase', {
      transaction_id: String(orderId),
      value,
      currency: 'PEN',
      items: items.map((item) => ({ item_id: String(item.product.id), item_name: item.product.name, quantity: item.quantity, price: item.product.price })),
    })
    window.fbq?.('track', 'Purchase', { value, currency: 'PEN' })
  } catch {
    // La medición nunca debe romper la compra.
  }
}
