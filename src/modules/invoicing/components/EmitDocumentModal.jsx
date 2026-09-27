// src/modules/invoicing/components/EmitDocumentModal.jsx
// Emitir boleta o factura de un pedido. Toma los datos que dejó el cliente al comprar; el
// servidor vuelve a validar todo y decide el número.
import { useRef, useState } from 'react'
import Icon from '@/components/Icon'
import { Modal } from '@/modules/dashboard/components/ui'
import { newIdempotencyKey } from '@/app/session'
import { createDocument } from '../api/invoicingApi'
import { BOLETA_ID_THRESHOLD, ID_TYPES, formatAmount, receiverErrors } from '../lib/invoicingFormat'

function initial(order, type) {
  const req = order.invoiceRequest
  const same = req?.type === type
  return {
    documentType: same ? req.documentType : type === 'FACTURA' ? 'RUC' : (req?.documentType && req.documentType !== 'RUC' ? req.documentType : 'DNI'),
    documentNumber: same ? req.documentNumber || '' : '',
    name: same ? req.legalName || '' : type === 'BOLETA' ? order.customerName || '' : '',
    address: same ? req.fiscalAddress || '' : '',
    email: req?.email || '',
  }
}

export default function EmitDocumentModal({ order, status, onClose, onEmitted }) {
  const requested = order.invoiceRequest?.type
  const [type, setType] = useState(requested === 'FACTURA' && status?.canIssueInvoice ? 'FACTURA' : 'BOLETA')
  const [form, setForm] = useState(() => initial(order, requested === 'FACTURA' && status?.canIssueInvoice ? 'FACTURA' : 'BOLETA'))
  const [errors, setErrors] = useState({})
  const [failure, setFailure] = useState('')
  const [saving, setSaving] = useState(false)
  const key = useRef(newIdempotencyKey('comprobante'))

  const changeType = (next) => {
    setType(next)
    setForm(initial(order, next))
    setErrors({})
    key.current = newIdempotencyKey('comprobante')
  }
  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((x) => ({ ...x, [field]: undefined }))
  }

  const submit = async (e) => {
    e.preventDefault()
    const found = receiverErrors(type, form, order.total)
    setErrors(found)
    if (Object.keys(found).length) return
    setSaving(true)
    setFailure('')
    try {
      const noDocument = type === 'BOLETA' && (!form.documentNumber.trim() || form.documentType === 'NINGUNO')
      const doc = await createDocument({
        orderId: order.id,
        type,
        customerDocumentType: noDocument ? 'NINGUNO' : form.documentType,
        customerDocumentNumber: noDocument ? null : form.documentNumber.trim(),
        customerName: form.name.trim() || null,
        customerAddress: form.address.trim() || null,
        customerEmail: form.email.trim() || null,
      }, key.current)
      onEmitted(doc)
    } catch (error) {
      setFailure(error.message)
    } finally {
      setSaving(false)
    }
  }

  const needsId = type === 'BOLETA' && Number(order.total) >= BOLETA_ID_THRESHOLD

  return (
    <Modal
      as="form"
      onSubmit={submit}
      title={`Emitir comprobante · Pedido #${order.id}`}
      subtitle={`Total ${formatAmount(order.total)}`}
      onClose={onClose}
      width={520}
      footer={(
        <>
          <button type="button" className="fx-btn fx-btn--ghost" onClick={onClose} disabled={saving}>Cancelar</button>
          <button type="submit" className="fx-btn fx-btn--primary" disabled={saving}>
            {saving ? <><span className="fx-spinner" /> Emitiendo…</> : <><Icon name="receipt" size={15} /> Emitir {type === 'FACTURA' ? 'factura' : 'boleta'}</>}
          </button>
        </>
      )}
    >
      {status?.environment === 'TEST' && (
        <div className="fx-alert fx-alert--warn" style={{ marginBottom: 14 }}>
          <Icon name="info" size={16} /><span>Modo de prueba: el comprobante no se envía a SUNAT ni tiene valor tributario.</span>
        </div>
      )}
      {requested && (
        <p className="fx-hint" style={{ marginBottom: 12 }}>
          El cliente pidió {requested === 'FACTURA' ? 'factura' : 'boleta'} al comprar{order.invoiceRequest.documentNumber ? ` (${order.invoiceRequest.documentNumber})` : ''}.
        </p>
      )}
      <div className="fx-roles" role="radiogroup" style={{ marginBottom: 16 }}>
        {['BOLETA', 'FACTURA'].map((t) => {
          const disabled = t === 'FACTURA' ? !status?.canIssueInvoice : !status?.canIssueReceipt
          return (
            <button key={t} type="button" role="radio" aria-checked={type === t} className={`fx-role${type === t ? ' is-on' : ''}`}
              disabled={disabled} style={disabled ? { opacity: .5, cursor: 'not-allowed' } : undefined} onClick={() => !disabled && changeType(t)}>
              <strong>{t === 'BOLETA' ? 'Boleta' : 'Factura'}</strong>
              <span>{t === 'BOLETA' ? 'Para consumidores finales.' : disabled ? 'Tu perfil fiscal no permite facturas.' : 'Para empresas con RUC.'}</span>
            </button>
          )
        })}
      </div>

      {type === 'BOLETA' ? (
        <div className="fx-grid" style={{ gridTemplateColumns: '150px 1fr', gap: 12 }}>
          <div className="fx-field">
            <label className="fx-label" htmlFor="em-doctype">Documento</label>
            <select id="em-doctype" className="fx-select" value={form.documentType} onChange={set('documentType')}>
              {['DNI', 'CARNET_EXTRANJERIA', 'PASAPORTE', 'RUC', ...(needsId ? [] : ['NINGUNO'])].map((k) => <option key={k} value={k}>{ID_TYPES[k]}</option>)}
            </select>
          </div>
          <div className="fx-field">
            <label className="fx-label" htmlFor="em-docnum">Número {needsId ? '' : '(opcional)'}</label>
            <input id="em-docnum" className={`fx-input${errors.documentNumber ? ' fx-input--error' : ''}`} value={form.documentNumber}
              onChange={set('documentNumber')} disabled={form.documentType === 'NINGUNO'} inputMode="numeric" maxLength={15} />
            {errors.documentNumber && <p className="fx-hint" style={{ color: 'var(--fx-danger)', marginTop: 4 }}>{errors.documentNumber}</p>}
          </div>
        </div>
      ) : (
        <div className="fx-field">
          <label className="fx-label" htmlFor="em-ruc">RUC</label>
          <input id="em-ruc" className={`fx-input${errors.documentNumber ? ' fx-input--error' : ''}`} value={form.documentNumber}
            onChange={set('documentNumber')} inputMode="numeric" maxLength={11} placeholder="20XXXXXXXXX" />
          {errors.documentNumber && <p className="fx-hint" style={{ color: 'var(--fx-danger)', marginTop: 4 }}>{errors.documentNumber}</p>}
        </div>
      )}
      <div className="fx-field">
        <label className="fx-label" htmlFor="em-name">{type === 'FACTURA' ? 'Razón social' : 'Nombre del cliente'}</label>
        <input id="em-name" className={`fx-input${errors.name ? ' fx-input--error' : ''}`} value={form.name} onChange={set('name')} maxLength={200}
          placeholder={type === 'BOLETA' ? 'Vacío = "Clientes varios"' : ''} />
        {errors.name && <p className="fx-hint" style={{ color: 'var(--fx-danger)', marginTop: 4 }}>{errors.name}</p>}
      </div>
      {type === 'FACTURA' && (
        <div className="fx-field">
          <label className="fx-label" htmlFor="em-address">Dirección fiscal</label>
          <input id="em-address" className="fx-input" value={form.address} onChange={set('address')} maxLength={300} />
        </div>
      )}
      <div className="fx-field">
        <label className="fx-label" htmlFor="em-email">Correo para enviarlo (opcional)</label>
        <input id="em-email" type="email" className={`fx-input${errors.email ? ' fx-input--error' : ''}`} value={form.email} onChange={set('email')} maxLength={150} />
        {errors.email && <p className="fx-hint" style={{ color: 'var(--fx-danger)', marginTop: 4 }}>{errors.email}</p>}
      </div>
      {failure && <div className="fx-alert fx-alert--error"><Icon name="alert" size={16} /><span>{failure}</span></div>}
    </Modal>
  )
}
