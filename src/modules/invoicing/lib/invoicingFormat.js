// src/modules/invoicing/lib/invoicingFormat.js
// Etiquetas y reglas de comprobantes para el panel y la tienda. La validación que vale es la del
// servidor; acá se repite para avisar antes de enviar.

export const DOC_TYPES = {
  BOLETA: { label: 'Boleta', long: 'Boleta de venta electrónica', short: 'Boleta' },
  FACTURA: { label: 'Factura', long: 'Factura electrónica', short: 'Factura' },
  NOTA_CREDITO: { label: 'Nota de crédito', long: 'Nota de crédito electrónica', short: 'N. crédito' },
}

export const DOC_STATUS = {
  DRAFT: { label: 'Borrador', badge: '' },
  PENDING: { label: 'En cola', badge: 'fx-badge--brand' },
  PROCESSING: { label: 'Procesando', badge: 'fx-badge--brand' },
  ACCEPTED: { label: 'Aceptado', badge: 'fx-badge--ok' },
  REJECTED: { label: 'Rechazado', badge: 'fx-badge--danger' },
  ERROR: { label: 'Con error', badge: 'fx-badge--danger' },
  CANCEL_PENDING: { label: 'Anulándose', badge: 'fx-badge--warn' },
  CANCELLED: { label: 'Anulado', badge: '' },
}

export const EMAIL_STATUS = {
  NOT_REQUESTED: 'Sin correo',
  PENDING: 'Enviando',
  SENT: 'Enviado',
  DELIVERED: 'Entregado',
  BOUNCED: 'Rebotó',
  FAILED: 'No se pudo enviar',
}

export const CONFIG_STATUS = {
  DRAFT: { label: 'Sin configurar', badge: '' },
  REQUIRES_ACTION: { label: 'Requiere acción', badge: 'fx-badge--warn' },
  ACTIVE: { label: 'Activa', badge: 'fx-badge--ok' },
  PAUSED: { label: 'Pausada', badge: 'fx-badge--warn' },
  SUSPENDED: { label: 'Suspendida', badge: 'fx-badge--danger' },
}

export const VERIFICATION = {
  PENDING_VERIFICATION: { label: 'Sin verificar', badge: '' },
  VERIFIED: { label: 'Verificado', badge: 'fx-badge--ok' },
  REQUIRES_ACTION: { label: 'Requiere acción', badge: 'fx-badge--warn' },
  SUSPENDED: { label: 'Suspendido', badge: 'fx-badge--danger' },
  ERROR: { label: 'No se pudo verificar', badge: 'fx-badge--danger' },
}

export const ID_TYPES = {
  DNI: 'DNI',
  RUC: 'RUC',
  CARNET_EXTRANJERIA: 'Carnet de extranjería',
  PASAPORTE: 'Pasaporte',
  NINGUNO: 'Sin documento',
}

export const CREDIT_REASONS = {
  ANULACION: 'Anulación de la operación',
  DEVOLUCION_TOTAL: 'Devolución total',
  ERROR_RUC: 'Error en el RUC (solo facturas)',
}

export const TAX_REGIMES = {
  GENERAL: 'Régimen General',
  MYPE: 'Régimen MYPE Tributario',
  ESPECIAL: 'Régimen Especial (RER)',
  NRUS: 'Nuevo RUS (solo boletas)',
  UNKNOWN: 'No sé / prefiero no decir',
}

export const EVENT_LABELS = {
  CREATED: 'Registrado',
  SENT_TO_PROVIDER: 'Enviado al proveedor',
  ACCEPTED: 'Aceptado',
  REJECTED: 'Rechazado',
  ERROR: 'Error',
  RETRY_SCHEDULED: 'Reintento programado',
  STATUS_CHECKED: 'Consulta de estado',
  WEBHOOK_RECEIVED: 'Aviso del proveedor',
  EMAIL_SENT: 'Correo enviado',
  EMAIL_FAILED: 'Correo no enviado',
  EMAIL_RESENT: 'Reenvío pedido',
  CREDIT_NOTE_CREATED: 'Nota de crédito',
  CANCEL_PENDING: 'Anulación en curso',
  CANCELLED: 'Anulado',
  CANCEL_REVERTED: 'Anulación rechazada',
  PUBLIC_LINK_REVOKED: 'Enlace público renovado',
  MANUAL_RETRY: 'Reintento manual',
}

/** Monto desde el que una boleta necesita el documento del cliente. */
export const BOLETA_ID_THRESHOLD = 700

const RUC_WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]

export function isValidRuc(value) {
  const ruc = String(value || '').replace(/\D/g, '')
  if (!/^\d{11}$/.test(ruc) || !['10', '15', '16', '17', '20'].includes(ruc.slice(0, 2))) return false
  const sum = RUC_WEIGHTS.reduce((acc, w, i) => acc + w * Number(ruc[i]), 0)
  let check = 11 - (sum % 11)
  if (check === 10) check = 0
  if (check === 11) check = 1
  return check === Number(ruc[10])
}

export function isValidDni(value) {
  return /^\d{8}$/.test(String(value || '').replace(/\D/g, ''))
}

/**
 * Errores del receptor para mostrar en el formulario, con las mismas reglas del servidor.
 * Devuelve { campo: mensaje }.
 */
export function receiverErrors(type, receiver, total) {
  const errors = {}
  const docType = receiver.documentType || (type === 'FACTURA' ? 'RUC' : 'DNI')
  const number = String(receiver.documentNumber || '').trim()
  const email = String(receiver.email || '').trim()
  if (type === 'FACTURA') {
    if (!isValidRuc(number)) errors.documentNumber = 'Ingresá un RUC válido de 11 dígitos.'
    if (!String(receiver.name || '').trim()) errors.name = 'Ingresá la razón social.'
  } else {
    if (docType === 'DNI' && number && !isValidDni(number)) errors.documentNumber = 'El DNI tiene 8 dígitos.'
    if (docType === 'RUC' && number && !isValidRuc(number)) errors.documentNumber = 'El RUC no es válido.'
    if (Number(total) >= BOLETA_ID_THRESHOLD && (!number || docType === 'NINGUNO')) {
      errors.documentNumber = 'Para boletas de S/ 700 o más hace falta el documento.'
    }
  }
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = 'El correo no es válido.'
  return errors
}

export function formatAmount(value) {
  return `S/ ${(Number(value) || 0).toFixed(2)}`
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

/**
 * HTML del ticket (80 o 58 mm) para imprimir desde el navegador. qrSvg: el QR ya dibujado.
 * Con impresoras térmicas conviene "Sin márgenes" y escala 100% en el diálogo de impresión.
 */
export function ticketHtml(doc, { width = 80, qrSvg = '' } = {}) {
  const mm = width === 58 ? 58 : 80
  const font = mm === 58 ? 10 : 11.5
  const items = (doc.items || []).map((i) => `
      <tr><td colspan="2">${escapeHtml(i.description)}</td></tr>
      <tr><td class="q">${Number(i.quantity)} × ${Number(i.unitPrice).toFixed(2)}</td><td class="r">${Number(i.total).toFixed(2)}</td></tr>`).join('')
  const issuer = doc.issuerTradeName || doc.issuerName
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapeHtml(doc.fullNumber)}</title>
<style>
  @page { size: ${mm}mm auto; margin: 3mm; }
  * { box-sizing: border-box; }
  body { width: ${mm - 6}mm; margin: 0 auto; font: ${font}px/1.35 "Courier New", monospace; color: #000; }
  h1 { font-size: ${font + 2}px; margin: 0; text-align: center; }
  .c { text-align: center; } .r { text-align: right; white-space: nowrap; } .q { padding-left: 2mm; }
  hr { border: 0; border-top: 1px dashed #000; margin: 2mm 0; }
  table { width: 100%; border-collapse: collapse; } td { vertical-align: top; padding: 0; }
  .t td { padding-top: 0.5mm; } .big td { font-weight: bold; font-size: ${font + 1}px; }
  .qr { display: flex; justify-content: center; margin: 2mm 0; } .qr svg { width: ${mm === 58 ? 28 : 34}mm; height: auto; }
  .test { border: 1px solid #000; padding: 1mm; text-align: center; font-weight: bold; margin: 2mm 0; }
</style></head><body>
  <h1>${escapeHtml(issuer)}</h1>
  ${issuer !== doc.issuerName ? `<div class="c">${escapeHtml(doc.issuerName)}</div>` : ''}
  <div class="c">RUC ${escapeHtml(doc.issuerRuc)}</div>
  ${doc.issuerAddress ? `<div class="c">${escapeHtml(doc.issuerAddress)}</div>` : ''}
  <hr>
  <div class="c"><b>${escapeHtml((DOC_TYPES[doc.type]?.long || doc.typeLabel || '').toUpperCase())}</b></div>
  <div class="c"><b>${escapeHtml(doc.fullNumber)}</b></div>
  ${doc.test ? '<div class="test">PRUEBA — SIN VALOR TRIBUTARIO</div>' : ''}
  <hr>
  <div>Fecha: ${escapeHtml(doc.issueDate)}</div>
  <div>Cliente: ${escapeHtml(doc.customerName)}</div>
  ${doc.customerDocumentNumber ? `<div>${escapeHtml(ID_TYPES[doc.customerDocumentType] || '')}: ${escapeHtml(doc.customerDocumentNumber)}</div>` : ''}
  ${doc.related ? `<div>Modifica: ${escapeHtml(doc.related.fullNumber)}</div><div>Motivo: ${escapeHtml(doc.creditReasonLabel || '')}</div>` : ''}
  <hr>
  <table>${items}</table>
  <hr>
  <table class="t">
    ${Number(doc.discount) > 0 ? `<tr><td>Descuentos</td><td class="r">${Number(doc.discount).toFixed(2)}</td></tr>` : ''}
    <tr><td>Op. ${doc.taxAffectation === 'GRAVADO' ? 'gravada' : doc.taxAffectation === 'EXONERADO' ? 'exonerada' : 'inafecta'}</td><td class="r">${Number(doc.subtotal).toFixed(2)}</td></tr>
    <tr><td>IGV${doc.taxAffectation === 'GRAVADO' ? ' 18%' : ''}</td><td class="r">${Number(doc.tax).toFixed(2)}</td></tr>
    <tr class="big"><td>TOTAL S/</td><td class="r">${Number(doc.total).toFixed(2)}</td></tr>
  </table>
  <div style="margin-top:1mm">SON: ${escapeHtml(doc.amountInWords)}</div>
  ${qrSvg ? `<div class="qr">${qrSvg}</div>` : '<hr>'}
  ${doc.hash ? `<div class="c" style="word-break:break-all">Resumen: ${escapeHtml(doc.hash)}</div>` : ''}
  <div class="c">Representación impresa de la ${escapeHtml((DOC_TYPES[doc.type]?.long || '').toLowerCase())}.</div>
  ${doc.publicUrl ? `<div class="c" style="word-break:break-all">Consultala en ${escapeHtml(doc.publicUrl)}</div>` : ''}
  <script>window.onload = () => { window.focus(); window.print(); }</script>
</body></html>`
}
