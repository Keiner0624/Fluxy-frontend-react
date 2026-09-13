// src/modules/dashboard/pages/OrdersPage.jsx
// Centro operativo de ventas: buscar, filtrar, avanzar estados y revisar el detalle.
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import OrderDetailModal from '@/modules/dashboard/components/OrderDetailModal'
import Icon from '@/components/Icon'
import { api } from '@/app/api'
import useApi, { useDebounced } from '@/hooks/useApi'
import useAccess from '@/hooks/useAccess'
import { money, dateTime, integer, ORDER_STATUS, ORDER_PAYMENT_STATUS, PAYMENT_METHODS, rangeFromPreset, count } from '@/app/format'
import {
  Badge, EmptyState, ErrorState, NoAccess, Pagination
} from '@/modules/dashboard/components/ui'

const TABS = [
  { key: 'ALL',         label: 'Todos' },
  { key: 'PENDING',     label: 'Pendientes' },
  { key: 'IN_PROGRESS', label: 'En curso' },
  { key: 'DELIVERED',   label: 'Entregados' },
  { key: 'CANCELLED',   label: 'Cancelados' },
]
const PAGE_SIZE = 20

export default function OrdersPage() {
  const access = useAccess()
  const [searchParams, setSearchParams] = useSearchParams()
  const [status, setStatus] = useState(() => searchParams.get('status') || 'ALL')
  const [query, setQuery] = useState('')
  const [method, setMethod] = useState('')
  const [range, setRange] = useState({ preset: 'all', from: '', to: '' })
  const [page, setPage] = useState(0)
  const openOrderId = Number(searchParams.get('order')) || null
  const debouncedQuery = useDebounced(query)
  const canView = access.can('ORDER_VIEW')

  const counts = useApi(() => api.get('/orders/status-counts'), [], { enabled: canView })
  const orders = useApi(() => api.get('/orders/search', {
    status, q: debouncedQuery, paymentMethod: method, from: range.from, to: range.to, page, size: PAGE_SIZE,
  }), [status, debouncedQuery, method, range.from, range.to, page], { enabled: canView })

  const changeFilter = (setter) => (value) => { setter(value); setPage(0) }

  const openOrder = (id) => {
    const next = new URLSearchParams(searchParams)
    if (id) next.set('order', id); else next.delete('order')
    setSearchParams(next, { replace: true })
  }

  const refreshAll = () => { orders.refresh(); counts.refresh() }
  const result = orders.data
  const hasFilters = status !== 'ALL' || debouncedQuery || method || range.from

  if (access.ready && !canView) {
    return <DashboardLayout><NoAccess module="Pedidos" /></DashboardLayout>
  }

  return (
    <DashboardLayout>
      <div className="fx-page-head">
        <div>
          <h1>Pedidos</h1>
          <p>{counts.data ? `${count(counts.data.ALL, 'pedido')} en total · ${integer(counts.data.PENDING)} por confirmar` : 'Gestioná y avanzá tus pedidos'}</p>
        </div>
        <div className="fx-page-head__actions">
          <button className="fx-btn fx-btn--secondary" onClick={() => { orders.reload(); counts.reload() }} disabled={orders.loading}>
            <Icon name="refresh" size={15} />
            Actualizar
          </button>
        </div>
      </div>

      <div className="fx-tabs" style={{ marginBottom: 14 }} role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={status === tab.key}
            className={`fx-tab${status === tab.key ? ' fx-tab--on' : ''}`}
            onClick={() => changeFilter(setStatus)(tab.key)}
          >
            {tab.label}
            {counts.data && <span className="fx-tab__count">{integer(counts.data[tab.key] ?? 0)}</span>}
          </button>
        ))}
      </div>

      <div className="fx-toolbar">
        <div className="fx-search">
          <Icon name="search" size={16} />
          <input
            className="fx-input"
            placeholder="Buscar por n.º de pedido, cliente o teléfono"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0) }}
          />
        </div>
        <select className="fx-select" style={{ maxWidth: 190 }} value={method} onChange={(e) => changeFilter(setMethod)(e.target.value)} aria-label="Medio de pago">
          <option value="">Todos los medios</option>
          {Object.entries(PAYMENT_METHODS).slice(0, 6).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
        <div className="fx-range-picker">
          <select
            className="fx-select"
            value={range.preset}
            aria-label="Fecha"
            onChange={(e) => {
              const preset = e.target.value
              setPage(0)
              if (preset === 'all') setRange({ preset, from: '', to: '' })
              else if (preset === 'custom') setRange((r) => ({ ...rangeFromPreset('30'), ...r, preset }))
              else setRange(rangeFromPreset(preset))
            }}
          >
            <option value="all">Cualquier fecha</option>
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="month">Este mes</option>
            <option value="custom">Personalizado</option>
          </select>
          {range.preset === 'custom' && (
            <>
              <input type="date" className="fx-input" value={range.from} max={range.to} aria-label="Desde"
                onChange={(e) => { if (e.target.value) { setRange((r) => ({ ...r, from: e.target.value })); setPage(0) } }} />
              <input type="date" className="fx-input" value={range.to} min={range.from} aria-label="Hasta"
                onChange={(e) => { if (e.target.value) { setRange((r) => ({ ...r, to: e.target.value })); setPage(0) } }} />
            </>
          )}
        </div>
      </div>

      {orders.error && <div style={{ marginBottom: 14 }}><ErrorState error={orders.error} onRetry={orders.reload} /></div>}

      <div className="fx-card">
        {orders.loading && !result ? (
          <div className="fx-card__body">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="fx-skeleton" style={{ height: 38, marginBottom: 8 }} />)}
          </div>
        ) : !result?.content?.length ? (
          <EmptyState
            icon="inbox"
            title={hasFilters ? 'No hay pedidos con estos filtros' : 'Todavía no recibiste pedidos'}
            text={hasFilters
              ? 'Probá con otro estado, fecha o término de búsqueda.'
              : 'Cuando alguien compre en tu tienda, el pedido va a aparecer acá para que lo confirmes y lo prepares.'}
          />
        ) : (
          <>
            <div className="fx-table-wrap" style={{ opacity: orders.loading ? .6 : 1, transition: 'opacity .15s' }}>
              <table className="fx-table">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th className="fx-hide-md">Fecha</th>
                    <th className="fx-table__num fx-hide-md">Ítems</th>
                    <th className="fx-table__num">Total</th>
                    <th className="fx-hide-sm">Cobro</th>
                    <th>Estado</th>
                    <th style={{ width: 36 }} />
                  </tr>
                </thead>
                <tbody>
                  {result.content.map((order) => (
                    <tr key={order.id} className="is-clickable" onClick={() => openOrder(order.id)}>
                      <td className="fx-table__strong">#{order.id}</td>
                      <td>
                        <div className="fx-truncate" style={{ maxWidth: 220, color: 'var(--fx-ink)' }}>{order.customerName || 'Sin nombre'}</div>
                        {order.customerPhone && <div className="fx-hint" style={{ fontSize: 12 }}>{order.customerPhone}</div>}
                      </td>
                      <td className="fx-hide-md" style={{ fontSize: 13 }}>{dateTime(order.createdAt)}</td>
                      <td className="fx-table__num fx-hide-md">{order.units}</td>
                      <td className="fx-table__num fx-table__strong">{money(order.total)}</td>
                      <td className="fx-hide-sm">
                        {order.status === 'CANCELLED'
                          ? <span className="fx-hint">—</span>
                          : <Badge config={ORDER_PAYMENT_STATUS[order.paymentStatus]} fallback={order.paymentStatus} />}
                      </td>
                      <td><Badge config={ORDER_STATUS[order.status]} fallback={order.status} /></td>
                      <td><Icon name="chevronRight" size={15} style={{ color: 'var(--fx-muted)' }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={result.page} totalPages={result.totalPages} totalElements={result.totalElements}
              size={result.size} onChange={setPage} noun="pedidos" />
          </>
        )}
      </div>

      {openOrderId && (
        <OrderDetailModal orderId={openOrderId} onClose={() => openOrder(null)} onChanged={refreshAll} />
      )}
    </DashboardLayout>
  )
}
