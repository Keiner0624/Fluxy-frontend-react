// src/modules/auth/pages/RegisterBusinessPage.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_URL, buildStoreUrl } from '@/app/config'
import BrandLogo from '@/components/BrandLogo'

function getToken() {
  return localStorage.getItem('token') || ''
}

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  padding: '13px 16px',
  color: 'white',
  fontSize: 14,
  outline: 'none',
  fontFamily: 'DM Sans, sans-serif',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
  marginBottom: 8,
}

export default function RegisterBusinessPage() {
  const navigate = useNavigate()

  const [step, setStep]                   = useState(1)
  const [form, setForm]                   = useState({ businesName: '', whatssapp: '', email: '', password: '' })
  const [showPassword, setShowPassword]   = useState(false)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const [profile, setProfile]             = useState({ firstName: '', lastName: '', birthDate: '' })
  const [savingProfile, setSavingProfile] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.businesName || !form.whatssapp || !form.email || !form.password) {
      setError('Por favor completa todos los campos.')
      return
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/auth/register-business`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Error al registrar el negocio')
      }

      const data    = await res.json()
      const company = data.company
        ? { ...data.company, storeUrl: data.company.slug ? buildStoreUrl(data.company.slug) : data.company.storeUrl || '' }
        : {}

      localStorage.setItem('token',   data.token)
      localStorage.setItem('company', JSON.stringify(company))
      localStorage.setItem('user',    JSON.stringify(data.user))
      localStorage.removeItem('storeStyle')

      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!profile.firstName) { setError('El nombre es obligatorio.'); return }

    setSavingProfile(true)
    setError('')

    try {
      await fetch(`${API_URL}/me/profile`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify(profile),
      })
    } catch { /* si falla el PUT, el perfil igual se persiste en local */ }
    finally {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        localStorage.setItem('user', JSON.stringify({ ...user, ...profile }))
      } catch { /* localStorage no disponible o con datos corruptos */ }
      setSavingProfile(false)
      navigate('/dashboard')
    }
  }

  const handleSkip = () => navigate('/dashboard')

  return (
    <div style={{
      minHeight: '100vh',
      background: '#06060f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: `
          radial-gradient(ellipse 60% 50% at 30% 30%, rgba(124,131,253,0.08) 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 70% 70%, rgba(79,70,229,0.05) 0%, transparent 55%)
        `,
      }}/>

      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-block' }}>
            <BrandLogo size={38} textSize={21} imageStyle={{ boxShadow: '0 4px 20px rgba(124,131,253,0.3)' }} />
          </Link>
        </div>

        {/* Indicador de pasos */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
          {[
            { n: 1, label: 'Tu negocio' },
            { n: 2, label: 'Tu perfil'  },
          ].map(({ n, label }, i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 14px', borderRadius: 20,
                background: step === n ? 'rgba(124,131,253,0.12)' : 'transparent',
                border: step === n ? '1px solid rgba(124,131,253,0.25)' : '1px solid transparent',
                transition: 'all 0.3s',
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: step > n
                    ? 'linear-gradient(135deg, #7c83fd, #4f46e5)'
                    : step === n
                      ? 'linear-gradient(135deg, #7c83fd, #4f46e5)'
                      : 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: step >= n ? 'white' : 'rgba(255,255,255,0.3)',
                }}>
                  {step > n ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : n}
                </div>
                <span style={{
                  fontSize: 12,
                  fontWeight: step === n ? 600 : 400,
                  color: step === n ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)',
                }}>
                  {label}
                </span>
              </div>
              {i < 1 && (
                <div style={{
                  width: 28, height: 1,
                  background: step > n ? 'rgba(124,131,253,0.4)' : 'rgba(255,255,255,0.08)',
                  transition: 'all 0.3s',
                }}/>
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(13,13,26,0.95)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20, padding: '36px 32px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(20px)',
        }}>

          {/* ── PASO 1 ── */}
          {step === 1 && (
            <>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 6 }}>
                  Crea tu tienda
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Completa los datos de tu negocio para comenzar.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Nombre del negocio</label>
                  <input name="businesName" value={form.businesName} onChange={handleChange}
                    placeholder="Cafetería Luna" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                    onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}/>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>WhatsApp</label>
                  <input name="whatssapp" value={form.whatssapp} onChange={handleChange}
                    placeholder="51999999999" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                    onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}/>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Correo electrónico</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="tu@negocio.com" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                    onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}/>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>Contraseña</label>
                  <div style={{ position: 'relative' }}>
                    <input name="password" type={showPassword ? 'text' : 'password'}
                      value={form.password} onChange={handleChange}
                      placeholder="Mínimo 6 caracteres"
                      style={{ ...inputStyle, paddingRight: 48 }}
                      onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                      onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}/>
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'transparent', border: 'none', color: 'var(--text-muted)',
                      cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center',
                    }}>
                      {showPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: 16 }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '14px',
                  background: loading ? 'rgba(124,131,253,0.4)' : 'linear-gradient(135deg, #7c83fd, #4f46e5)',
                  color: 'white', borderRadius: 12, fontSize: 14, fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 6px 20px rgba(124,131,253,0.25)',
                  border: 'none', transition: 'all 0.2s',
                }}>
                  {loading ? 'Creando cuenta...' : 'Continuar'}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 20px' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }}/>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>¿Ya tienes cuenta?</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }}/>
              </div>

              <Link to="/login" style={{
                display: 'block', textAlign: 'center', padding: '13px', borderRadius: 12,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                color: 'var(--text-soft)', fontSize: 14, fontWeight: 500, textDecoration: 'none',
              }}>
                Iniciar sesión
              </Link>
            </>
          )}

          {/* ── PASO 2 ── */}
          {step === 2 && (
            <>
              <div style={{ marginBottom: 28 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
                  borderRadius: 8, padding: '4px 10px', marginBottom: 16,
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#34d399', letterSpacing: '0.5px' }}>
                    Negocio creado
                  </span>
                </div>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 6 }}>
                  Datos personales
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Esta información es opcional. Puedes completarla ahora o más tarde desde tu perfil.
                </p>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={labelStyle}>
                      Nombre <span style={{ color: '#f87171' }}>*</span>
                    </label>
                    <input name="firstName" value={profile.firstName} onChange={handleProfileChange}
                      placeholder="Juan" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                      onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}/>
                  </div>
                  <div>
                    <label style={labelStyle}>Apellido</label>
                    <input name="lastName" value={profile.lastName} onChange={handleProfileChange}
                      placeholder="Pérez" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                      onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}/>
                  </div>
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}>Fecha de nacimiento</label>
                  <input name="birthDate" type="date" value={profile.birthDate} onChange={handleProfileChange}
                    max={new Date().toISOString().split('T')[0]}
                    style={{ ...inputStyle, colorScheme: 'dark' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                    onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}/>
                </div>

                {error && (
                  <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: 16 }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={savingProfile} style={{
                  width: '100%', padding: '14px',
                  background: savingProfile ? 'rgba(124,131,253,0.4)' : 'linear-gradient(135deg, #7c83fd, #4f46e5)',
                  color: 'white', borderRadius: 12, fontSize: 14, fontWeight: 600,
                  cursor: savingProfile ? 'not-allowed' : 'pointer',
                  boxShadow: '0 6px 20px rgba(124,131,253,0.25)', border: 'none', marginBottom: 12,
                }}>
                  {savingProfile ? 'Guardando...' : 'Ir al dashboard'}
                </button>

                <button type="button" onClick={handleSkip} style={{
                  width: '100%', padding: '12px', background: 'transparent',
                  border: 'none', color: 'var(--text-muted)', fontSize: 13,
                  cursor: 'pointer', transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                >
                  Completar después
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 20, lineHeight: 1.6 }}>
          Al registrarte aceptas nuestros{' '}
          <Link to="/terms" style={{ color: 'var(--primary)' }}>Términos de uso</Link>
          {' '}y{' '}
          <Link to="/terms" style={{ color: 'var(--primary)' }}>Política de privacidad</Link>
        </p>
      </div>
    </div>
  )
}
