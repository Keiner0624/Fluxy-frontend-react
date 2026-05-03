// src/modules/dashboard/pages/DashboardPage.jsx
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { API_URL, getCompanyStoreUrl } from '../../../app/config'

const PLAN_NAMES = { PRO: 'Pro', BUSINESS: 'Business' }
const PAYMENT_STATUS_MAP = {
  approved:     'success',
  rejected:     'failure',
  cancelled:    'failure',
  in_process:   'pending',
  in_mediation: 'pending',
}
const PENDING_PLAN_KEY = 'fluxy_pending_plan_checkout'

function getToken() {
  return localStorage.getItem('token') || ''
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function refreshSellerAccount(expectedPlan) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (attempt > 0) await wait(1200)
    const res = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    if (!res.ok) continue
    const data = await res.json()
    const planName  = data.planName  || expectedPlan
    const planLimit = data.planLimit
    if (planName || planLimit) {
      const company = JSON.parse(localStorage.getItem('company') || '{}') || {}
      const user    = JSON.parse(localStorage.getItem('user')    || '{}') || {}
      const planData = {
        ...(planName  ? { planName }  : {}),
        ...(planLimit ? { planLimit } : {}),
      }
      localStorage.setItem('company', JSON.stringify({ ...company, ...planData }))
      localStorage.setItem('user',    JSON.stringify({ ...user,    ...planData }))
    }
    if (!expectedPlan || data.planName === expectedPlan) break
  }
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [plan, setPlan] = useState('FREE')
  const [daysLeft, setDaysLeft] = useState(null)

  const company  = JSON.parse(localStorage.getItem('company') || '{}') || {}
  const storeUrl = getCompanyStoreUrl(company)
  const user     = JSON.parse(localStorage.getItem('user')    || '{}') || {}

  useEffect(() => {
    // Cargar plan y fecha de expiración
    fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json())
      .then(d => {
        if (d.planName) setPlan(d.planName)
        if (d.planExpiresAt && d.planName !== 'FREE') {
          const expires = new Date(d.planExpiresAt)
          const now     = new Date()
          const diff    = Math.ceil((expires - now) / (1000 * 60 * 60 * 24))
          if (diff <= 7 && diff > 0) setDaysLeft(diff)
        }
      })
      .catch(() => {})

    // Detectar retorno de Mercado Pago
    const rawPayment = searchParams.get('payment')
      || searchParams.get('status')
      || searchParams.get('collection_status')
    const payment = PAYMENT_STATUS_MAP[rawPayment] || rawPayment
    const planParam = searchParams.get('plan') || localStorage.getItem(PENDING_PLAN_KEY) || ''

    if (payment) {
      setPaymentStatus({ status: payment, plan: planParam })
      window.history.replaceState({}, '', '/dashboard')
      localStorage.removeItem(PENDING_PLAN_KEY)

      if (payment === 'success') {
        // Activar plan directamente
        if (planParam) {
          fetch(`${API_URL}/companies/plan`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
            body: JSON.stringify({ plan: planParam.toUpperCase(), months: '1' }),
          }).catch(() => {})
        }
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
  }, [])

  // ─── Badge del plan ───────────────────────────────────────────────────────
  const PlanBadge = () => {
    if (plan === 'BUSINESS') return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)',
        borderRadius: 12, padding: '11px 20px',
        fontSize: 13, fontWeight: 700, color: '#34d399',
      }}>🚀 Plan Business</div>
    )
    if (plan === 'PRO') return (
      <div onClick={() => navigate('/dashboard/plans')} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(124,131,253,0.15)', border: '1px solid rgba(124,131,253,0.35)',
        borderRadius: 12, padding: '11px 20px',
        fontSize: 13, fontWeight: 700, color: '#7c83fd',
        cursor: 'pointer', transition: 'all 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,131,253,0.22)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,131,253,0.15)'}
      >⚡ Plan Pro</div>
    )
    return (
      <button onClick={() => navigate('/dashboard/plans')} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'linear-gradient(135deg, #7c83fd, #4f46e5)',
        color: 'white', border: 'none', borderRadius: 12,
        padding: '11px 20px', fontSize: 13, fontWeight: 600,
        cursor: 'pointer', whiteSpace: 'nowrap',
        boxShadow: '0 4px 16px rgba(124,131,253,0.3)',
        transition: 'all 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >⚡ Mejorar plan</button>
    )
  }

  return (
    <DashboardLayout>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }`}</style>

      {/* ── Banner vencimiento próximo ── */}
      {daysLeft !== null && (
        <div style={{
          background: daysLeft <= 3 ? 'rgba(248,113,113,0.08)' : 'rgba(251,191,36,0.08)',
          border: `1px solid ${daysLeft <= 3 ? 'rgba(248,113,113,0.3)' : 'rgba(251,191,36,0.3)'}`,
          borderRadius: 14, padding: '14px 20px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, flexWrap: 'wrap', animation: 'fadeIn 0.4s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>{daysLeft <= 3 ? '🚨' : '⏰'}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: daysLeft <= 3 ? '#f87171' : '#fbbf24' }}>
                Tu plan vence en {daysLeft} día{daysLeft !== 1 ? 's' : ''}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Renueva tu plan para no perder acceso a tus funciones.
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard/plans')} style={{
            background: daysLeft <= 3
              ? 'linear-gradient(135deg, #f87171, #ef4444)'
              : 'linear-gradient(135deg, #fbbf24, #d97706)',
            color: 'white', border: 'none', borderRadius: 10,
            padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}>Renovar ahora →</button>
        </div>
      )}

      {/* ── Banner resultado de pago ── */}
      {paymentStatus?.status === 'success' && (
        <div style={{
          background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)',
          borderRadius: 14, padding: '16px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, flexWrap: 'wrap', animation: 'fadeIn 0.4s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>🎉</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#34d399' }}>
                Pago confirmado. Ya tienes acceso al plan {PLAN_NAMES[paymentStatus.plan] || paymentStatus.plan || 'seleccionado'}.
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                Tu cuenta fue actualizada correctamente.
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard/products')} style={{
            background: 'linear-gradient(135deg, #34d399, #059669)',
            color: 'white', border: 'none', borderRadius: 10,
            padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>Ir a productos →</button>
        </div>
      )}

      {paymentStatus?.status === 'failure' && (
        <div style={{
          background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)',
          borderRadius: 14, padding: '16px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 24 }}>❌</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f87171' }}>El pago no pudo procesarse</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Intenta de nuevo con otro método de pago.</div>
          </div>
        </div>
      )}

      {paymentStatus?.status === 'pending' && (
        <div style={{
          background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)',
          borderRadius: 14, padding: '16px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 24 }}>⏳</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fbbf24' }}>Pago pendiente de confirmación</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Tu plan se activará automáticamente cuando el pago sea confirmado.</div>
          </div>
        </div>
      )}

      {/* ── Bienvenida ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,131,253,0.1), rgba(79,70,229,0.05))',
        border: '1px solid rgba(124,131,253,0.2)',
        borderRadius: 20, padding: '28px 32px', marginBottom: 28,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(to right, transparent, var(--primary), transparent)' }}/>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8 }}>
              Panel de control
            </div>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 6 }}>
              ¡Bienvenido, {company.name || user.fullName}! 👋
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-soft)' }}>
              Desde aquí gestionas todo tu negocio en Fluxy.
            </p>
          </div>

          {/* ── Badge plan ── */}
          <PlanBadge />
        </div>
      </div>

      {/* ── Cards rápidas ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { icon: '📦', label: 'Productos',    desc: 'Gestiona tu catálogo',  path: '/dashboard/products', color: '#7c83fd' },
          { icon: '🛒', label: 'Pedidos',      desc: 'Ver pedidos recibidos', path: '/dashboard/orders',   color: '#34d399' },
          { icon: '⚙️', label: 'Configuración', desc: 'Edita tu tienda',      path: '/dashboard/settings', color: '#fbbf24' },
          { icon: '⚡', label: 'Planes',       desc: 'Ver planes y precios',  path: '/dashboard/plans',    color: '#a78bfa' },
        ].map(card => (
          <button key={card.path} onClick={() => navigate(card.path)} style={{
            background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16, padding: '20px', textAlign: 'left',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${card.color}40`; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 11, background: `${card.color}15`, border: `1px solid ${card.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 12 }}>{card.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 4 }}>{card.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{card.desc}</div>
          </button>
        ))}
      </div>

      {/* ── Link tienda ── */}
      {storeUrl && (
        <div style={{
          background: 'rgba(13,13,26,0.8)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16, padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>🔗 Tu tienda pública</div>
            <div style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 500 }}>{storeUrl}</div>
          </div>
          <a href={storeUrl} target="_blank" rel="noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
            borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#34d399',
          }}>
            Ver tienda
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      )}
    </DashboardLayout>
  )
}