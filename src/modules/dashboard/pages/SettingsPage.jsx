// src/modules/dashboard/pages/SettingsPage.jsx
import { useState, useEffect, useRef } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { API_URL } from '../../../app/config'

const CLOUDINARY_CLOUD = 'dklhbrw7s'
const CLOUDINARY_PRESET = 'fluxy_unsigned'

function getToken() { return localStorage.getItem('token') || '' }

const PAYMENT_METHODS = [
  { key: 'efectivo',      label: 'Efectivo',       emoji: '💵' },
  { key: 'yape',          label: 'Yape',            emoji: '📱' },
  { key: 'plin',          label: 'Plin',            emoji: '🏦' },
  { key: 'tarjeta',       label: 'Tarjeta',         emoji: '💳' },
  { key: 'transferencia', label: 'Transferencia',   emoji: '🏧' },
]

async function uploadToCloudinary(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_PRESET)
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
    { method: 'POST', body: formData }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error('Cloudinary error:', err)
    throw new Error('Error al subir imagen')
  }
  return (await res.json()).secure_url
}

export default function SettingsPage() {
  const [form, setForm] = useState({
    name: '', description: '', phone: '', address: '', email: '',
    logoUrl: '', paymentMethods: [],
  })
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)
  const [success, setSuccess]         = useState('')
  const [error, setError]             = useState('')
  const logoRef = useRef()

  useEffect(() => { loadCompany() }, [])

  const loadCompany = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/companies/my-company`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      console.log('Company data from backend:', data)
      setForm({
        name:           data.name           || '',
        description:    data.description    || '',
        phone:          data.phone          || '',
        address:        data.address        || '',
        email:          data.email          || '',
        logoUrl:        data.logoUrl        || '',
        paymentMethods: data.paymentMethods
          ? JSON.parse(data.paymentMethods)
          : [],
      })
      setLogoPreview(data.logoUrl || null)
    } catch (e) {
      console.error('Error loading company:', e)
      setError('Error al cargar la configuración')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogoPreview(URL.createObjectURL(file))
    setUploadingLogo(true)
    setError('')
    try {
      console.log('Uploading to Cloudinary cloud:', CLOUDINARY_CLOUD)
      const url = await uploadToCloudinary(file)
      console.log('Logo URL:', url)
      setForm(f => ({ ...f, logoUrl: url }))
    } catch (err) {
      setError('Error al subir el logo: ' + err.message)
    } finally {
      setUploadingLogo(false)
    }
  }

  const togglePayment = (key) => {
    setForm(f => ({
      ...f,
      paymentMethods: f.paymentMethods.includes(key)
        ? f.paymentMethods.filter(p => p !== key)
        : [...f.paymentMethods, key],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return }
    setSaving(true); setError(''); setSuccess('')

    const payload = {
      name:           form.name,
      description:    form.description,
      phone:          form.phone,
      address:        form.address,
      email:          form.email,
      logoUrl:        form.logoUrl,
      paymentMethods: JSON.stringify(form.paymentMethods),
    }
    console.log('Enviando payload:', JSON.stringify(payload, null, 2))

    try {
      const res = await fetch(`${API_URL}/companies/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      })

      console.log('Response status:', res.status)

      if (!res.ok) {
        const errBody = await res.text()
        console.error('Backend error response:', errBody)
        throw new Error(`Error al guardar (${res.status}): ${errBody}`)
      }

      const updated = await res.json()
      console.log('Updated company:', updated)

      const company = JSON.parse(localStorage.getItem('company') || '{}')
      localStorage.setItem('company', JSON.stringify({
        ...company,
        name:    updated.name,
        slug:    updated.slug,
        logoUrl: updated.logoUrl,
      }))

      setSuccess('✅ Configuración guardada.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Submit error:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const company = JSON.parse(localStorage.getItem('company') || '{}')

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
    padding: '13px 14px 13px 44px', color: 'white', fontSize: 14,
    outline: 'none', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
  }

  const fields = [
    { key: 'name',        label: 'Nombre del negocio *', icon: '🏪', placeholder: 'Ej: Cafetería Luna' },
    { key: 'description', label: 'Descripción',          icon: '📝', placeholder: 'Describe tu negocio...', type: 'textarea' },
    { key: 'phone',       label: 'WhatsApp',             icon: '📱', placeholder: '51999999999' },
    { key: 'address',     label: 'Dirección',            icon: '📍', placeholder: 'Av. Ejemplo 123, Lima' },
    { key: 'email',       label: 'Correo',               icon: '✉️', placeholder: 'tu@negocio.com', type: 'email' },
  ]

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>
          Panel de vendedor
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, color: 'white' }}>
          Configuración de tienda
        </h1>
      </div>

      {/* Link tienda */}
      {company.storeUrl && (
        <div style={{
          background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)',
          borderRadius: 14, padding: '14px 18px', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#34d399', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 3 }}>🔗 Tu tienda pública</div>
            <div style={{ fontSize: 14, color: 'var(--text-soft)' }}>{company.storeUrl}</div>
          </div>
          <a href={company.storeUrl} target="_blank" rel="noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)',
            borderRadius: 9, padding: '7px 14px', fontSize: 13, fontWeight: 600, color: '#34d399',
          }}>Ver tienda ↗</a>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Cargando...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 20, alignItems: 'start' }}>

            {/* Columna izquierda */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Logo */}
              <div style={{
                background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 20, padding: '24px',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  Logo de tu negocio
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div
                    onClick={() => logoRef.current?.click()}
                    style={{
                      width: 90, height: 90, borderRadius: 18, flexShrink: 0,
                      background: logoPreview ? 'transparent' : 'rgba(124,131,253,0.08)',
                      border: '2px dashed rgba(124,131,253,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', overflow: 'hidden', position: 'relative',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,131,253,0.6)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(124,131,253,0.3)'}
                  >
                    {logoPreview
                      ? <img src={logoPreview} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                      : <span style={{ fontSize: 28 }}>🖼️</span>
                    }
                    {uploadingLogo && (
                      <div style={{
                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, color: 'white',
                      }}>⬆️</div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 6 }}>
                      {logoPreview ? 'Logo cargado ✓' : 'Sube el logo de tu negocio'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
                      PNG o JPG. Recomendado: cuadrado 200×200px
                    </div>
                    <button type="button" onClick={() => logoRef.current?.click()} style={{
                      padding: '8px 16px', borderRadius: 9,
                      background: 'rgba(124,131,253,0.1)', border: '1px solid rgba(124,131,253,0.25)',
                      color: 'var(--primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}>
                      {uploadingLogo ? 'Subiendo...' : logoPreview ? '🔄 Cambiar logo' : '📤 Subir logo'}
                    </button>
                  </div>
                </div>
                <input ref={logoRef} type="file" accept="image/*"
                  style={{ display: 'none' }} onChange={handleLogoChange}/>
              </div>

              {/* Info negocio */}
              <div style={{
                background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 20, padding: '24px',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  Información del negocio
                </div>
                {fields.map(field => (
                  <div key={field.key} style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
                      {field.label}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute', left: 14,
                        top: field.type === 'textarea' ? 14 : '50%',
                        transform: field.type === 'textarea' ? 'none' : 'translateY(-50%)',
                        fontSize: 16, pointerEvents: 'none',
                      }}>{field.icon}</span>
                      {field.type === 'textarea' ? (
                        <textarea value={form[field.key]}
                          onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                          placeholder={field.placeholder} rows={3}
                          style={{ ...inputStyle, resize: 'vertical' }}
                          onFocus={e => { e.target.style.borderColor = 'rgba(124,131,253,0.5)'; e.target.style.background = 'rgba(124,131,253,0.05)' }}
                          onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)' }}
                        />
                      ) : (
                        <input type={field.type || 'text'} value={form[field.key]}
                          onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                          placeholder={field.placeholder} style={inputStyle}
                          onFocus={e => { e.target.style.borderColor = 'rgba(124,131,253,0.5)'; e.target.style.background = 'rgba(124,131,253,0.05)' }}
                          onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)' }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Métodos de pago */}
              <div style={{
                background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 20, padding: '24px',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 6, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  Métodos de pago aceptados
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, marginTop: 10 }}>
                  Selecciona los métodos que aceptas en tu tienda.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {PAYMENT_METHODS.map(pm => {
                    const active = form.paymentMethods.includes(pm.key)
                    return (
                      <button key={pm.key} type="button" onClick={() => togglePayment(pm.key)} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 18px', borderRadius: 12,
                        background: active ? 'rgba(124,131,253,0.15)' : 'rgba(255,255,255,0.04)',
                        border: active ? '1px solid rgba(124,131,253,0.4)' : '1px solid rgba(255,255,255,0.08)',
                        color: active ? 'var(--primary)' : 'var(--text-soft)',
                        fontSize: 14, fontWeight: active ? 600 : 400,
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}>
                        <span>{pm.emoji}</span> {pm.label}
                        {active && <span style={{ fontSize: 12 }}>✓</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Mensajes */}
              {error && (
                <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#f87171' }}>
                  ⚠️ {error}
                </div>
              )}
              {success && (
                <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#34d399' }}>
                  {success}
                </div>
              )}

              <button type="submit" disabled={saving || uploadingLogo} style={{
                width: '100%', padding: '15px', borderRadius: 14,
                background: (saving || uploadingLogo) ? 'rgba(124,131,253,0.4)' : 'linear-gradient(135deg, #7c83fd, #4f46e5)',
                border: 'none', color: 'white', fontSize: 15, fontWeight: 700,
                cursor: (saving || uploadingLogo) ? 'not-allowed' : 'pointer',
                boxShadow: (saving || uploadingLogo) ? 'none' : '0 8px 24px rgba(124,131,253,0.25)',
              }}>
                {saving ? 'Guardando...' : uploadingLogo ? 'Subiendo logo...' : '💾 Guardar configuración'}
              </button>
            </div>

            {/* Preview */}
            <div style={{
              background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20, padding: '22px', position: 'sticky', top: 24,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>
                Vista previa
              </div>
              <div style={{ background: '#06060f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ background: 'rgba(8,8,15,0.9)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {logoPreview ? (
                    <img src={logoPreview} alt="logo" style={{ width: 26, height: 26, borderRadius: 7, objectFit: 'cover', flexShrink: 0 }}/>
                  ) : (
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #7c83fd, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                      {form.name?.[0]?.toUpperCase() || 'N'}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>{form.name || 'Tu negocio'}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>via Fluxy</div>
                  </div>
                </div>
                <div style={{ padding: '14px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 4, fontFamily: "'Fraunces', serif" }}>
                    Bienvenido a <span style={{ color: 'var(--primary)' }}>{form.name || 'tu tienda'}</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.5 }}>
                    {form.description || 'Descripción de tu negocio...'}
                  </div>
                  {form.paymentMethods.length > 0 && (
                    <div>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Pagos</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {form.paymentMethods.map(key => {
                          const pm = PAYMENT_METHODS.find(p => p.key === key)
                          return pm ? (
                            <span key={key} style={{ fontSize: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '3px 6px', color: 'var(--text-soft)' }}>
                              {pm.emoji} {pm.label}
                            </span>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}
                  <div style={{ marginTop: 10, padding: '6px', background: 'linear-gradient(135deg, #25d366, #128c7e)', borderRadius: 7, textAlign: 'center', fontSize: 9, fontWeight: 600, color: 'white' }}>
                    💬 Hablar con el vendedor
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
                Vista previa en tiempo real
              </div>
            </div>
          </div>
        </form>
      )}
    </DashboardLayout>
  )
}