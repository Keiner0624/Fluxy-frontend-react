// src/modules/auth/pages/ResetPasswordPage.jsx
import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { API_URL } from '../../app/config'
import BrandLogo from '../../components/BrandLogo'

export default function ResetPasswordPage() {
  const [searchParams]          = useSearchParams()
  const navigate                = useNavigate()
  const token                   = searchParams.get('token')

  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [validating, setValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [done, setDone]             = useState(false)
  const [error, setError]           = useState('')

  // Validar token al cargar
  useEffect(() => {
    if (!token) { setValidating(false); return }
    fetch(`${API_URL}/auth/reset-password?token=${token}`)
      .then(r => r.json())
      .then(data => setTokenValid(data.valid === true))
      .catch(() => setTokenValid(false))
      .finally(() => setValidating(false))
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }

    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al restablecer la contraseña')
      setDone(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12, padding: '14px 44px 14px 44px',
    color: 'white', fontSize: 14, outline: 'none',
    fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#06060f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(124,131,253,0.12) 0%, transparent 65%)',
        pointerEvents: 'none',
      }}/>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <BrandLogo size={38} textSize={20} />
          </Link>
        </div>

        <div style={{
          background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24, padding: '36px 32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>

          {/* Cargando validación */}
          {validating && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.6 }}>⟳</div>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Verificando link...</p>
            </div>
          )}

          {/* Token inválido */}
          {!validating && !tokenValid && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>⏰</div>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: 'white', marginBottom: 12 }}>
                Link expirado
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
                Este link ya fue usado o expiró. Los links son válidos por 1 hora.
              </p>
              <Link to="/forgot-password" style={{
                display: 'block', textAlign: 'center', padding: '13px',
                background: 'linear-gradient(135deg, #7c83fd, #4f46e5)',
                color: 'white', borderRadius: 12, fontSize: 14, fontWeight: 600,
                textDecoration: 'none', marginBottom: 12,
              }}>Solicitar nuevo link</Link>
              <Link to="/login" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Volver al login
              </Link>
            </div>
          )}

          {/* Contraseña restablecida */}
          {done && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: 'white', marginBottom: 12 }}>
                ¡Contraseña actualizada!
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
                Tu contraseña fue restablecida. Redirigiendo al login en 3 segundos...
              </p>
              <Link to="/login" style={{
                display: 'block', textAlign: 'center', padding: '13px',
                background: 'linear-gradient(135deg, #34d399, #059669)',
                color: 'white', borderRadius: 12, fontSize: 14, fontWeight: 600,
                textDecoration: 'none',
              }}>Ir al login ahora →</Link>
            </div>
          )}

          {/* Formulario */}
          {!validating && tokenValid && !done && (
            <>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 700, color: 'white', marginBottom: 8 }}>
                  Nueva contraseña
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                  Elige una contraseña segura de al menos 6 caracteres.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Nueva contraseña */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
                    Nueva contraseña
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔒</span>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError('') }}
                      placeholder="Mínimo 6 caracteres"
                      autoFocus
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = 'rgba(124,131,253,0.5)'; e.target.style.background = 'rgba(124,131,253,0.05)' }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)' }}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 16, cursor: 'pointer', padding: 4 }}>
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {/* Confirmar contraseña */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
                    Confirmar contraseña
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔑</span>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => { setConfirm(e.target.value); setError('') }}
                      placeholder="Repite tu contraseña"
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = 'rgba(124,131,253,0.5)'; e.target.style.background = 'rgba(124,131,253,0.05)' }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)' }}
                    />
                  </div>
                  {/* Indicador de coincidencia */}
                  {confirm && (
                    <div style={{ fontSize: 12, marginTop: 6, color: password === confirm ? '#34d399' : '#f87171' }}>
                      {password === confirm ? '✅ Las contraseñas coinciden' : '❌ No coinciden'}
                    </div>
                  )}
                </div>

                {error && (
                  <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#f87171', marginBottom: 16, textAlign: 'center' }}>
                    ⚠️ {error}
                  </div>
                )}

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '15px',
                  background: loading ? 'rgba(124,131,253,0.4)' : 'linear-gradient(135deg, #7c83fd, #4f46e5)',
                  color: 'white', borderRadius: 12, fontSize: 15, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 8px 24px rgba(124,131,253,0.3)',
                  border: 'none', transition: 'all 0.3s',
                }}>
                  {loading ? 'Guardando...' : '🔐 Guardar nueva contraseña'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}