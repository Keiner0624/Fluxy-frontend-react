// src/modules/dashboard/pages/PlansPage.jsx
import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { API_URL } from '../../../app/config'

function getToken() {
  return localStorage.getItem('token') || ''
}

const PLANS = [
  {
    key: 'FREE',
    name: 'Free',
    price: 0,
    priceLabel: 'Gratis',
    color: '#9ca3af',
    bg: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.10)',
    badge: null,
    benefits: [
      { icon: '📦', text: 'Hasta 10 productos en tu tienda' },
      { icon: '🛒', text: 'Recepción de pedidos básica' },
      { icon: '🎨', text: 'Personalización de colores y logo' },
      { icon: '🔗', text: 'Tienda pública con slug propio' },
      { icon: '📊', text: 'Métricas básicas de ventas' },
    ],
    excluded: [
      'Mensaje automático por WhatsApp',
      'Estados de pedidos avanzados',
      'Dominio personalizado',
      'Quitar branding Fluxy',
      'Soporte prioritario',
    ],
  },
  {
    key: 'PRO',
    name: 'Pro',
    price: 19,
    priceLabel: 'S/ 19',
    color: '#7c83fd',
    bg: 'rgba(124,131,253,0.08)',
    border: 'rgba(124,131,253,0.30)',
    badge: 'Más popular',
    benefits: [
      { icon: '📦', text: 'Hasta 100 productos en tu tienda' },
      { icon: '💬', text: 'Mensaje automático de pedido por WhatsApp al vendedor' },
      { icon: '🔔', text: 'Notificación al cliente con resumen del pedido' },
      { icon: '📋', text: 'Panel de pedidos con estados (Pendiente, Completado, Cancelado)' },
      { icon: '📊', text: 'Estadísticas completas de ventas y gráficas' },
      { icon: '🏆', text: 'Ranking de productos más vendidos' },
      { icon: '🎨', text: 'Personalización avanzada: colores, gradientes y animaciones' },
      { icon: '🖼️', text: 'Logo personalizado en tu tienda' },
      { icon: '💳', text: 'Múltiples métodos de pago visibles (Yape, Plin, transferencia)' },
      { icon: '📱', text: 'Tienda 100% responsive para móvil' },
      { icon: '⚡', text: 'Soporte por correo electrónico' },
    ],
    excluded: [
      'Dominio personalizado',
      'Quitar branding Fluxy',
      'Soporte prioritario 24/7',
    ],
  },
  {
    key: 'BUSINESS',
    name: 'Business',
    price: 39,
    priceLabel: 'S/ 39',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.06)',
    border: 'rgba(52,211,153,0.25)',
    badge: 'Todo incluido',
    benefits: [
      { icon: '♾️', text: 'Productos ilimitados en tu tienda' },
      { icon: '💬', text: 'Mensaje automático de pedido por WhatsApp al vendedor' },
      { icon: '🔔', text: 'Notificación al cliente con resumen del pedido' },
      { icon: '📋', text: 'Panel de pedidos con estados avanzados' },
      { icon: '📊', text: 'Estadísticas completas de ventas y gráficas' },
      { icon: '🏆', text: 'Ranking de productos más vendidos' },
      { icon: '🎨', text: 'Personalización avanzada: colores, gradientes y animaciones' },
      { icon: '🌐', text: 'Dominio personalizado para tu tienda' },
      { icon: '🏷️', text: 'Quitar branding de Fluxy de tu tienda' },
      { icon: '💳', text: 'Múltiples métodos de pago visibles' },
      { icon: '📱', text: 'Tienda 100% responsive para móvil' },
      { icon: '🚀', text: 'Soporte prioritario 24/7' },
      { icon: '📈', text: 'Reportes avanzados de ventas por período' },
    ],
    excluded: [],
  },
]

export default function PlansPage() {
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
        body: JSON.stringify({ plan, months: '1' }),
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

  return (
    <DashboardLayout>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      {/* ── Trial activado ── */}
      {trialSuccess && (
        <div style={{
          background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)',
          borderRadius: 14, padding: '16px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 12,
          animation: 'fadeIn 0.4s ease',
        }}>
          <span style={{ fontSize: 28 }}>🎉</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#34d399' }}>¡Plan Pro activado gratis por 1 mes!</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Disfruta todas las funciones premium. Al vencer volverás al plan Free.</div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>
          Planes y precios
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 8 }}>
          Elige tu plan
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Actualiza tu plan y desbloquea más funciones para hacer crecer tu negocio.
        </p>
      </div>

      {/* ── Plan actual ── */}
      <div style={{
        background: 'rgba(124,131,253,0.06)', border: '1px solid rgba(124,131,253,0.15)',
        borderRadius: 12, padding: '12px 18px', marginBottom: 32,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 16 }}>💡</span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Tu plan actual: <strong style={{ color: 'white' }}>{currentPlan}</strong>
          {currentPlan === 'FREE' && ' — Mejora para desbloquear más funciones'}
          {currentPlan === 'PRO' && ' — ¡Considera Business para funciones ilimitadas!'}
          {currentPlan === 'BUSINESS' && ' — Tienes acceso a todas las funciones 🎉'}
        </span>
      </div>

      {/* ── Error de pago ── */}
      {paymentError && (
        <div style={{
          background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#f87171',
        }}>⚠️ {paymentError}</div>
      )}

      {/* ── Grid de planes ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20, alignItems: 'start',
      }}>
        {PLANS.map(plan => {
          const isCurrent  = currentPlan === plan.key
          const isLoading  = loadingPayment === plan.key
          const canUpgrade = !isCurrent && plan.key !== 'FREE'

          return (
            <div key={plan.key} style={{
              background: plan.bg,
              border: `1px solid ${isCurrent ? plan.color : plan.border}`,
              borderRadius: 20, overflow: 'hidden',
              position: 'relative',
              boxShadow: isCurrent ? `0 0 0 2px ${plan.color}40` : 'none',
              transition: 'all 0.2s',
            }}>

              {/* Badge */}
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: 16, right: 16,
                  background: plan.color, color: 'white',
                  borderRadius: 20, padding: '3px 10px',
                  fontSize: 11, fontWeight: 700,
                }}>{plan.badge}</div>
              )}

              {/* Plan actual badge */}
              {isCurrent && (
                <div style={{
                  position: 'absolute', top: 16, right: 16,
                  background: 'rgba(255,255,255,0.1)', color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 20, padding: '3px 10px',
                  fontSize: 11, fontWeight: 700,
                }}>✓ Tu plan</div>
              )}

              {/* Header del plan */}
              <div style={{ padding: '24px 24px 20px', borderBottom: `1px solid ${plan.border}` }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: plan.color,
                  textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8,
                }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 900, color: 'white' }}>
                    {plan.priceLabel}
                  </span>
                  {plan.price > 0 && (
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/mes</span>
                  )}
                </div>
                {plan.price === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Para siempre</div>
                )}
              </div>

              {/* Beneficios */}
              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {plan.benefits.map((b, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{b.icon}</span>
                      <span style={{ fontSize: 13, color: '#e5e7eb', lineHeight: 1.5 }}>{b.text}</span>
                    </div>
                  ))}
                  {plan.excluded.map((e, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, opacity: 0.35 }}>
                      <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>✕</span>
                      <span style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.5, textDecoration: 'line-through' }}>{e}</span>
                    </div>
                  ))}
                </div>

                {/* Botón */}
                {isCurrent ? (
                  <div style={{
                    textAlign: 'center', padding: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12, fontSize: 13,
                    color: 'var(--text-muted)',
                  }}>✓ Plan activo</div>
                ) : plan.key === 'FREE' ? (
                  <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 13, color: 'var(--text-muted)' }}>Plan base</div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.key)}
                    disabled={!!loadingPayment}
                    style={{
                      width: '100%', padding: '13px',
                      background: loadingPayment
                        ? 'rgba(255,255,255,0.06)'
                        : `linear-gradient(135deg, ${plan.color}, ${plan.key === 'PRO' ? '#4f46e5' : '#059669'})`,
                      border: 'none', borderRadius: 12,
                      color: 'white', fontSize: 14, fontWeight: 600,
                      cursor: loadingPayment ? 'not-allowed' : 'pointer',
                      opacity: loadingPayment && !isLoading ? 0.5 : 1,
                      transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                  >
                    {isLoading ? (
                      <>
                        <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                        Redirigiendo...
                      </>
                    ) : (
                      <>⚡ Activar {plan.name} — {plan.priceLabel}/mes</>
                    )}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Banner prueba gratuita ── */}
      {currentPlan === 'FREE' && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(124,131,253,0.1), rgba(79,70,229,0.06))',
          border: '1px solid rgba(124,131,253,0.25)',
          borderRadius: 20, padding: '28px 32px', marginTop: 24, marginBottom: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 20, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(124,131,253,0.08)', pointerEvents: 'none' }}/>
          <div>
            <div style={{ fontSize: 11, color: '#7c83fd', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8 }}>Oferta especial</div>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 8 }}>
              Prueba el Plan Pro gratis por 1 mes 🚀
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 440 }}>
              Activa todas las funciones premium sin pagar nada. Al vencer el mes, tu cuenta vuelve al plan Free automáticamente.
            </p>
          </div>
          {trialUsed ? (
            <div style={{ background: 'rgba(156,163,175,0.1)', border: '1px solid rgba(156,163,175,0.2)', borderRadius: 14, padding: '14px 24px', fontSize: 13, color: '#9ca3af', textAlign: 'center' }}>
              ✓ Ya usaste tu prueba gratuita
            </div>
          ) : (
            <button onClick={handleTrial} disabled={loadingTrial} style={{
              background: loadingTrial ? 'rgba(124,131,253,0.4)' : 'linear-gradient(135deg, #7c83fd, #4f46e5)',
              color: 'white', border: 'none', borderRadius: 14,
              padding: '14px 28px', fontSize: 15, fontWeight: 700,
              cursor: loadingTrial ? 'not-allowed' : 'pointer',
              boxShadow: loadingTrial ? 'none' : '0 8px 24px rgba(124,131,253,0.35)',
              whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.2s',
            }}
              onMouseEnter={e => { if (!loadingTrial) e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {loadingTrial ? 'Activando...' : '🎁 Probar Pro gratis 1 mes'}
            </button>
          )}
        </div>
      )}

      {/* ── Footer info ── */}
      <div style={{
        marginTop: 32, padding: '20px 24px',
        background: 'rgba(13,13,26,0.6)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 14, textAlign: 'center',
      }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
          🔒 Pago seguro con <strong style={{ color: '#00bcff' }}>Mercado Pago</strong>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', opacity: 0.7 }}>
          Cancela cuando quieras · Sin contratos · Soporte en español
        </div>
      </div>
    </DashboardLayout>
  )
}