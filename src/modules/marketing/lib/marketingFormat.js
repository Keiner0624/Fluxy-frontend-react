// src/modules/marketing/lib/marketingFormat.js
// Textos, etiquetas y armado de mensajes del módulo Marketing. Sin React: se prueba con node --test.

export const TYPES = {
  STORE: { label: 'Tienda', icon: 'store', text: 'Tu tienda completa: logo, portada y catálogo.' },
  PRODUCT: { label: 'Producto', icon: 'products', text: 'Un producto con su foto, precio y stock.' },
  CATEGORY: { label: 'Categoría', icon: 'categories', text: 'Una colección y sus productos.' },
  COUPON: { label: 'Cupón', icon: 'coupons', text: 'Un descuento con sus condiciones.', plan: 'PRO' },
}

export const OBJECTIVES = {
  VISITS: { label: 'Conseguir visitas', text: 'Que más gente conozca la tienda.' },
  SELL_PRODUCT: { label: 'Vender un producto', text: 'Mover un producto puntual.' },
  PROMOTION: { label: 'Impulsar una promoción', text: 'Un precio o un cupón por tiempo limitado.' },
  WIN_BACK: { label: 'Recuperar clientes', text: 'Volver a traer a quienes dejaron de comprar.' },
}

export const CHANNELS = {
  WHATSAPP: { label: 'WhatsApp', icon: 'whatsapp', text: 'Copiá el mensaje o compartilo directo.' },
  INSTAGRAM: { label: 'Instagram', icon: 'instagram', text: 'Descargá la pieza y pegá el texto.' },
  FACEBOOK: { label: 'Facebook', icon: 'facebook', text: 'Compartí el enlace o subí la pieza.' },
  TIKTOK: { label: 'TikTok', icon: 'tiktok', text: 'Usá la pieza y el enlace en tu bio.' },
  DIRECT: { label: 'Enlace directo', icon: 'link', text: 'Un enlace para pegar donde quieras.' },
  QR: { label: 'Código QR', icon: 'qr', text: 'Para imprimir en el local, bolsas o volantes.' },
}

export const STATUS = {
  DRAFT: { label: 'Borrador', badge: '' },
  SCHEDULED: { label: 'Programada', badge: 'fx-badge--brand' },
  ACTIVE: { label: 'Activa', badge: 'fx-badge--ok' },
  PAUSED: { label: 'Pausada', badge: 'fx-badge--warn' },
  FINISHED: { label: 'Finalizada', badge: '' },
  ARCHIVED: { label: 'Archivada', badge: '' },
}

export const FUNNEL = {
  VIEW: 'Entraron por el enlace',
  PRODUCT_VIEW: 'Vieron un producto',
  ADD_TO_CART: 'Agregaron al carrito',
  CHECKOUT_STARTED: 'Empezaron el pedido',
  ORDER_COMPLETED: 'Hicieron el pedido',
}

export const PRIORITY = {
  HIGH: { label: 'Prioridad alta', badge: 'fx-badge--danger' },
  MEDIUM: { label: 'Prioridad media', badge: 'fx-badge--warn' },
  LOW: { label: 'Sugerencia', badge: '' },
}

/** Canal → objetivo por defecto según lo que se promociona. */
export function defaultObjective(type) {
  if (type === 'PRODUCT') return 'SELL_PRODUCT'
  if (type === 'COUPON') return 'PROMOTION'
  return 'VISITS'
}

export function formatMoney(value) {
  return `S/ ${(Number(value) || 0).toFixed(2)}`
}

export function percent(rate) {
  const value = (Number(rate) || 0) * 100
  return `${value >= 10 || value === 0 ? Math.round(value) : value.toFixed(1)}%`
}

export function discountLabel(coupon) {
  if (!coupon) return ''
  return coupon.discountType === 'PERCENTAGE'
    ? `${Number(coupon.discountValue)}%`
    : formatMoney(coupon.discountValue)
}

/**
 * Texto sugerido para el asistente. Todo es editable: Fluxy propone, el comercio decide.
 * target: { name, price } del producto o { name } de la categoría.
 */
export function suggestContent({ type, objective, target, coupon, storeName }) {
  const store = storeName || 'nuestra tienda'
  const code = coupon?.code
  const discount = discountLabel(coupon)
  const withCoupon = code ? ` Con el cupón ${code} tenés ${discount} de descuento.` : ''

  if (objective === 'WIN_BACK') {
    return {
      title: '¡Te extrañamos!',
      message: `Hace tiempo que no nos visitás. Mirá lo nuevo en ${store}.${withCoupon}`,
      callToAction: 'Volvé a pedir',
    }
  }
  if (type === 'PRODUCT' && target) {
    const price = target.price != null ? ` a ${formatMoney(target.price)}` : ''
    if (objective === 'PROMOTION') {
      return {
        title: `Promo: ${target.name}`,
        message: `${target.name}${price}, solo por tiempo limitado.${withCoupon}`,
        callToAction: 'Aprovechá acá',
      }
    }
    return {
      title: `${target.name} en ${store}`,
      message: `Probá nuestro ${target.name}${price}. Pedilo online en un minuto y coordinamos la entrega.${withCoupon}`,
      callToAction: 'Pedilo acá',
    }
  }
  if (type === 'CATEGORY' && target) {
    return {
      title: `Nueva selección: ${target.name}`,
      message: `Conocé todo lo que tenemos en ${target.name}. Pedí online y coordinamos la entrega.${withCoupon}`,
      callToAction: 'Ver la colección',
    }
  }
  if (type === 'COUPON' && code) {
    const min = coupon.minOrderAmount ? ` (compra mínima ${formatMoney(coupon.minOrderAmount)})` : ''
    return {
      title: `${discount} de descuento con ${code}`,
      message: `Usá el cupón ${code} en tu próximo pedido en ${store}${min}.`,
      callToAction: 'Aprovechá acá',
    }
  }
  return {
    title: `Conocé ${store}`,
    message: `Ya podés pedir online: elegí tus productos y coordinamos la entrega.${withCoupon}`,
    callToAction: 'Mirá la tienda',
  }
}

/** Mensaje listo para compartir: el mismo formato que arma el backend. */
export function composeMessage(campaign, url) {
  const lines = []
  if (campaign?.title?.trim()) lines.push(campaign.title.trim())
  if (campaign?.message?.trim()) lines.push(campaign.message.trim())
  const cta = campaign?.callToAction?.trim() || 'Pedí acá'
  lines.push(url ? `${cta}: ${url}` : cta)
  return lines.join('\n')
}

/**
 * El backend arma el enlace con su dominio; el panel conoce el de la tienda (puede ser otro).
 * Se conserva el query del backend (código, canal, destino) sobre la URL pública del panel.
 */
export function rebaseLink(link, storeUrl) {
  if (!link) return ''
  if (!storeUrl || !link.query) return link.url
  return `${storeUrl.replace(/[?#].*$/, '').replace(/\/$/, '')}${link.query}`
}

/** Número para wa.me: solo dígitos; un celular peruano de 9 dígitos lleva el 51. */
export function whatsappDigits(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.length === 9 && digits.startsWith('9')) return `51${digits}`
  return digits
}

export function whatsappShare(text, phone) {
  const number = phone ? whatsappDigits(phone) : ''
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}

/** Saludo personal para los mensajes uno a uno a un cliente del segmento. */
export function personalMessage(name, text) {
  const first = String(name || '').trim().split(/\s+/)[0]
  return first ? `Hola ${first}! ${text}` : text
}

/** Límite del plan en palabras. -1 = sin límite. */
export function limitLabel(live, limit) {
  if (limit == null || limit < 0) return `${live} en curso · sin límite`
  return `${live} de ${limit} en curso`
}

/** Qué se puede hacer con la campaña según su estado (lo decide el backend) y los permisos. */
export function campaignActions(campaign, can) {
  const actions = new Set(campaign?.actions || [])
  return {
    edit: actions.has('EDIT') && can('MARKETING_EDIT'),
    activate: actions.has('ACTIVATE') && can('MARKETING_PUBLISH'),
    pause: actions.has('PAUSE') && can('MARKETING_PUBLISH'),
    finish: actions.has('FINISH') && can('MARKETING_PUBLISH'),
    archive: actions.has('ARCHIVE') && can('MARKETING_PUBLISH'),
    remove: actions.has('DELETE') && can('MARKETING_EDIT'),
  }
}
