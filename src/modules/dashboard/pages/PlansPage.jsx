// src/modules/dashboard/pages/PlansPage.jsx
import { useState, useEffect } from 'react'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import { API_URL } from '@/app/config'
import { useCurrency } from '@/hooks/useCurrency'
import Icon from '@/components/Icon'

function getToken() {
  return localStorage.getItem('token') || ''
}

const PLANS = [
  {
    key: 'FREE',
    name: 'Free',
    tagline: 'Para empezar a vender hoy mismo.',
    badge: null,
    benefits: [
      'Hasta 10 productos en tu tienda',
      'Recepción de pedidos básica',
      'Personalización de colores y logo',
      'Tienda pública con enlace propio',
      'Métricas básicas de ventas',
    ],
    excluded: [
      'Mensaje automático por WhatsApp',
      'Estados de pedidos avanzados',
      'Dominio personalizado',
      'Quitar la marca de Fluxy',
      'Soporte prioritario',
    ],
  },
  {
    key: 'PRO',
    name: 'Pro',
    tagline: 'Para negocios que ya venden todos los días.',
    badge: 'Más elegido',
    benefits: [
      'Hasta 100 productos en tu tienda',
      'Mensaje automático de pedido por WhatsApp',
      'Notificación al cliente con el resumen del pedido',
      'Panel de pedidos con estados',
      'Estadísticas completas y gráficos',
      'Ranking de productos más vendidos',
      'Personalización avanzada de la tienda',
      'Logo propio en tu tienda',
      'Múltiples métodos de pago visibles',
      'Soporte por correo electrónico',
    ],
    excluded: [
      'Dominio personalizado',
      'Quitar la marca de Fluxy',
      'Soporte prioritario 24/7',
    ],
  },
  {
    key: 'BUSINESS',
    name: 'Business',
    tagline: 'Todo incluido, sin límites.',
    badge: 'Todo incluido',
    benefits: [
      'Productos ilimitados',
      'Mensaje automático de pedido por WhatsApp',
      'Notificación al cliente con el resumen del pedido',
      'Panel de pedidos con estados avanzados',
      'Estadísticas completas y gráficos',
      'Ranking de productos más vendidos',
      'Personalización avanzada de la tienda',
      'Dominio personalizado',
      'Tienda sin la marca de Fluxy',
      'Soporte prioritario 24/7',
    ],
    excluded: [],
  },
]

const PLAN_ORDER = { FREE: 0, PRO: 1, BUSINESS: 2 }

export default function PlansPage() {
  const { currencyInfo, formatProPrice, formatBusinessPrice } = useCurrency()
  const [currentPlan, setCurrentPlan]     = useState('FREE')
  const [trialUsed, setTrialUsed]         = useState(false)
  const [loadingPayment, setLoadingPayment] = useState(null)
  const [loadingTrial, setLoadingTrial]   = useState(false)
  const [trialSuccess, setTrialSuccess]   = useState(false)
  const [paymentError, setPaymentError]   = useState('')

  useEffect(() => { loadPlan() }, [])

  const loadPlan = async () => {
    try {
      const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) return
      const data = await res.json()
      if (data.planName) setCurrentPlan(data.planName)
      if (data.trialUsed !== undefined) setTrialUsed(data.trialUsed)
      // También revisar en /companies/my-company
      const cRes = await fetch(`${API_URL}/companies/my-company`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (cRes.ok) {
        const cData = await cRes.json()
        if (cData.trialUsed !== undefined) setTrialUsed(cData.trialUsed)
      }
    } catch { /* silencioso */ }
  }

  const handleTrial = async () => {
    setLoadingTrial(true)
    setPaymentError('')
    try {
      const res = await fetch(`${API_URL}/companies/trial`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Error al activar prueba')
      setTrialSuccess(true)
      setCurrentPlan('PRO')
      setTrialUsed(true)
      // Actualizar localStorage
      const company = JSON.parse(localStorage.getItem('company') || '{}')
      localStorage.setItem('company', JSON.stringify({ ...company, plan: 'PRO' }))
      setTimeout(() => setTrialSuccess(false), 5000)
    } catch (err) {
      setPaymentError(err.message)
    } finally {
      setLoadingTrial(false)
    }
  }

  const handleUpgrade = async (plan) => {
    setLoadingPayment(plan)
    setPaymentError('')
    try {
      const res = await fetch(`${API_URL}/payments/create-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          plan,
          months: '1',
          currency: currencyInfo.currency,
          price: plan === 'PRO' ? currencyInfo.proPrize : currencyInfo.businessPrice,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear preferencia')
      if (data.initPoint) window.location.href = data.initPoint
    } catch (err) {
      setPaymentError(err.message || 'Error al iniciar el pago.')
    } finally {
      setLoadingPayment(null)
    }
  }

  const priceLabel = (key) => {
    if (key === 'FREE') return 'Gratis'
    return key === 'PRO' ? formatProPrice() : formatBusinessPrice()
  }

  return (
    <DashboardLayout>
      <div className="fx-page-head">
        <div>
          <h1>Plan y facturación</h1>
          <p>Estás en el plan <strong style={{ color: 'var(--fx-ink)' }}>{PLANS.find(p => p.key === currentPlan)?.name || currentPlan}</strong>.</p>
        </div>
      </div>

      {trialSuccess && (
        <div className="fx-alert fx-alert--ok" style={{ marginBottom: 16 }}>
          <Icon name="checkCircle" size={16} />
          <span>Prueba del plan Pro activada. Ya tenés acceso a todas sus funciones.</span>
        </div>
      )}
      {paymentError && (
        <div className="fx-alert fx-alert--error" style={{ marginBottom: 16 }}>
          <Icon name="alert" size={16} /><span>{paymentError}</span>
        </div>
      )}

      {currentPlan === 'FREE' && !trialUsed && (
        <div className="fx-card" style={{ marginBottom: 20 }}>
          <div className="fx-card__body fx-row fx-row--between" style={{ flexWrap: 'wrap', gap: 14 }}>
            <div>
              <h2 className="fx-h3" style={{ marginBottom: 4 }}>Probá el plan Pro gratis</h2>
              <p className="fx-hint">7 días con todas las funciones. No se requiere tarjeta.</p>
            </div>
            <button className="fx-btn fx-btn--primary" onClick={handleTrial} disabled={loadingTrial}>
              {loadingTrial ? <><span className="fx-spinner" /> Activando…</> : 'Activar prueba gratuita'}
            </button>
          </div>
        </div>
      )}

      <div className="fx-plans">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.key
          const isLower   = PLAN_ORDER[plan.key] < PLAN_ORDER[currentPlan]
          const isLoading = loadingPayment === plan.key

          return (
            <div key={plan.key} className={`fx-plan${isCurrent ? ' fx-plan--current' : ''}`}>
              <div className="fx-plan__head">
                <div className="fx-row fx-row--between">
                  <h2 className="fx-h2">{plan.name}</h2>
                  {isCurrent
                    ? <span className="fx-badge fx-badge--brand">Tu plan</span>
                    : plan.badge ? <span className="fx-badge">{plan.badge}</span> : null}
                </div>
                <p className="fx-plan__price">
                  {priceLabel(plan.key)}
                  {plan.key !== 'FREE' && <span className="fx-plan__period"> / mes</span>}
                </p>
                <p className="fx-hint">{plan.tagline}</p>
              </div>

              <ul className="fx-plan__list">
                {plan.benefits.map((b) => (
                  <li key={b}>
                    <Icon name="check" size={15} style={{ color: 'var(--fx-ok)' }} />
                    <span>{b}</span>
                  </li>
                ))}
                {plan.excluded.map((b) => (
                  <li key={b} className="is-off">
                    <Icon name="close" size={15} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="fx-plan__foot">
                {isCurrent ? (
                  <button className="fx-btn fx-btn--secondary fx-btn--block" disabled>Plan actual</button>
                ) : isLower ? (
                  <button className="fx-btn fx-btn--ghost fx-btn--block" disabled>Incluido en tu plan</button>
                ) : (
                  <button
                    className="fx-btn fx-btn--primary fx-btn--block"
                    onClick={() => handleUpgrade(plan.key)}
                    disabled={isLoading}
                  >
                    {isLoading ? <><span className="fx-spinner" /> Redirigiendo…</> : `Cambiar a ${plan.name}`}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="fx-hint" style={{ marginTop: 18, textAlign: 'center' }}>
        Los pagos se procesan con Mercado Pago. La renovación es mensual y manual: si no renovás, tu cuenta vuelve al plan Free.
      </p>
    </DashboardLayout>
  )
}
