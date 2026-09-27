// src/modules/invoicing/components/printTicket.js
// Imprime el ticket (80 o 58 mm) en una ventana aparte con el QR del comprobante.
import qrcode from 'qrcode-generator'
import { ticketHtml } from '../lib/invoicingFormat'

export function printTicket(doc, width = 80) {
  let qrSvg = ''
  const text = doc.qrText || doc.publicUrl
  if (text) {
    const qr = qrcode(0, 'M')
    qr.addData(text, 'Byte')
    qr.make()
    qrSvg = qr.createSvgTag({ cellSize: 3, margin: 0, scalable: true })
  }
  const html = ticketHtml(doc, { width, qrSvg })
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
  const win = window.open(url, '_blank', 'width=420,height=640')
  if (!win) throw new Error('El navegador bloqueó la ventana de impresión. Permití ventanas emergentes para Fluxy.')
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
