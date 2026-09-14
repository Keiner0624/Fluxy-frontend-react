// src/modules/auth/pages/ForgotPasswordPage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '@/app/config'
import BrandLogo from '@/components/BrandLogo'
import Icon from '@/components/Icon'
import { IconField } from '../components/AuthUi'
import '../auth.css'

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
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'No pudimos enviar el enlace. Intentá de nuevo.')
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fx fx-auth fx-signin">
      <header className="fx-auth__top">
        <Link to="/">
          <BrandLogo size={28} textSize={18} textColor="var(--fx-ink)" />
        </Link>
        <Link to="/login" className="fx-btn fx-btn--ghost fx-btn--sm">
          <Icon name="arrowLeft" size={15} />
          Volver
        </Link>
      </header>

      <main className="fx-auth__main">
        <div className="fx-auth__panel">
          {sent ? (
            <>
              <div className="fx-auth__head">
                <div className="fx-auth__mark fx-auth__mark--ok">
                  <Icon name="checkCircle" size={22} />
                </div>
                <h1 className="fx-h1">Revisá tu correo</h1>
                <p className="fx-hint">
                  Si <strong style={{ color: 'var(--fx-ink)' }}>{email.trim()}</strong> está registrado,
                  te enviamos un enlace para restablecer tu contraseña. Sirve una sola vez y vence en 30 minutos.
                </p>
              </div>

              <div className="fx-alert" style={{ marginBottom: 20 }}>
                <Icon name="info" size={16} />
                <span>¿No lo ves? Revisá la carpeta de spam o correo no deseado.</span>
              </div>

              <Link to="/login" className="fx-btn fx-btn--secondary fx-btn--lg fx-btn--block">
                Volver a iniciar sesión
              </Link>

              <p className="fx-auth__foot">
                <button
                  type="button"
                  className="fx-auth__link"
                  style={{ border: 'none', background: 'none', cursor: 'pointer', font: 'inherit' }}
                  onClick={() => { setSent(false); setError('') }}
                >
                  Probar con otro correo
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="fx-auth__head">
                <h1 className="fx-h1">Restablecer contraseña</h1>
                <p className="fx-hint">
                  Ingresá tu correo y te enviamos un enlace para crear una contraseña nueva.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <IconField id="email" label="Correo electrónico" icon="mail">
                  {(aria) => (
                    <input {...aria} id="email" type="email" autoComplete="email" inputMode="email" maxLength={254}
                      className={`fx-input${error ? ' fx-input--error' : ''}`} placeholder="tu@negocio.com"
                      value={email} onChange={(e) => { setEmail(e.target.value); setError('') }} />
                  )}
                </IconField>

                {error && (
                  <div className="fx-alert fx-alert--error" role="alert" style={{ marginBottom: 16 }}>
                    <Icon name="alert" size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" className="fx-btn fx-btn--primary fx-btn--lg fx-btn--block fx-signin__submit" disabled={loading}>
                  {loading ? <><span className="fx-spinner" /> Enviando…</> : 'Enviar enlace'}
                </button>
              </form>

              <p className="fx-auth__foot">
                ¿Recordaste tu contraseña? <Link to="/login" className="fx-auth__link">Iniciar sesión</Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
