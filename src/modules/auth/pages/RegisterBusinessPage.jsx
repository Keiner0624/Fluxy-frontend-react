// src/modules/auth/pages/RegisterBusinessPage.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_URL, buildStoreUrl } from '../../../app/config'
import BrandLogo from '../../../components/BrandLogo'

function getToken() {
  return localStorage.getItem('token') || ''
}

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  padding: '13px 14px 13px 42px',
  color: 'white',
  fontSize: 14,
  outline: 'none',
  fontFamily: 'DM Sans, sans-serif',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
}

export default function RegisterBusinessPage() {
  const navigate = useNavigate()

  // ── Paso 1: datos del negocio ──────────────────────────────────────────
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    businesName: '',
    whatssapp:   '',
    email:       '',
    password:    '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  // ── Paso 2: datos personales ───────────────────────────────────────────
  const [profile, setProfile] = useState({
    firstName: '',
    lastName:  '',
    birthDate: '',
  })
  const [savingProfile, setSavingProfile] = useState(false)

  // ── Handlers paso 1 ───────────────────────────────────────────────────
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

      // Avanzar al paso 2
      setStep(2)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Handlers paso 2 ───────────────────────────────────────────────────
  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!profile.firstName) { setError('Ingresa al menos tu nombre.'); return }

    setSavingProfile(true)
    setError('')

    try {
      await fetch(`${API_URL}/me/profile`, {
        method:  'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${getToken()}`,
        },
        body: JSON.stringify(profile),
      })
    } catch (_) {
      // Si falla el perfil no bloqueamos al usuario
    } finally {
      setSavingProfile(false)
      navigate('/dashboard')
    }
  }

  const handleSkip = () => navigate('/dashboard')

  // ── UI ────────────────────────────────────────────────────────────────
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
          radial-gradient(ellipse 60% 50% at 30% 30%, rgba(124,131,253,0.1) 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 70% 70%, rgba(79,70,229,0.06) 0%, transparent 55%)
        `,
      }}/>

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <BrandLogo size={40} textSize={22} imageStyle={{ boxShadow: '0 4px 20px rgba(124,131,253,0.35)' }} />
          </Link>
        </div>

        {/* Indicador de pasos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
          {[1, 2].map(n => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: step >= n ? 'linear-gradient(135deg, #7c83fd, #4f46e5)' : 'rgba(255,255,255,0.08)',
                border: step >= n ? 'none' : '1px solid rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                color: step >= n ? 'white' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.3s',
              }}>{n}</div>
              {n < 2 && (
                <div style={{
                  width: 40, height: 2,
                  background: step > n ? 'linear-gradient(to right, #7c83fd, #4f46e5)' : 'rgba(255,255,255,0.08)',
                  borderRadius: 2, transition: 'all 0.3s',
                }}/>
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(13,13,26,0.9)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24, padding: '36px 32px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(20px)',
        }}>

          {/* ════════════════════════════════ PASO 1 ════════════════════════════════ */}
          {step === 1 && (
            <>
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 8 }}>
                  Paso 1 de 2
                </div>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 700, color: 'white', marginBottom: 8 }}>
                  Crea tu tienda gratis
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  En menos de 2 minutos tendrás tu tienda online lista para vender.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Nombre del negocio */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
                    Nombre del negocio
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🏪</span>
                    <input name="businesName" value={form.businesName} onChange={handleChange}
                      placeholder="Ej: Cafetería Luna" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                      onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}/>
                  </div>
                </div>

                {/* WhatsApp */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
                    WhatsApp
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>📱</span>
                    <input name="whatssapp" value={form.whatssapp} onChange={handleChange}
                      placeholder="Ej: 51999999999" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                      onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}/>
                  </div>
                </div>

                {/* Email */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
                    Correo electrónico
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>✉️</span>
                    <input name="email" type="email" value={form.email} onChange={handleChange}
                      placeholder="tu@negocio.com" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                      onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}/>
                  </div>
                </div>

                {/* Contraseña */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
                    Contraseña
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔒</span>
                    <input name="password" type={showPassword ? 'text' : 'password'}
                      value={form.password} onChange={handleChange}
                      placeholder="Mínimo 6 caracteres"
                      style={{ ...inputStyle, paddingRight: 44 }}
                      onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                      onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}/>
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer',
                    }}>{showPassword ? '🙈' : '👁️'}</button>
                  </div>
                </div>

                {error && (
                  <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: 16, textAlign: 'center' }}>
                    ⚠️ {error}
                  </div>
                )}

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '15px',
                  background: loading ? 'rgba(124,131,253,0.5)' : 'linear-gradient(135deg, #7c83fd, #4f46e5)',
                  color: 'white', borderRadius: 14, fontSize: 15, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 8px 24px rgba(124,131,253,0.3)',
                  border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  {loading ? 'Creando tu tienda...' : <>Continuar → <span>Paso 2</span></>}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }}/>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>¿Ya tienes cuenta?</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }}/>
              </div>

              <Link to="/login" style={{
                display: 'block', textAlign: 'center', padding: '13px', borderRadius: 12,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-soft)', fontSize: 14, fontWeight: 500,
              }}>Iniciar sesión</Link>
            </>
          )}

          {/* ════════════════════════════════ PASO 2 ════════════════════════════════ */}
          {step === 2 && (
            <>
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 11, color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 8 }}>
                  ¡Tienda creada! · Paso 2 de 2
                </div>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 700, color: 'white', marginBottom: 8 }}>
                  Cuéntanos sobre ti 👤
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Así podemos saludarte por tu nombre y celebrar tu cumpleaños 🎂
                </p>
              </div>

              <form onSubmit={handleSaveProfile}>
                {/* Nombre */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
                    Nombre *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>👤</span>
                    <input name="firstName" value={profile.firstName} onChange={handleProfileChange}
                      placeholder="Ej: Juan" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                      onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}/>
                  </div>
                </div>

                {/* Apellido */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
                    Apellido
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>📝</span>
                    <input name="lastName" value={profile.lastName} onChange={handleProfileChange}
                      placeholder="Ej: Pérez" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                      onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}/>
                  </div>
                </div>

                {/* Fecha de nacimiento */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
                    Fecha de nacimiento
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🎂</span>
                    <input name="birthDate" type="date" value={profile.birthDate} onChange={handleProfileChange}
                      max={new Date().toISOString().split('T')[0]}
                      style={{ ...inputStyle, colorScheme: 'dark' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                      onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}/>
                  </div>
                </div>

                {error && (
                  <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: 16, textAlign: 'center' }}>
                    ⚠️ {error}
                  </div>
                )}

                <button type="submit" disabled={savingProfile} style={{
                  width: '100%', padding: '15px',
                  background: savingProfile ? 'rgba(124,131,253,0.5)' : 'linear-gradient(135deg, #7c83fd, #4f46e5)',
                  color: 'white', borderRadius: 14, fontSize: 15, fontWeight: 700,
                  cursor: savingProfile ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 24px rgba(124,131,253,0.3)', border: 'none', marginBottom: 12,
                }}>
                  {savingProfile ? 'Guardando...' : '🚀 Ir a mi dashboard'}
                </button>

                <button type="button" onClick={handleSkip} style={{
                  width: '100%', padding: '12px', background: 'transparent',
                  border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer',
                }}>
                  Completar después →
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