// src/modules/dashboard/pages/OrdersPage.jsx
import { useState, useEffect } from 'react'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import { API_URL } from '@/app/config'
import { OrderRowSkeleton, StatCardSkeleton } from '@/components/Skeleton'
import Icon from '@/components/Icon'

function getToken() {
  return localStorage.getItem('token') || ''
}

const STATUS_CONFIG = {
  PENDING:   { label: 'Pendiente',  badge: 'fx-badge--warn',   icon: 'clock' },
  COMPLETED: { label: 'Completado', badge: 'fx-badge--ok',     icon: 'checkCircle' },
  CANCELLED: { label: 'Cancelado',  badge: 'fx-badge--danger', icon: 'close' },
}

const FILTERS = [
  { key: 'ALL',       label: 'Todos' },
  { key: 'PENDING',   label: 'Pendientes' },
  { key: 'COMPLETED', label: 'Completados' },
  { key: 'CANCELLED', label: 'Cancelados' },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => { loadOrders() }, [])

  const loadOrders = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error('Error al cargar pedidos')
      const data = await res.json()
      setOrders(data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async (orderId) => {
    setActionLoading(orderId + '_complete')
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/complete`, {
        method: 'PUT', headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error()
      await loadOrders()
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, status: 'COMPLETED' }))
    } catch { setError('Error al completar el pedido') }
    finally { setActionLoading(null) }
  }

  const handleCancel = async (orderId) => {
    setActionLoading(orderId + '_cancel')
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: 'PUT', headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error()
      await loadOrders()
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, status: 'CANCELLED' }))
    } catch { setError('Error al cancelar el pedido') }
    finally { setActionLoading(null) }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  const exportPDF = () => {
    const company = JSON.parse(localStorage.getItem('company') || '{}')
    const now = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })
    const totalVentas = orders.filter(o => o.status === 'COMPLETED').reduce((s, o) => s + (o.total || 0), 0)

    const statusLabel = { PENDING: 'Pendiente', COMPLETED: 'Completado', CANCELLED: 'Cancelado' }
    const statusColor = { PENDING: '#d97706', COMPLETED: '#059669', CANCELLED: '#dc2626' }

    const rows = (filter === 'ALL' ? orders : orders.filter(o => o.status === filter))
      .map((o, i) => {
        const total = o.items?.reduce((s, item) => s + item.unitPrice * item.quantity, 0) || o.total || 0
        const date  = o.createdAt ? new Date(o.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
        const color = statusColor[o.status] || '#374151'
        const label = statusLabel[o.status] || o.status
        return `
          <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f9fafb'}">
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#6366f1">#${o.id}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#111827;font-weight:500">${o.customerName || 'Sin nombre'}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:12px">${date}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#374151">${o.items?.length || 0} ítem${(o.items?.length || 0) !== 1 ? 's' : ''}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-weight:700;color:#111827;font-family:Georgia,serif">S/ ${total.toFixed(2)}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb">
              <span style="background:${color}18;color:${color};border:1px solid ${color}40;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:600">${label}</span>
            </td>
            ${o.customerPhone ? `<td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:12px">${o.customerPhone}</td>` : '<td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#d1d5db">—</td>'}
          </tr>
        `
      }).join('')

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Reporte de Pedidos — ${company.name || 'Mi Tienda'}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#111827; background:#fff; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .no-print { display:none; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 40px;color:white">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div>
        <div style="font-size:28px;font-weight:900;letter-spacing:-0.5px;font-family:Georgia,serif">${company.name || 'Mi Tienda'}</div>
        <div style="font-size:13px;opacity:0.8;margin-top:4px">Reporte de pedidos · Generado el ${now}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:11px;opacity:0.7;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Powered by</div>
        <div style="font-size:18px;font-weight:900;letter-spacing:2px">FLUXY</div>
      </div>
    </div>
  </div>

  <!-- Stats -->
  <div style="padding:24px 40px;background:#f8fafc;border-bottom:1px solid #e5e7eb;display:flex;gap:24px;flex-wrap:wrap">
    ${[
      { label: 'Total pedidos',    value: stats.total,              color: '#4f46e5' },
      { label: 'Completados',      value: stats.completed,          color: '#059669' },
      { label: 'Pendientes',       value: stats.pending,            color: '#d97706' },
      { label: 'Cancelados',       value: stats.cancelled,          color: '#dc2626' },
      { label: 'Ingresos totales', value: 'S/ ' + totalVentas.toFixed(2), color: '#4f46e5' },
    ].map(s => `
      <div style="background:white;border:1px solid #e5e7eb;border-radius:10px;padding:14px 20px;min-width:130px">
        <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">${s.label}</div>
        <div style="font-size:22px;font-weight:800;color:${s.color};font-family:Georgia,serif">${s.value}</div>
      </div>
    `).join('')}
  </div>

  <!-- Tabla -->
  <div style="padding:32px 40px">
    <div style="font-size:16px;font-weight:700;color:#111827;margin-bottom:16px">
      Lista de pedidos ${filter !== 'ALL' ? '— ' + (statusLabel[filter] || filter) + 's' : ''}
    </div>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <thead>
        <tr style="background:#4f46e5">
          <th style="padding:12px 14px;text-align:left;font-size:11px;font-weight:700;color:white;text-transform:uppercase;letter-spacing:0.5px">#</th>
          <th style="padding:12px 14px;text-align:left;font-size:11px;font-weight:700;color:white;text-transform:uppercase;letter-spacing:0.5px">Cliente</th>
          <th style="padding:12px 14px;text-align:left;font-size:11px;font-weight:700;color:white;text-transform:uppercase;letter-spacing:0.5px">Fecha</th>
          <th style="padding:12px 14px;text-align:left;font-size:11px;font-weight:700;color:white;text-transform:uppercase;letter-spacing:0.5px">Ítems</th>
          <th style="padding:12px 14px;text-align:left;font-size:11px;font-weight:700;color:white;text-transform:uppercase;letter-spacing:0.5px">Total</th>
          <th style="padding:12px 14px;text-align:left;font-size:11px;font-weight:700;color:white;text-transform:uppercase;letter-spacing:0.5px">Estado</th>
          <th style="padding:12px 14px;text-align:left;font-size:11px;font-weight:700;color:white;text-transform:uppercase;letter-spacing:0.5px">Teléfono</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>

  <!-- Footer -->
  <div style="padding:20px 40px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;color:#9ca3af;font-size:12px">
    <span>${company.name || 'Mi Tienda'} · ${now}</span>
    <span>fluxy.com · Reporte generado automáticamente</span>
  </div>

  <script>window.onload = () => window.print()</script>
</body>
</html>`

    const win = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
  }

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)

  const orderTotal = (o) =>
    o.items?.reduce((s, item) => s + item.unitPrice * item.quantity, 0) || o.total || 0

  const stats = [
    { label: 'Pedidos totales', value: orders.length, icon: 'inbox' },
    { label: 'Pendientes',      value: orders.filter(o => o.status === 'PENDING').length, icon: 'clock' },
    { label: 'Completados',     value: orders.filter(o => o.status === 'COMPLETED').length, icon: 'checkCircle' },
    {
      label: 'Ventas confirmadas',
      value: `S/ ${orders.filter(o => o.status === 'COMPLETED').reduce((s, o) => s + orderTotal(o), 0).toFixed(2)}`,
      icon: 'money',
    },
  ]

  return (
    <DashboardLayout>
      <div className="fx-page-head">
        <div>
          <h1>Pedidos</h1>
          <p>{loading ? 'Cargando…' : `${orders.length} ${orders.length === 1 ? 'pedido' : 'pedidos'} en total`}</p>
        </div>
        <div className="fx-page-head__actions">
          <button className="fx-btn fx-btn--secondary" onClick={loadOrders} disabled={loading}>
            <Icon name="refresh" size={15} />
            Actualizar
          </button>
          <button className="fx-btn fx-btn--secondary" onClick={exportPDF} disabled={orders.length === 0}>
            <Icon name="download" size={15} />
            Exportar
          </button>
        </div>
      </div>

      <div className="fx-stats" style={{ marginBottom: 20 }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map((s) => (
            <div key={s.label} className="fx-stat">
              <span className="fx-stat__label"><Icon name={s.icon} size={14} />{s.label}</span>
              <p className="fx-stat__value">{s.value}</p>
            </div>
          ))}
      </div>

      {error && (
        <div className="fx-alert fx-alert--error" style={{ marginBottom: 16 }}>
          <Icon name="alert" size={16} /><span>{error}</span>
        </div>
      )}

      <div className="fx-tabs" style={{ marginBottom: 16 }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`fx-tab${filter === f.key ? ' fx-tab--on' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span className="fx-tab__count">
              {f.key === 'ALL' ? orders.length : orders.filter(o => o.status === f.key).length}
            </span>
          </button>
        ))}
      </div>

      <div className="fx-card">
        {loading ? (
          <table className="fx-table">
            <tbody>{Array.from({ length: 5 }).map((_, i) => <OrderRowSkeleton key={i} />)}</tbody>
          </table>
        ) : filtered.length === 0 ? (
          <div className="fx-empty">
            <div className="fx-empty__icon"><Icon name="inbox" size={20} /></div>
            <p className="fx-empty__title">
              {filter === 'ALL' ? 'Todavía no recibiste pedidos' : 'No hay pedidos con este estado'}
            </p>
            <p className="fx-empty__text">
              {filter === 'ALL'
                ? 'Cuando alguien compre en tu tienda, el pedido va a aparecer acá.'
                : 'Probá con otro filtro para ver el resto de tus pedidos.'}
            </p>
          </div>
        ) : (
          <div className="fx-table-wrap">
            <table className="fx-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th className="fx-table__num">Ítems</th>
                  <th className="fx-table__num">Total</th>
                  <th>Estado</th>
                  <th style={{ width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING
                  return (
                    <tr key={order.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedOrder(order)}>
                      <td className="fx-table__strong">#{order.id}</td>
                      <td>{order.customerName || 'Sin nombre'}</td>
                      <td style={{ fontSize: 13 }}>{formatDate(order.createdAt)}</td>
                      <td className="fx-table__num">{order.items?.length || 0}</td>
                      <td className="fx-table__num fx-table__strong">S/ {orderTotal(order).toFixed(2)}</td>
                      <td>
                        <span className={`fx-badge ${st.badge}`}>
                          <Icon name={st.icon} size={12} />
                          {st.label}
                        </span>
                      </td>
                      <td><Icon name="chevronRight" size={15} style={{ color: 'var(--fx-muted)' }} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (() => {
        const st = STATUS_CONFIG[selectedOrder.status] || STATUS_CONFIG.PENDING
        return (
          <div className="fx-modal" role="dialog" aria-modal="true" onClick={() => setSelectedOrder(null)}>
            <div className="fx-modal__panel" onClick={(e) => e.stopPropagation()}>
              <div className="fx-modal__head">
                <div>
                  <h2 className="fx-h2">Pedido #{selectedOrder.id}</h2>
                  <p className="fx-hint" style={{ marginTop: 2 }}>{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <button className="fx-btn fx-btn--ghost fx-btn--icon" onClick={() => setSelectedOrder(null)} aria-label="Cerrar">
                  <Icon name="close" size={17} />
                </button>
              </div>

              <div className="fx-modal__body">
                <div className="fx-row fx-row--between" style={{ marginBottom: 20 }}>
                  <span className={`fx-badge ${st.badge}`}>
                    <Icon name={st.icon} size={12} />
                    {st.label}
                  </span>
                  <span style={{ fontSize: 19, fontWeight: 700 }}>S/ {orderTotal(selectedOrder).toFixed(2)}</span>
                </div>

                <p className="fx-eyebrow" style={{ marginBottom: 9 }}>Cliente</p>
                <dl className="fx-deflist">
                  <div><dt>Nombre</dt><dd>{selectedOrder.customerName || '—'}</dd></div>
                  <div><dt>Teléfono</dt><dd>{selectedOrder.customerPhone || '—'}</dd></div>
                  {selectedOrder.customerAddress && (
                    <div><dt>Dirección</dt><dd>{selectedOrder.customerAddress}</dd></div>
                  )}
                </dl>

                <p className="fx-eyebrow" style={{ margin: '20px 0 9px' }}>Productos</p>
                {selectedOrder.items?.length ? (
                  <table className="fx-table" style={{ border: '1px solid var(--fx-line)', borderRadius: 'var(--fx-r)' }}>
                    <tbody>
                      {selectedOrder.items.map((item, i) => (
                        <tr key={i}>
                          <td className="fx-table__strong">{item.productName || item.product?.name || 'Producto'}</td>
                          <td className="fx-table__num">×{item.quantity}</td>
                          <td className="fx-table__num">S/ {(item.unitPrice * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="fx-hint">Este pedido no tiene ítems registrados.</p>
                )}
              </div>

              {selectedOrder.status === 'PENDING' && (
                <div className="fx-modal__foot">
                  <button
                    className="fx-btn fx-btn--danger"
                    onClick={() => handleCancel(selectedOrder.id)}
                    disabled={actionLoading === selectedOrder.id + '_cancel'}
                  >
                    {actionLoading === selectedOrder.id + '_cancel'
                      ? <><span className="fx-spinner" /> Cancelando…</>
                      : 'Cancelar pedido'}
                  </button>
                  <button
                    className="fx-btn fx-btn--primary"
                    onClick={() => handleComplete(selectedOrder.id)}
                    disabled={actionLoading === selectedOrder.id + '_complete'}
                  >
                    {actionLoading === selectedOrder.id + '_complete'
                      ? <><span className="fx-spinner" /> Guardando…</>
                      : <><Icon name="check" size={15} /> Marcar completado</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })()}
    </DashboardLayout>
  )
}


