// src/modules/dashboard/pages/DashboardPage.jsx
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import { API_URL, getCompanyStoreUrl } from '@/app/config'
import Icon from '@/components/Icon'

const PLAN_NAMES = { PRO: 'Pro', BUSINESS: 'Business' }
const PAYMENT_STATUS_MAP = {
  approved:     'success',
  rejected:     'failure',
  cancelled:    'failure',
  in_process:   'pending',
  in_mediation: 'pending',
}
const PENDING_PLAN_KEY   = 'fluxy_pending_plan_checkout'
const BIRTHDAY_SHOWN_KEY = 'fluxy_birthday_shown'

function getToken() { return localStorage.getItem('token') || '' }
function wait(ms)   { return new Promise(r => setTimeout(r, ms)) }

function readStorage(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}') }
  catch { return {} }
}

function firstWord(value) {
  return String(value || '').trim().split(/\s+/)[0] || ''
}

function getUserFirstName(user) {
  return user.firstName || firstWord(user.fullName || user.name)
}

function normalizeCompany(company = {}) {
  return {
    ...company,
    name: company.name || company.companyName || company.businessName || company.businesName || '',
  }
}

async function refreshSellerAccount(expectedPlan) {
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) await wait(1200)
    const res = await fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${getToken()}` } })
    if (!res.ok) continue
    const data     = await res.json()
    const planName  = data.planName  || expectedPlan
    const planLimit = data.planLimit
    if (planName || planLimit) {
      const company  = readStorage('company')
      const user     = readStorage('user')
      const planData = {
        ...(planName  ? { planName  } : {}),
        ...(planLimit ? { planLimit } : {}),
      }
      localStorage.setItem('company', JSON.stringify({ ...company, ...planData }))
      localStorage.setItem('user',    JSON.stringify({ ...user,    ...planData }))
    }
    if (!expectedPlan || data.planName === expectedPlan) break
  }
}

const SHORTCUTS = [
  { to: '/dashboard/products', icon: 'products', title: 'Productos',     text: 'Cargá y organizá tu catálogo.' },
  { to: '/dashboard/orders',   icon: 'orders',   title: 'Pedidos',       text: 'Revisá y gestioná tus ventas.' },
  { to: '/dashboard/style',    icon: 'style',    title: 'Estilo',        text: 'Personalizá el diseño de la tienda.' },
  { to: '/dashboard/settings', icon: 'settings', title: 'Configuración', text: 'Datos del negocio y pagos.' },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const [searchParams]   = useSearchParams()
  const [paymentStatus,  setPaymentStatus]  = useState(null)
  const [plan,           setPlan]           = useState('FREE')
  const [daysLeft,       setDaysLeft]       = useState(null)
  const [loadingPlan,    setLoadingPlan]    = useState(true)
  const [firstName,      setFirstName]      = useState(() => getUserFirstName(readStorage('user')))
  const [company,        setCompany]        = useState(() => normalizeCompany(readStorage('company')))
  const [showBirthday,   setShowBirthday]   = useState(false)

  const user        = readStorage('user')
  const displayName = firstName || user.fullName || company.name || ''
  const storeUrl = getCompanyStoreUrl(company)

  useEffect(() => {
    // Cargar datos del usuario
    fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json())
      .then(d => {
        if (d.planName)   setPlan(d.planName)
        const nextFirstName = getUserFirstName(d)
        if (nextFirstName) {
          setFirstName(nextFirstName)
          localStorage.setItem('user', JSON.stringify({ ...readStorage('user'), ...d, firstName: nextFirstName }))
        }

        // Modal de cumpleaños — solo una vez por sesión
        if (d.isBirthday && !sessionStorage.getItem(BIRTHDAY_SHOWN_KEY)) {
          setShowBirthday(true)
        }

        if (d.planExpiresAt && d.planName !== 'FREE') {
          const expires = new Date(d.planExpiresAt)
          const diff    = Math.ceil((expires - new Date()) / (1000 * 60 * 60 * 24))
          if (diff <= 7 && diff > 0) setDaysLeft(diff)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPlan(false))

    fetch(`${API_URL}/companies/my-company`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (!d) return
        const nextCompany = normalizeCompany({ ...readStorage('company'), ...d })
        localStorage.setItem('company', JSON.stringify({ ...nextCompany, storeUrl: getCompanyStoreUrl(nextCompany) }))
        setCompany(nextCompany)
      })
      .catch(() => {})

    // Detectar retorno de Mercado Pago
    const rawPayment = searchParams.get('payment')
      || searchParams.get('status')
      || searchParams.get('collection_status')
    const payment   = PAYMENT_STATUS_MAP[rawPayment] || rawPayment
    const planParam = searchParams.get('plan') || localStorage.getItem(PENDING_PLAN_KEY) || ''

    if (payment) {
      setPaymentStatus({ status: payment, plan: planParam })
      window.history.replaceState({}, '', '/dashboard')
      localStorage.removeItem(PENDING_PLAN_KEY)

      if (payment === 'success' && planParam) {
        refreshSellerAccount(planParam).catch(() => {})
          .then(() => {
            fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${getToken()}` } })
              .then(r => r.json())
              .then(d => { if (d.planName) setPlan(d.planName) })
              .catch(() => {})
          })
      }
      const timer = setTimeout(() => setPaymentStatus(null), 6000)
      return () => clearTimeout(timer)
    }
    // Solo al montar: lee los params de pago una unica vez
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const closeBirthdayModal = () => {
    setShowBirthday(false)
    sessionStorage.setItem(BIRTHDAY_SHOWN_KEY, '1')
  }

  const paymentAlert = () => {
    if (!paymentStatus) return null
    const { status, plan: planParam } = paymentStatus
    const planLabel = PLAN_NAMES[planParam?.toUpperCase()] || planParam

    if (status === 'success') {
      return (
        <div className="fx-alert fx-alert--ok" role="status">
          <Icon name="checkCircle" size={17} />
          <span>Pago confirmado{planLabel ? `. Ya tenés acceso al plan ${planLabel}.` : '.'}</span>
        </div>
      )
    }
    if (status === 'pending') {
      return (
        <div className="fx-alert fx-alert--warn" role="status">
          <Icon name="clock" size={17} />
          <span>Tu pago está en revisión. Te avisamos cuando se acredite.</span>
        </div>
      )
    }
    return (
      <div className="fx-alert fx-alert--error" role="status">
        <Icon name="alert" size={17} />
        <span>No pudimos procesar el pago. Podés intentarlo de nuevo desde la sección de planes.</span>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="fx-page-head">
        <div>
          <h1>{displayName ? `Hola, ${displayName}` : 'Resumen'}</h1>
          <p>{company.name ? `Panel de ${company.name}` : 'Panel de control de tu tienda'}</p>
        </div>
        <div className="fx-page-head__actions">
          {loadingPlan ? (
            <span className="fx-skeleton" style={{ display: 'block', width: 104, height: 32 }} />
          ) : plan === 'FREE' ? (
            <button className="fx-btn fx-btn--primary" onClick={() => navigate('/dashboard/plans')}>
              <Icon name="plans" size={15} />
              Mejorar plan
            </button>
          ) : (
            <Link to="/dashboard/plans" className="fx-badge fx-badge--brand" style={{ height: 32, padding: '0 12px' }}>
              <Icon name="plans" size={14} />
              Plan {PLAN_NAMES[plan] || plan}
            </Link>
          )}
        </div>
      </div>

      <div className="fx-grid" style={{ gap: 12, marginBottom: 22 }}>
        {paymentAlert()}

        {daysLeft !== null && (
          <div className="fx-alert fx-alert--warn">
            <Icon name="clock" size={17} />
            <span style={{ flex: 1 }}>
              Tu plan vence en {daysLeft} {daysLeft === 1 ? 'día' : 'días'}. Renovalo para no perder acceso a tus funciones.
            </span>
            <Link to="/dashboard/plans" className="fx-btn fx-btn--sm fx-btn--secondary">Renovar</Link>
          </div>
        )}
      </div>

      {storeUrl && (
        <div className="fx-card" style={{ marginBottom: 22 }}>
          <div className="fx-card__body fx-row fx-row--between" style={{ flexWrap: 'wrap', gap: 14 }}>
            <div style={{ minWidth: 0 }}>
              <p className="fx-eyebrow" style={{ marginBottom: 6 }}>Tu tienda en línea</p>
              <p className="fx-truncate" style={{ fontSize: 14.5, fontWeight: 500 }}>{storeUrl}</p>
            </div>
            <div className="fx-row" style={{ gap: 8 }}>
              <button
                type="button"
                className="fx-btn fx-btn--secondary fx-btn--sm"
                onClick={() => navigator.clipboard?.writeText(storeUrl)}
              >
                <Icon name="copy" size={15} />
                Copiar enlace
              </button>
              <a href={storeUrl} target="_blank" rel="noreferrer" className="fx-btn fx-btn--primary fx-btn--sm">
                <Icon name="external" size={15} />
                Visitar
              </a>
            </div>
          </div>
        </div>
      )}

      <h2 className="fx-h2" style={{ marginBottom: 14 }}>Accesos rápidos</h2>
      <div className="fx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {SHORTCUTS.map((s) => (
          <Link key={s.to} to={s.to} className="fx-shortcut">
            <span className="fx-shortcut__icon"><Icon name={s.icon} size={18} /></span>
            <span className="fx-shortcut__title">{s.title}</span>
            <span className="fx-shortcut__text">{s.text}</span>
            <Icon name="arrowRight" size={15} className="fx-shortcut__go" />
          </Link>
        ))}
      </div>

      {showBirthday && (
        <div className="fx-modal" role="dialog" aria-modal="true" onClick={closeBirthdayModal}>
          <div className="fx-modal__panel" style={{ maxWidth: 400, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div className="fx-modal__body">
              <div className="fx-auth__mark" style={{ margin: '0 auto 16px' }}>
                <Icon name="tag" size={22} />
              </div>
              <h2 className="fx-h2" style={{ marginBottom: 8 }}>
                {displayName ? `Feliz cumpleaños, ${displayName}` : 'Feliz cumpleaños'}
              </h2>
              <p className="fx-hint" style={{ marginBottom: 22 }}>
                Todo el equipo de Fluxy te desea un año lleno de ventas y buenos resultados.
              </p>
              <button className="fx-btn fx-btn--primary fx-btn--block" onClick={closeBirthdayModal}>
                Gracias
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
