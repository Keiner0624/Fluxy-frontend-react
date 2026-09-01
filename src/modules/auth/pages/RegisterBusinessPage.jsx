// src/modules/auth/pages/RegisterBusinessPage.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_URL, buildStoreUrl } from '@/app/config'
import BrandLogo from '@/components/BrandLogo'
import Icon from '@/components/Icon'

function getToken() {
  return localStorage.getItem('token') || ''
}

export default function RegisterBusinessPage() {
  const navigate = useNavigate()

  const [step, setStep]                   = useState(1)
  const [form, setForm]                   = useState({ businesName: '', whatssapp: '', email: '', password: '' })
  const [showPassword, setShowPassword]   = useState(false)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const [profile, setProfile]             = useState({ firstName: '', lastName: '', birthDate: '' })
  const [savingProfile, setSavingProfile] = useState(false)

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
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Error al registrar el negocio')
      }

      const data    = await res.json()
      const company = data.company
        ? { ...data.company, storeUrl: data.company.slug ? buildStoreUrl(data.company.slug) : data.company.storeUrl || '' }
        : {}

      localStorage.setItem('token',   data.token)
      localStorage.setItem('company', JSON.stringify(company))
      localStorage.setItem('user',    JSON.stringify(data.user))
      localStorage.removeItem('storeStyle')

      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!profile.firstName) { setError('El nombre es obligatorio.'); return }

    setSavingProfile(true)
    setError('')

    try {
      await fetch(`${API_URL}/me/profile`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify(profile),
      })
    } catch { /* si falla el PUT, el perfil igual se persiste en local */ }
    finally {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        localStorage.setItem('user', JSON.stringify({ ...user, ...profile }))
      } catch { /* localStorage no disponible o con datos corruptos */ }
      setSavingProfile(false)
      navigate('/dashboard')
    }
  }

  const handleSkip = () => navigate('/dashboard')

  return (
    <div className="fx fx-auth">
      <header className="fx-auth__top">
        <Link to="/">
          <BrandLogo size={28} textSize={18} textColor="var(--fx-ink)" />
        </Link>
        {step === 1 && (
          <Link to="/login" className="fx-btn fx-btn--ghost fx-btn--sm">Ya tengo cuenta</Link>
        )}
      </header>

      <main className="fx-auth__main">
        <div className="fx-auth__panel">
          <div className="fx-auth__steps" aria-label={`Paso ${step} de 2`}>
            <span className="fx-auth__step fx-auth__step--on" />
            <span className={`fx-auth__step${step === 2 ? ' fx-auth__step--on' : ''}`} />
          </div>

          {step === 1 ? (
            <>
              <div className="fx-auth__head">
                <span className="fx-eyebrow">Paso 1 de 2</span>
                <h1 className="fx-h1" style={{ marginTop: 8 }}>Creá tu tienda</h1>
                <p className="fx-hint">Empezá gratis. No se requiere tarjeta de crédito.</p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="fx-field">
                  <label className="fx-label" htmlFor="businesName">Nombre del negocio</label>
                  <input
                    id="businesName"
                    name="businesName"
                    className="fx-input"
                    placeholder="Mi Negocio"
                    value={form.businesName}
                    onChange={handleChange}
                  />
                </div>

                <div className="fx-field">
                  <label className="fx-label" htmlFor="whatssapp">WhatsApp</label>
                  <input
                    id="whatssapp"
                    name="whatssapp"
                    type="tel"
                    className="fx-input"
                    placeholder="999888777"
                    value={form.whatssapp}
                    onChange={handleChange}
                  />
                  <p className="fx-hint" style={{ marginTop: 6, fontSize: 12.5 }}>
                    Es el número donde vas a recibir los pedidos.
                  </p>
                </div>

                <div className="fx-field">
                  <label className="fx-label" htmlFor="email">Correo electrónico</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="fx-input"
                    placeholder="tu@negocio.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="fx-field">
                  <label className="fx-label" htmlFor="password">Contraseña</label>
                  <div className="fx-input-wrap">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className="fx-input"
                      placeholder="Mínimo 6 caracteres"
                      value={form.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="fx-input-affix"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      <Icon name={showPassword ? 'eyeOff' : 'eye'} size={16} />
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="fx-alert fx-alert--error" role="alert" style={{ marginBottom: 16 }}>
                    <Icon name="alert" size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" className="fx-btn fx-btn--primary fx-btn--lg fx-btn--block" disabled={loading}>
                  {loading ? <><span className="fx-spinner" /> Creando tu tienda…</> : 'Crear mi tienda'}
                </button>
              </form>

              <p className="fx-auth__foot">
                Al registrarte aceptás nuestros{' '}
                <Link to="/terms" className="fx-auth__link">Términos de uso</Link> y la{' '}
                <Link to="/terms?doc=privacy" className="fx-auth__link">Política de privacidad</Link>.
              </p>
            </>
          ) : (
            <>
              <div className="fx-auth__head">
                <span className="fx-eyebrow">Paso 2 de 2</span>
                <h1 className="fx-h1" style={{ marginTop: 8 }}>Contanos quién sos</h1>
                <p className="fx-hint">Usamos estos datos para personalizar tu panel. Podés completarlos después.</p>
              </div>

              <form onSubmit={handleSaveProfile} noValidate>
                <div className="fx-field">
                  <label className="fx-label" htmlFor="firstName">Nombre</label>
                  <input
                    id="firstName"
                    name="firstName"
                    className="fx-input"
                    placeholder="Tu nombre"
                    value={profile.firstName}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="fx-field">
                  <label className="fx-label" htmlFor="lastName">Apellido</label>
                  <input
                    id="lastName"
                    name="lastName"
                    className="fx-input"
                    placeholder="Tu apellido"
                    value={profile.lastName}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="fx-field">
                  <label className="fx-label" htmlFor="birthDate">Fecha de nacimiento</label>
                  <input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    className="fx-input"
                    value={profile.birthDate}
                    onChange={handleProfileChange}
                  />
                </div>

                {error && (
                  <div className="fx-alert fx-alert--error" role="alert" style={{ marginBottom: 16 }}>
                    <Icon name="alert" size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" className="fx-btn fx-btn--primary fx-btn--lg fx-btn--block" disabled={savingProfile}>
                  {savingProfile ? <><span className="fx-spinner" /> Guardando…</> : 'Continuar al panel'}
                </button>

                <button
                  type="button"
                  className="fx-btn fx-btn--ghost fx-btn--block"
                  style={{ marginTop: 10 }}
                  onClick={handleSkip}
                >
                  Completar más tarde
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
