// src/modules/store/lib/storeTheme.js
// Colores de la tienda a partir del estilo que eligió el vendedor.
//
// El vendedor elige un acento y la apariencia (clara, oscura o según el dispositivo
// del cliente). El acento se ajusta al fondo: uno casi blanco no se lee sobre la
// tienda clara y uno casi negro desaparece sobre la oscura, así que se reemplazan;
// el texto de acento se aclara u oscurece hasta leerse, y el texto sobre el acento
// se elige por contraste.

const FALLBACK_ACCENT = '#e0312b'

export const STORE_MODES = ['light', 'dark', 'auto']

// Mismos valores que --sf-surface y --sf-bg en StorePage.css.
const SURFACE = { light: [255, 255, 255], dark: [28, 28, 33] }
const BACKGROUND = { light: [247, 245, 242], dark: [16, 16, 20] }
const INK_ON_LIGHT = [17, 24, 39]
const INK_ON_DARK = [244, 244, 245]

export function parseStoreStyle(storeStyle) {
  try {
    const style = typeof storeStyle === 'string' ? JSON.parse(storeStyle) : storeStyle
    return style && typeof style === 'object' ? style : {}
  } catch {
    return {}
  }
}

/** Apariencia que eligió el vendedor: light, dark o auto (según el dispositivo del cliente). */
export function storeMode(storeStyle) {
  const mode = parseStoreStyle(storeStyle).mode
  return STORE_MODES.includes(mode) ? mode : 'light'
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

export function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

function toHex(rgb) {
  return `#${rgb.map((c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, '0')).join('')}`
}

/** Oscurece (fondo claro) o aclara (fondo oscuro) el color hasta leerse como texto (contraste 4.5). */
function readableOn(rgb, surface) {
  const lighten = luminance(surface) < 0.2
  let current = rgb
  for (let step = 0; step < 16 && contrast(current, surface) < 4.5; step += 1) {
    current = lighten ? current.map((c) => c + (255 - c) * 0.16) : current.map((c) => c * 0.86)
  }
  return current
}

/**
 * Variables CSS del acento para el esquema en pantalla (light o dark).
 * Con mode auto, quien llama resuelve el esquema según el dispositivo.
 */
export function storeThemeVars(storeStyle, scheme = 'light') {
  const dark = scheme === 'dark'
  const style = parseStoreStyle(storeStyle)
  let rgb = channels(style.primary) || channels(FALLBACK_ACCENT)

  // Un acento que casi no se distingue del fondo se reemplaza por la tinta del esquema.
  if (!dark && luminance(rgb) > 0.82) rgb = INK_ON_LIGHT
  if (dark && contrast(rgb, BACKGROUND.dark) < 2) rgb = INK_ON_DARK

  const onAccent = contrast(rgb, [255, 255, 255]) >= 3 ? '#ffffff' : '#111827'
  return {
    '--sf-accent': toHex(rgb),
    '--sf-accent-ink': toHex(readableOn(rgb, dark ? SURFACE.dark : SURFACE.light)),
    '--sf-on-accent': onAccent,
  }
}

/** Imagen de portada que el vendedor subió en Estilo, si hay. */
export function storeBanner(storeStyle) {
  const image = parseStoreStyle(storeStyle).bgImage
  return typeof image === 'string' && /^https:\/\//.test(image) ? image : ''
}
