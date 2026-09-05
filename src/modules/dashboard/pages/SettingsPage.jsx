// src/modules/dashboard/pages/SettingsPage.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import usePlan from '@/hooks/usePlan'
import { API_URL, getCompanyStoreUrl } from '@/app/config'
import { useCurrency } from '@/hooks/useCurrency'
import Icon from '@/components/Icon'
import { uploadImage } from '@/app/cloudinary'


function getToken() { return localStorage.getItem('token') || '' }

const PAYMENT_METHODS_BY_COUNTRY = {
  PE: [
    { key: 'efectivo',      label: 'Efectivo',      emoji: '💵' },
    { key: 'yape',          label: 'Yape',           emoji: '📱' },
    { key: 'plin',          label: 'Plin',           emoji: '🏦' },
    { key: 'tarjeta',       label: 'Tarjeta',        emoji: '💳' },
    { key: 'transferencia', label: 'Transferencia',  emoji: '🏧' },
  ],
  CO: [
    { key: 'efectivo',      label: 'Efectivo',      emoji: '💵' },
    { key: 'nequi',         label: 'Nequi',          emoji: '📱' },
    { key: 'daviplata',     label: 'Daviplata',      emoji: '🏦' },
    { key: 'pse',           label: 'PSE',            emoji: '🔐' },
    { key: 'tarjeta',       label: 'Tarjeta',        emoji: '💳' },
    { key: 'transferencia', label: 'Transferencia',  emoji: '🏧' },
  ],
  MX: [
    { key: 'efectivo',      label: 'Efectivo',      emoji: '💵' },
    { key: 'oxxo',          label: 'OXXO',           emoji: '🏪' },
    { key: 'codi',          label: 'CoDi',           emoji: '📱' },
    { key: 'tarjeta',       label: 'Tarjeta',        emoji: '💳' },
    { key: 'transferencia', label: 'Transferencia',  emoji: '🏧' },
    { key: 'mercadopago',   label: 'Mercado Pago',   emoji: '💙' },
  ],
  AR: [
    { key: 'efectivo',      label: 'Efectivo',      emoji: '💵' },
    { key: 'mercadopago',   label: 'Mercado Pago',   emoji: '💙' },
    { key: 'modo',          label: 'MODO',           emoji: '📱' },
    { key: 'tarjeta',       label: 'Tarjeta',        emoji: '💳' },
    { key: 'transferencia', label: 'Transferencia',  emoji: '🏧' },
  ],
  CL: [
    { key: 'efectivo',      label: 'Efectivo',      emoji: '💵' },
    { key: 'webpay',        label: 'Webpay',         emoji: '💳' },
    { key: 'tarjeta',       label: 'Tarjeta',        emoji: '💳' },
    { key: 'transferencia', label: 'Transferencia',  emoji: '🏧' },
  ],
  BR: [
    { key: 'efectivo',      label: 'Dinheiro',      emoji: '💵' },
    { key: 'pix',           label: 'PIX',            emoji: '📱' },
    { key: 'boleto',        label: 'Boleto',         emoji: '📄' },
    { key: 'tarjeta',       label: 'Cartão',         emoji: '💳' },
    { key: 'transferencia', label: 'Transferência',  emoji: '🏧' },
  ],
  DEFAULT: [
    { key: 'efectivo',      label: 'Efectivo',      emoji: '💵' },
    { key: 'tarjeta',       label: 'Tarjeta',        emoji: '💳' },
    { key: 'transferencia', label: 'Transferencia',  emoji: '🏧' },
    { key: 'mercadopago',   label: 'Mercado Pago',   emoji: '💙' },
  ],
}

function getPaymentMethods(countryCode) {
  return PAYMENT_METHODS_BY_COUNTRY[countryCode] || PAYMENT_METHODS_BY_COUNTRY.DEFAULT
}


// ─── Dominio personalizado ───────────────────────────────────────────────────
function CustomDomainSection({ plan }) {
  const navigate = useNavigate()
  const [domain, setDomain]               = useState('')
  const [currentDomain, setCurrentDomain] = useState('')
  const [domainStatus, setDomainStatus]   = useState('none')
  const [saving, setSaving]               = useState(false)
  const [removing, setRemoving]           = useState(false)
  const [message, setMessage]             = useState(null)
  const [instructions, setInstructions]   = useState(null)
  const isBusiness = plan === 'BUSINESS'

  useEffect(() => { if (isBusiness) loadDomainStatus() }, [isBusiness])

  const loadDomainStatus = async () => {
    try {
      const res  = await fetch(`${API_URL}/domains/status`, { headers: { Authorization: `Bearer ${getToken()}` } })
      const data = await res.json()
      setCurrentDomain(data.domain || '')
      setDomainStatus(data.status || 'none')
    } catch { /* silencioso */ }
  }

  const handleAddDomain = async () => {
    if (!domain.trim()) return
    setSaving(true); setMessage(null)
    try {
      const res  = await fetch(`${API_URL}/domains/add`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ domain: domain.trim() }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al agregar dominio')
      setCurrentDomain(data.domain); setDomainStatus('pending'); setInstructions(data.instructions)
      setMessage({ type: 'ok', text: data.message }); setDomain('')
    } catch (err) { setMessage({ type: 'error', text: err.message }) }
    finally { setSaving(false) }
  }

  const handleRemoveDomain = async () => {
    setRemoving(true); setMessage(null)
    try {
      const res  = await fetch(`${API_URL}/domains/remove`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setCurrentDomain(''); setDomainStatus('none'); setInstructions(null)
      setMessage({ type: 'ok', text: 'Dominio eliminado.' })
    } catch (err) { setMessage({ type: 'error', text: err.message }) }
    finally { setRemoving(false) }
  }

  const STATUS = {
    verified: { label: 'Verificado', badge: 'fx-badge--ok',     icon: 'checkCircle' },
    pending:  { label: 'Pendiente',  badge: 'fx-badge--warn',   icon: 'clock' },
    error:    { label: 'Con error',  badge: 'fx-badge--danger', icon: 'alert' },
  }

  return (
    <div className="fx-card">
      <div className="fx-card__head">
        <h2 className="fx-h3">Dominio personalizado</h2>
        {!isBusiness && <span className="fx-badge">Business</span>}
      </div>

      <div className="fx-card__body">
        {!isBusiness ? (
          <>
            <p className="fx-hint" style={{ marginBottom: 16 }}>
              Conectá tu propio dominio (por ejemplo <strong style={{ color: 'var(--fx-ink)' }}>mitienda.com</strong>) y
              mostrá tu tienda sin la marca de Fluxy.
            </p>
            <button className="fx-btn fx-btn--primary" onClick={() => navigate('/dashboard/plans')}>
              Ver plan Business
              <Icon name="arrowRight" size={15} />
            </button>
          </>
        ) : (
          <>
            {message && (
              <div className={`fx-alert fx-alert--${message.type === 'ok' ? 'ok' : 'error'}`} style={{ marginBottom: 16 }}>
                <Icon name={message.type === 'ok' ? 'checkCircle' : 'alert'} size={16} />
                <span>{message.text}</span>
              </div>
            )}

            {currentDomain ? (
              <>
                <div className="fx-row fx-row--between" style={{ flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600 }}>{currentDomain}</p>
                    <span className={`fx-badge ${STATUS[domainStatus]?.badge || ''}`} style={{ marginTop: 6 }}>
                      <Icon name={STATUS[domainStatus]?.icon || 'info'} size={12} />
                      {STATUS[domainStatus]?.label || domainStatus}
                    </span>
                  </div>
                  <div className="fx-row" style={{ gap: 8 }}>
                    <button className="fx-btn fx-btn--secondary fx-btn--sm" onClick={loadDomainStatus}>
                      <Icon name="refresh" size={15} />
                      Verificar
                    </button>
                    <button className="fx-btn fx-btn--danger fx-btn--sm" onClick={handleRemoveDomain} disabled={removing}>
                      {removing ? <span className="fx-spinner" /> : <Icon name="trash" size={15} />}
                      Quitar
                    </button>
                  </div>
                </div>

                {(instructions || domainStatus === 'pending') && (
                  <div className="fx-alert" style={{ marginTop: 16, display: 'block' }}>
                    <p style={{ marginBottom: 8, fontWeight: 500 }}>Configurá estos registros en tu proveedor de DNS:</p>
                    {instructions ? (
                      <pre className="fx-pre">{typeof instructions === 'string' ? instructions : JSON.stringify(instructions, null, 2)}</pre>
                    ) : (
                      <p>Los cambios de DNS pueden tardar hasta 48 horas en propagarse.</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="fx-row" style={{ gap: 8 }}>
                <input
                  className="fx-input"
                  placeholder="mitienda.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddDomain() }}
                />
                <button className="fx-btn fx-btn--primary" onClick={handleAddDomain} disabled={saving || !domain.trim()}>
                  {saving ? <><span className="fx-spinner" /> Conectando…</> : 'Conectar'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── SettingsPage ────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { plan } = usePlan()
  const { currencyInfo } = useCurrency()
  const PAYMENT_METHODS = getPaymentMethods(currencyInfo?.countryCode || 'PE')
  const [form, setForm] = useState({ name: '', description: '', phone: '', address: '', email: '', logoUrl: '', paymentMethods: [] })
  const [loading, setLoading]             = useState(true)
  const [saving, setSaving]               = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoPreview, setLogoPreview]     = useState(null)
  const [success, setSuccess]             = useState('')
  const [error, setError]                 = useState('')
  const logoRef = useRef()

  const company  = JSON.parse(localStorage.getItem('company') || '{}') || {}
  const storeUrl = getCompanyStoreUrl(company)

  useEffect(() => { loadCompany() }, [])

  const loadCompany = async () => {
    setLoading(true)
    try {
      const res  = await fetch(`${API_URL}/companies/my-company`, { headers: { Authorization: `Bearer ${getToken()}` } })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setForm({ name: data.name || '', description: data.description || '', phone: data.phone || '', address: data.address || '', email: data.email || '', logoUrl: data.logoUrl || '', paymentMethods: data.paymentMethods ? JSON.parse(data.paymentMethods) : [] })
      setLogoPreview(data.logoUrl || null)
    } catch { setError('Error al cargar la configuración') }
    finally { setLoading(false) }
  }

  const handleLogoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogoPreview(URL.createObjectURL(file))
    setUploadingLogo(true); setError('')
    try { const url = await uploadImage(file); setForm(f => ({ ...f, logoUrl: url })) }
    catch (err) { setError('Error al subir el logo: ' + err.message) }
    finally { setUploadingLogo(false) }
  }

  const togglePayment = (key) => setForm(f => ({ ...f, paymentMethods: f.paymentMethods.includes(key) ? f.paymentMethods.filter(p => p !== key) : [...f.paymentMethods, key] }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return }
    setSaving(true); setError(''); setSuccess('')
    try {
      const res = await fetch(`${API_URL}/companies/config`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ name: form.name, description: form.description, phone: form.phone, address: form.address, email: form.email, logoUrl: form.logoUrl, paymentMethods: JSON.stringify(form.paymentMethods) }),
      })
      if (!res.ok) throw new Error(`Error al guardar (${res.status})`)
      const updated = await res.json()
      const merged  = { ...company, name: updated.name, slug: updated.slug, logoUrl: updated.logoUrl }
      localStorage.setItem('company', JSON.stringify({ ...merged, storeUrl: getCompanyStoreUrl(merged) }))
      setSuccess('Configuración guardada.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  return (
    <DashboardLayout>
      <div className="fx-page-head">
        <div>
          <h1>Configuración</h1>
          <p>Datos de tu negocio, logo y métodos de pago</p>
        </div>
        <div className="fx-page-head__actions">
          <button className="fx-btn fx-btn--primary" onClick={handleSubmit} disabled={saving || loading}>
            {saving ? <><span className="fx-spinner" /> Guardando…</> : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {success && (
        <div className="fx-alert fx-alert--ok" style={{ marginBottom: 16 }}>
          <Icon name="checkCircle" size={16} /><span>{success}</span>
        </div>
      )}
      {error && (
        <div className="fx-alert fx-alert--error" style={{ marginBottom: 16 }}>
          <Icon name="alert" size={16} /><span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="fx-grid" style={{ gap: 16 }}>
        <div className="fx-card">
          <div className="fx-card__head"><h2 className="fx-h3">Datos del negocio</h2></div>
          <div className="fx-card__body">
            <div className="fx-field">
              <span className="fx-label">Logo</span>
              <div className="fx-row" style={{ gap: 12 }}>
                <div className="fx-thumb fx-thumb--lg">
                  {logoPreview ? <img src={logoPreview} alt="" /> : <Icon name="building" size={20} />}
                </div>
                <div>
                  <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                  <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" onClick={() => logoRef.current?.click()} disabled={uploadingLogo}>
                    {uploadingLogo ? <><span className="fx-spinner" /> Subiendo…</> : <><Icon name="upload" size={15} /> {logoPreview ? 'Cambiar logo' : 'Subir logo'}</>}
                  </button>
                  <p className="fx-hint" style={{ marginTop: 6, fontSize: 12.5 }}>Se muestra en la cabecera de tu tienda.</p>
                </div>
              </div>
            </div>

            <div className="fx-field">
              <label className="fx-label" htmlFor="s-name">Nombre del negocio</label>
              <input id="s-name" className="fx-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            <div className="fx-field">
              <label className="fx-label" htmlFor="s-desc">Descripción</label>
              <textarea id="s-desc" className="fx-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Contá brevemente qué vendés" />
            </div>

            <div className="fx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div className="fx-field">
                <label className="fx-label" htmlFor="s-phone">WhatsApp</label>
                <input id="s-phone" className="fx-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="999888777" />
              </div>
              <div className="fx-field">
                <label className="fx-label" htmlFor="s-email">Correo de contacto</label>
                <input id="s-email" className="fx-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div className="fx-field" style={{ marginBottom: 0 }}>
              <label className="fx-label" htmlFor="s-addr">Dirección</label>
              <input id="s-addr" className="fx-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Opcional" />
            </div>
          </div>
        </div>

        <div className="fx-card">
          <div className="fx-card__head">
            <h2 className="fx-h3">Métodos de pago</h2>
            <span className="fx-hint" style={{ fontSize: 12.5 }}>Se muestran en el checkout</span>
          </div>
          <div className="fx-card__body">
            <div className="fx-checks">
              {PAYMENT_METHODS.map((pm) => (
                <label key={pm.key} className={`fx-choice${form.paymentMethods.includes(pm.key) ? ' is-on' : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.paymentMethods.includes(pm.key)}
                    onChange={() => togglePayment(pm.key)}
                  />
                  <span>{pm.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {storeUrl && (
          <div className="fx-card">
            <div className="fx-card__head"><h2 className="fx-h3">Enlace de tu tienda</h2></div>
            <div className="fx-card__body fx-row fx-row--between" style={{ flexWrap: 'wrap', gap: 12 }}>
              <span className="fx-truncate" style={{ fontSize: 14 }}>{storeUrl}</span>
              <div className="fx-row" style={{ gap: 8 }}>
                <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" onClick={() => navigator.clipboard?.writeText(storeUrl)}>
                  <Icon name="copy" size={15} />
                  Copiar
                </button>
                <a href={storeUrl} target="_blank" rel="noreferrer" className="fx-btn fx-btn--secondary fx-btn--sm">
                  <Icon name="external" size={15} />
                  Abrir
                </a>
              </div>
            </div>
          </div>
        )}

        <CustomDomainSection plan={plan} />
      </form>
    </DashboardLayout>
  )
}


