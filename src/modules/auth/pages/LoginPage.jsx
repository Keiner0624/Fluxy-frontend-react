// src/modules/auth/pages/LoginPage.jsx
import { useEffect, useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { API_URL } from '@/app/config'
import BrandLogo from '@/components/BrandLogo'
import Icon from '@/components/Icon'
import { Divider, IconField, PasswordField, SocialButtons } from '../components/AuthUi'
import { rememberSignup, safeReturnTo, startSession } from '../authSession'
import '../auth.css'

const NOTICES = {
  expired: 'Tu sesión venció. Iniciá sesión de nuevo para continuar.',
  disabled: 'Tu acceso a este negocio fue desactivado. Consultá con el dueño.',
  reset: 'Contraseña actualizada. Iniciá sesión con la nueva.',
}

// Gestor de contraseñas del navegador (Chrome y Edge). Si el usuario lo configuró, el
// navegador pide Windows Hello, Touch ID o el PIN antes de entregar la contraseña.
const canUseSavedPasswords = () => typeof window !== 'undefined' && 'PasswordCredential' in window && Boolean(navigator.credentials)

function savePassword(email, password) {
  if (!canUseSavedPasswords()) return
  try {
    navigator.credentials.store(new window.PasswordCredential({ id: email, password, name: email })).catch(() => {})
  } catch { /* el navegador no lo permite */ }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ email: '', password: '', rememberMe: true })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const notice = NOTICES[searchParams.get('reason')] || ''
  const returnTo = safeReturnTo(searchParams.get('returnTo'))

  // Ofrece las cuentas guardadas al entrar y rellena correo y contraseña con la elegida.
  useEffect(() => {
    if (!canUseSavedPasswords()) return undefined
    let vigente = true
    navigator.credentials.get({ password: true, mediation: 'optional' })
      .then((credential) => {
        if (!vigente || credential?.type !== 'password' || !credential.password) return
        setForm((f) => ({ ...f, email: credential.id, password: credential.password }))
      })
      .catch(() => { /* sin cuentas guardadas o el usuario cerró el selector */ })
    return () => { vigente = false }
  }, [])

  const handleChange = ({ target }) => {
    setForm((f) => ({ ...f, [target.name]: target.type === 'checkbox' ? target.checked : target.value }))
    setError('')
  }

  const enter = async (auth) => {
    const { company } = await startSession(auth)
    navigate(company ? returnTo : '/dashboard', { replace: true })
  }

  const continueSignup = (signup) => {
    rememberSignup(signup)
    navigate('/register-business?step=continue', { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email.trim() || !form.password) {
      setError('Completá tu correo y tu contraseña.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim(), password: form.password, rememberMe: form.rememberMe }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        if (form.rememberMe) savePassword(form.email.trim(), form.password)
        await enter(data)
        return
      }
      if (data.code === 'VERIFICATION_REQUIRED' && data.details?.signupToken) {
        continueSignup({ signupToken: data.details.signupToken })
        return
      }
      if (res.status === 401) throw new Error('Correo o contraseña incorrectos.')
      throw new Error(data.message || 'No pudimos iniciar sesión. Intentá de nuevo.')
    } catch (err) {
      setError(err instanceof TypeError ? 'No se pudo conectar con el servidor. Revisá tu conexión.' : err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleProvider = async (result) => {
    if (result.status === 'LOGGED_IN') await enter(result.session)
    else continueSignup(result.signup)
  }

  return (
    <div className="fx fx-auth fx-signin">
      <header className="fx-auth__top">
        <Link to="/"><BrandLogo size={28} textSize={18} textColor="var(--fx-ink)" /></Link>
        <Link to="/" className="fx-btn fx-btn--ghost fx-btn--sm">
          <Icon name="arrowLeft" size={15} /> Volver al inicio
        </Link>
      </header>

      <main className="fx-auth__main">
        <div className="fx-auth__panel">
          <div className="fx-auth__head">
            <h1 className="fx-h1">Inicia sesión</h1>
            <p className="fx-hint">Accedé al panel para administrar tu tienda.</p>
          </div>

          {notice && !error && (
            <div className={`fx-alert ${searchParams.get('reason') === 'reset' ? 'fx-alert--ok' : 'fx-alert--warn'}`} role="status" style={{ marginBottom: 18 }}>
              <Icon name="info" size={16} /><span>{notice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate aria-busy={loading}>
            <IconField id="email" label="Correo electrónico" icon="mail">
              {(aria) => (
                <input {...aria} id="email" name="email" type="email" autoComplete="username" inputMode="email"
                  className={`fx-input${error ? ' fx-input--error' : ''}`} placeholder="tu@negocio.com"
                  value={form.email} onChange={handleChange} maxLength={254} />
              )}
            </IconField>

            <PasswordField value={form.password} onChange={handleChange} autoComplete="current-password"
              placeholder="Tu contraseña" invalid={Boolean(error)} />

            <div className="fx-signin__row">
              <label className="fx-check">
                <input type="checkbox" name="rememberMe" checked={form.rememberMe} onChange={handleChange} />
                <span>Recordarme en este dispositivo</span>
              </label>
              <Link to="/forgot-password" className="fx-auth__link">¿Olvidaste tu contraseña?</Link>
            </div>

            {error && (
              <div className="fx-alert fx-alert--error" role="alert" style={{ marginBottom: 16 }}>
                <Icon name="alert" size={16} /><span>{error}</span>
              </div>
            )}

            <button type="submit" className="fx-btn fx-btn--primary fx-btn--lg fx-btn--block fx-signin__submit" disabled={loading}>
              {loading ? <><span className="fx-spinner" /> Ingresando…</> : <>Iniciar sesión <Icon name="arrowRight" size={17} /></>}
            </button>
          </form>

          <Divider>o continúa con</Divider>
          <SocialButtons rememberMe={form.rememberMe} onResult={handleProvider} onError={(err) => setError(err.message)} googleText="signin_with" />

          <p className="fx-auth__foot">
            ¿No tenés cuenta? <Link to="/register-business" className="fx-auth__link">Crear tu tienda</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
