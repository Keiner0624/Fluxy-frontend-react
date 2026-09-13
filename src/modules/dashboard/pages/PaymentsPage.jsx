// src/modules/dashboard/pages/PaymentsPage.jsx
// Control de cobros: qué entró, qué falta y qué hay que devolver.
import { useState } from 'react'
import toast from 'react-hot-toast'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import OrderDetailModal from '@/modules/dashboard/components/OrderDetailModal'
import Icon from '@/components/Icon'
import { api } from '@/app/api'
import useApi, { useDebounced } from '@/hooks/useApi'
import useAccess from '@/hooks/useAccess'
import { money, dateTime, integer, PAYMENT_STATUS, PAYMENT_METHODS, ORDER_STATUS, paymentMethodLabel, rangeFromPreset, count } from '@/app/format'
import {
  Badge, EmptyState, ErrorState, Modal, NoAccess, Pagination, RangePicker, StatCard
} from '@/modules/dashboard/components/ui'

const STATUS_TABS = [
  { key: '',         label: 'Todos' },
  { key: 'PENDING',  label: 'Pendientes' },
  { key: 'APPROVED', label: 'Aprobados' },
  { key: 'REJECTED', label: 'Rechazados' },
  { key: 'REFUNDED', label: 'Reembolsados' },
]

const ISSUE = {
  UNPAID:     { label: 'Falta cobrar',       badge: 'fx-badge--warn',   text: 'Venta confirmada con cobro incompleto' },
  REFUND_DUE: { label: 'Reembolso pendiente', badge: 'fx-badge--danger', text: 'Pedido cancelado con dinero cobrado' },
  OVERPAID:   { label: 'Cobrado de más',     badge: 'fx-badge--danger', text: 'Se cobró más que el total del pedido' },
}

function RefundModal({ payment, onClose, onDone }) {
  const remaining = payment.amount - payment.refundedAmount
  const [amount, setAmount] = useState(remaining.toFixed(2))
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!reason.trim()) { setError('Indicá el motivo del reembolso.'); return }
    setSaving(true)
    setError('')
    try {
      await api.post(`/payments/${payment.id}/refund`, { amount: Number(amount), reason })
      toast.success('Reembolso registrado.')
      onDone()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal as="form" onSubmit={submit} title={`Reembolsar cobro · Pedido #${payment.orderId}`}
      subtitle={`Disponible para reembolsar: ${money(remaining)}`} onClose={onClose} width={440}
      footer={(
        <>
          <button type="button" className="fx-btn fx-btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="fx-btn fx-btn--danger" disabled={saving}>
            {saving ? <><span className="fx-spinner" /> Guardando…</> : 'Registrar reembolso'}
          </button>
        </>
      )}
    >
      <p className="fx-hint" style={{ marginBottom: 14 }}>
        Registra la devolución en Fluxy. El dinero lo devolvés por el mismo medio con el que te pagaron.
      </p>
      <div className="fx-field">
        <label className="fx-label" htmlFor="refund-amount">Monto (S/)</label>
        <input id="refund-amount" className="fx-input" type="number" min="0.01" max={remaining} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <div className="fx-field" style={{ marginBottom: 0 }}>
        <label className="fx-label" htmlFor="refund-reason">Motivo</label>
        <input id="refund-reason" className="fx-input" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={200} placeholder="Producto dañado, pedido cancelado…" autoFocus />
      </div>
      {error && <div className="fx-alert fx-alert--error" style={{ marginTop: 14 }}><span>{error}</span></div>}
    </Modal>
  )
}

function ReferenceModal({ payment, onClose, onDone }) {
  const [reference, setReference] = useState(payment.providerReference || '')
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch(`/payments/${payment.id}`, { providerReference: reference })
      toast.success('Referencia guardada.')
      onDone()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal as="form" onSubmit={submit} title="Referencia del cobro" onClose={onClose} width={420}
      footer={(
        <>
          <button type="button" className="fx-btn fx-btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="fx-btn fx-btn--primary" disabled={saving}>Guardar</button>
        </>
      )}
    >
      <label className="fx-label" htmlFor="ref">N.º de operación, voucher o ID del proveedor</label>
      <input id="ref" className="fx-input" value={reference} onChange={(e) => setReference(e.target.value)} maxLength={120} autoFocus />
    </Modal>
  )
}

export default function PaymentsPage() {
  const access = useAccess()
  const canView = access.can('PAYMENT_VIEW')
  const canUpdate = access.can('PAYMENT_UPDATE')
  const [view, setView] = useState('payments')
  const [range, setRange] = useState(() => rangeFromPreset('30'))
  const [status, setStatus] = useState('')
  const [method, setMethod] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [refunding, setRefunding] = useState(null)
  const [editingRef, setEditingRef] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [busy, setBusy] = useState(null)
  const debouncedQuery = useDebounced(query)

  const summary = useApi(() => api.get('/payments/summary', { from: range.from, to: range.to }), [range.from, range.to], { enabled: canView })
  const list = useApi(() => api.get('/payments', {
    status, method, q: debouncedQuery, from: range.from, to: range.to, page, size: 20,
  }), [status, method, debouncedQuery, range.from, range.to, page], { enabled: canView && view === 'payments' })
  const reconciliation = useApi(() => api.get('/payments/reconciliation'), [], { enabled: canView })

  const refreshAll = () => { list.refresh(); summary.refresh(); reconciliation.refresh() }

  const decide = async (payment, nextStatus) => {
    setBusy(`${payment.id}-${nextStatus}`)
    try {
      await api.patch(`/payments/${payment.id}`, { status: nextStatus })
      toast.success(nextStatus === 'APPROVED' ? 'Cobro aprobado.' : 'Cobro rechazado.')
      refreshAll()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(null)
    }
  }

  if (access.ready && !canView) return <DashboardLayout><NoAccess module="Pagos" /></DashboardLayout>

  const s = summary.data
  const r = reconciliation.data
  const issuesCount = r ? r.unpaidCount + r.refundDueCount + r.overpaidCount : 0
  const result = list.data

  return (
    <DashboardLayout>
      <div className="fx-page-head">
        <div>
          <h1>Pagos</h1>
          <p>Cobros de tus pedidos y su conciliación con lo vendido</p>
        </div>
        <div className="fx-page-head__actions">
          <RangePicker value={range} onChange={(value) => { setRange(value); setPage(0) }} />
        </div>
      </div>

      {summary.error && <div style={{ marginBottom: 14 }}><ErrorState error={summary.error} onRetry={summary.reload} /></div>}

      <div className="fx-stats" style={{ marginBottom: 18 }}>
        <StatCard loading={!s} icon="money" label="Cobrado neto" value={money(s?.netCollected)} foot="Aprobado menos reembolsos" />
        <StatCard loading={!s} icon="checkCircle" label="Aprobados" value={money(s?.approvedAmount)} foot={s && count(s.approvedCount, 'cobro')} />
        <StatCard loading={!s} icon="clock" label="Pendientes" value={money(s?.pendingAmount)} foot={s && `${integer(s.pendingCount)} por confirmar`}
          tone={s?.pendingCount > 0 ? 'warn' : undefined} />
        <StatCard loading={!s} icon="close" label="Rechazados" value={money(s?.rejectedAmount)} foot={s && count(s.rejectedCount, 'cobro')} />
        <StatCard loading={!s} icon="undo" label="Reembolsado" value={money(s?.refundedAmount)} foot={s && count(s.refundedCount, 'reembolso')} />
      </div>

      <div className="fx-tabs" style={{ marginBottom: 14, display: 'inline-flex' }} role="tablist">
        <button role="tab" aria-selected={view === 'payments'} className={`fx-tab${view === 'payments' ? ' fx-tab--on' : ''}`} onClick={() => setView('payments')}>
          Cobros
        </button>
        <button role="tab" aria-selected={view === 'reconciliation'} className={`fx-tab${view === 'reconciliation' ? ' fx-tab--on' : ''}`} onClick={() => setView('reconciliation')}>
          Conciliación
          {issuesCount > 0 && <span className="fx-tab__count">{issuesCount}</span>}
        </button>
      </div>

      {view === 'payments' ? (
        <>
          <div className="fx-toolbar">
            <div className="fx-search">
              <Icon name="search" size={16} />
              <input className="fx-input" placeholder="Buscar por n.º de pedido o referencia" value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(0) }} />
            </div>
            <select className="fx-select" style={{ maxWidth: 170 }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(0) }} aria-label="Estado">
              {STATUS_TABS.map((t) => <option key={t.key} value={t.key}>{t.key ? t.label : 'Todos los estados'}</option>)}
            </select>
            <select className="fx-select" style={{ maxWidth: 170 }} value={method} onChange={(e) => { setMethod(e.target.value); setPage(0) }} aria-label="Medio de pago">
              <option value="">Todos los medios</option>
              {Object.entries(PAYMENT_METHODS).slice(0, 6).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </div>

          {list.error && <div style={{ marginBottom: 14 }}><ErrorState error={list.error} onRetry={list.reload} /></div>}

          <div className="fx-card">
            {list.loading && !result ? (
              <div className="fx-card__body">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="fx-skeleton" style={{ height: 40, marginBottom: 8 }} />)}</div>
            ) : !result?.content?.length ? (
              <EmptyState icon="payments" title="No hay cobros en este período"
                text="Cada pedido deja su cobro pendiente. Confirmalo cuando recibas el dinero, desde acá o desde el detalle del pedido." />
            ) : (
              <>
                <div className="fx-table-wrap" style={{ opacity: list.loading ? .6 : 1 }}>
                  <table className="fx-table">
                    <thead>
                      <tr>
                        <th>Pedido</th>
                        <th className="fx-hide-md">Fecha</th>
                        <th className="fx-hide-sm">Medio</th>
                        <th className="fx-hide-md">Referencia</th>
                        <th className="fx-table__num">Monto</th>
                        <th>Estado</th>
                        <th style={{ width: 170 }} />
                      </tr>
                    </thead>
                    <tbody>
                      {result.content.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <button type="button" className="fx-link" onClick={() => setOrderId(p.orderId)}>#{p.orderId}</button>
                            <div className="fx-hint fx-truncate" style={{ fontSize: 12, maxWidth: 170 }}>{p.customerName || '—'}</div>
                          </td>
                          <td className="fx-hide-md" style={{ fontSize: 13 }}>{dateTime(p.createdAt)}</td>
                          <td className="fx-hide-sm">{paymentMethodLabel(p.method)}</td>
                          <td className="fx-hide-md">
                            {p.providerReference
                              ? <span className="fx-code">{p.providerReference}</span>
                              : canUpdate
                                ? <button type="button" className="fx-link" style={{ fontSize: 13 }} onClick={() => setEditingRef(p)}>Agregar</button>
                                : <span className="fx-hint">—</span>}
                          </td>
                          <td className="fx-table__num">
                            <div className="fx-table__strong">{money(p.amount)}</div>
                            {p.refundedAmount > 0 && <div className="fx-hint" style={{ fontSize: 12 }}>− {money(p.refundedAmount)}</div>}
                          </td>
                          <td><Badge config={PAYMENT_STATUS[p.status]} fallback={p.status} /></td>
                          <td>
                            <div className="fx-row" style={{ gap: 4, justifyContent: 'flex-end' }}>
                              {p.status === 'PENDING' && canUpdate && p.orderStatus !== 'CANCELLED' && (
                                <>
                                  <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" disabled={Boolean(busy)} onClick={() => decide(p, 'REJECTED')}>Rechazar</button>
                                  <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" disabled={Boolean(busy)} onClick={() => decide(p, 'APPROVED')}>
                                    {busy === `${p.id}-APPROVED` ? <span className="fx-spinner" /> : 'Confirmar'}
                                  </button>
                                </>
                              )}
                              {p.status === 'APPROVED' && access.can('PAYMENT_REFUND') && (
                                <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={() => setRefunding(p)}>
                                  <Icon name="undo" size={14} /> Reembolsar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={result.page} totalPages={result.totalPages} totalElements={result.totalElements}
                  size={result.size} onChange={setPage} noun="cobros" />
              </>
            )}
          </div>
        </>
      ) : (
        <>
          {reconciliation.error && <div style={{ marginBottom: 14 }}><ErrorState error={reconciliation.error} onRetry={reconciliation.reload} /></div>}
          <div className="fx-stats" style={{ marginBottom: 16 }}>
            <StatCard loading={!r} icon="clock" label="Ventas sin cobrar" value={money(r?.unpaidAmount)}
              foot={r && count(r.unpaidCount, 'pedido')} tone={r?.unpaidCount ? 'warn' : undefined} />
            <StatCard loading={!r} icon="undo" label="Reembolsos pendientes" value={money(r?.refundDueAmount)}
              foot={r && count(r.refundDueCount, 'pedido cancelado', 'pedidos cancelados')} tone={r?.refundDueCount ? 'danger' : undefined} />
            <StatCard loading={!r} icon="warning" label="Cobrado de más" value={money(r?.overpaidAmount)}
              foot={r && count(r.overpaidCount, 'pedido')} tone={r?.overpaidCount ? 'danger' : undefined} />
          </div>

          <div className="fx-card">
            {!r ? (
              <div className="fx-card__body"><div className="fx-skeleton" style={{ height: 120 }} /></div>
            ) : r.issues.length === 0 ? (
              <EmptyState icon="checkCircle" title="Todo conciliado"
                text="Cada venta confirmada tiene su cobro completo y ningún pedido cancelado tiene dinero pendiente de devolver." />
            ) : (
              <div className="fx-table-wrap">
                <table className="fx-table">
                  <thead>
                    <tr>
                      <th>Pedido</th>
                      <th>Diferencia</th>
                      <th className="fx-hide-md">Estado del pedido</th>
                      <th className="fx-table__num fx-hide-sm">Total</th>
                      <th className="fx-table__num fx-hide-sm">Cobrado</th>
                      <th className="fx-table__num">A resolver</th>
                      <th style={{ width: 36 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {r.issues.map((issue) => (
                      <tr key={`${issue.type}-${issue.orderId}`} className="is-clickable" onClick={() => setOrderId(issue.orderId)}>
                        <td>
                          <div className="fx-table__strong">#{issue.orderId}</div>
                          <div className="fx-hint fx-truncate" style={{ fontSize: 12, maxWidth: 170 }}>{issue.customerName || '—'} · {dateTime(issue.orderDate)}</div>
                        </td>
                        <td>
                          <span className={`fx-badge ${ISSUE[issue.type].badge}`}>{ISSUE[issue.type].label}</span>
                          {issue.pendingPayments > 0 && <div className="fx-hint" style={{ fontSize: 12, marginTop: 3 }}>{issue.pendingPayments} cobro pendiente de confirmar</div>}
                        </td>
                        <td className="fx-hide-md"><Badge config={ORDER_STATUS[issue.orderStatus]} fallback={issue.orderStatus} /></td>
                        <td className="fx-table__num fx-hide-sm">{money(issue.orderTotal)}</td>
                        <td className="fx-table__num fx-hide-sm">{money(issue.collected)}</td>
                        <td className="fx-table__num fx-table__strong">{money(issue.difference)}</td>
                        <td><Icon name="chevronRight" size={15} style={{ color: 'var(--fx-muted)' }} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {refunding && <RefundModal payment={refunding} onClose={() => setRefunding(null)} onDone={() => { setRefunding(null); refreshAll() }} />}
      {editingRef && <ReferenceModal payment={editingRef} onClose={() => setEditingRef(null)} onDone={() => { setEditingRef(null); list.refresh() }} />}
      {orderId && <OrderDetailModal orderId={orderId} onClose={() => setOrderId(null)} onChanged={refreshAll} />}
    </DashboardLayout>
  )
}
