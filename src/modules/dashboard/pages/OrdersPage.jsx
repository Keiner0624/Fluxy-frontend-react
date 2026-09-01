// src/modules/dashboard/pages/OrdersPage.jsx
import { useState, useEffect } from 'react'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import { API_URL } from '@/app/config'
import { OrderRowSkeleton, StatCardSkeleton } from '@/components/Skeleton'

function getToken() {
  return localStorage.getItem('token') || ''
}

const STATUS_CONFIG = {
  PENDING:   { label: 'Pendiente',  color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.25)',  icon: '⏳' },
  COMPLETED: { label: 'Completado', color: '#34d399', bg: 'rgba(52,211,153,0.1)',   border: 'rgba(52,211,153,0.25)',  icon: '✅' },
  CANCELLED: { label: 'Cancelado',  color: '#f87171', bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.25)', icon: '❌' },
}

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
  const stats = {
    total:     orders.length,
    pending:   orders.filter(o => o.status === 'PENDING').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>Panel de vendedor</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, color: 'white' }}>Pedidos</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{orders.length} pedido{orders.length !== 1 ? 's' : ''} en total</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={loadOrders} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 11, padding: '9px 16px', color: 'var(--text-soft)', fontSize: 13, cursor: 'pointer' }}>
              🔄 Actualizar
            </button>
            <button onClick={exportPDF} disabled={orders.length === 0} style={{ display: 'flex', alignItems: 'center', gap: 8, background: orders.length === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(124,131,253,0.1)', border: '1px solid rgba(124,131,253,0.25)', borderRadius: 11, padding: '9px 16px', color: orders.length === 0 ? 'rgba(255,255,255,0.2)' : '#7c83fd', fontSize: 13, fontWeight: 600, cursor: orders.length === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { if (orders.length > 0) e.currentTarget.style.background = 'rgba(124,131,253,0.18)' }}
              onMouseLeave={e => e.currentTarget.style.background = orders.length === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(124,131,253,0.1)'}
            >
              📄 Exportar PDF
            </button>
          </div>
        </div>
      </div>

      {/* Stats skeleton o reales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {loading ? (
          [1,2,3,4].map(i => <StatCardSkeleton key={i}/>)
        ) : (
          [
            { label: 'Total',      value: stats.total,     color: '#7c83fd', icon: '📋' },
            { label: 'Pendientes', value: stats.pending,   color: '#fbbf24', icon: '⏳' },
            { label: 'Completados',value: stats.completed, color: '#34d399', icon: '✅' },
            { label: 'Cancelados', value: stats.cancelled, color: '#f87171', icon: '❌' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '16px' }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 700, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))
        )}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: 'ALL', label: 'Todos' },
          { key: 'PENDING', label: '⏳ Pendientes' },
          { key: 'COMPLETED', label: '✅ Completados' },
          { key: 'CANCELLED', label: '❌ Cancelados' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '7px 16px', borderRadius: 50,
            background: filter === f.key ? 'rgba(124,131,253,0.15)' : 'rgba(255,255,255,0.04)',
            border: filter === f.key ? '1px solid rgba(124,131,253,0.35)' : '1px solid rgba(255,255,255,0.08)',
            color: filter === f.key ? 'var(--primary)' : 'var(--text-muted)',
            fontSize: 13, fontWeight: filter === f.key ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s',
          }}>{f.label}</button>
        ))}
      </div>

      {error && (
        <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#f87171' }}>⚠️ {error}</div>
      )}

      {/* Skeleton rows */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4,5].map(i => <OrderRowSkeleton key={i}/>)}
        </div>
      )}

      {/* Sin pedidos */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'rgba(13,13,26,0.6)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
          <h3 style={{ color: 'white', marginBottom: 8, fontFamily: "'Fraunces', serif" }}>
            {filter === 'ALL' ? 'Sin pedidos aún' : `Sin pedidos ${STATUS_CONFIG[filter]?.label.toLowerCase()}s`}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Cuando tus clientes hagan pedidos aparecerán aquí.</p>
        </div>
      )}

      {/* Lista de pedidos */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(order => {
            const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING
            const total = order.items?.reduce((s, i) => s + (i.unitPrice * i.quantity), 0) || order.total || 0
            return (
              <div key={order.id} onClick={() => setSelectedOrder(order)} style={{
                background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16, padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,131,253,0.25)'; e.currentTarget.style.transform = 'translateX(2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateX(0)' }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: 'rgba(124,131,253,0.1)', border: '1px solid rgba(124,131,253,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces', serif", fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>#{order.id}</div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 3 }}>{order.customerName || 'Cliente'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(order.createdAt)}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 100 }}>{order.items?.length || 0} producto{(order.items?.length || 0) !== 1 ? 's' : ''}</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: 'white', minWidth: 80 }}>S/ {total.toFixed(2)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: st.bg, border: `1px solid ${st.border}`, borderRadius: 50, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: st.color, flexShrink: 0 }}>{st.icon} {st.label}</div>
                {order.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleComplete(order.id)} disabled={actionLoading === order.id + '_complete'} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399', cursor: 'pointer' }}>{actionLoading === order.id + '_complete' ? '...' : '✅'}</button>
                    <button onClick={() => handleCancel(order.id)} disabled={actionLoading === order.id + '_cancel'} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', cursor: 'pointer' }}>{actionLoading === order.id + '_cancel' ? '...' : '❌'}</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal detalle */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setSelectedOrder(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#0a0a18', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, width: '100%', maxWidth: 500, boxShadow: '0 40px 80px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '22px 26px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: 'white' }}>Pedido #{selectedOrder.id}</h3>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{formatDate(selectedOrder.createdAt)}</div>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div style={{ padding: '24px 26px' }}>
              {(() => {
                const st = STATUS_CONFIG[selectedOrder.status] || STATUS_CONFIG.PENDING
                return (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: st.bg, border: `1px solid ${st.border}`, borderRadius: 50, padding: '5px 14px', fontSize: 13, fontWeight: 600, color: st.color, marginBottom: 20 }}>{st.icon} {st.label}</div>
                )
              })()}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Cliente</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>👤 {selectedOrder.customerName || 'Sin nombre'}</div>
                {selectedOrder.customerPhone && <div style={{ fontSize: 13, color: 'var(--text-soft)', marginTop: 6 }}>📞 {selectedOrder.customerPhone}</div>}
                {selectedOrder.customerAddress && <div style={{ fontSize: 13, color: 'var(--text-soft)', marginTop: 6 }}>📍 {selectedOrder.customerAddress}</div>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(124,131,253,0.06)', border: '1px solid rgba(124,131,253,0.15)', borderRadius: 12, marginBottom: 24 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-soft)' }}>Total del pedido</span>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: 'white' }}>S/ {(selectedOrder.items?.reduce((s, i) => s + i.unitPrice * i.quantity, 0) || selectedOrder.total || 0).toFixed(2)}</span>
              </div>
              {selectedOrder.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => handleComplete(selectedOrder.id)} disabled={!!actionLoading} style={{ flex: 1, padding: '13px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 12, fontSize: 14, fontWeight: 600, color: '#34d399', cursor: 'pointer' }}>{actionLoading ? '...' : '✅ Marcar completado'}</button>
                  <button onClick={() => handleCancel(selectedOrder.id)} disabled={!!actionLoading} style={{ flex: 1, padding: '13px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 12, fontSize: 14, fontWeight: 600, color: '#f87171', cursor: 'pointer' }}>{actionLoading ? '...' : '❌ Cancelar pedido'}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}