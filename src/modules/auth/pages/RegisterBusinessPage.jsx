// src/modules/auth/pages/RegisterBusinessPage.jsx
// Registro verificado: datos → código por correo (y WhatsApp) → tienda creada.
// Quien llega con Google o Apple completa primero los datos del negocio.
import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { API_URL } from '@/app/config'
import BrandLogo from '@/components/BrandLogo'
import Icon from '@/components/Icon'
import { BUSINESS_CATEGORIES, PASSWORD_MIN, apiFieldErrors, normalizePhone, normalizeRegistration, validateRegistration } from '../registration'
import { CodeInput, Divider, IconField, PasswordField, SocialButtons } from '../components/AuthUi'
import useCountdown from '../useCountdown'
import { forgetSignup, recallSignupToken, rememberSignup, startSession } from '../authSession'
import { legalUrl } from '@/modules/landing/legal/documents'
import '../auth.css'

async function post(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const error = new Error(data.message || 'No se pudo completar el paso. Intentá de nuevo.')
    Object.assign(error, { status: res.status, code: data.code, data })
    throw error
  }
  return data
}

const EMPTY = { fullName: '', businessName: '', category: '', whatsapp: '', email: '', password: '', taxId: '', termsAccepted: false }

function Consent({ checked, onChange, error }) {
  return (
    <>
      <label className="fx-signin__consent" htmlFor="termsAccepted">
        <input id="termsAccepted" name="termsAccepted" type="checkbox" checked={checked} onChange={onChange}
          aria-invalid={Boolean(error)} aria-describedby={error ? 'termsAccepted-error' : undefined} />
        <span>
          Acepto los <Link to={legalUrl('terms')} target="_blank" rel="noopener">Términos de uso</Link> y
          la <Link to={legalUrl('privacy')} target="_blank" rel="noopener">Política de privacidad</Link> de Fluxy.
        </span>
      </label>
      {error && <p id="termsAccepted-error" className="fx-field__error" role="alert" style={{ marginTop: -10, marginBottom: 14 }}>{error}</p>}
    </>
  )
}

function BusinessFields({ form, errors, onChange, onPhoneBlur }) {
  const cls = (name) => `fx-input${errors[name] ? ' fx-input--error' : ''}`
  return (
    <>
      <IconField id="businessName" label="Nombre del negocio" icon="building" error={errors.businessName}>
        {(aria) => <input {...aria} id="businessName" name="businessName" className={cls('businessName')} value={form.businessName}
          onChange={onChange} autoComplete="organization" maxLength={120} placeholder="Tech Store Perú" />}
      </IconField>
      <IconField id="category" label="Rubro del negocio" icon="tag" error={errors.category}
        affix={<span className="fx-iconfield__chevron" aria-hidden="true"><Icon name="chevronDown" size={16} /></span>}>
        {(aria) => (
          <select {...aria} id="category" name="category" className={cls('category')} value={form.category} onChange={onChange}>
            <option value="">Seleccioná tu rubro</option>
            {Object.entries(BUSINESS_CATEGORIES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        )}
      </IconField>
      <IconField id="whatsapp" label="WhatsApp" icon="phone" prefix="+51" error={errors.whatsapp}
        hint="Celular donde recibís consultas y pedidos.">
        {(aria) => <input {...aria} id="whatsapp" name="whatsapp" type="tel" inputMode="tel" autoComplete="tel-national"
          className={cls('whatsapp')} value={form.whatsapp} onChange={onChange} onBlur={onPhoneBlur} maxLength={18} placeholder="999 888 777" />}
      </IconField>
    </>
  )
}

function VerifyStep({ state, signupToken, onState, onRestart }) {
  const pending = state.pending || []
  const channel = pending.includes('EMAIL') ? 'EMAIL' : 'PHONE'
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)
  const [left, setLeft] = useCountdown(60)
  const submitting = useRef(false)

  useEffect(() => { setCode(''); setError(''); setInfo(''); setLeft(60) }, [channel, setLeft])

  const verify = async (value = code) => {
    if (submitting.current || value.length !== 6) return
    submitting.current = true
    setBusy(true)
    setError('')
    try {
      onState(await post('/auth/signup/verify', { signupToken, channel, code: value }))
    } catch (err) {
      setError(err.message)
      setCode('')
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }

  const resend = async () => {
    setError('')
    setInfo('')
    try {
      const issued = await post('/auth/signup/resend', { signupToken, channel })
      setInfo(`Te enviamos un código nuevo a ${issued.destination}.`)
      setLeft(issued.resendInSeconds || 60)
    } catch (err) {
      setError(err.message)
      if (err.data?.retryAfterSeconds) setLeft(err.data.retryAfterSeconds)
    }
  }

  const destination = channel === 'EMAIL' ? state.email : state.phone
  return (
    <>
      <div className="fx-auth__head">
        <span className="fx-signin__badge"><Icon name={channel === 'EMAIL' ? 'mail' : 'message'} size={22} /></span>
        <h1 className="fx-h1">{channel === 'EMAIL' ? 'Verificá tu correo' : 'Verificá tu WhatsApp'}</h1>
        <p className="fx-hint">
          Ingresá el código de 6 dígitos que enviamos a <strong style={{ color: 'var(--fx-ink)' }}>{destination}</strong>. Vence en 10 minutos.
        </p>
      </div>

      {(state.phoneRequired) && (
        <div className="fx-verify__channels">
          <div className={`fx-verify__channel${channel === 'EMAIL' ? ' is-current' : ''}${state.emailVerified ? ' is-done' : ''}`}>
            <Icon name={state.emailVerified ? 'checkCircle' : 'mail'} size={16} /><span>Correo</span>
            {state.emailVerified && 'Verificado'}
          </div>
          <div className={`fx-verify__channel${channel === 'PHONE' ? ' is-current' : ''}${state.phoneVerified ? ' is-done' : ''}`}>
            <Icon name={state.phoneVerified ? 'checkCircle' : 'phone'} size={16} /><span>WhatsApp</span>
            {state.phoneVerified && 'Verificado'}
          </div>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); verify() }} noValidate>
        <CodeInput value={code} onChange={(v) => { setCode(v); setError('') }} onComplete={verify} error={Boolean(error)} disabled={busy} />
        {error && <div className="fx-alert fx-alert--error" role="alert" style={{ marginBottom: 14 }}><Icon name="alert" size={16} /><span>{error}</span></div>}
        {info && !error && <div className="fx-alert fx-alert--ok" role="status" style={{ marginBottom: 14 }}><Icon name="checkCircle" size={16} /><span>{info}</span></div>}
        <button type="submit" className="fx-btn fx-btn--primary fx-btn--lg fx-btn--block fx-signin__submit" disabled={busy || code.length !== 6}>
          {busy ? <><span className="fx-spinner" /> Verificando…</> : <>Verificar <Icon name="arrowRight" size={17} /></>}
        </button>
      </form>

      <div className="fx-verify__actions">
        <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={resend} disabled={left > 0}>
          <Icon name="refresh" size={14} /> {left > 0 ? `Reenviar en ${left} s` : 'Reenviar código'}
        </button>
        {onRestart && <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={onRestart}>Cambiar datos</button>}
      </div>
      <p className="fx-signin__legal">¿No llega? Revisá la carpeta de spam o promociones.</p>
    </>
  )
}

export default function RegisterBusinessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState(searchParams.get('step') === 'continue' ? 'loading' : 'form')
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [signup, setSignup] = useState(null)
  const [signupToken, setSignupToken] = useState(null)
  const submitting = useRef(false)

  const applyState = async (state, token = signupToken) => {
    if (state.signupToken) {
      rememberSignup(state)
      setSignupToken(state.signupToken)
      token = state.signupToken
    }
    setSignup(state)
    if (state.completed && state.session) {
      forgetSignup()
      await startSession(state.session)
      navigate('/dashboard/onboarding', { replace: true })
      return
    }
    setStep((state.pending || []).includes('BUSINESS') ? 'business' : 'verify')
    return token
  }

  // Registro que viene del login (cuenta sin verificar) o de Google/Apple.
  useEffect(() => {
    if (searchParams.get('step') !== 'continue') return
    const token = recallSignupToken()
    if (!token) { setStep('form'); return }
    setSignupToken(token)
    post('/auth/signup/state', { signupToken: token })
      .then((state) => applyState(state, token))
      .catch((err) => {
        forgetSignup()
        if (err.code === 'SIGNUP_ALREADY_COMPLETED') navigate('/login', { replace: true })
        else { setError(err.message); setStep('form') }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = ({ target }) => {
    const value = target.type === 'checkbox' ? target.checked : target.value
    setForm((f) => ({ ...f, [target.name]: value }))
    setErrors((e) => ({ ...e, [target.name]: undefined }))
    setError('')
  }
  const onPhoneBlur = () => setForm((f) => ({ ...f, whatsapp: normalizePhone(f.whatsapp) }))

  const run = async (fn) => {
    if (submitting.current) return
    submitting.current = true
    setLoading(true)
    setError('')
    try {
      await fn()
    } catch (err) {
      if (err.data) setErrors(apiFieldErrors(err.data))
      setError(err instanceof TypeError ? 'No se pudo conectar con el servidor. Tus datos siguen en el formulario.' : err.message)
    } finally {
      submitting.current = false
      setLoading(false)
    }
  }

  const submitForm = (e) => {
    e.preventDefault()
    const payload = normalizeRegistration(form)
    const fieldErrors = validateRegistration(payload)
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length) {
      document.getElementById(Object.keys(fieldErrors)[0])?.focus()
      return
    }
    run(async () => applyState(await post('/auth/signup', payload)))
  }

  const submitBusiness = (e) => {
    e.preventDefault()
    const payload = normalizeRegistration({ ...form, fullName: signup?.fullName || '', email: signup?.email || '' })
    const fieldErrors = validateRegistration(payload, { requirePassword: false, requirePersonal: false })
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length) {
      document.getElementById(Object.keys(fieldErrors)[0])?.focus()
      return
    }
    run(async () => applyState(await post('/auth/signup/business', {
      signupToken, businessName: payload.businessName, category: payload.category,
      whatsapp: payload.whatsapp, taxId: payload.taxId, termsAccepted: payload.termsAccepted,
    })))
  }

  const handleProvider = async (result) => {
    if (result.status === 'LOGGED_IN') {
      await startSession(result.session)
      navigate('/dashboard', { replace: true })
    } else {
      await applyState(result.signup, result.signup.signupToken)
    }
  }

  const restart = () => {
    forgetSignup()
    setSignup(null)
    setSignupToken(null)
    setStep('form')
  }

  const cls = (name) => `fx-input${errors[name] ? ' fx-input--error' : ''}`
  const alert = error && <div className="fx-alert fx-alert--error" role="alert" style={{ marginBottom: 16 }}><Icon name="alert" size={16} /><span>{error}</span></div>

  return (
    <div className="fx fx-auth fx-signin">
      <header className="fx-auth__top">
        <Link to="/"><BrandLogo size={28} textSize={18} textColor="var(--fx-ink)" /></Link>
        <Link to="/login" className="fx-btn fx-btn--ghost fx-btn--sm">Ya tengo cuenta</Link>
      </header>

      <main className="fx-auth__main">
        <div className="fx-auth__panel">
          {step === 'loading' && (
            <div className="fx-auth__head"><span className="fx-spinner" /> <p className="fx-hint">Retomando tu registro…</p></div>
          )}

          {step === 'verify' && signup && (
            <VerifyStep state={signup} signupToken={signupToken} onState={(s) => applyState(s)} onRestart={signup.method === 'PASSWORD' || !signup.method ? restart : null} />
          )}

          {step === 'business' && signup && (
            <>
              <div className="fx-auth__head">
                <h1 className="fx-h1">Contanos de tu negocio</h1>
                <p className="fx-hint">Hola {signup.fullName?.split(' ')[0] || ''}, falta un paso para crear tu tienda.</p>
              </div>
              <form onSubmit={submitBusiness} noValidate aria-busy={loading}>
                <BusinessFields form={form} errors={errors} onChange={handleChange} onPhoneBlur={onPhoneBlur} />
                <Consent checked={form.termsAccepted} onChange={handleChange} error={errors.termsAccepted} />
                {alert}
                <button type="submit" className="fx-btn fx-btn--primary fx-btn--lg fx-btn--block fx-signin__submit" disabled={loading}>
                  {loading ? <><span className="fx-spinner" /> Guardando…</> : <>Continuar <Icon name="arrowRight" size={17} /></>}
                </button>
              </form>
            </>
          )}

          {step === 'form' && (
            <>
              <div className="fx-auth__head">
                <h1 className="fx-h1">Crea tu tienda</h1>
                <p className="fx-hint">Empezá gratis. No necesitás tarjeta de crédito.</p>
              </div>

              <form onSubmit={submitForm} noValidate aria-busy={loading}>
                <IconField id="fullName" label="Tu nombre" icon="user" error={errors.fullName}>
                  {(aria) => <input {...aria} id="fullName" name="fullName" className={cls('fullName')} value={form.fullName}
                    onChange={handleChange} autoComplete="name" maxLength={80} placeholder="Eduardo Moreno" />}
                </IconField>
                <BusinessFields form={form} errors={errors} onChange={handleChange} onPhoneBlur={onPhoneBlur} />
                <IconField id="email" label="Correo electrónico" icon="mail" error={errors.email}>
                  {(aria) => <input {...aria} id="email" name="email" type="email" inputMode="email" className={cls('email')}
                    value={form.email} onChange={handleChange} autoComplete="email" maxLength={254} placeholder="hola@tienda.pe" />}
                </IconField>
                <PasswordField value={form.password} onChange={handleChange} error={errors.password} autoComplete="new-password"
                  placeholder={`Mínimo ${PASSWORD_MIN} caracteres`}
                  hint={form.password.length >= PASSWORD_MIN ? 'Largo suficiente.' : 'Podés usar una frase fácil de recordar.'} />
                <Consent checked={form.termsAccepted} onChange={handleChange} error={errors.termsAccepted} />
                {alert}
                <button type="submit" className="fx-btn fx-btn--primary fx-btn--lg fx-btn--block fx-signin__submit" disabled={loading}>
                  {loading ? <><span className="fx-spinner" /> Creando tu cuenta…</> : <>Crear mi tienda <Icon name="arrowRight" size={17} /></>}
                </button>
              </form>

              <Divider>o registrate con</Divider>
              <SocialButtons onResult={handleProvider} onError={(err) => setError(err.message)} googleText="signup_with" />

              <p className="fx-signin__legal">
                Te enviaremos un código para verificar tu correo. Tus datos se tratan según
                la <Link to={legalUrl('privacy')} target="_blank" rel="noopener">Política de privacidad</Link>.
              </p>
            </>
          )}

          <p className="fx-auth__foot">
            ¿Ya tenés cuenta? <Link to="/login" className="fx-auth__link">Iniciá sesión</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
