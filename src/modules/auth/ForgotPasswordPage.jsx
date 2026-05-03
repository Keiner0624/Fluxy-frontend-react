// src/modules/auth/pages/ForgotPasswordPage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../../app/config'
import BrandLogo from '../../components/BrandLogo'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) { setError('Ingresa tu correo electrónico.'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al enviar el correo')
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#06060f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Glow de fondo */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(124,131,253,0.12) 0%, transparent 65%)',
        pointerEvents: 'none',
      }}/>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <BrandLogo size={38} textSize={20} />
          </Link>
        </div>

        {/* Volver */}
        <Link to="/login" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13, color: 'var(--text-muted)', marginBottom: 32,
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'white'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver al login
        </Link>

        <div style={{
          background: 'rgba(13,13,26,0.9)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24, padding: '36px 32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>
          {sent ? (
            /* ── Estado enviado ── */
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 52, marginBottom: 20 }}>📬</div>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 12 }}>
                ¡Correo enviado!
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 28 }}>
                Si <strong style={{ color: 'white' }}>{email}</strong> está registrado, recibirás un link para restablecer tu contraseña en los próximos minutos.
              </p>
              <div style={{
                background: 'rgba(124,131,253,0.08)', border: '1px solid rgba(124,131,253,0.15)',
                borderRadius: 12, padding: '14px 16px', marginBottom: 24,
                fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6,
              }}>
                📌 Revisa también tu carpeta de <strong style={{ color: 'white' }}>spam</strong> por si acaso.
              </div>
              <Link to="/login" style={{
                display: 'block', textAlign: 'center', padding: '13px',
                background: 'linear-gradient(135deg, #7c83fd, #4f46e5)',
                color: 'white', borderRadius: 12, fontSize: 14, fontWeight: 600,
                textDecoration: 'none',
              }}>
                Volver al login
              </Link>
            </div>
          ) : (
            /* ── Formulario ── */
            <>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 700, color: 'white', marginBottom: 8 }}>
                  ¿Olvidaste tu contraseña?
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Ingresa tu correo y te enviaremos un link para crear una nueva contraseña.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{
                    display: 'block', fontSize: 12, fontWeight: 600,
                    color: 'var(--text-muted)', textTransform: 'uppercase',
                    letterSpacing: '0.8px', marginBottom: 8,
                  }}>Correo electrónico</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>✉️</span>
                    <input
                      type="email" value={email}
                      onChange={e => { setEmail(e.target.value); setError('') }}
                      placeholder="tu@negocio.com"
                      autoFocus
                      style={{
                        width: '100%', background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 12, padding: '14px 14px 14px 44px',
                        color: 'white', fontSize: 14, outline: 'none',
                        fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
                      }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(124,131,253,0.5)'; e.target.style.background = 'rgba(124,131,253,0.05)' }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)' }}
                    />
                  </div>
                </div>

                {error && (
                  <div style={{
                    background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                    borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#f87171',
                    marginBottom: 16, textAlign: 'center',
                  }}>⚠️ {error}</div>
                )}

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '15px',
                  background: loading ? 'rgba(124,131,253,0.4)' : 'linear-gradient(135deg, #7c83fd, #4f46e5)',
                  color: 'white', borderRadius: 12, fontSize: 15, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 8px 24px rgba(124,131,253,0.3)',
                  border: 'none', transition: 'all 0.3s',
                }}>
                  {loading ? 'Enviando...' : '📧 Enviar link de recuperación'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}