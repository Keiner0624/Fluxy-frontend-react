import { API_URL } from '@/app/config'

async function requestJson(path, options, fallbackMessage) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, options)
  } catch {
    throw new Error('No pudimos conectar con la tienda. Revisá tu conexión e intentá de nuevo.')
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    // Algunas respuestas de error del backend no incluyen JSON.
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || fallbackMessage)
  }
  return data
}

export function getCompanyInfo(slug) {
  return requestJson(`/store/slug/${encodeURIComponent(slug)}/info`, undefined, 'Tienda no encontrada')
}

export function getCategories(slug) {
  return requestJson(`/store/slug/${encodeURIComponent(slug)}/categories`, undefined, 'No se pudieron cargar las categorías')
}

export function validateCoupon(companyId, code, orderTotal) {
  const params = new URLSearchParams({ code, companyId: String(companyId), orderTotal: String(orderTotal) })
  return requestJson(`/coupons/validate?${params}`, undefined, 'El cupón no es válido')
}

export function getProducts(slug) {
  return requestJson(`/store/slug/${encodeURIComponent(slug)}/products`, undefined, 'No se pudieron cargar los productos')
}

/**
 * Paso del embudo de una campaña. Nunca falla ni demora la tienda: keepalive deja que el
 * aviso salga aunque el comprador cambie de página. Devuelve null si no se pudo.
 */
export async function trackCampaignEvent(companyId, event) {
  try {
    const response = await fetch(`${API_URL}/store/${encodeURIComponent(companyId)}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
      keepalive: true,
    })
    return response.ok ? await response.json() : null
  } catch {
    return null
  }
}

/**
 * idempotencyKey: si la conexión se corta y el comprador vuelve a confirmar,
 * el backend devuelve el mismo pedido en lugar de crear otro.
 */
export function createOrder(companyId, orderData, idempotencyKey) {
  return requestJson(
    `/store/${encodeURIComponent(companyId)}/order`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}) },
      body: JSON.stringify(orderData),
    },
    'No se pudo crear el pedido',
  )
}
