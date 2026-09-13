import { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_URL, buildStoreUrl } from '@/app/config'
import BrandLogo from '@/components/BrandLogo'
import Icon from '@/components/Icon'
import { invalidateAccount } from '@/app/account'
import { BUSINESS_CATEGORIES, normalizePhone, normalizeRegistration, validateRegistration, apiFieldErrors } from '../registration'
import '../registration.css'

function Field({ name, label, errors, children, hint }) {
  return <div className="fx-field">
    <label className="fx-label" htmlFor={name}>{label}</label>
    {children}
    {hint && <p className="fx-hint" id={name + '-hint'}>{hint}</p>}
    {errors[name] && <p className="fx-registration-error" id={name + '-error'} role="alert">{errors[name]}</p>}
  </div>
}

export default function RegisterBusinessPage() {
  const navigate = useNavigate()
  const submitting = useRef(false)
  const [form, setForm] = useState({ fullName: '', businessName: '', category: '', whatsapp: '', email: '', password: '', taxId: '', termsAccepted: false })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')

  const handleChange = ({ target }) => {
    const value = target.type === 'checkbox' ? target.checked : target.value
    setForm(current => ({ ...current, [target.name]: value }))
    setErrors(current => ({ ...current, [target.name]: undefined }))
    setError('')
  }
  const inputProps = (name, hint = false) => ({
    id: name, name, value: form[name], onChange: handleChange,
    className: 'fx-input' + (errors[name] ? ' fx-input--error' : ''),
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': [hint && name + '-hint', errors[name] && name + '-error'].filter(Boolean).join(' ') || undefined,
  })

  const handleSubmit = async event => {
    event.preventDefault()
    if (submitting.current) return
    const payload = normalizeRegistration(form)
    const fieldErrors = validateRegistration(payload)
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length) {
      document.getElementById(Object.keys(fieldErrors)[0])?.focus()
      return
    }
    submitting.current = true
    setLoading(true)
    setError('')
    try {
      const res = await fetch(API_URL + '/auth/register-business', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErrors(apiFieldErrors(data))
        throw new Error(data.message || 'No se pudo crear la tienda. Intenta nuevamente.')
      }
      if (!data.token || !data.company?.id) throw new Error('La respuesta del servidor está incompleta. Intenta iniciar sesión.')
      const company = { ...data.company, storeUrl: buildStoreUrl(data.company.slug) }
      localStorage.setItem('token', data.token)
      localStorage.setItem('company', JSON.stringify(company))
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.removeItem('storeStyle')
      invalidateAccount()
      navigate('/dashboard/onboarding', { replace: true })
    } catch (err) {
      setError(err instanceof TypeError ? 'No se pudo conectar al backend. Tus datos siguen en el formulario; intenta nuevamente.' : err.message)
    } finally {
      submitting.current = false
      setLoading(false)
    }
  }

  return <div className="fx fx-auth fx-registration">
    <header className="fx-auth__top">
      <Link to="/"><BrandLogo size={28} textSize={18} textColor="var(--fx-ink)" /></Link>
      <Link to="/login" className="fx-btn fx-btn--ghost fx-btn--sm">Ya tengo cuenta</Link>
    </header>
    <main className="fx-auth__main">
      <div className="fx-auth__panel">
        <div className="fx-auth__head">
          <span className="fx-eyebrow">Tu negocio empieza aquí</span>
          <h1 className="fx-h1">Crea tu tienda</h1>
          <p className="fx-hint">Empieza gratis. No necesitas tarjeta de crédito.</p>
        </div>
        <form onSubmit={handleSubmit} noValidate aria-busy={loading}>
          <fieldset disabled={loading} className="fx-registration-fields">
            <Field name="fullName" label="Tu nombre" errors={errors}>
              <input {...inputProps('fullName')} required autoComplete="name" maxLength={80} placeholder="Eduardo Moreno" />
            </Field>
            <Field name="businessName" label="Nombre del negocio" errors={errors}>
              <input {...inputProps('businessName')} required autoComplete="organization" maxLength={120} placeholder="Tech Store Perú" />
            </Field>
            <Field name="category" label="Rubro" errors={errors}>
              <select {...inputProps('category')} required>
                <option value="">Selecciona tu rubro</option>
                {Object.entries(BUSINESS_CATEGORIES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
            <Field name="whatsapp" label="WhatsApp" errors={errors} hint="Celular peruano donde recibirás las consultas y pedidos.">
              <div className="fx-registration-phone">
                <span aria-hidden="true">+51</span>
                <input {...inputProps('whatsapp', true)} required type="tel" inputMode="tel" autoComplete="tel-national" maxLength={18} placeholder="999 888 777"
                  onBlur={() => setForm(current => ({ ...current, whatsapp: normalizePhone(current.whatsapp) }))} />
              </div>
            </Field>
            <Field name="email" label="Correo electrónico" errors={errors}>
              <input {...inputProps('email')} required type="email" autoComplete="email" maxLength={254} placeholder="hola@tienda.pe" />
            </Field>
            <Field name="password" label="Contraseña" errors={errors} hint={(form.password.length >= 8 ? 'Mínimo alcanzado. ' : 'Mínimo 8 caracteres. ') + 'Puedes usar una frase fácil de recordar.'}>
              <div className="fx-input-wrap">
                <input {...inputProps('password', true)} required type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} maxLength={72} placeholder="Mínimo 8 caracteres" />
                <button type="button" className="fx-input-affix" onClick={() => setShowPassword(current => !current)} aria-pressed={showPassword} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
                </button>
              </div>
            </Field>
            <Field name="taxId" label="RUC o DNI (opcional)" errors={errors} hint="Puedes agregarlo más adelante. No se mostrará en tu tienda pública.">
              <input {...inputProps('taxId', true)} inputMode="numeric" maxLength={11} placeholder="8 u 11 dígitos" />
            </Field>
            <div className="fx-field">
              <div className="fx-registration-consent">
                <input id="termsAccepted" name="termsAccepted" type="checkbox" checked={form.termsAccepted} onChange={handleChange} required aria-invalid={Boolean(errors.termsAccepted)} aria-describedby={errors.termsAccepted ? 'termsAccepted-error' : undefined} />
                <label htmlFor="termsAccepted">Acepto los <Link to="/terms" target="_blank" rel="noopener">Términos de uso</Link> y la <Link to="/terms?doc=privacy" target="_blank" rel="noopener">Política de privacidad</Link>.</label>
              </div>
              {errors.termsAccepted && <p id="termsAccepted-error" className="fx-registration-error" role="alert">{errors.termsAccepted}</p>}
            </div>
            {error && <div className="fx-alert fx-alert--error" role="alert"><Icon name="alert" size={16} /><span>{error}</span></div>}
            <button type="submit" className="fx-btn fx-btn--primary fx-btn--lg fx-btn--block" disabled={loading}>
              {loading ? <><span className="fx-spinner" /> Creando tu tienda…</> : 'Crear mi tienda'}
            </button>
          </fieldset>
        </form>
        <p className="fx-auth__foot">Configurado para Perú · Soles (PEN)<br />Puedes completar los detalles de tu negocio después.</p>
      </div>
    </main>
  </div>
}
