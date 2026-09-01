// src/components/PlanGate.jsx
import { useNavigate } from 'react-router-dom'
import Icon from '@/components/Icon'

const PLAN_ORDER  = { FREE: 0, PRO: 1, BUSINESS: 2 }
const PLAN_LABELS = { PRO: 'Pro', BUSINESS: 'Business' }

const DESCRIPTIONS = {
  PRO: 'Mejorá al plan Pro para acceder a esta función, además de hasta 100 productos, notificaciones por WhatsApp y estadísticas avanzadas.',
  BUSINESS: 'Esta función es exclusiva del plan Business: productos ilimitados, dominio propio y tienda sin marca de Fluxy.',
}

export default function PlanGate({ currentPlan, requiredPlan = 'PRO', children }) {
  const navigate = useNavigate()
  const hasAccess = (PLAN_ORDER[currentPlan] || 0) >= (PLAN_ORDER[requiredPlan] || 0)

  if (hasAccess) return children

  return (
    <div className="fx-gate">
      <div className="fx-gate__icon">
        <Icon name="lock" size={20} />
      </div>
      <h2 className="fx-h2">Disponible en el plan {PLAN_LABELS[requiredPlan] || requiredPlan}</h2>
      <p className="fx-gate__text">{DESCRIPTIONS[requiredPlan] || DESCRIPTIONS.PRO}</p>
      <button className="fx-btn fx-btn--primary" onClick={() => navigate('/dashboard/plans')}>
        Ver planes
        <Icon name="arrowRight" size={15} />
      </button>
    </div>
  )
}
