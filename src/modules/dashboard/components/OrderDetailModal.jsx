// src/modules/dashboard/components/OrderDetailModal.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Icon from '@/components/Icon'
import { api } from '@/app/api'
import useApi from '@/hooks/useApi'
import useAccess from '@/hooks/useAccess'
import {
  money, dateTime, ORDER_STATUS, ORDER_FLOW, ORDER_ACTION, PAYMENT_STATUS, ORDER_PAYMENT_STATUS, paymentMethodLabel,
} from '@/app/format'
import { Modal, Badge, ErrorState } from '@/modules/dashboard/components/ui'
import PaymentForm from '@/modules/dashboard/components/PaymentForm'

const CANCEL_REASONS = [
  'El cliente canceló',
  'El cliente no respondió',
  'Sin stock para completarlo',
  'Pago no recibido',
  'Pedido duplicado',
]

function Steps({ status }) {
  const cancelled = status === 'CANCELLED'
  const index = ORDER_FLOW.indexOf(status)
  return (
    <div className="fx-steps" aria-label="Avance del pedido">
      {ORDER_FLOW.map((step, i) => (
        <div
          key={step}
          className={`fx-steps__item${!cancelled && i <= index ? ' is-done' : ''}${cancelled ? ' is-cancelled' : ''}${i === index ? ' is-current' : ''}`}
        >
          <div className="fx-steps__bar" />
          <span className="fx-steps__label">{ORDER_STATUS[step].label}</span>
        </div>
      ))}
    </div>
  )
}

export default function OrderDetailModal({ orderId, onClose, onChanged }) {
  const access = useAccess()
  const { data: order, loading, error, reload, setData } = useApi(() => api.get(`/orders/${orderId}/detail`), [orderId])
  const [busy, setBusy] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [reason, setReason] = useState(CANCEL_REASONS[0])
  const [otherReason, setOtherReason] = useState('')
  const [paying, setPaying] = useState(false)

  const move = async (status, note) => {
    setBusy(status)
    try {
      const updated = await api.patch(`/orders/${orderId}/status`, { status, note })
      setData(updated)
      setCancelling(false)
      toast.success(status === 'CANCELLED' ? 'Pedido cancelado. El stock volvió al inventario.' : `Pedido ${ORDER_STATUS[status].label.toLowerCase()}.`)
      onChanged?.(updated)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(null)
    }
  }

  const approvePayment = async (payment) => {
    setBusy(`pay-${payment.id}`)
    try {
      await api.patch(`/payments/${payment.id}`, { status: 'APPROVED' })
      toast.success('Cobro aprobado.')
      const updated = await reload()
      onChanged?.(updated)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(null)
    }
  }

  const next = order?.nextStatuses?.filter((s) => s !== 'CANCELLED') || []
  const primaryNext = next[0]
  const canUpdate = access.can('ORDER_UPDATE')
  const canCancel = access.can('ORDER_CANCEL') && order?.nextStatuses?.includes('CANCELLED')
  const outstanding = order ? Math.max(order.total - order.paidAmount, 0) : 0

  const footer = order && (canUpdate || canCancel) && order.nextStatuses.length > 0 ? (
    <div className="fx-row" style={{ flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8, width: '100%' }}>
      {canCancel && (
        <button type="button" className="fx-btn fx-btn--danger" onClick={() => setCancelling(true)} disabled={Boolean(busy)} style={{ marginRight: 'auto' }}>
          Cancelar pedido
        </button>
      )}
      {canUpdate && next.length > 1 && (
        <select
          className="fx-select"
          style={{ width: 'auto' }}
          value=""
          onChange={(e) => e.target.value && move(e.target.value)}
          disabled={Boolean(busy)}
          aria-label="Pasar a otro estado"
        >
          <option value="">Saltar a…</option>
          {next.slice(1).map((s) => <option key={s} value={s}>{ORDER_STATUS[s].label}</option>)}
        </select>
      )}
      {canUpdate && primaryNext && (
        <button type="button" className="fx-btn fx-btn--primary" onClick={() => move(primaryNext)} disabled={Boolean(busy)}>
          {busy === primaryNext ? <><span className="fx-spinner" /> Guardando…</> : <><Icon name="check" size={15} /> {ORDER_ACTION[primaryNext]}</>}
        </button>
      )}
    </div>
  ) : null

  return (
    <>
      <Modal
        title={`Pedido #${orderId}`}
        subtitle={order ? dateTime(order.createdAt) : undefined}
        onClose={onClose}
        width={720}
        footer={footer}
      >
        {error && <ErrorState error={error} onRetry={reload} />}
        {loading && !order && Array.from({ length: 5 }).map((_, i) => <div key={i} className="fx-skeleton" style={{ height: 30, marginBottom: 10 }} />)}

        {order && (
          <>
            <div className="fx-row fx-row--between" style={{ marginBottom: 12, flexWrap: 'wrap' }}>
              <div className="fx-row" style={{ gap: 6 }}>
                <Badge config={ORDER_STATUS[order.status]} fallback={order.status} />
                <Badge config={ORDER_PAYMENT_STATUS[order.paymentStatus]} fallback={order.paymentStatus} />
              </div>
              <span style={{ fontSize: 20, fontWeight: 700 }} className="fx-num">{money(order.total)}</span>
            </div>

            {order.status !== 'CANCELLED' && <Steps status={order.status} />}
            {order.status === 'CANCELLED' && (
              <div className="fx-alert fx-alert--error" style={{ marginBottom: 16 }}>
                <Icon name="close" size={16} />
                <span>Cancelado{order.cancelReason ? `: ${order.cancelReason}` : ''}</span>
              </div>
            )}

            <div className="fx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
              <section>
                <p className="fx-eyebrow" style={{ marginBottom: 8 }}>Cliente</p>
                <dl className="fx-deflist">
                  <div>
                    <dt>Nombre</dt>
                    <dd>
                      {order.customerId && access.can('CUSTOMER_VIEW')
                        ? <Link className="fx-link" to={`/dashboard/customers?customer=${order.customerId}`}>{order.customerName}</Link>
                        : order.customerName || '—'}
                    </dd>
                  </div>
                  <div><dt>Teléfono</dt><dd>{order.customerPhone || '—'}</dd></div>
                  {order.customerAddress && <div><dt>Dirección</dt><dd>{order.customerAddress}</dd></div>}
                </dl>
              </section>

              <section>
                <p className="fx-eyebrow" style={{ marginBottom: 8 }}>Cobro</p>
                <dl className="fx-deflist">
                  <div><dt>Medio elegido</dt><dd>{paymentMethodLabel(order.paymentMethod)}</dd></div>
                  <div><dt>Cobrado</dt><dd className="fx-num">{money(order.paidAmount)}</dd></div>
                  {order.status !== 'CANCELLED' && <div><dt>Por cobrar</dt><dd className="fx-num">{money(outstanding)}</dd></div>}
                </dl>
              </section>
            </div>

            <p className="fx-eyebrow" style={{ margin: '20px 0 8px' }}>Productos</p>
            <div className="fx-table-wrap" style={{ border: '1px solid var(--fx-line)', borderRadius: 'var(--fx-r)' }}>
              <table className="fx-table">
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={`${item.productId}-${i}`}>
                      <td className="fx-table__strong">{item.productName}</td>
                      <td className="fx-table__num">{item.quantity} × {money(item.unitPrice)}</td>
                      <td className="fx-table__num fx-table__strong">{money(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="fx-totals">
              <div><span>Subtotal</span><span className="fx-num">{money(order.subtotal)}</span></div>
              {order.discount > 0 && (
                <div><span>Descuento{order.couponCode ? ` (${order.couponCode})` : ''}</span><span className="fx-num">− {money(order.discount)}</span></div>
              )}
              <div className="is-total"><span>Total</span><span className="fx-num">{money(order.total)}</span></div>
            </div>

            {access.can('PAYMENT_VIEW') && (
              <>
                <div className="fx-row fx-row--between" style={{ margin: '22px 0 8px' }}>
                  <p className="fx-eyebrow">Pagos del pedido</p>
                  {access.can('PAYMENT_UPDATE') && order.status !== 'CANCELLED' && outstanding > 0.009 && (
                    <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" onClick={() => setPaying(true)}>
                      <Icon name="plus" size={14} /> Registrar cobro
                    </button>
                  )}
                </div>
                {order.payments.length === 0 ? (
                  <p className="fx-hint">No hay cobros registrados.</p>
                ) : (
                  <ul className="fx-list">
                    {order.payments.map((p) => (
                      <li key={p.id} className="fx-list__row" style={{ flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 160 }}>
                          <div style={{ fontSize: 13.5, color: 'var(--fx-ink)' }}>
                            {paymentMethodLabel(p.method)} · <span className="fx-num">{money(p.amount)}</span>
                            {p.refundedAmount > 0 && <span className="fx-hint"> (reembolsado {money(p.refundedAmount)})</span>}
                          </div>
                          <div className="fx-hint" style={{ fontSize: 12 }}>
                            {dateTime(p.createdAt)}{p.providerReference ? ` · Ref. ${p.providerReference}` : ''}
                          </div>
                        </div>
                        <Badge config={PAYMENT_STATUS[p.status]} fallback={p.status} />
                        {p.status === 'PENDING' && access.can('PAYMENT_UPDATE') && order.status !== 'CANCELLED' && (
                          <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={() => approvePayment(p)} disabled={Boolean(busy)}>
                            {busy === `pay-${p.id}` ? <span className="fx-spinner" /> : 'Confirmar cobro'}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            <p className="fx-eyebrow" style={{ margin: '22px 0 10px' }}>Historial</p>
            <ol className="fx-timeline">
              {order.history.map((h, i) => (
                <li key={i}>
                  <div className="fx-timeline__title">
                    {h.fromStatus ? `${ORDER_STATUS[h.fromStatus]?.label || h.fromStatus} → ${ORDER_STATUS[h.toStatus]?.label || h.toStatus}` : 'Pedido recibido'}
                  </div>
                  <div className="fx-timeline__meta">
                    {dateTime(h.changedAt)}{h.changedBy ? ` · ${h.changedBy}` : ''}{h.note ? ` · ${h.note}` : ''}
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}
      </Modal>

      {cancelling && (
        <Modal
          title={`Cancelar pedido #${orderId}`}
          onClose={() => setCancelling(false)}
          width={460}
          footer={(
            <>
              <button type="button" className="fx-btn fx-btn--ghost" onClick={() => setCancelling(false)}>Volver</button>
              <button
                type="button"
                className="fx-btn fx-btn--danger"
                disabled={busy === 'CANCELLED' || (reason === 'other' && !otherReason.trim())}
                onClick={() => move('CANCELLED', reason === 'other' ? otherReason.trim() : reason)}
              >
                {busy === 'CANCELLED' ? <><span className="fx-spinner" /> Cancelando…</> : 'Cancelar pedido'}
              </button>
            </>
          )}
        >
          <p className="fx-hint" style={{ marginBottom: 14 }}>
            Los productos vuelven al stock y los cobros pendientes se marcan como rechazados.
            {order?.paidAmount > 0 && ' Este pedido tiene cobros aprobados: quedará en Pagos para reembolsar.'}
          </p>
          <div className="fx-field">
            <label className="fx-label" htmlFor="cancel-reason">Motivo</label>
            <select id="cancel-reason" className="fx-select" value={reason} onChange={(e) => setReason(e.target.value)}>
              {CANCEL_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              <option value="other">Otro motivo</option>
            </select>
          </div>
          {reason === 'other' && (
            <div className="fx-field" style={{ marginBottom: 0 }}>
              <input className="fx-input" autoFocus maxLength={300} placeholder="Contá brevemente qué pasó" value={otherReason} onChange={(e) => setOtherReason(e.target.value)} />
            </div>
          )}
        </Modal>
      )}

      {paying && order && (
        <PaymentForm
          orderId={order.id}
          outstanding={outstanding}
          defaultMethod={order.paymentMethod}
          onClose={() => setPaying(false)}
          onSaved={async () => {
            setPaying(false)
            const updated = await reload()
            onChanged?.(updated)
          }}
        />
      )}
    </>
  )
}
