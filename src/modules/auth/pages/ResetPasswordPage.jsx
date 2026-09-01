// src/modules/auth/pages/ResetPasswordPage.jsx
import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { API_URL } from '@/app/config'
import BrandLogo from '@/components/BrandLogo'
import Icon from '@/components/Icon'

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
              Ya podés ingresar con tu contraseña nueva. Te vamos a redirigir en unos segundos.
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
          <p className="fx-hint">Elegí una contraseña de al menos 6 caracteres.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="fx-field">
            <label className="fx-label" htmlFor="password">Contraseña</label>
            <div className="fx-input-wrap">
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                className={`fx-input${error ? ' fx-input--error' : ''}`}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
              />
              <button
                type="button"
                className="fx-input-affix"
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <Icon name={showPass ? 'eyeOff' : 'eye'} size={16} />
              </button>
            </div>
          </div>

          <div className="fx-field">
            <label className="fx-label" htmlFor="confirm">Repetir contraseña</label>
            <input
              id="confirm"
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              className={`fx-input${error ? ' fx-input--error' : ''}`}
              placeholder="Repetí la contraseña"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setError('') }}
            />
          </div>

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
    <div className="fx fx-auth">
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
