// src/components/PlanGate.jsx
import { useNavigate } from 'react-router-dom'

export default function PlanGate({ feature, currentPlan, requiredPlan = 'PRO', children }) {
  const navigate = useNavigate()

  const PLAN_ORDER = { FREE: 0, PRO: 1, BUSINESS: 2 }
  const PLAN_LABELS = { PRO: 'Pro', BUSINESS: 'Business' }
  const hasAccess = (PLAN_ORDER[currentPlan] || 0) >= (PLAN_ORDER[requiredPlan] || 0)

  if (hasAccess) return children

  return (
    <div style={{
      position: 'relative', borderRadius: 20, overflow: 'hidden',
      minHeight: 300,
    }}>
      {/* Contenido bloqueado con blur */}
      <div style={{ filter: 'blur(4px)', pointerEvents: 'none', opacity: 0.4 }}>
        {children}
      </div>

      {/* Overlay de bloqueo */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'rgba(6,6,15,0.85)',
        backdropFilter: 'blur(2px)',
        borderRadius: 20,
        border: '1px solid rgba(124,131,253,0.2)',
        gap: 16, padding: 32, textAlign: 'center',
      }}>
        <div style={{ fontSize: 48 }}>🔒</div>
        <div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 8 }}>
            Función del plan {PLAN_LABELS[requiredPlan]}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 320 }}>
            {requiredPlan === 'PRO'
              ? 'Mejora al plan Pro para acceder a esta función y desbloquear hasta 100 productos, WhatsApp automático, estadísticas avanzadas y más.'
              : 'Esta función es exclusiva del plan Business: productos ilimitados, dominio propio y sin branding de Fluxy.'
            }
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard/plans')}
          style={{
            background: 'linear-gradient(135deg, #7c83fd, #4f46e5)',
            color: 'white', border: 'none', borderRadius: 12,
            padding: '12px 28px', fontSize: 14, fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(124,131,253,0.3)',
          }}
        >
          ⚡ Ver planes
        </button>
      </div>
    </div>
  )
}