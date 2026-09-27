// src/modules/marketing/lib/qr.js
// QR de campaña dibujado en canvas: básico (negro sobre blanco) o con el color y el logo del negocio.
import qrcode from 'qrcode-generator'

/** Módulos del QR (true = oscuro). Con logo se usa corrección alta para que siga leyéndose. */
export function qrMatrix(text, level = 'M') {
  const qr = qrcode(0, level)
  qr.addData(text, 'Byte')
  qr.make()
  const size = qr.getModuleCount()
  return Array.from({ length: size }, (_, row) => Array.from({ length: size }, (_, col) => qr.isDark(row, col)))
}

const QUIET = 4

export function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) { resolve(null); return }
    const image = new Image()
    // Cloudinary responde con CORS abierto: sin esto el canvas no se podría descargar.
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = src
  })
}

/**
 * Dibuja el QR en ctx dentro del cuadrado (x, y, size). Devuelve el tamaño de módulo usado.
 * logo: imagen ya cargada; se centra sobre un recuadro claro.
 */
export function paintQr(ctx, text, { x = 0, y = 0, size, color = '#111111', background = '#ffffff', logo = null } = {}) {
  const matrix = qrMatrix(text, logo ? 'H' : 'M')
  const count = matrix.length + QUIET * 2
  const cell = size / count
  ctx.fillStyle = background
  ctx.fillRect(x, y, size, size)
  ctx.fillStyle = color
  matrix.forEach((row, r) => row.forEach((dark, c) => {
    if (!dark) return
    // Un pelo más grande que la celda: sin esto quedan líneas finas entre módulos.
    ctx.fillRect(x + (c + QUIET) * cell, y + (r + QUIET) * cell, Math.ceil(cell + 0.5), Math.ceil(cell + 0.5))
  }))
  if (logo) {
    const box = size * 0.22
    const bx = x + (size - box) / 2
    const by = y + (size - box) / 2
    ctx.fillStyle = background
    roundRect(ctx, bx - cell, by - cell, box + cell * 2, box + cell * 2, cell * 2)
    ctx.fill()
    ctx.save()
    roundRect(ctx, bx, by, box, box, cell * 1.5)
    ctx.clip()
    drawCover(ctx, logo, bx, by, box, box)
    ctx.restore()
  }
  return cell
}

/** Canvas con el QR listo para mostrar o descargar como PNG. */
export async function renderQr(text, { size = 1024, color, background, logoUrl } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const logo = logoUrl ? await loadImage(logoUrl) : null
  paintQr(canvas.getContext('2d'), text, { size, color, background, logo })
  return canvas
}

export function canvasBlob(canvas) {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo generar la imagen.'))), 'image/png')
    } catch {
      reject(new Error('La imagen del producto no permite descargarse. Probá sin foto.'))
    }
  })
}

export function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

/** Como object-fit: cover. */
export function drawCover(ctx, image, x, y, w, h) {
  const scale = Math.max(w / image.width, h / image.height)
  const sw = w / scale
  const sh = h / scale
  ctx.drawImage(image, (image.width - sw) / 2, (image.height - sh) / 2, sw, sh, x, y, w, h)
}
