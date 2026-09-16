// src/modules/landing/pages/ComplaintsPage.jsx
// Libro de Reclamaciones virtual de Fluxy (sobre el servicio de Fluxy, no sobre las tiendas).
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '@/app/config'
import BrandLogo from '@/components/BrandLogo'
import Icon from '@/components/Icon'
import { CURRENT_PROVIDER, legalUrl } from '../legal/documents'
import '../legal/legal.css'

const EMPTY = {
  type: 'RECLAMO', consumerName: '', documentType: 'DNI', documentNumber: '', address: '', phone: '', email: '',
  minor: false, guardianName: '', itemType: 'SERVICIO', itemDescription: '', amount: '', detail: '', consumerRequest: '',
  accepted: false,
}

const LABELS = {
  consumerName: 'Nombre completo', documentNumber: 'Número de documento', address: 'Domicilio', email: 'Correo electrónico',
  guardianName: 'Padre, madre o apoderado', itemDescription: 'Descripción', amount: 'Monto reclamado', detail: 'Detalle',
  consumerRequest: 'Pedido', phone: 'Teléfono',
}

const longDate = (value) => new Date(`${value}T12:00:00`).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })

function Field({ id, label, error, hint, children }) {
  return (
    <div className="fx-field">
      <label className="fx-label" htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <p className="fx-hint" style={{ marginTop: 6 }}>{hint}</p>}
      {error && <p className="fx-field__error" role="alert">{error}</p>}
    </div>
  )
}

export default function ComplaintsPage() {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [provider, setProvider] = useState({ name: CURRENT_PROVIDER.name, taxId: CURRENT_PROVIDER.taxId, address: CURRENT_PROVIDER.address })
  const today = new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })

  useEffect(() => {
    let vigente = true
    fetch(`${API_URL}/complaints/provider`).then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (vigente && data?.name) setProvider(data) })
      .catch(() => {})
    return () => { vigente = false }
  }, [])

  const set = (key) => ({ target }) => {
    setForm((f) => ({ ...f, [key]: target.type === 'checkbox' ? target.checked : target.value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
    setError('')
  }

  const validate = () => {
    const next = {}
    for (const key of ['consumerName', 'documentNumber', 'address', 'email', 'itemDescription', 'detail', 'consumerRequest']) {
      if (!String(form[key]).trim()) next[key] = 'Completá este dato.'
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Revisá el correo: ahí te llega la copia y la respuesta.'
    if (form.documentNumber && !/^[A-Za-z0-9-]+$/.test(form.documentNumber.trim())) next.documentNumber = 'Solo letras, números y guiones.'
    if (form.documentType === 'DNI' && form.documentNumber && !/^\d{8}$/.test(form.documentNumber.trim())) next.documentNumber = 'El DNI tiene 8 dígitos.'
    if (form.minor && !form.guardianName.trim()) next.guardianName = 'Indicá el nombre de tu padre, madre o apoderado.'
    if (form.amount !== '' && !(Number(form.amount) >= 0)) next.amount = 'Ingresá un monto válido o dejalo vacío.'
    if (!form.accepted) next.accepted = 'Confirmá que los datos son verdaderos.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      setError('Revisá los datos marcados.')
      return
    }
    setSending(true)
    try {
      const res = await fetch(`${API_URL}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: form.amount === '' ? null : Number(form.amount) }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data.errors) setErrors(Object.fromEntries(Object.entries(data.errors).map(([k, v]) => [k, `${LABELS[k] || k}: ${v}`])))
        throw new Error(data.message || 'No se pudo registrar la hoja. Intentá de nuevo.')
      }
      setReceipt({ ...data, form })
      window.scrollTo({ top: 0 })
    } catch (err) {
      setError(err instanceof TypeError ? 'No se pudo conectar con el servidor. Revisá tu conexión.' : err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fx fx-legal">
      <header className="fx-legal__nav">
        <div className="fx-legal__nav-inner">
          <Link to="/"><BrandLogo size={28} textSize={18} textColor="var(--fx-ink)" /></Link>
          <Link to="/" className="fx-btn fx-btn--ghost fx-btn--sm"><Icon name="arrowLeft" size={15} /> Volver al inicio</Link>
        </div>
      </header>

      <main className="fx-legal__shell fx-complaints">
        <div className="fx-legal__header">
          <span className="fx-eyebrow">Atención al consumidor</span>
          <h1 className="fx-legal__title"><Icon name="book" size={30} /> Libro de Reclamaciones</h1>
          <p className="fx-hint">Conforme al Código de Protección y Defensa del Consumidor. La hoja queda registrada y te enviamos una copia por correo.</p>
        </div>

        <section className="fx-complaints__provider" aria-label="Datos del proveedor">
          <div><span>Proveedor</span><strong>{provider.name}</strong></div>
          <div><span>RUC</span><strong>{provider.taxId || 'En trámite'}</strong></div>
          {provider.address && <div><span>Domicilio</span><strong>{provider.address}</strong></div>}
          <div><span>Fecha</span><strong>{today}</strong></div>
        </section>

        {receipt ? (
          <section className="fx-legal__doc fx-complaints__receipt" aria-live="polite">
            <div className="fx-auth__mark fx-auth__mark--ok"><Icon name="checkCircle" size={22} /></div>
            <h2>Registramos tu {receipt.type === 'RECLAMO' ? 'reclamo' : 'queja'}</h2>
            <p>Código de la hoja: <strong className="fx-complaints__code">{receipt.code}</strong></p>
            <p>
              Enviamos una copia a <strong>{receipt.email}</strong>. Te responderemos a ese correo a más tardar el{' '}
              <strong>{longDate(receipt.dueDate)}</strong>. Guardá el código para cualquier consulta.
            </p>
            <dl className="fx-kv" style={{ marginTop: 16 }}>
              <dt>Consumidor</dt><dd>{receipt.form.consumerName}</dd>
              <dt>Documento</dt><dd>{receipt.form.documentType} {receipt.form.documentNumber}</dd>
              <dt>{receipt.form.itemType === 'PRODUCTO' ? 'Producto' : 'Servicio'}</dt><dd>{receipt.form.itemDescription}</dd>
              <dt>Detalle</dt><dd style={{ whiteSpace: 'pre-line' }}>{receipt.form.detail}</dd>
              <dt>Pedido</dt><dd style={{ whiteSpace: 'pre-line' }}>{receipt.form.consumerRequest}</dd>
            </dl>
            <div className="fx-row" style={{ flexWrap: 'wrap', gap: 8, marginTop: 20 }}>
              <button type="button" className="fx-btn fx-btn--secondary" onClick={() => window.print()}><Icon name="download" size={15} /> Imprimir o guardar</button>
              <Link to="/" className="fx-btn fx-btn--primary">Volver al inicio</Link>
            </div>
          </section>
        ) : (
          <form className="fx-legal__doc" onSubmit={submit} noValidate aria-busy={sending}>
            <div className="fx-alert fx-alert--warn" role="note" style={{ marginBottom: 22 }}>
              <Icon name="info" size={16} />
              <span>
                Este libro es para el servicio de Fluxy. Si tu reclamo es por un producto comprado en una tienda, escribile a esa tienda:
                cada comercio atiende sus propias ventas.
              </span>
            </div>

            <h2>1. Tus datos</h2>
            <Field id="lr-name" label="Nombre completo" error={errors.consumerName}>
              <input id="lr-name" className="fx-input" autoComplete="name" maxLength={150} value={form.consumerName} onChange={set('consumerName')} />
            </Field>
            <div className="fx-grid fx-complaints__two">
              <Field id="lr-doctype" label="Documento">
                <select id="lr-doctype" className="fx-select" value={form.documentType} onChange={set('documentType')}>
                  <option value="DNI">DNI</option>
                  <option value="CE">Carné de extranjería</option>
                  <option value="PASAPORTE">Pasaporte</option>
                  <option value="RUC">RUC</option>
                </select>
              </Field>
              <Field id="lr-doc" label="Número" error={errors.documentNumber}>
                <input id="lr-doc" className="fx-input" inputMode={form.documentType === 'DNI' || form.documentType === 'RUC' ? 'numeric' : 'text'}
                  maxLength={20} value={form.documentNumber} onChange={set('documentNumber')} />
              </Field>
            </div>
            <Field id="lr-address" label="Domicilio" error={errors.address}>
              <input id="lr-address" className="fx-input" autoComplete="street-address" maxLength={300} value={form.address} onChange={set('address')} />
            </Field>
            <div className="fx-grid fx-complaints__two">
              <Field id="lr-email" label="Correo electrónico" error={errors.email} hint="Ahí te llega la copia y la respuesta.">
                <input id="lr-email" className="fx-input" type="email" autoComplete="email" maxLength={254} value={form.email} onChange={set('email')} />
              </Field>
              <Field id="lr-phone" label="Teléfono (opcional)">
                <input id="lr-phone" className="fx-input" type="tel" autoComplete="tel" maxLength={30} value={form.phone} onChange={set('phone')} />
              </Field>
            </div>
            <label className="fx-check" style={{ marginBottom: 14 }}>
              <input type="checkbox" checked={form.minor} onChange={set('minor')} />
              <span>Soy menor de edad</span>
            </label>
            {form.minor && (
              <Field id="lr-guardian" label="Nombre del padre, madre o apoderado" error={errors.guardianName}>
                <input id="lr-guardian" className="fx-input" maxLength={150} value={form.guardianName} onChange={set('guardianName')} />
              </Field>
            )}

            <h2>2. Producto o servicio contratado</h2>
            <div className="fx-grid fx-complaints__two">
              <Field id="lr-itemtype" label="Tipo">
                <select id="lr-itemtype" className="fx-select" value={form.itemType} onChange={set('itemType')}>
                  <option value="SERVICIO">Servicio</option>
                  <option value="PRODUCTO">Producto</option>
                </select>
              </Field>
              <Field id="lr-amount" label="Monto reclamado en S/ (opcional)" error={errors.amount}>
                <input id="lr-amount" className="fx-input" type="number" min="0" step="0.01" inputMode="decimal" value={form.amount} onChange={set('amount')} />
              </Field>
            </div>
            <Field id="lr-item" label="Descripción" error={errors.itemDescription} hint="Por ejemplo: plan PRO mensual, pago del 10 de septiembre.">
              <input id="lr-item" className="fx-input" maxLength={300} value={form.itemDescription} onChange={set('itemDescription')} />
            </Field>

            <h2>3. Detalle</h2>
            <fieldset className="fx-complaints__types">
              <legend className="fx-label">¿Qué querés registrar?</legend>
              {[
                ['RECLAMO', 'Reclamo', 'Disconformidad con el servicio o producto contratado.'],
                ['QUEJA', 'Queja', 'Malestar con la atención recibida, sin relación directa con el servicio.'],
              ].map(([value, title, text]) => (
                <label key={value} className={`fx-complaints__type${form.type === value ? ' is-on' : ''}`}>
                  <input type="radio" name="type" value={value} checked={form.type === value} onChange={set('type')} />
                  <span><strong>{title}</strong><small>{text}</small></span>
                </label>
              ))}
            </fieldset>
            <Field id="lr-detail" label="Detalle" error={errors.detail} hint="Contá qué pasó, con fechas si las tenés.">
              <textarea id="lr-detail" className="fx-textarea" rows={5} maxLength={3000} value={form.detail} onChange={set('detail')} />
            </Field>
            <Field id="lr-request" label="¿Qué pedís?" error={errors.consumerRequest}>
              <textarea id="lr-request" className="fx-textarea" rows={3} maxLength={1500} value={form.consumerRequest} onChange={set('consumerRequest')} />
            </Field>

            <label className="fx-check fx-complaints__consent" htmlFor="lr-accepted">
              <input id="lr-accepted" type="checkbox" checked={form.accepted} onChange={set('accepted')} />
              <span>
                Declaro que los datos son verdaderos. Serán tratados para atender esta hoja según la{' '}
                <Link to={legalUrl('privacy')} target="_blank" rel="noopener">Política de privacidad</Link>.
              </span>
            </label>
            {errors.accepted && <p className="fx-field__error" role="alert" style={{ marginTop: -10 }}>{errors.accepted}</p>}

            {error && <div className="fx-alert fx-alert--error" role="alert" style={{ margin: '14px 0' }}><Icon name="alert" size={16} /><span>{error}</span></div>}

            <p className="fx-hint" style={{ margin: '14px 0' }}>
              La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para
              interponer una denuncia ante el INDECOPI. El proveedor responde en un plazo no mayor al establecido por ley.
            </p>

            <button type="submit" className="fx-btn fx-btn--primary fx-btn--lg fx-btn--block" disabled={sending}>
              {sending ? <><span className="fx-spinner" /> Registrando…</> : 'Registrar hoja de reclamación'}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
