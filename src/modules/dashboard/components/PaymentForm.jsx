// src/modules/dashboard/components/PaymentForm.jsx
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '@/app/api'
import { newIdempotencyKey } from '@/app/session'
import { money, PAYMENT_METHODS } from '@/app/format'
import { Modal } from '@/modules/dashboard/components/ui'

/** Registrar un cobro sobre un pedido. outstanding es lo que falta cobrar. */
export default function PaymentForm({ orderId, outstanding, defaultMethod, onClose, onSaved }) {
  const [form, setForm] = useState({
    method: defaultMethod || 'efectivo',
    amount: outstanding > 0 ? outstanding.toFixed(2) : '',
    status: 'APPROVED',
    providerReference: '',
    note: '',
  })
  const [saving, setSaving] = useState(false)
  const paymentKey = useRef(newIdempotencyKey('cobro'))
  const [error, setError] = useState('')
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!Number.isFinite(amount) || amount <= 0) { setError('Ingresá un monto mayor que cero.'); return }
    setSaving(true)
    setError('')
    try {
      const payment = await api.post('/payments', {
        orderId,
        method: form.method,
        amount,
        status: form.status,
        provider: form.method === 'mercadopago' ? 'MERCADO_PAGO' : 'MANUAL',
        providerReference: form.providerReference,
        note: form.note,
      }, { idempotencyKey: paymentKey.current })
      toast.success(form.status === 'APPROVED' ? 'Cobro registrado.' : 'Cobro pendiente registrado.')
      onSaved(payment)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      as="form"
      onSubmit={submit}
      title={`Registrar cobro · Pedido #${orderId}`}
      subtitle={outstanding > 0 ? `Falta cobrar ${money(outstanding)}` : undefined}
      onClose={onClose}
      width={460}
      footer={(
        <>
          <button type="button" className="fx-btn fx-btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="fx-btn fx-btn--primary" disabled={saving}>
            {saving ? <><span className="fx-spinner" /> Guardando…</> : 'Registrar cobro'}
          </button>
        </>
      )}
    >
      <div className="fx-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="fx-field">
          <label className="fx-label" htmlFor="pay-method">Medio de pago</label>
          <select id="pay-method" className="fx-select" value={form.method} onChange={set('method')}>
            {Object.entries(PAYMENT_METHODS).slice(0, 6).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
        <div className="fx-field">
          <label className="fx-label" htmlFor="pay-amount">Monto (S/)</label>
          <input id="pay-amount" className="fx-input" type="number" min="0" step="0.01" value={form.amount} onChange={set('amount')} />
        </div>
      </div>
      <div className="fx-field">
        <label className="fx-label" htmlFor="pay-status">Estado</label>
        <select id="pay-status" className="fx-select" value={form.status} onChange={set('status')}>
          <option value="APPROVED">Cobrado (el dinero ya ingresó)</option>
          <option value="PENDING">Pendiente de confirmar</option>
        </select>
      </div>
      <div className="fx-field">
        <label className="fx-label" htmlFor="pay-ref">Referencia</label>
        <input id="pay-ref" className="fx-input" placeholder="N.º de operación, voucher o ID de Mercado Pago" value={form.providerReference} onChange={set('providerReference')} maxLength={120} />
        <p className="fx-hint" style={{ marginTop: 6, fontSize: 12.5 }}>Sirve para conciliar el cobro con tu estado de cuenta.</p>
      </div>
      <div className="fx-field" style={{ marginBottom: 0 }}>
        <label className="fx-label" htmlFor="pay-note">Nota</label>
        <input id="pay-note" className="fx-input" value={form.note} onChange={set('note')} maxLength={300} placeholder="Opcional" />
      </div>
      {error && <div className="fx-alert fx-alert--error" style={{ marginTop: 14 }}><span>{error}</span></div>}
    </Modal>
  )
}
