import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import { API_URL } from '@/app/config'
import { authFetch } from '@/app/authFetch'
import { BUSINESS_CATEGORIES, apiFieldErrors } from '../registration'
import '../registration.css'

const TYPES = { PHYSICAL: 'Físico', ONLINE: 'Online', HYBRID: 'Físico y online' }
const EMPLOYEES = { SOLO: 'Solo yo', TWO_TO_5: '2 a 5 personas', SIX_TO_20: '6 a 20 personas', MORE_THAN_20: 'Más de 20 personas' }
const ORDERS = { ZERO_TO_50: '0 a 50', FIFTY_ONE_TO_200: '51 a 200', TWO_HUNDRED_ONE_TO_1000: '201 a 1,000', MORE_THAN_1000: 'Más de 1,000' }
const CHANNELS = { WHATSAPP: 'WhatsApp', INSTAGRAM: 'Instagram', FACEBOOK: 'Facebook', PHYSICAL_STORE: 'Tienda física', WEBSITE: 'Página web', MARKETPLACE: 'Marketplace', OTHER: 'Otro' }
const GOALS = { ORDERS: 'Organizar pedidos', INVENTORY: 'Controlar inventario', SALES: 'Vender más', ONLINE_STORE: 'Crear catálogo o tienda online', CUSTOMERS: 'Gestionar clientes', AUTOMATION: 'Automatizar procesos' }
const STEPS = ['BUSINESS_PROFILE', 'SALES_CHANNELS', 'GOALS']
const TITLES = ['Cuéntanos sobre tu negocio', '¿Dónde vendes?', '¿Qué quieres mejorar?']
const INITIAL = { category: '', businessType: '', employeeRange: '', monthlyOrdersRange: '', salesChannels: [], goals: [], taxId: '', legalName: '', department: '', province: '', district: '', taxAddress: '', openingHours: '', instagram: '', facebook: '', website: '', deliveryMethods: '' }
const OPTIONAL_FIELDS = [
  ['taxId', 'RUC o DNI (opcional)', 11], ['legalName', 'Razón social (opcional)', 160],
  ['department', 'Departamento', 100], ['province', 'Provincia', 100], ['district', 'Distrito', 100],
  ['taxAddress', 'Dirección fiscal (opcional)', 255], ['openingHours', 'Horarios de atención', 500],
  ['instagram', 'Instagram', 255], ['facebook', 'Facebook', 255], ['website', 'Página web', 255],
  ['deliveryMethods', 'Métodos de entrega', 500],
]

export default function BusinessOnboardingPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const detailsMode = params.get('details') === '1'
  const [form, setForm] = useState(INITIAL)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [retry, setRetry] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const submitting = useRef(false)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const response = await authFetch(`${API_URL}/companies/onboarding`)
        if (!response?.ok) throw new Error('No se pudo cargar la configuración del negocio.')
        const data = await response.json()
        if (!active) return
        setForm(Object.fromEntries(Object.entries(INITIAL).map(([key, fallback]) => [key, data.profile[key] ?? fallback])))
        setStep(Math.max(0, STEPS.indexOf(data.profile.onboardingStep)))
        setLoaded(true)
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [retry])

  const change = (name, value) => {
    setForm(current => ({ ...current, [name]: value }))
    setErrors(current => ({ ...current, [name]: undefined }))
    setSuccess('')
  }
  const toggle = (name, value) => change(name, form[name].includes(value) ? form[name].filter(item => item !== value) : [...form[name], value])
  const select = (name, label, choices) => <div className="fx-field">
    <label htmlFor={name} className="fx-label">{label}</label>
    <select id={name} className="fx-input" value={form[name]} onChange={event => change(name, event.target.value)} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined}>
      <option value="">Selecciona una opción</option>
      {Object.entries(choices).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
    </select>
    {errors[name] && <p id={`${name}-error`} className="fx-registration-error" role="alert">{errors[name]}</p>}
  </div>
  const choices = (name, options) => <div className="fx-onboarding-grid">
    {Object.entries(options).map(([value, label]) => <label key={value} className={`fx-choice${form[name].includes(value) ? ' is-on' : ''}`}>
      <input type="checkbox" checked={form[name].includes(value)} onChange={() => toggle(name, value)} />{label}
    </label>)}
  </div>

  async function save(action) {
    if (submitting.current || !loaded) return
    const fieldErrors = {}
    if (action === 'SAVE_PROFILE' || action === 'COMPLETE') {
      if (!form.category) fieldErrors.category = 'Selecciona tu rubro.'
      if (!form.businessType) fieldErrors.businessType = 'Selecciona el tipo de negocio.'
    }
    if (form.taxId && !/^(\d{8}|\d{11})$/.test(form.taxId)) fieldErrors.taxId = 'El DNI tiene 8 dígitos y el RUC, 11.'
    if (form.website && !/^https?:\/\/[^\s]+$/.test(form.website)) fieldErrors.website = 'Usa una dirección que empiece con https:// o http://.'
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length) {
      if (fieldErrors.businessType || fieldErrors.category) setStep(0)
      setError('Revisa los campos indicados antes de continuar.')
      return
    }
    submitting.current = true
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const payload = { ...form, action }
      for (const key of ['category', 'businessType', 'employeeRange', 'monthlyOrdersRange']) payload[key] ||= null
      const response = await authFetch(`${API_URL}/companies/onboarding`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      if (!response) return
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setErrors(apiFieldErrors(data))
        throw new Error(data.message || 'No se pudo guardar. Tus datos siguen aquí para reintentar.')
      }
      if (action === 'SKIP' || action === 'COMPLETE') navigate('/dashboard', { replace: true })
      else if (action === 'SAVE_DETAILS') setSuccess('Datos del negocio guardados.')
      else {
        setStep(Math.max(0, STEPS.indexOf(data.profile.onboardingStep)))
        setSuccess('Tu avance está guardado.')
      }
    } catch (err) { setError(err.message) }
    finally { submitting.current = false; setSaving(false) }
  }

  return <DashboardLayout>
    <div className="fx-onboarding">
      <div className="fx-page-head"><div>
        <h1>{detailsMode ? 'Perfil del negocio' : TITLES[step]}</h1>
        <p>{detailsMode ? 'Datos comerciales y fiscales opcionales. No se publican automáticamente en tu tienda.' : `Paso ${step + 1} de 3. Puedes completarlo más tarde desde Configuración.`}</p>
      </div></div>
      {error && <div className="fx-alert fx-alert--error" role="alert">{error}</div>}
      {success && <div className="fx-alert fx-alert--ok" role="status">{success}</div>}
      {loading ? <p role="status">Cargando datos del negocio…</p> : !loaded ? <button className="fx-btn fx-btn--secondary" onClick={() => setRetry(value => value + 1)}>Reintentar</button> :
        <form onSubmit={event => { event.preventDefault(); save(detailsMode ? 'SAVE_DETAILS' : ['SAVE_PROFILE', 'SAVE_CHANNELS', 'COMPLETE'][step]) }} className="fx-card" aria-busy={saving}>
          <fieldset disabled={saving} className="fx-card__body">
            {!detailsMode && <div className="fx-auth__steps" aria-label={`Paso ${step + 1} de 3`}>{STEPS.map((name, index) => <span key={name} className={`fx-auth__step${index <= step ? ' fx-auth__step--on' : ''}`} />)}</div>}
            {(step === 0 || detailsMode) && <div className="fx-onboarding-grid">
              {select('businessType', 'Tipo de negocio', TYPES)}
              {select('category', 'Rubro', BUSINESS_CATEGORIES)}
              {select('employeeRange', 'Número de trabajadores (opcional)', EMPLOYEES)}
              {select('monthlyOrdersRange', 'Pedidos mensuales (opcional)', ORDERS)}
            </div>}
            {(step === 1 || detailsMode) && <div className="fx-field"><h2 className="fx-h3">Canales de venta</h2><p className="fx-hint">Selecciona los que usas. Puedes elegir más de uno.</p>{choices('salesChannels', CHANNELS)}</div>}
            {(step === 2 || detailsMode) && <div className="fx-field"><h2 className="fx-h3">Objetivos de tu negocio</h2>{choices('goals', GOALS)}</div>}
            {detailsMode && <>
              <h2 className="fx-h3">Información adicional</h2>
              <div className="fx-onboarding-grid">{OPTIONAL_FIELDS.map(([name, label, maxLength]) => <div key={name} className="fx-field">
                <label className="fx-label" htmlFor={name}>{label}</label>
                <input id={name} className="fx-input" value={form[name]} maxLength={maxLength} inputMode={name === 'taxId' ? 'numeric' : 'text'} placeholder={name === 'website' ? 'https://mitienda.pe' : 'Opcional'} onChange={event => change(name, event.target.value)} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} />
                {errors[name] && <p id={`${name}-error`} className="fx-registration-error" role="alert">{errors[name]}</p>}
              </div>)}</div>
              <p className="fx-hint">La dirección comercial, descripción, logo y métodos de pago siguen en <Link to="/dashboard/settings">Configuración de la tienda</Link>.</p>
            </>}
            <div className="fx-onboarding-actions">
              {!detailsMode && step > 0 && <button type="button" className="fx-btn fx-btn--secondary" onClick={() => setStep(value => value - 1)}>Anterior</button>}
              <button className="fx-btn fx-btn--primary" type="submit" disabled={saving}>{saving ? 'Guardando…' : detailsMode ? 'Guardar datos' : step === 2 ? 'Finalizar e ir al panel' : 'Guardar y continuar'}</button>
              {!detailsMode && <button className="fx-btn fx-btn--ghost" type="button" onClick={() => save('SKIP')} disabled={saving}>Completar más tarde</button>}
            </div>
            <p className="fx-hint">Perú · PEN · Español (Perú) · America/Lima</p>
          </fieldset>
        </form>}
    </div>
  </DashboardLayout>
}
