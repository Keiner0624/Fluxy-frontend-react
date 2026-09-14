import { API_URL } from '@/app/config'

async function requestJson(path, options, fallbackMessage) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, options)
  } catch {
    throw new Error('No se pudo conectar con la tienda. Verifica que el backend local esté encendido.')
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

export function getProducts(slug) {
  return requestJson(`/store/slug/${encodeURIComponent(slug)}/products`, undefined, 'No se pudieron cargar los productos')
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
