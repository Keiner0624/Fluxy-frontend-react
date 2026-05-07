// src/modules/dashboard/pages/SettingsPage.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import usePlan from '../../../hooks/usePlan'
import { API_URL, getCompanyStoreUrl } from '../../../app/config'

const CLOUDINARY_CLOUD  = 'dklhbrw7s'
const CLOUDINARY_PRESET = 'fluxy_unsigned'

function getToken() { return localStorage.getItem('token') || '' }

const PAYMENT_METHODS = [
  { key: 'efectivo',      label: 'Efectivo',      emoji: '💵' },
  { key: 'yape',          label: 'Yape',           emoji: '📱' },
  { key: 'plin',          label: 'Plin',           emoji: '🏦' },
  { key: 'tarjeta',       label: 'Tarjeta',        emoji: '💳' },
  { key: 'transferencia', label: 'Transferencia',  emoji: '🏧' },
]

async function uploadToCloudinary(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_PRESET)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: 'POST', body: formData })
  if (!res.ok) throw new Error('Error al subir imagen')
  return (await res.json()).secure_url
}

// ─── Vista previa de configuración ───────────────────────────────────────────
function SettingsPreview({ form, logoPreview }) {
  const primary = '#7c83fd'
  const accepted = PAYMENT_METHODS.filter(p => form.paymentMethods.includes(p.key))

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
      {/* Browser bar */}
      <div style={{ background: 'rgba(8,8,20,0.95)', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#f87171','#fbbf24','#34d399'].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }}/>)}
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 4, padding: '3px 8px', fontSize: 9, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
          fluxy.app/store/mi-tienda
        </div>
      </div>

      {/* Store header */}
      <div style={{ background: 'rgba(6,6,15,0.92)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {logoPreview ? (
            <img src={logoPreview} alt="logo" style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}/>
          ) : (
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${primary}, #4f46e5)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white' }}>
              {form.name?.[0]?.toUpperCase() || 'T'}
            </div>
          )}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{form.name || 'Tu negocio'}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>via Fluxy</div>
          </div>
        </div>
        <div style={{ background: primary, borderRadius: 8, padding: '4px 10px', fontSize: 9, fontWeight: 700, color: '#fff' }}>🛒 0</div>
      </div>

      {/* Hero info */}
      <div style={{ background: 'linear-gradient(135deg, #06060f, #1a0a2e)', padding: '20px 16px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: `${primary}18`, border: `1px solid ${primary}35`, borderRadius: 50, padding: '3px 10px', marginBottom: 10 }}>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: primary }}/>
          <span style={{ fontSize: 9, color: primary, fontWeight: 600 }}>Tienda oficial</span>
        </div>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 900, color: 'white', lineHeight: 1.2, marginBottom: 6 }}>
          Bienvenido a <span style={{ color: primary }}>{form.name || 'Tu Tienda'}</span>
        </h2>
        {form.description && (
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, marginBottom: 12 }}>
            {form.description.slice(0, 80)}{form.description.length > 80 ? '...' : ''}
          </p>
        )}

        {/* Info card */}
        <div style={{ background: 'rgba(13,13,26,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 14px', marginTop: 12 }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10, fontWeight: 700 }}>Información</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {form.phone && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(124,131,253,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>📞</div>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{form.phone}</span>
              </div>
            )}
            {form.address && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(124,131,253,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>📍</div>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{form.address.slice(0, 30)}{form.address.length > 30 ? '...' : ''}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(124,131,253,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>⚡</div>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Respuesta inmediata</span>
            </div>
          </div>

          {accepted.length > 0 && (
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, fontWeight: 700 }}>Pagos aceptados</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {accepted.map(p => (
                  <div key={p.key} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: '3px 8px', fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>
                    {p.emoji} {p.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ background: 'rgba(8,8,20,0.9)', padding: '7px 12px', textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
        Vista previa en tiempo real
      </div>
    </div>
  )
}

// ─── CustomDomainSection ──────────────────────────────────────────────────────
function CustomDomainSection({ plan }) {
  const navigate = useNavigate()
  const [domain, setDomain]               = useState('')
  const [currentDomain, setCurrentDomain] = useState('')
  const [domainStatus, setDomainStatus]   = useState('none')
  const [saving, setSaving]               = useState(false)
  const [removing, setRemoving]           = useState(false)
  const [message, setMessage]             = useState('')
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
    setSaving(true); setMessage('')
    try {
      const res  = await fetch(`${API_URL}/domains/add`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ domain: domain.trim() }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al agregar dominio')
      setCurrentDomain(data.domain); setDomainStatus('pending'); setInstructions(data.instructions); setMessage('✅ ' + data.message); setDomain('')
    } catch (err) { setMessage('⚠️ ' + err.message) }
    finally { setSaving(false) }
  }

  const handleRemoveDomain = async () => {
    setRemoving(true); setMessage('')
    try {
      const res  = await fetch(`${API_URL}/domains/remove`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setCurrentDomain(''); setDomainStatus('none'); setInstructions(null); setMessage('✅ Dominio eliminado.')
    } catch (err) { setMessage('⚠️ ' + err.message) }
    finally { setRemoving(false) }
  }

  return (
    <div style={{ background: 'rgba(13,13,26,0.9)', border: `1px solid ${isBusiness ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 20, padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>🌐 Dominio personalizado</div>
        {!isBusiness && <span style={{ fontSize: 10, fontWeight: 700, color: '#34d399', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 6, padding: '2px 8px', textTransform: 'uppercase' }}>BUSINESS</span>}
      </div>

      {!isBusiness ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
            Conecta tu propio dominio (ej: <strong style={{ color: 'white' }}>mitienda.com</strong>) y quita el branding de Fluxy.
          </div>
          <button onClick={() => navigate('/dashboard/plans')} style={{ background: 'linear-gradient(135deg, #34d399, #059669)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>🚀 Ver plan Business</button>
        </div>
      ) : (
        <>
          {currentDomain ? (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 12, padding: '12px 16px', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>🌐</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{currentDomain}</div>
                    <div style={{ fontSize: 12, marginTop: 2 }}>
                      {domainStatus === 'verified' && <span style={{ color: '#34d399' }}>✅ Verificado</span>}
                      {domainStatus === 'pending'  && <span style={{ color: '#fbbf24' }}>⏳ Pendiente</span>}
                      {domainStatus === 'error'    && <span style={{ color: '#f87171' }}>❌ Error</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={loadDomainStatus} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-soft)', fontSize: 12, cursor: 'pointer' }}>🔄</button>
                  <button onClick={handleRemoveDomain} disabled={removing} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', fontSize: 12, cursor: 'pointer' }}>{removing ? '...' : '🗑️'}</button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Sin https:// ni www:</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="mitienda.com" onKeyDown={e => e.key === 'Enter' && handleAddDomain()}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 11, padding: '12px 14px', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(52,211,153,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
                <button onClick={handleAddDomain} disabled={saving || !domain.trim()} style={{ padding: '12px 20px', borderRadius: 11, background: 'linear-gradient(135deg, #34d399, #059669)', border: 'none', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: saving || !domain.trim() ? 0.6 : 1 }}>
                  {saving ? '...' : 'Agregar'}
                </button>
              </div>
            </div>
          )}

          {(instructions || domainStatus === 'pending') && (
            <div style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 12, padding: '16px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fbbf24', marginBottom: 12 }}>📋 Configura tu DNS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Para www.tudominio.com', code: 'CNAME   www   cname.vercel-dns.com' },
                  { label: 'Para tudominio.com (sin www)', code: 'A   @   76.76.21.21' },
                ].map((item, i) => (
                  <div key={i} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'white' }}>{item.code}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>⏱️ Los cambios de DNS pueden tardar hasta 48 horas.</div>
            </div>
          )}

          {message && (
            <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, fontSize: 13, background: message.startsWith('✅') ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${message.startsWith('✅') ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`, color: message.startsWith('✅') ? '#34d399' : '#f87171' }}>{message}</div>
          )}
        </>
      )}
    </div>
  )
}

// ─── SettingsPage principal ───────────────────────────────────────────────────
export default function SettingsPage() {
  const { plan } = usePlan()
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
    try { const url = await uploadToCloudinary(file); setForm(f => ({ ...f, logoUrl: url })) }
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
      setSuccess('✅ Configuración guardada.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '13px 14px 13px 44px', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s' }
  const fields = [
    { key: 'name',        label: 'Nombre del negocio *', icon: '🏪', placeholder: 'Ej: Cafetería Luna' },
    { key: 'description', label: 'Descripción',          icon: '📝', placeholder: 'Describe tu negocio...', type: 'textarea' },
    { key: 'phone',       label: 'WhatsApp',             icon: '📱', placeholder: '51999999999' },
    { key: 'address',     label: 'Dirección',            icon: '📍', placeholder: 'Av. Ejemplo 123, Lima' },
    { key: 'email',       label: 'Correo',               icon: '✉️', placeholder: 'tu@negocio.com', type: 'email' },
  ]

  return (
    <DashboardLayout>
      <style>{`
        @media (max-width: 768px) {
          .fluxy-two-col { grid-template-columns: 1fr !important; }
          .fluxy-sticky { position: relative !important; top: 0 !important; }
        }
      `}</style>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>Panel de vendedor</div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, color: 'white' }}>Configuración de tienda</h1>
      </div>

      {storeUrl && (
        <div style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 14, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: '#34d399', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 3 }}>🔗 Tu tienda pública</div>
            <div style={{ fontSize: 14, color: 'var(--text-soft)' }}>{storeUrl}</div>
          </div>
          <a href={storeUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 9, padding: '7px 14px', fontSize: 13, fontWeight: 600, color: '#34d399' }}>Ver tienda ↗</a>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Cargando...</div>
      ) : (
        <div className="fluxy-two-col" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,340px)', gap: 24, alignItems: 'start' }}>

          {/* ── Columna izquierda: Formulario ── */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Logo */}
              <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Logo de tu negocio</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div onClick={() => logoRef.current?.click()} style={{ width: 90, height: 90, borderRadius: 18, flexShrink: 0, background: logoPreview ? 'transparent' : 'rgba(124,131,253,0.08)', border: '2px dashed rgba(124,131,253,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,131,253,0.6)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(124,131,253,0.3)'}
                  >
                    {logoPreview ? <img src={logoPreview} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : <span style={{ fontSize: 28 }}>🖼️</span>}
                    {uploadingLogo && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'white' }}>⬆️</div>}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 6 }}>{logoPreview ? 'Logo cargado ✓' : 'Sube el logo de tu negocio'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>PNG o JPG. Recomendado: 200×200px</div>
                    <button type="button" onClick={() => logoRef.current?.click()} style={{ padding: '8px 16px', borderRadius: 9, background: 'rgba(124,131,253,0.1)', border: '1px solid rgba(124,131,253,0.25)', color: 'var(--primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      {uploadingLogo ? 'Subiendo...' : logoPreview ? '🔄 Cambiar' : '📤 Subir logo'}
                    </button>
                  </div>
                </div>
                <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange}/>
              </div>

              {/* Info */}
              <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Información del negocio</div>
                {fields.map(field => (
                  <div key={field.key} style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>{field.label}</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: field.type === 'textarea' ? 14 : '50%', transform: field.type === 'textarea' ? 'none' : 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>{field.icon}</span>
                      {field.type === 'textarea' ? (
                        <textarea value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })} placeholder={field.placeholder} rows={3} style={{ ...inputStyle, resize: 'vertical' }}
                          onFocus={e => { e.target.style.borderColor = 'rgba(124,131,253,0.5)'; e.target.style.background = 'rgba(124,131,253,0.05)' }}
                          onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)' }}
                        />
                      ) : (
                        <input type={field.type || 'text'} value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })} placeholder={field.placeholder} style={inputStyle}
                          onFocus={e => { e.target.style.borderColor = 'rgba(124,131,253,0.5)'; e.target.style.background = 'rgba(124,131,253,0.05)' }}
                          onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)' }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagos */}
              <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Métodos de pago aceptados</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {PAYMENT_METHODS.map(pm => {
                    const active = form.paymentMethods.includes(pm.key)
                    return (
                      <button key={pm.key} type="button" onClick={() => togglePayment(pm.key)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, background: active ? 'rgba(124,131,253,0.15)' : 'rgba(255,255,255,0.04)', border: active ? '1px solid rgba(124,131,253,0.4)' : '1px solid rgba(255,255,255,0.08)', color: active ? 'var(--primary)' : 'var(--text-soft)', fontSize: 14, fontWeight: active ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s' }}>
                        <span>{pm.emoji}</span> {pm.label} {active && <span style={{ fontSize: 12 }}>✓</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Dominio */}
              <CustomDomainSection plan={plan} />

              {error   && <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#f87171' }}>⚠️ {error}</div>}
              {success && <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#34d399' }}>{success}</div>}

              <button type="submit" disabled={saving || uploadingLogo} style={{ width: '100%', padding: '15px', borderRadius: 14, background: (saving || uploadingLogo) ? 'rgba(124,131,253,0.4)' : 'linear-gradient(135deg, #7c83fd, #4f46e5)', border: 'none', color: 'white', fontSize: 15, fontWeight: 700, cursor: (saving || uploadingLogo) ? 'not-allowed' : 'pointer', boxShadow: (saving || uploadingLogo) ? 'none' : '0 8px 24px rgba(124,131,253,0.25)' }}>
                {saving ? 'Guardando...' : uploadingLogo ? 'Subiendo logo...' : '💾 Guardar configuración'}
              </button>
            </div>
          </form>

          {/* ── Vista previa ── */}
          <div className="fluxy-sticky" style={{ position: 'sticky', top: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Vista previa</div>
            <SettingsPreview form={form} logoPreview={logoPreview} />
            <div style={{ marginTop: 12, background: 'rgba(124,131,253,0.06)', border: '1px solid rgba(124,131,253,0.15)', borderRadius: 12, padding: '12px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, marginBottom: 4 }}>💡 Tip</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Los cambios se reflejan en tiempo real aquí. Guarda para que tus clientes los vean.
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}