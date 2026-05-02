// src/modules/dashboard/pages/OrdersPage.jsx
import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { API_URL } from '../../../app/config'

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
      // Ordenar por fecha más reciente
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
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error()
      await loadOrders()
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: 'COMPLETED' }))
      }
    } catch {
      setError('Error al completar el pedido')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (orderId) => {
    setActionLoading(orderId + '_cancel')
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error()
      await loadOrders()
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: 'CANCELLED' }))
      }
    } catch {
      setError('Error al cancelar el pedido')
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const filtered = filter === 'ALL'
    ? orders
    : orders.filter(o => o.status === filter)

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
        <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>
          Panel de vendedor
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, color: 'white' }}>
              Pedidos
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              {orders.length} pedido{orders.length !== 1 ? 's' : ''} en total
            </p>
          </div>
          <button onClick={loadOrders} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 11, padding: '9px 16px',
            color: 'var(--text-soft)', fontSize: 13, cursor: 'pointer',
          }}>
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12, marginBottom: 24,
      }}>
        {[
          { label: 'Total', value: stats.total, color: '#7c83fd', icon: '📋' },
          { label: 'Pendientes', value: stats.pending, color: '#fbbf24', icon: '⏳' },
          { label: 'Completados', value: stats.completed, color: '#34d399', icon: '✅' },
          { label: 'Cancelados', value: stats.cancelled, color: '#f87171', icon: '❌' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'rgba(13,13,26,0.9)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14, padding: '16px',
          }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{stat.icon}</div>
            <div style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 26, fontWeight: 700,
              color: stat.color, marginBottom: 4,
            }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: 'ALL',       label: 'Todos' },
          { key: 'PENDING',   label: '⏳ Pendientes' },
          { key: 'COMPLETED', label: '✅ Completados' },
          { key: 'CANCELLED', label: '❌ Cancelados' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '7px 16px', borderRadius: 50,
            background: filter === f.key ? 'rgba(124,131,253,0.15)' : 'rgba(255,255,255,0.04)',
            border: filter === f.key ? '1px solid rgba(124,131,253,0.35)' : '1px solid rgba(255,255,255,0.08)',
            color: filter === f.key ? 'var(--primary)' : 'var(--text-muted)',
            fontSize: 13, fontWeight: filter === f.key ? 600 : 400,
            cursor: 'pointer', transition: 'all 0.2s',
          }}>{f.label}</button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 20,
          fontSize: 13, color: '#f87171',
        }}>⚠️ {error}</div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          Cargando pedidos...
        </div>
      )}

      {/* Sin pedidos */}
      {!loading && filtered.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 24px',
          background: 'rgba(13,13,26,0.6)',
          border: '1px dashed rgba(255,255,255,0.08)',
          borderRadius: 20,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
          <h3 style={{ color: 'white', marginBottom: 8, fontFamily: "'Fraunces', serif" }}>
            {filter === 'ALL' ? 'Sin pedidos aún' : `Sin pedidos ${STATUS_CONFIG[filter]?.label.toLowerCase()}s`}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Cuando tus clientes hagan pedidos aparecerán aquí.
          </p>
        </div>
      )}

      {/* Lista de pedidos */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(order => {
            const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING
            const total = order.items?.reduce((s, i) => s + (i.unitPrice * i.quantity), 0) || order.total || 0

            return (
              <div key={order.id}
                onClick={() => setSelectedOrder(order)}
                style={{
                  background: 'rgba(13,13,26,0.9)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 16, padding: '16px 20px',
                  cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center',
                  gap: 16, flexWrap: 'wrap',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(124,131,253,0.25)'
                  e.currentTarget.style.transform = 'translateX(2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.transform = 'translateX(0)'
                }}
              >
                {/* ID */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: 'rgba(124,131,253,0.1)',
                  border: '1px solid rgba(124,131,253,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Fraunces', serif", fontSize: 14, fontWeight: 700, color: 'var(--primary)',
                }}>#{order.id}</div>

                {/* Info cliente */}
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 3 }}>
                    {order.customerName || 'Cliente'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {formatDate(order.createdAt)}
                  </div>
                </div>

                {/* Productos */}
                <div style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 100 }}>
                  {order.items?.length || 0} producto{(order.items?.length || 0) !== 1 ? 's' : ''}
                </div>

                {/* Total */}
                <div style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 18, fontWeight: 700, color: 'white', minWidth: 80,
                }}>
                  S/ {total.toFixed(2)}
                </div>

                {/* Status */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: st.bg, border: `1px solid ${st.border}`,
                  borderRadius: 50, padding: '4px 12px',
                  fontSize: 12, fontWeight: 600, color: st.color,
                  flexShrink: 0,
                }}>
                  {st.icon} {st.label}
                </div>

                {/* Acciones rápidas */}
                {order.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}
                    onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleComplete(order.id)}
                      disabled={actionLoading === order.id + '_complete'}
                      style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)',
                        color: '#34d399', cursor: 'pointer',
                      }}>
                      {actionLoading === order.id + '_complete' ? '...' : '✅'}
                    </button>
                    <button
                      onClick={() => handleCancel(order.id)}
                      disabled={actionLoading === order.id + '_cancel'}
                      style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                        color: '#f87171', cursor: 'pointer',
                      }}>
                      {actionLoading === order.id + '_cancel' ? '...' : '❌'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal detalle pedido */}
      {selectedOrder && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }} onClick={() => setSelectedOrder(null)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0a0a18',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 24, width: '100%', maxWidth: 500,
              boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
              maxHeight: '90vh', overflowY: 'auto',
            }}>
            {/* Header modal */}
            <div style={{
              padding: '22px 26px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: 'white' }}>
                  Pedido #{selectedOrder.id}
                </h3>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {formatDate(selectedOrder.createdAt)}
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{
                width: 34, height: 34, borderRadius: 9,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-muted)', fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>

            <div style={{ padding: '24px 26px' }}>
              {/* Estado */}
              {(() => {
                const st = STATUS_CONFIG[selectedOrder.status] || STATUS_CONFIG.PENDING
                return (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: st.bg, border: `1px solid ${st.border}`,
                    borderRadius: 50, padding: '5px 14px',
                    fontSize: 13, fontWeight: 600, color: st.color,
                    marginBottom: 20,
                  }}>
                    {st.icon} {st.label}
                  </div>
                )
              })()}

                {/* Cliente */}
<div style={{
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 12, padding: '14px 16px', marginBottom: 16,
}}>
  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
    Cliente
  </div>
  <div style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>
    👤 {selectedOrder.customerName || 'Sin nombre'}
  </div>
  {/* Agrega aquí: */}
  {selectedOrder.customerPhone && (
    <div style={{ fontSize: 13, color: 'var(--text-soft)', marginTop: 6, display: 'flex', gap: 6 }}>
      📞 {selectedOrder.customerPhone}
    </div>
  )}
  {selectedOrder.customerAddress && (
    <div style={{ fontSize: 13, color: 'var(--text-soft)', marginTop: 6, display: 'flex', gap: 6 }}>
      📍 {selectedOrder.customerAddress}
    </div>
  )}
</div>

              {/* Total */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 16px',
                background: 'rgba(124,131,253,0.06)',
                border: '1px solid rgba(124,131,253,0.15)',
                borderRadius: 12, marginBottom: 24,
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-soft)' }}>Total del pedido</span>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: 'white' }}>
                  S/ {(selectedOrder.items?.reduce((s, i) => s + i.unitPrice * i.quantity, 0) || selectedOrder.total || 0).toFixed(2)}
                </span>
              </div>

              {/* Acciones */}
              {selectedOrder.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => handleComplete(selectedOrder.id)}
                    disabled={!!actionLoading}
                    style={{
                      flex: 1, padding: '13px',
                      background: 'rgba(52,211,153,0.1)',
                      border: '1px solid rgba(52,211,153,0.25)',
                      borderRadius: 12, fontSize: 14, fontWeight: 600,
                      color: '#34d399', cursor: 'pointer',
                    }}>
                    {actionLoading ? '...' : '✅ Marcar completado'}
                  </button>
                  <button
                    onClick={() => handleCancel(selectedOrder.id)}
                    disabled={!!actionLoading}
                    style={{
                      flex: 1, padding: '13px',
                      background: 'rgba(248,113,113,0.08)',
                      border: '1px solid rgba(248,113,113,0.2)',
                      borderRadius: 12, fontSize: 14, fontWeight: 600,
                      color: '#f87171', cursor: 'pointer',
                    }}>
                    {actionLoading ? '...' : '❌ Cancelar pedido'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
