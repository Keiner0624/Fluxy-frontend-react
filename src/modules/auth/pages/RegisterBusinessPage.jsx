// src/modules/auth/pages/RegisterBusinessPage.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_URL, buildStoreUrl } from '../../../app/config'
import BrandLogo from '../../../components/BrandLogo'

export default function RegisterBusinessPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    businesName: '',
    whatssapp: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Error al registrar el negocio')
      }

      const data = await res.json()
      const company = data.company
        ? {
            ...data.company,
            storeUrl: data.company.slug
              ? buildStoreUrl(data.company.slug)
              : data.company.storeUrl || '',
          }
        : {}

      // Guardar token y datos
      localStorage.setItem('token', data.token)
      localStorage.setItem('company', JSON.stringify(company))
      localStorage.setItem('user', JSON.stringify(data.user))

      // Mostrar éxito y redirigir al dashboard
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
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Fondo */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: `
          radial-gradient(ellipse 60% 50% at 30% 30%, rgba(124,131,253,0.1) 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 70% 70%, rgba(79,70,229,0.06) 0%, transparent 55%)
        `,
      }}/>

      <div style={{
        width: '100%', maxWidth: 480,
        position: 'relative', zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
          }}>
            <BrandLogo
              size={40}
              textSize={22}
              imageStyle={{ boxShadow: '0 4px 20px rgba(124,131,253,0.35)' }}
            />
          </Link>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(13,13,26,0.9)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24, padding: '36px 32px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(20px)',
        }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 26, fontWeight: 700, color: 'white',
              marginBottom: 8,
            }}>Crea tu tienda gratis</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              En menos de 2 minutos tendrás tu tienda online lista para vender.
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            {/* Nombre del negocio */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 600,
                color: 'var(--text-muted)', textTransform: 'uppercase',
                letterSpacing: '0.8px', marginBottom: 8,
              }}>Nombre del negocio</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)', fontSize: 16,
                }}>🏪</span>
                <input
                  name="businesName"
                  value={form.businesName}
                  onChange={handleChange}
                  placeholder="Ej: Cafetería Luna"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12, padding: '13px 14px 13px 42px',
                    color: 'white', fontSize: 14,
                    outline: 'none', fontFamily: 'DM Sans, sans-serif',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 600,
                color: 'var(--text-muted)', textTransform: 'uppercase',
                letterSpacing: '0.8px', marginBottom: 8,
              }}>WhatsApp</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)', fontSize: 16,
                }}>📱</span>
                <input
                  name="whatssapp"
                  value={form.whatssapp}
                  onChange={handleChange}
                  placeholder="Ej: 51999999999"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12, padding: '13px 14px 13px 42px',
                    color: 'white', fontSize: 14,
                    outline: 'none', fontFamily: 'DM Sans, sans-serif',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
            </div>

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
                  transform: 'translateY(-50%)', fontSize: 16,
                }}>✉️</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tu@negocio.com"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12, padding: '13px 14px 13px 42px',
                    color: 'white', fontSize: 14,
                    outline: 'none', fontFamily: 'DM Sans, sans-serif',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 600,
                color: 'var(--text-muted)', textTransform: 'uppercase',
                letterSpacing: '0.8px', marginBottom: 8,
              }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)', fontSize: 16,
                }}>🔒</span>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12, padding: '13px 44px 13px 42px',
                    color: 'white', fontSize: 14,
                    outline: 'none', fontFamily: 'DM Sans, sans-serif',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none',
                    color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer',
                  }}
                >{showPassword ? '🙈' : '👁️'}</button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: 10, padding: '10px 14px',
                fontSize: 13, color: '#f87171',
                marginBottom: 16, textAlign: 'center',
              }}>⚠️ {error}</div>
            )}

            {/* Botón */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '15px',
              background: loading
                ? 'rgba(124,131,253,0.5)'
                : 'linear-gradient(135deg, #7c83fd, #4f46e5)',
              color: 'white', borderRadius: 14,
              fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(124,131,253,0.3)',
              transition: 'all 0.3s',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8,
            }}>
              {loading ? (
                <>
                  <span style={{ animation: 'spin 1s linear infinite' }}>⟳</span>
                  Creando tu tienda...
                </>
              ) : (
                <>
                  Crear mi tienda gratis
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            margin: '20px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }}/>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>¿Ya tienes cuenta?</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }}/>
          </div>

          <Link to="/login" style={{
            display: 'block', textAlign: 'center',
            padding: '13px', borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--text-soft)', fontSize: 14, fontWeight: 500,
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.04)'}
          >
            Iniciar sesión
          </Link>
        </div>

        {/* Nota */}
        <p style={{
          textAlign: 'center', fontSize: 12,
          color: 'var(--text-muted)', marginTop: 20,
          lineHeight: 1.6,
        }}>
          Al registrarte aceptas nuestros{' '}
          <a href="#" style={{ color: 'var(--primary)' }}>Términos de uso</a>
          {' '}y{' '}
          <a href="#" style={{ color: 'var(--primary)' }}>Política de privacidad</a>
        </p>
      </div>
    </div>
  )
}
