// src/app/format.js
// Formatos y etiquetas compartidas por el panel.

const moneyFormat = new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const intFormat = new Intl.NumberFormat('es-PE')

export function money(value) {
  const number = Number(value)
  return `S/ ${moneyFormat.format(Number.isFinite(number) ? number : 0)}`
}

export function integer(value) {
  const number = Number(value)
  return intFormat.format(Number.isFinite(number) ? number : 0)
}

/** "1 cobro", "3 cobros". */
export function count(value, singular, pluralForm = `${singular}s`) {
  const number = Number(value) || 0
  return `${integer(number)} ${number === 1 ? singular : pluralForm}`
}

export function dateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function date(value) {
  if (!value) return '—'
  // Un día suelto (YYYY-MM-DD) se lee en hora local para que no se corra un día.
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value)
  return parsed.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Variación porcentual contra un valor anterior; null si no hay con qué comparar. */
export function delta(current, previous) {
  const prev = Number(previous) || 0
  const curr = Number(current) || 0
  if (prev === 0) return curr === 0 ? 0 : null
  return Math.round(((curr - prev) / prev) * 1000) / 10
}

/** YYYY-MM-DD en hora local. */
export function isoDay(d) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function daysAgo(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return isoDay(d)
}

/** Rango de fechas a partir de un atajo: 7, 30, 90, 365 días o month. */
export function rangeFromPreset(key) {
  if (key === 'month') {
    const now = new Date()
    return { preset: key, from: isoDay(new Date(now.getFullYear(), now.getMonth(), 1)), to: isoDay(now) }
  }
  const days = Number(key) || 30
  return { preset: String(days), from: daysAgo(days - 1), to: isoDay(new Date()) }
}

// ─── Pedidos ─────────────────────────────────────────────────────────────────

export const ORDER_STATUS = {
  PENDING:   { label: 'Pendiente',      badge: 'fx-badge--warn',   icon: 'clock' },
  CONFIRMED: { label: 'Confirmado',     badge: 'fx-badge--brand',  icon: 'check' },
  PREPARING: { label: 'En preparación', badge: 'fx-badge--brand',  icon: 'package' },
  READY:     { label: 'Listo',          badge: 'fx-badge--brand',  icon: 'checkCircle' },
  SHIPPED:   { label: 'Enviado',        badge: 'fx-badge--brand',  icon: 'truck' },
  DELIVERED: { label: 'Entregado',      badge: 'fx-badge--ok',     icon: 'checkCircle' },
  CANCELLED: { label: 'Cancelado',      badge: 'fx-badge--danger', icon: 'close' },
}

export const ORDER_FLOW = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SHIPPED', 'DELIVERED']

/** Acción que lleva a cada estado, para los botones del pedido. */
export const ORDER_ACTION = {
  CONFIRMED: 'Confirmar',
  PREPARING: 'Preparar',
  READY: 'Marcar listo',
  SHIPPED: 'Marcar enviado',
  DELIVERED: 'Marcar entregado',
  CANCELLED: 'Cancelar pedido',
}

// ─── Cobros ──────────────────────────────────────────────────────────────────

export const PAYMENT_STATUS = {
  PENDING:  { label: 'Pendiente',   badge: 'fx-badge--warn' },
  APPROVED: { label: 'Aprobado',    badge: 'fx-badge--ok' },
  REJECTED: { label: 'Rechazado',   badge: 'fx-badge--danger' },
  REFUNDED: { label: 'Reembolsado', badge: '' },
}

/** Estado de cobro de un pedido, calculado por el backend. */
export const ORDER_PAYMENT_STATUS = {
  PAID:     { label: 'Cobrado',        badge: 'fx-badge--ok' },
  PARTIAL:  { label: 'Cobro parcial',  badge: 'fx-badge--warn' },
  PENDING:  { label: 'Por cobrar',     badge: 'fx-badge--warn' },
  UNPAID:   { label: 'Sin cobro',      badge: '' },
  REFUNDED: { label: 'Reembolsado',    badge: '' },
}

export const PAYMENT_METHODS = {
  efectivo: 'Efectivo',
  yape: 'Yape',
  plin: 'Plin',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  mercadopago: 'Mercado Pago',
  nequi: 'Nequi',
  daviplata: 'Daviplata',
  pse: 'PSE',
  oxxo: 'OXXO',
  codi: 'CoDi',
  modo: 'MODO',
  webpay: 'Webpay',
  pix: 'PIX',
  boleto: 'Boleto',
}

export function paymentMethodLabel(key) {
  if (!key) return 'Sin indicar'
  return PAYMENT_METHODS[key] || key
}

// ─── Equipo ──────────────────────────────────────────────────────────────────

export const ROLES = {
  OWNER:  { label: 'Dueño',          text: 'Acceso total, incluida la facturación.' },
  ADMIN:     { label: 'Administrador', text: 'Todo el negocio salvo el plan y la facturación.' },
  MANAGER:   { label: 'Encargado',     text: 'La operación diaria: catálogo, pedidos, cobros, stock y reportes. Sin equipo ni configuración.' },
  SELLER:    { label: 'Vendedor',      text: 'Pedidos, clientes y cobros. Ve el catálogo y el stock.' },
  WAREHOUSE: { label: 'Almacén',       text: 'Stock y preparación de pedidos.' },
  VIEWER:    { label: 'Solo lectura',  text: 'Consulta la información sin modificar nada.' },
}

export const PERMISSION_GROUPS = [
  { module: 'Productos',     items: [['PRODUCT_VIEW', 'Ver'], ['PRODUCT_CREATE', 'Crear'], ['PRODUCT_UPDATE', 'Editar'], ['PRODUCT_DELETE', 'Eliminar']] },
  { module: 'Pedidos',       items: [['ORDER_VIEW', 'Ver'], ['ORDER_UPDATE', 'Cambiar estado'], ['ORDER_CANCEL', 'Cancelar']] },
  { module: 'Clientes',      items: [['CUSTOMER_VIEW', 'Ver'], ['CUSTOMER_UPDATE', 'Editar']] },
  { module: 'Pagos',         items: [['PAYMENT_VIEW', 'Ver'], ['PAYMENT_UPDATE', 'Registrar y aprobar'], ['PAYMENT_REFUND', 'Reembolsar']] },
  { module: 'Inventario',    items: [['INVENTORY_VIEW', 'Ver'], ['INVENTORY_ADJUST', 'Ajustar stock']] },
  { module: 'Cupones',       items: [['COUPON_VIEW', 'Ver'], ['COUPON_MANAGE', 'Gestionar']] },
  { module: 'Reportes',      items: [['REPORT_VIEW', 'Ver'], ['REPORT_EXPORT', 'Exportar']] },
  { module: 'Equipo',        items: [['TEAM_VIEW', 'Ver'], ['TEAM_INVITE', 'Invitar'], ['TEAM_MANAGE', 'Gestionar']] },
  { module: 'Integraciones', items: [['INTEGRATION_VIEW', 'Ver'], ['INTEGRATION_MANAGE', 'Configurar']] },
  { module: 'Tienda',        items: [['SETTINGS_MANAGE', 'Configuración y estilo']] },
  { module: 'Actividad',     items: [['AUDIT_VIEW', 'Ver el registro']] },
]
