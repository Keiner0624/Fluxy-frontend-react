// src/modules/auth/pages/AcceptInvitePage.jsx
// Aceptar una invitación al equipo: la persona crea su acceso y entra al panel.
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { API_URL } from '@/app/config'
import { ROLES } from '@/app/format'
import { IconField, PasswordField } from '../components/AuthUi'
import { startSession } from '../authSession'
import { PASSWORD_MIN } from '../registration'
import { legalUrl } from '@/modules/landing/legal/documents'
import '../auth.css'
import BrandLogo from '@/components/BrandLogo'
import Icon from '@/components/Icon'

const INVALID = {
  NOT_FOUND: 'Este enlace de invitación no existe. Revisá que lo hayas copiado completo.',
  EXPIRED: 'La invitación venció. Pedile a quien te invitó que la reenvíe.',
  REVOKED: 'La invitación fue revocada. Si fue un error, pedí una nueva.',
  ACCEPTED: 'Esta invitación ya se usó. Iniciá sesión con tu correo.',
}

export default function AcceptInvitePage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [info, setInfo] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API_URL}/auth/invitations/${encodeURIComponent(token)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error())))
      .then(setInfo)
      .catch(() => setLoadError('No pudimos consultar la invitación. Intentá de nuevo en unos segundos.'))
  }, [token])

  const submit = async (e) => {
    e.preventDefault()
    if (fullName.trim().length < 2) { setError('Ingresá tu nombre completo.'); return }
    if (password.length < PASSWORD_MIN) { setError(`La contraseña tiene que tener al menos ${PASSWORD_MIN} caracteres.`); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/auth/invitations/${encodeURIComponent(token)}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: fullName.trim(), password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'No se pudo aceptar la invitación.')

      await startSession(data)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fx fx-auth fx-signin">
      <header className="fx-auth__top">
        <Link to="/"><BrandLogo size={28} textSize={18} textColor="var(--fx-ink)" /></Link>
        <Link to="/login" className="fx-btn fx-btn--ghost fx-btn--sm">Iniciar sesión</Link>
      </header>

      <main className="fx-auth__main">
        <div className="fx-auth__panel">
          {!info && !loadError && (
            <div className="fx-grid" style={{ gap: 10 }}>
              <div className="fx-skeleton" style={{ height: 28, width: '70%' }} />
              <div className="fx-skeleton" style={{ height: 16 }} />
              <div className="fx-skeleton" style={{ height: 180, marginTop: 14 }} />
            </div>
          )}

          {loadError && (
            <div className="fx-alert fx-alert--error"><Icon name="alert" size={16} /><span>{loadError}</span></div>
          )}

          {info && !info.valid && (
            <>
              <div className="fx-auth__mark fx-auth__mark--danger"><Icon name="alert" size={22} /></div>
              <h1 className="fx-h1" style={{ marginBottom: 8 }}>Invitación no disponible</h1>
              <p className="fx-hint" style={{ fontSize: 14, marginBottom: 22 }}>{INVALID[info.reason] || INVALID.NOT_FOUND}</p>
              <Link to="/login" className="fx-btn fx-btn--primary fx-btn--block">Ir a iniciar sesión</Link>
            </>
          )}

          {info?.valid && (
            <>
              <div className="fx-auth__head">
                <h1 className="fx-h1">Sumate a {info.companyName}</h1>
                <p className="fx-hint">
                  Te invitaron con el rol <strong style={{ color: 'var(--fx-ink)' }}>{ROLES[info.role]?.label || info.role}</strong>. Creá tu acceso para entrar al panel.
                </p>
              </div>

              <form onSubmit={submit} noValidate>
                <IconField id="inv-email" label="Correo" icon="mail">
                  {(aria) => <input {...aria} id="inv-email" className="fx-input" value={info.email} readOnly disabled />}
                </IconField>
                <IconField id="inv-name" label="Nombre completo" icon="user">
                  {(aria) => <input {...aria} id="inv-name" className="fx-input" autoComplete="name" value={fullName}
                    onChange={(e) => setFullName(e.target.value)} maxLength={80} autoFocus placeholder="Tu nombre y apellido" />}
                </IconField>
                <PasswordField id="inv-password" value={password} onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password" placeholder={`Mínimo ${PASSWORD_MIN} caracteres`} />

                {error && (
                  <div className="fx-alert fx-alert--error" role="alert" style={{ marginBottom: 16 }}>
                    <Icon name="alert" size={16} /><span>{error}</span>
                  </div>
                )}

                <button type="submit" className="fx-btn fx-btn--primary fx-btn--lg fx-btn--block fx-signin__submit" disabled={saving}>
                  {saving ? <><span className="fx-spinner" /> Creando tu acceso…</> : 'Aceptar invitación'}
                </button>
              </form>

              <p className="fx-auth__foot">
                Al aceptar, aceptás los <Link to={legalUrl('terms')} className="fx-auth__link">términos</Link> y la <Link to={legalUrl('privacy')} className="fx-auth__link">política de privacidad</Link>.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
