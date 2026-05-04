// src/modules/admin/pages/AdminLoginPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL, buildStoreUrl } from '../../../app/config'

const ADMIN_EMAIL = 'pkeinerr.e13@gmail.com'

function getToken() { return localStorage.getItem('token') || '' }

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [mounted, setMounted]   = useState(false)

  useEffect(() => {
    setTimeout(() => setMounted(true), 80)
    // Si ya está logueado como admin, ir directo
    const token = getToken()
    if (token) {
      fetch(`${API_URL}/admin/metrics`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => { if (r.ok) navigate('/admin') })
        .catch(() => {})
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validar email de admin antes de hacer request
    if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      setError('Acceso denegado. No tienes permisos de administrador.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      if (!res.ok) throw new Error('Credenciales incorrectas.')
      const data = await res.json()

      // Verificar que sea admin en el backend
      const meRes = await fetch(`${API_URL}/admin/metrics`, {
        headers: { Authorization: `Bearer ${data.token}` },
      })

      if (!meRes.ok) {
        setError('Acceso denegado. No tienes permisos de administrador.')
        return
      }

      localStorage.setItem('token', data.token)
      navigate('/admin')

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080810',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'DM Sans, sans-serif',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        * { box-sizing: border-box; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px #0d0d1e inset !important;
          -webkit-text-fill-color: white !important;
        }
      `}</style>

      {/* Grid de fondo */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(124,131,253,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(124,131,253,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}/>

      {/* Glow central */}
      <div style={{
        position: 'fixed', top: '40%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 400,
        background: 'radial-gradient(ellipse, rgba(124,131,253,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }}/>

      {/* Línea de escaneo sutil */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden',
      }}>
        <div style={{
          width: '100%', height: 2,
          background: 'linear-gradient(to right, transparent, rgba(124,131,253,0.08), transparent)',
          animation: 'scanline 8s linear infinite',
        }}/>
      </div>

      {/* Card principal */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: '100%', maxWidth: 380,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s ease',
      }}>

        {/* Logo / marca */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, #7c83fd, #4f46e5)',
            fontSize: 20, fontWeight: 900, color: 'white',
            marginBottom: 16,
            boxShadow: '0 8px 24px rgba(124,131,253,0.3)',
          }}>F</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(124,131,253,0.7)', textTransform: 'uppercase', letterSpacing: '3px' }}>
            Fluxy · Admin
          </div>
        </div>

        {/* Formulario */}
        <div style={{
          background: 'rgba(13,13,26,0.8)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20,
          padding: '32px 28px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,131,253,0.05)',
        }}>
          {/* Línea decorativa */}
          <div style={{
            position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
            background: 'linear-gradient(to right, transparent, rgba(124,131,253,0.4), transparent)',
            borderRadius: 1,
            marginTop: -1,
          }}/>

          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 22, fontWeight: 700,
            color: 'white', marginBottom: 6,
            letterSpacing: '-0.5px',
          }}>Acceso restringido</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 28, lineHeight: 1.5 }}>
            Solo el administrador de Fluxy puede ingresar.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 600,
                color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
                letterSpacing: '1px', marginBottom: 8,
              }}>Correo</label>
              <input
                type="email" value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="admin@fluxy.com"
                autoComplete="email"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 11, padding: '12px 14px',
                  color: 'white', fontSize: 14, outline: 'none',
                  fontFamily: 'DM Sans, sans-serif',
                  transition: 'all 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(124,131,253,0.4)'; e.target.style.background = 'rgba(124,131,253,0.04)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.03)' }}
              />
            </div>

            {/* Contraseña */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 600,
                color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
                letterSpacing: '1px', marginBottom: 8,
              }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 11, padding: '12px 44px 12px 14px',
                    color: 'white', fontSize: 14, outline: 'none',
                    fontFamily: 'DM Sans, sans-serif',
                    transition: 'all 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(124,131,253,0.4)'; e.target.style.background = 'rgba(124,131,253,0.04)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.03)' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
                  cursor: 'pointer', fontSize: 14, padding: 4,
                }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(248,113,113,0.06)',
                border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: 10, padding: '10px 14px',
                fontSize: 13, color: '#f87171',
                marginBottom: 16, textAlign: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                🔒 {error}
              </div>
            )}

            {/* Botón */}
            <button type="submit" disabled={loading || !email || !password} style={{
              width: '100%', padding: '13px',
              background: loading || !email || !password
                ? 'rgba(124,131,253,0.2)'
                : 'linear-gradient(135deg, #7c83fd, #4f46e5)',
              border: 'none', borderRadius: 12,
              color: loading || !email || !password ? 'rgba(255,255,255,0.4)' : 'white',
              fontSize: 14, fontWeight: 700,
              cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: loading || !email || !password ? 'none' : '0 6px 20px rgba(124,131,253,0.3)',
              letterSpacing: '0.3px',
            }}
              onMouseEnter={e => { if (!loading && email && password) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {loading ? 'Verificando...' : 'Ingresar al panel'}
            </button>
          </form>
        </div>

        {/* Volver */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="/" style={{
            fontSize: 12, color: 'rgba(255,255,255,0.2)',
            textDecoration: 'none', transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
          >← Volver a Fluxy</a>
        </div>
      </div>
    </div>
  )
}