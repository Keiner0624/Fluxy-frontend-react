// src/modules/marketing/lib/creative.js
// Pieza para redes (post cuadrado o historia) armada con la foto, el texto y el QR de la campaña.
import { drawCover, loadImage, paintQr, roundRect } from './qr'

export const FORMATS = {
  square: { label: 'Post 1:1', width: 1080, height: 1080 },
  story: { label: 'Historia 9:16', width: 1080, height: 1920 },
}

const FONT = '"DM Sans", "Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif'

function wrap(ctx, text, maxWidth, maxLines) {
  const words = String(text || '').split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next
    } else {
      lines.push(line)
      line = word
      if (lines.length === maxLines) break
    }
  }
  if (line && lines.length < maxLines) lines.push(line)
  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    let last = lines[maxLines - 1]
    while (last && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1)
    lines[maxLines - 1] = `${last.replace(/[\s.,;:!?]+$/, '')}…`
  }
  return lines
}

function shade(hex, amount) {
  const value = String(hex || '').replace('#', '')
  const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value.padEnd(6, '0').slice(0, 6)
  const num = parseInt(full, 16)
  if (Number.isNaN(num)) return hex
  const channel = (shift) => Math.max(0, Math.min(255, ((num >> shift) & 255) + amount))
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`
}

/**
 * Devuelve un canvas. imageUrl: foto (si no se puede cargar, la pieza sale sin foto);
 * qrText: el enlace de la campaña, para que la pieza impresa o en pantalla también se mida.
 */
export async function renderCreative({ format = 'square', imageUrl, title, subtitle, cta, storeName, color = '#1769e0', qrText, logoUrl }) {
  const { width, height } = FORMATS[format] || FORMATS.square
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const [image, logo] = await Promise.all([loadImage(imageUrl), loadImage(logoUrl)])
  const story = format === 'story'
  const pad = 64

  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, shade(color, 18))
  gradient.addColorStop(1, shade(color, -46))
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // Foto
  const photoH = image ? (story ? 1000 : 470) : 0
  const photoY = story ? 150 : pad
  if (image) {
    ctx.save()
    roundRect(ctx, pad, photoY, width - pad * 2, photoH, 44)
    ctx.clip()
    drawCover(ctx, image, pad, photoY, width - pad * 2, photoH)
    ctx.restore()
  }

  // Marca arriba en historias, abajo en posts.
  ctx.fillStyle = 'rgba(255,255,255,.92)'
  ctx.font = `700 ${story ? 42 : 34}px ${FONT}`
  ctx.textBaseline = 'alphabetic'
  if (story) ctx.fillText(storeName || '', pad, 100)

  // Texto. En el post el QR ocupa la esquina: el texto no pasa por encima.
  const qrSize = story ? 300 : 210
  const textWidth = width - pad * 2 - (!story && qrText ? qrSize + 58 : 0)
  let y = image ? photoY + photoH + (story ? 110 : 84) : (story ? 480 : 220)
  ctx.fillStyle = '#ffffff'
  ctx.font = `800 ${story ? 78 : 64}px ${FONT}`
  const titleLines = wrap(ctx, title, textWidth, image ? 2 : 3)
  titleLines.forEach((line) => { ctx.fillText(line, pad, y); y += story ? 90 : 76 })
  if (subtitle) {
    ctx.fillStyle = 'rgba(255,255,255,.86)'
    ctx.font = `500 ${story ? 44 : 36}px ${FONT}`
    const subLines = wrap(ctx, subtitle, textWidth, story ? 3 : image ? 1 : 3)
    y += 8
    subLines.forEach((line) => { ctx.fillText(line, pad, y); y += story ? 58 : 48 })
  }

  // QR y llamada a la acción abajo.
  const qrX = width - pad - qrSize
  const qrY = height - pad - qrSize
  if (qrText) {
    ctx.save()
    roundRect(ctx, qrX - 14, qrY - 14, qrSize + 28, qrSize + 28, 26)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.restore()
    paintQr(ctx, qrText, { x: qrX, y: qrY, size: qrSize, color: '#111111', logo })
  }

  const label = cta || 'Pedí online'
  ctx.font = `700 ${story ? 46 : 38}px ${FONT}`
  const pillW = Math.min(ctx.measureText(label).width + 72, qrText ? qrX - pad - 40 : width - pad * 2)
  const pillH = story ? 104 : 86
  const pillY = height - pad - (qrText ? (qrSize + pillH) / 2 : pillH)
  ctx.fillStyle = '#ffffff'
  roundRect(ctx, pad, pillY, pillW, pillH, pillH / 2)
  ctx.fill()
  ctx.fillStyle = shade(color, -30)
  ctx.textBaseline = 'middle'
  ctx.fillText(wrap(ctx, label, pillW - 60, 1)[0] || '', pad + 36, pillY + pillH / 2 + 2)
  ctx.textBaseline = 'alphabetic'

  if (!story && storeName) {
    ctx.fillStyle = 'rgba(255,255,255,.9)'
    ctx.font = `700 34px ${FONT}`
    ctx.fillText(wrap(ctx, storeName, qrText ? qrX - pad - 40 : width - pad * 2, 1)[0] || '', pad, pillY - 34)
  }
  return canvas
}
