// src/modules/auth/pages/ResetPasswordPage.jsx
import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { API_URL } from '@/app/config'
import BrandLogo from '@/components/BrandLogo'
import Icon from '@/components/Icon'
import { PasswordField } from '../components/AuthUi'
import { PASSWORD_MIN } from '../registration'
import '../auth.css'

export default function ResetPasswordPage() {
  const [searchParams]          = useSearchParams()
  const navigate                = useNavigate()
  const token                   = searchParams.get('token')

  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [loading, setLoading]       = useState(false)
  const [validating, setValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [done, setDone]             = useState(false)
  const [error, setError]           = useState('')

  // Validar token al cargar
  useEffect(() => {
    if (!token) { setValidating(false); return }
    fetch(`${API_URL}/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(data => setTokenValid(data.valid === true))
      .catch(() => setTokenValid(false))
      .finally(() => setValidating(false))
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < PASSWORD_MIN) { setError(`La contraseña tiene que tener al menos ${PASSWORD_MIN} caracteres.`); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }

    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'No se pudo restablecer la contraseña.')
      setDone(true)
      setTimeout(() => navigate('/login?reason=reset'), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const renderBody = () => {
    if (validating) {
      return (
        <div className="fx-auth__head" style={{ textAlign: 'center' }}>
          <span className="fx-spinner" style={{ color: 'var(--fx-brand)', width: 22, height: 22 }} />
          <p className="fx-hint" style={{ marginTop: 14 }}>Verificando el enlace…</p>
        </div>
      )
    }

    if (!token || !tokenValid) {
      return (
        <>
          <div className="fx-auth__head">
            <div className="fx-auth__mark fx-auth__mark--danger">
              <Icon name="alert" size={22} />
            </div>
            <h1 className="fx-h1">Enlace no válido</h1>
            <p className="fx-hint">
              Este enlace ya venció o fue utilizado. Solicitá uno nuevo para continuar.
            </p>
          </div>

          <Link to="/forgot-password" className="fx-btn fx-btn--primary fx-btn--lg fx-btn--block">
            Solicitar un enlace nuevo
          </Link>

          <p className="fx-auth__foot">
            <Link to="/login" className="fx-auth__link">Volver a iniciar sesión</Link>
          </p>
        </>
      )
    }

    if (done) {
      return (
        <>
          <div className="fx-auth__head">
            <div className="fx-auth__mark fx-auth__mark--ok">
              <Icon name="checkCircle" size={22} />
            </div>
            <h1 className="fx-h1">Contraseña actualizada</h1>
            <p className="fx-hint">
              Por seguridad cerramos todas las sesiones abiertas. Ya podés ingresar con tu contraseña nueva.
            </p>
          </div>

          <Link to="/login" className="fx-btn fx-btn--primary fx-btn--lg fx-btn--block">
            Ir a iniciar sesión
          </Link>
        </>
      )
    }

    return (
      <>
        <div className="fx-auth__head">
          <h1 className="fx-h1">Nueva contraseña</h1>
          <p className="fx-hint">Elegí una contraseña de al menos {PASSWORD_MIN} caracteres. Al guardarla se cierran todas tus sesiones.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <PasswordField id="password" label="Contraseña nueva" value={password} autoComplete="new-password" invalid={Boolean(error)}
            placeholder={`Mínimo ${PASSWORD_MIN} caracteres`} onChange={(e) => { setPassword(e.target.value); setError('') }} autoFocus />
          <PasswordField id="confirm" label="Repetir contraseña" value={confirm} autoComplete="new-password" invalid={Boolean(error)}
            placeholder="Repetí la contraseña" onChange={(e) => { setConfirm(e.target.value); setError('') }} />

          {error && (
            <div className="fx-alert fx-alert--error" role="alert" style={{ marginBottom: 16 }}>
              <Icon name="alert" size={16} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="fx-btn fx-btn--primary fx-btn--lg fx-btn--block" disabled={loading}>
            {loading ? <><span className="fx-spinner" /> Guardando…</> : 'Guardar contraseña'}
          </button>
        </form>

        <p className="fx-auth__foot">
          <Link to="/login" className="fx-auth__link">Volver a iniciar sesión</Link>
        </p>
      </>
    )
  }

  return (
    <div className="fx fx-auth fx-signin">
      <header className="fx-auth__top">
        <Link to="/">
          <BrandLogo size={28} textSize={18} textColor="var(--fx-ink)" />
        </Link>
      </header>

      <main className="fx-auth__main">
        <div className="fx-auth__panel">{renderBody()}</div>
      </main>
    </div>
  )
}
