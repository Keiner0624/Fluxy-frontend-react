// src/modules/dashboard/pages/SettingsPage.jsx
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import usePlan from '@/hooks/usePlan'
import { API_URL, getCompanyStoreUrl } from '@/app/config'
import { useCurrency } from '@/hooks/useCurrency'
import Icon from '@/components/Icon'
import { getMyCompany, invalidateAccount } from '@/app/account'
import { uploadImage } from '@/app/cloudinary'
import { api } from '@/app/api'
import { dateTime } from '@/app/format'
import { ConfirmDialog } from '@/modules/dashboard/components/ui'


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
const DOMAIN_STATUS = {
  ACTIVE:                { badge: 'fx-badge--ok',     icon: 'checkCircle' },
  PENDING_DNS:           { badge: 'fx-badge--warn',   icon: 'clock' },
  VERIFICATION_REQUIRED: { badge: 'fx-badge--warn',   icon: 'shield' },
  ERROR:                 { badge: 'fx-badge--danger', icon: 'alert' },
}

function CopyValue({ value }) {
  const [copied, setCopied] = useState(false)
  return (
    <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" aria-label={`Copiar ${value}`}
      onClick={() => { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500) }}>
      <Icon name={copied ? 'check' : 'copy'} size={14} />
    </button>
  )
}

/** Guarda el dominio activo en la empresa del navegador: los enlaces para compartir lo usan. */
function rememberStoreDomain(domain) {
  try {
    const cached = JSON.parse(localStorage.getItem('company') || '{}') || {}
    const next = { ...cached, storeDomain: domain || '' }
    localStorage.setItem('company', JSON.stringify({ ...next, storeUrl: getCompanyStoreUrl(next) }))
  } catch { /* sin almacenamiento: se actualiza al volver a entrar */ }
  invalidateAccount()
}

function CustomDomainSection({ plan }) {
  const navigate = useNavigate()
  const [view, setView]         = useState(null)
  const [input, setInput]       = useState('')
  const [busy, setBusy]         = useState('')
  const [error, setError]       = useState('')
  const [confirming, setConfirming] = useState(false)
  const isBusiness = plan === 'BUSINESS'

  const apply = (next) => {
    setView(next)
    rememberStoreDomain(next?.status === 'ACTIVE' && next.planIncludes ? next.domain : '')
  }

  const run = async (kind, action) => {
    setBusy(kind); setError('')
    try { await action() } catch (err) { setError(err.message) } finally { setBusy('') }
  }

  useEffect(() => {
    let alive = true
    api.get('/domains').then((next) => { if (alive) apply(next) }).catch(() => { if (alive) setView({ status: 'NONE' }) })
    return () => { alive = false }
  }, [])

  const connect = () => run('connect', async () => {
    apply(await api.post('/domains', { domain: input.trim() }))
    setInput('')
  })
  const verify = () => run('verify', async () => apply(await api.post('/domains/verify')))
  const remove = () => run('remove', async () => {
    await api.del('/domains')
    setConfirming(false)
    apply({ status: 'NONE', planIncludes: isBusiness, available: view?.available })
  })

  const hasDomain = view && view.status !== 'NONE' && view.domain
  const status = hasDomain ? DOMAIN_STATUS[view.status] || DOMAIN_STATUS.PENDING_DNS : null

  return (
    <div className="fx-card">
      <div className="fx-card__head">
        <h2 className="fx-h3">Dominio personalizado</h2>
        {!isBusiness && <span className="fx-badge">Business</span>}
      </div>

      <div className="fx-card__body">
        {error && (
          <div className="fx-alert fx-alert--error" style={{ marginBottom: 16 }}>
            <Icon name="alert" size={16} /><span>{error}</span>
          </div>
        )}

        {!view ? (
          <div className="fx-skeleton" style={{ height: 44 }} />
        ) : hasDomain ? (
          <>
            <div className="fx-row fx-row--between" style={{ flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600 }}>{view.domain}</p>
                <span className={`fx-badge ${status.badge}`} style={{ marginTop: 6 }}>
                  <Icon name={status.icon} size={12} /> {view.statusLabel}
                </span>
              </div>
              <div className="fx-row" style={{ gap: 8, flexWrap: 'wrap' }}>
                {view.status === 'ACTIVE' && view.planIncludes && (
                  <a href={view.url} target="_blank" rel="noreferrer" className="fx-btn fx-btn--secondary fx-btn--sm">
                    <Icon name="external" size={15} /> Abrir
                  </a>
                )}
                {view.status !== 'ACTIVE' && (
                  <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" onClick={verify} disabled={Boolean(busy)}>
                    {busy === 'verify' ? <span className="fx-spinner" /> : <Icon name="refresh" size={15} />} Verificar ahora
                  </button>
                )}
                <button type="button" className="fx-btn fx-btn--danger fx-btn--sm" onClick={() => setConfirming(true)} disabled={Boolean(busy)}>
                  <Icon name="trash" size={15} /> Quitar
                </button>
              </div>
            </div>

            {view.message && (
              <div className={`fx-alert ${view.status === 'ACTIVE' && view.planIncludes ? 'fx-alert--ok' : view.planIncludes ? '' : 'fx-alert--warn'}`}
                style={{ marginTop: 16 }}>
                <Icon name={view.status === 'ACTIVE' && view.planIncludes ? 'checkCircle' : 'info'} size={16} />
                <span>{view.message}</span>
              </div>
            )}

            {view.records?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <p className="fx-eyebrow" style={{ marginBottom: 8 }}>Registros DNS</p>
                <div className="fx-table-wrap" style={{ border: '1px solid var(--fx-line)', borderRadius: 'var(--fx-r)' }}>
                  <table className="fx-table">
                    <thead>
                      <tr><th>Tipo</th><th>Nombre</th><th>Valor</th><th className="fx-hide-sm">Para qué</th></tr>
                    </thead>
                    <tbody>
                      {view.records.map((r) => (
                        <tr key={`${r.type}-${r.name}-${r.value}`}>
                          <td className="fx-table__strong">{r.type}</td>
                          <td><code>{r.name}</code><CopyValue value={r.name} /></td>
                          <td style={{ wordBreak: 'break-all' }}><code>{r.value}</code><CopyValue value={r.value} /></td>
                          <td className="fx-hide-sm fx-hint" style={{ fontSize: 12.5 }}>{r.purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ol className="fx-hint" style={{ margin: '12px 0 0', paddingLeft: 18, fontSize: 13, display: 'grid', gap: 4 }}>
                  <li>Entrá a la empresa donde compraste el dominio (Punto.pe, GoDaddy, Namecheap, Cloudflare…) y buscá “DNS” o “Zona DNS”.</li>
                  <li>Agregá cada registro. Si ya hay un registro A para “@” o un CNAME para “www”, reemplazalo. Si no acepta “@”, dejá el nombre vacío.</li>
                  <li>Si usás Cloudflare, dejá la nube en gris (“Solo DNS”).</li>
                  <li>Volvé acá y tocá “Verificar ahora”. También lo revisamos solos cada 10 minutos.</li>
                </ol>
              </div>
            )}

            {view.checkedAt && (
              <p className="fx-hint" style={{ marginTop: 12, fontSize: 12 }}>Última revisión: {dateTime(view.checkedAt)}</p>
            )}
          </>
        ) : !isBusiness ? (
          <>
            <p className="fx-hint" style={{ marginBottom: 16 }}>
              Conectá tu propio dominio (por ejemplo <strong style={{ color: 'var(--fx-ink)' }}>mitienda.com</strong>) y
              mostrá tu tienda sin la marca de Fluxy.
            </p>
            <button type="button" className="fx-btn fx-btn--primary" onClick={() => navigate('/dashboard/plans')}>
              Ver plan Business
              <Icon name="arrowRight" size={15} />
            </button>
          </>
        ) : (
          <>
            <p className="fx-hint" style={{ marginBottom: 12 }}>
              Usá un dominio que ya compraste. Si escribís <strong style={{ color: 'var(--fx-ink)' }}>mitienda.com</strong>, también
              conectamos <strong style={{ color: 'var(--fx-ink)' }}>www.mitienda.com</strong>. Tu tienda sigue disponible en su dirección de Fluxy.
            </p>
            {view.available === false && (
              <div className="fx-alert fx-alert--warn" style={{ marginBottom: 12 }}>
                <Icon name="info" size={16} /><span>Conectar dominios no está disponible en este momento. Probá más tarde.</span>
              </div>
            )}
            <form className="fx-row" style={{ gap: 8 }} onSubmit={(e) => { e.preventDefault(); if (input.trim()) connect() }}>
              <input className="fx-input" placeholder="mitienda.com" value={input} aria-label="Dominio"
                onChange={(e) => setInput(e.target.value)} disabled={view.available === false} />
              <button type="submit" className="fx-btn fx-btn--primary" disabled={Boolean(busy) || !input.trim() || view.available === false}>
                {busy === 'connect' ? <><span className="fx-spinner" /> Conectando…</> : 'Conectar'}
              </button>
            </form>
          </>
        )}
      </div>

      {confirming && (
        <ConfirmDialog title="Quitar el dominio" danger confirmLabel="Quitar dominio" busy={busy === 'remove'}
          text={`${view?.domain} deja de mostrar tu tienda. Tu tienda sigue disponible en su dirección de Fluxy y podés volver a conectarlo cuando quieras.`}
          onConfirm={remove} onClose={() => setConfirming(false)} />
      )}
    </div>
  )
}

// ─── SettingsPage ────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { plan } = usePlan()
  const { currencyInfo } = useCurrency()
  const PAYMENT_METHODS = getPaymentMethods(currencyInfo?.countryCode || 'PE')
  const [form, setForm] = useState({ name: '', description: '', aboutText: '', phone: '', address: '', email: '', logoUrl: '', paymentMethods: [] })
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
      const data = await getMyCompany()
      setForm({ name: data.name || '', description: data.description || '', aboutText: data.aboutText || '', phone: data.phone || '', address: data.address || '', email: data.email || '', logoUrl: data.logoUrl || '', paymentMethods: data.paymentMethods ? JSON.parse(data.paymentMethods) : [] })
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
        body: JSON.stringify({ name: form.name, description: form.description, aboutText: form.aboutText, phone: form.phone, address: form.address, email: form.email, logoUrl: form.logoUrl, paymentMethods: JSON.stringify(form.paymentMethods) }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const fields = data.errors ? Object.values(data.errors).join(' ') : ''
        throw new Error(data.message && !fields ? data.message : fields || `No se pudo guardar (${res.status}).`)
      }
      const updated = await res.json()
      const merged  = { ...company, name: updated.name, slug: updated.slug, logoUrl: updated.logoUrl }
      localStorage.setItem('company', JSON.stringify({ ...merged, storeUrl: getCompanyStoreUrl(merged) }))
      invalidateAccount('company')
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

      <div className="fx-card" style={{ marginBottom: 16 }}>
        <div className="fx-card__body">
          <h2 className="fx-h3">Perfil del negocio</h2>
          <p className="fx-hint">Rubro, RUC/DNI, ubicación, horarios, redes sociales y métodos de entrega.</p>
          <div className="fx-row" style={{ flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
            <Link to="/dashboard/onboarding?details=1" className="fx-btn fx-btn--secondary">Editar datos del negocio</Link>
            <Link to="/dashboard/onboarding" className="fx-btn fx-btn--ghost">Retomar configuración inicial</Link>
          </div>
        </div>
      </div>

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
              <input id="s-name" className="fx-input" maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            <div className="fx-field">
              <label className="fx-label" htmlFor="s-desc">Descripción de la portada</label>
              <textarea id="s-desc" className="fx-textarea" maxLength={2000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Contá brevemente qué vendés" />
              <p className="fx-hint" style={{ marginTop: 6, textAlign: 'right' }}>{(form.description || '').length} / 2000 · Se muestra en la portada de tu tienda.</p>
            </div>

            <div className="fx-field">
              <label className="fx-label" htmlFor="s-about">Sobre nosotros</label>
              <textarea id="s-about" className="fx-textarea" rows={5} maxLength={2000} value={form.aboutText}
                onChange={(e) => setForm({ ...form, aboutText: e.target.value })}
                placeholder="Tu historia: desde cuándo atendés, qué te diferencia, cómo trabajás con tus clientes…" />
              <p className="fx-hint" style={{ marginTop: 6, textAlign: 'right' }}>
                {(form.aboutText || '').length} / 2000 · Se muestra en la sección Nosotros. Si lo dejás vacío, usamos un texto breve.
              </p>
            </div>

            <div className="fx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: 12 }}>
              <div className="fx-field">
                <label className="fx-label" htmlFor="s-phone">WhatsApp</label>
                <input id="s-phone" className="fx-input" maxLength={30} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="999888777" />
              </div>
              <div className="fx-field">
                <label className="fx-label" htmlFor="s-email">Correo de contacto</label>
                <input id="s-email" className="fx-input" type="email" maxLength={254} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div className="fx-field" style={{ marginBottom: 0 }}>
              <label className="fx-label" htmlFor="s-addr">Dirección</label>
              <input id="s-addr" className="fx-input" maxLength={300} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Opcional" />
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

