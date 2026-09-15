// src/modules/store/lib/storeFormat.js
// Formatos y datos derivados que usan varias piezas de la tienda.

const moneyFormat = new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function money(value) {
  const number = Number(value)
  return `S/ ${moneyFormat.format(Number.isFinite(number) ? number : 0)}`
}

export function stockOf(product) {
  return Math.max(0, Number(product?.stock) || 0)
}

export function productImages(product) {
  let images = []
  try {
    if (Array.isArray(product?.images)) images = product.images
    else if (product?.images) images = JSON.parse(product.images)
  } catch {
    images = []
  }
  if (!Array.isArray(images)) images = []
  images = images.filter((src) => typeof src === 'string' && src)
  if (product?.imageUrl && !images.includes(product.imageUrl)) images.unshift(product.imageUrl)
  return images
}

/** Sin tildes ni mayúsculas, para buscar como escribe la gente. */
export function normalizeText(value = '') {
  return String(value).toLocaleLowerCase('es').normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function matchesSearch(product, query) {
  const q = normalizeText(query.trim())
  if (!q) return true
  const haystack = normalizeText(`${product.name || ''} ${product.description || ''} ${product.category?.name || ''}`)
  return q.split(/\s+/).every((word) => haystack.includes(word))
}

/** Número de WhatsApp con código de país: un celular peruano de 9 dígitos recibe el 51. */
export function whatsappNumber(company) {
  const digits = String(company?.phone || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.length === 9 && digits.startsWith('9')) return `51${digits}`
  return digits
}

/** WhatsApp solo para planes pagos y si el vendedor no lo desactivó en Integraciones. */
export function canUseWhatsapp(company) {
  return Boolean(whatsappNumber(company)) && company?.plan !== 'FREE' && company?.whatsappEnabled !== false
}

export function whatsappLink(company, message) {
  const number = whatsappNumber(company)
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : ''
}

export function mapsLink(address) {
  return address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : ''
}

export const PAYMENT_LABELS = {
  efectivo: 'Efectivo', yape: 'Yape', plin: 'Plin', tarjeta: 'Tarjeta', transferencia: 'Transferencia',
  mercadopago: 'Mercado Pago', nequi: 'Nequi', daviplata: 'Daviplata', pse: 'PSE', oxxo: 'OXXO',
  codi: 'CoDi', modo: 'MODO', webpay: 'Webpay', pix: 'PIX', boleto: 'Boleto',
}

/** Medios de pago que el vendedor habilitó en Configuración. */
export function paymentMethods(company) {
  try {
    const raw = company?.paymentMethods
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(parsed) ? parsed.filter((key) => typeof key === 'string' && /^[a-z0-9_-]{1,40}$/.test(key)) : []
  } catch {
    return []
  }
}

export const SORTS = {
  featured: 'Destacados',
  priceAsc: 'Menor precio',
  priceDesc: 'Mayor precio',
  name: 'Nombre (A-Z)',
}

export function sortProducts(products, sort) {
  const list = [...products]
  switch (sort) {
    case 'priceAsc': return list.sort((a, b) => a.price - b.price)
    case 'priceDesc': return list.sort((a, b) => b.price - a.price)
    case 'name': return list.sort((a, b) => String(a.name).localeCompare(String(b.name), 'es'))
    default:
      // Disponibles primero y, entre ellos, los que tienen foto.
      return list.sort((a, b) => (stockOf(b) > 0) - (stockOf(a) > 0) || Boolean(b.imageUrl) - Boolean(a.imageUrl))
  }
}
