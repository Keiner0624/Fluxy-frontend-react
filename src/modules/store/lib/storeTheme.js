// src/modules/store/lib/storeTheme.js
// Color de acento de la tienda a partir del estilo que eligió el vendedor.
//
// La tienda es clara: un acento muy claro (el "Blanco" de Estilo) no se leería
// sobre blanco, así que se reemplaza por tinta; y el texto sobre el acento se
// elige por contraste.

const FALLBACK_ACCENT = '#e0312b'

export function parseStoreStyle(storeStyle) {
  try {
    const style = typeof storeStyle === 'string' ? JSON.parse(storeStyle) : storeStyle
    return style && typeof style === 'object' ? style : {}
  } catch {
    return {}
  }
}

function channels(hex) {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex || '')
  if (!match) return null
  const value = match[1].length === 3 ? match[1].split('').map((c) => c + c).join('') : match[1]
  return [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16))
}

function luminance([r, g, b]) {
  const linear = [r, g, b].map((channel) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722
}

function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

function toHex(rgb) {
  return `#${rgb.map((c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, '0')).join('')}`
}

/** Oscurece el color hasta que se lea como texto sobre blanco (contraste 4.5). */
function readableOnWhite(rgb) {
  let current = rgb
  for (let step = 0; step < 12 && contrast(current, [255, 255, 255]) < 4.5; step += 1) {
    current = current.map((c) => c * 0.86)
  }
  return current
}

export function storeThemeVars(storeStyle) {
  const style = parseStoreStyle(storeStyle)
  let rgb = channels(style.primary) || channels(FALLBACK_ACCENT)
  // Un acento casi blanco desaparece sobre la tienda clara.
  if (luminance(rgb) > 0.82) rgb = [17, 24, 39]

  const onAccent = contrast(rgb, [255, 255, 255]) >= 3 ? '#ffffff' : '#111827'
  return {
    '--sf-accent': toHex(rgb),
    '--sf-accent-ink': toHex(readableOnWhite(rgb)),
    '--sf-on-accent': onAccent,
  }
}

/** Imagen de portada que el vendedor subió en Estilo, si hay. */
export function storeBanner(storeStyle) {
  const image = parseStoreStyle(storeStyle).bgImage
  return typeof image === 'string' && /^https:\/\//.test(image) ? image : ''
}
