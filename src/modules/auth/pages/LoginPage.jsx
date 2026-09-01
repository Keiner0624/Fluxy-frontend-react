// src/modules/auth/pages/LoginPage.jsx
import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { API_URL, buildStoreUrl } from '@/app/config'
import BrandLogo from '@/components/BrandLogo'
import Icon from '@/components/Icon'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Por favor completa todos los campos.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('Correo o contraseña incorrectos.')

      const data = await res.json()
      localStorage.setItem('token', data.token)
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user))

      const companyRes = await fetch(`${API_URL}/companies/my-company`, {
        headers: { Authorization: `Bearer ${data.token}` },
      })

      if (companyRes.ok) {
        const company = await companyRes.json()
        localStorage.setItem('company', JSON.stringify({
          id:         company.id,
          name:       company.name,
          slug:       company.slug,
          plan:       company.plan      || 'FREE',
          logoUrl:    company.logoUrl   || '',
          storeStyle: company.storeStyle || '',
          storeUrl:   buildStoreUrl(company.slug),
        }))
      }

      const returnTo = searchParams.get('returnTo') || '/dashboard'
      navigate(returnTo)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fx fx-auth">
      <header className="fx-auth__top">
        <Link to="/">
          <BrandLogo size={28} textSize={18} textColor="var(--fx-ink)" />
        </Link>
        <Link to="/" className="fx-btn fx-btn--ghost fx-btn--sm">
          <Icon name="arrowLeft" size={15} />
          Volver al inicio
        </Link>
      </header>

      <main className="fx-auth__main">
        <div className="fx-auth__panel">
          <div className="fx-auth__head">
            <h1 className="fx-h1">Iniciar sesión</h1>
            <p className="fx-hint">Accedé al panel para administrar tu tienda.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="fx-field">
              <label className="fx-label" htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={`fx-input${error ? ' fx-input--error' : ''}`}
                placeholder="tu@negocio.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="fx-field">
              <div className="fx-row fx-row--between" style={{ marginBottom: 6 }}>
                <label className="fx-label" htmlFor="password" style={{ marginBottom: 0 }}>Contraseña</label>
                <Link to="/forgot-password" className="fx-auth__link">¿Olvidaste tu contraseña?</Link>
              </div>
              <div className="fx-input-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`fx-input${error ? ' fx-input--error' : ''}`}
                  placeholder="Tu contraseña"
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
              {loading ? <><span className="fx-spinner" /> Ingresando…</> : 'Iniciar sesión'}
            </button>
          </form>

          <p className="fx-auth__foot">
            ¿No tenés cuenta? <Link to="/register-business" className="fx-auth__link">Creá tu tienda</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
