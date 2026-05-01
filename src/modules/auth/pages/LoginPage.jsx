// src/modules/auth/pages/LoginPage.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_URL, buildStoreUrl } from '../../../app/config'
import BrandLogo from '../../../components/BrandLogo'

export default function LoginPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Por favor completa todos los campos.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        throw new Error('Correo o contraseña incorrectos.')
      }

      const data = await res.json()

      // Guardar token
      localStorage.setItem('token', data.token)

      // Obtener info de la empresa
      const companyRes = await fetch(`${API_URL}/companies/my-company`, {
        headers: { Authorization: `Bearer ${data.token}` },
      })

      if (companyRes.ok) {
        const company = await companyRes.json()
        localStorage.setItem('company', JSON.stringify({
          id: company.id,
          name: company.name,
          slug: company.slug,
          storeUrl: buildStoreUrl(company.slug),
        }))
      }

      navigate('/dashboard')

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#06060f',
      display: 'flex',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Panel izquierdo — decorativo, solo desktop */}
      <div className="hide-mobile" style={{
        width: '45%', flexShrink: 0,
        background: 'linear-gradient(135deg, rgba(124,131,253,0.15) 0%, rgba(79,70,229,0.08) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 48, position: 'relative', overflow: 'hidden',
      }}>
        {/* Grid decorativo */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(124,131,253,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,131,253,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}/>

        {/* Glow */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(124,131,253,0.2) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}/>

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 340 }}>
          {/* Logo */}
          <BrandLogo
            size={64}
            showWordmark={false}
            style={{ justifyContent: 'center' }}
            imageStyle={{
              margin: '0 auto 24px',
              boxShadow: '0 8px 32px rgba(124,131,253,0.35)',
              animation: 'float 6s ease infinite',
            }}
          />

          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 32, fontWeight: 700, color: 'white',
            marginBottom: 12, letterSpacing: '-0.5px',
          }}>Gestiona tu tienda</h2>

          <p style={{
            fontSize: 15, color: 'var(--text-soft)',
            lineHeight: 1.7, marginBottom: 40,
          }}>
            Accede a tu panel para administrar productos, pedidos y métricas de tu negocio.
          </p>

          {/* Features */}
          {[
            { icon: '📦', text: 'Gestión de productos' },
            { icon: '🛒', text: 'Control de pedidos' },
            { icon: '📊', text: 'Métricas en tiempo real' },
            { icon: '💬', text: 'Notificaciones WhatsApp' },
          ].map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 16px', marginBottom: 8,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, textAlign: 'left',
            }}>
              <span style={{ fontSize: 20 }}>{f.icon}</span>
              <span style={{ fontSize: 14, color: 'var(--text-soft)' }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Logo mobile */}
          <div className="hide-desktop" style={{ textAlign: 'center', marginBottom: 32 }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <BrandLogo size={38} textSize={20} />
            </Link>
          </div>

          {/* Volver */}
          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 13, color: 'var(--text-muted)',
            marginBottom: 32, transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Volver al inicio
          </Link>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 30, fontWeight: 700, color: 'white',
              marginBottom: 8, letterSpacing: '-0.5px',
            }}>Bienvenido de nuevo</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Ingresa tus credenciales para acceder a tu panel
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 600,
                color: 'var(--text-muted)', textTransform: 'uppercase',
                letterSpacing: '0.8px', marginBottom: 8,
              }}>Correo electrónico</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none',
                }}>✉️</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tu@negocio.com"
                  autoComplete="email"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12, padding: '14px 14px 14px 44px',
                    color: 'white', fontSize: 14, outline: 'none',
                    fontFamily: 'DM Sans, sans-serif',
                    transition: 'all 0.2s',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(124,131,253,0.5)'
                    e.target.style.background = 'rgba(124,131,253,0.05)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)'
                    e.target.style.background = 'rgba(255,255,255,0.04)'
                  }}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div style={{ marginBottom: 8 }}>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 600,
                color: 'var(--text-muted)', textTransform: 'uppercase',
                letterSpacing: '0.8px', marginBottom: 8,
              }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none',
                }}>🔒</span>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12, padding: '14px 44px 14px 44px',
                    color: 'white', fontSize: 14, outline: 'none',
                    fontFamily: 'DM Sans, sans-serif',
                    transition: 'all 0.2s',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(124,131,253,0.5)'
                    e.target.style.background = 'rgba(124,131,253,0.05)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)'
                    e.target.style.background = 'rgba(255,255,255,0.04)'
                  }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none',
                    color: 'var(--text-muted)', fontSize: 16, cursor: 'pointer',
                    padding: 4,
                  }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Olvidé mi contraseña */}
            <div style={{ textAlign: 'right', marginBottom: 24 }}>
              <a href="#" style={{
                fontSize: 13, color: 'var(--primary)',
                transition: 'opacity 0.2s',
              }}
                onMouseEnter={e => e.target.style.opacity = '0.7'}
                onMouseLeave={e => e.target.style.opacity = '1'}
              >¿Olvidaste tu contraseña?</a>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: 10, padding: '12px 16px',
                fontSize: 13, color: '#f87171',
                marginBottom: 16, textAlign: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Botón */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '15px',
              background: loading
                ? 'rgba(124,131,253,0.4)'
                : 'linear-gradient(135deg, #7c83fd, #4f46e5)',
              color: 'white', borderRadius: 14,
              fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(124,131,253,0.3)',
              transition: 'all 0.3s', border: 'none',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8,
              marginBottom: 20,
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {loading ? (
                <span style={{ opacity: 0.8 }}>Iniciando sesión...</span>
              ) : (
                <>
                  Iniciar sesión
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>

            {/* Divider */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
            }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }}/>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>¿No tienes cuenta?</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }}/>
            </div>

            <Link to="/register-business" style={{
              display: 'block', textAlign: 'center',
              padding: '13px', borderRadius: 12,
              background: 'rgba(124,131,253,0.08)',
              border: '1px solid rgba(124,131,253,0.2)',
              color: 'var(--primary)', fontSize: 14, fontWeight: 600,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,131,253,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,131,253,0.08)'}
            >
              Crear mi tienda gratis →
            </Link>
          </form>
        </div>
      </div>
    </div>
  )
}
