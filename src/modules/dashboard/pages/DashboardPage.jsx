// src/modules/dashboard/pages/DashboardPage.jsx
// Responde en pocos segundos: cómo está el negocio hoy y qué requiere atención.
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import { getCompanyStoreUrl } from '@/app/config'
import Icon from '@/components/Icon'
import { getMe, getMyCompany } from '@/app/account'
import { api } from '@/app/api'
import useApi from '@/hooks/useApi'
import useAccess from '@/hooks/useAccess'
import { money, integer, dateTime, delta, ORDER_STATUS } from '@/app/format'
import { StatCard, ErrorState, EmptyState, Badge, NoAccess } from '@/modules/dashboard/components/ui'

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
    // force: se espera a que el webhook active el plan, la cache no sirve aqui.
    let data
    try { data = await getMe({ force: true }) } catch { continue }
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

export default function DashboardPage() {
  const navigate = useNavigate()
  const [searchParams]   = useSearchParams()
  const access = useAccess()
  const [paymentStatus,  setPaymentStatus]  = useState(null)
  const [plan,           setPlan]           = useState('FREE')
  const [daysLeft,       setDaysLeft]       = useState(null)
  const [firstName,      setFirstName]      = useState(() => getUserFirstName(readStorage('user')))
  const [company,        setCompany]        = useState(() => normalizeCompany(readStorage('company')))
  const [showBirthday,   setShowBirthday]   = useState(false)

  const canView = access.can('ORDER_VIEW')
  const overview = useApi(() => api.get('/dashboard/overview'), [canView], { enabled: canView })

  const user        = readStorage('user')
  const displayName = firstName || user.fullName || company.name || ''
  const storeUrl = getCompanyStoreUrl(company)

  useEffect(() => {
    getMe()
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

    getMyCompany()
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
            getMe({ force: true })
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

  const o = overview.data
  const loading = overview.loading && !o
  const attention = o ? [
    o.pendingOrders > 0 && {
      to: '/dashboard/orders?status=PENDING', icon: 'clock', tone: 'warn',
      text: `${o.pendingOrders} ${o.pendingOrders === 1 ? 'pedido espera' : 'pedidos esperan'} confirmación`,
    },
    o.outOfStockCount > 0 && access.can('INVENTORY_VIEW') && {
      to: '/dashboard/inventory?filter=out', icon: 'warning', tone: 'danger',
      text: `${o.outOfStockCount} ${o.outOfStockCount === 1 ? 'producto agotado' : 'productos agotados'}`,
    },
    o.lowStockCount > 0 && access.can('INVENTORY_VIEW') && {
      to: '/dashboard/inventory?filter=low', icon: 'inventory', tone: 'warn',
      text: `${o.lowStockCount} ${o.lowStockCount === 1 ? 'producto requiere' : 'productos requieren'} reposición`,
    },
  ].filter(Boolean) : []

  return (
    <DashboardLayout>
      <div className="fx-page-head">
        <div>
          <h1>{displayName ? `Hola, ${displayName}` : 'Resumen'}</h1>
          <p>{company.name ? `Así está ${company.name} hoy` : 'Así está tu negocio hoy'}</p>
        </div>
        <div className="fx-page-head__actions">
          {access.can('BILLING_MANAGE') && (plan === 'FREE' ? (
            <button className="fx-btn fx-btn--secondary" onClick={() => navigate('/dashboard/plans')}>
              <Icon name="plans" size={15} />
              Mejorar plan
            </button>
          ) : (
            <Link to="/dashboard/plans" className="fx-badge fx-badge--brand" style={{ height: 32, padding: '0 12px' }}>
              <Icon name="plans" size={14} />
              Plan {PLAN_NAMES[plan] || plan}
            </Link>
          ))}
          {access.can('ORDER_VIEW') && (
            <Link to="/dashboard/orders" className="fx-btn fx-btn--primary">
              <Icon name="orders" size={15} />
              Ver pedidos
            </Link>
          )}
        </div>
      </div>

      <div className="fx-grid" style={{ gap: 12, marginBottom: paymentStatus || daysLeft !== null ? 20 : 0 }}>
        {paymentAlert()}

        {daysLeft !== null && (
          <div className="fx-alert fx-alert--warn">
            <Icon name="clock" size={17} />
            <span style={{ flex: 1 }}>
              Tu plan vence en {daysLeft} {daysLeft === 1 ? 'día' : 'días'}. Renovalo para no perder acceso a tus funciones.
            </span>
            {access.can('BILLING_MANAGE') && <Link to="/dashboard/plans" className="fx-btn fx-btn--sm fx-btn--secondary">Renovar</Link>}
          </div>
        )}
      </div>

      {access.ready && !canView ? (
        <NoAccess module="el resumen de ventas" />
      ) : (
        <>
          {overview.error && <div style={{ marginBottom: 16 }}><ErrorState error={overview.error} onRetry={overview.reload} /></div>}

          <div className="fx-stats" style={{ marginBottom: 16 }}>
            <StatCard loading={loading} icon="money" label="Ventas de hoy" value={money(o?.salesToday)}
              delta={o && delta(o.salesToday, o.salesYesterday)} deltaLabel="frente a ayer" />
            <StatCard loading={loading} icon="trend" label="Ventas del mes" value={money(o?.salesMonth)}
              delta={o && delta(o.salesMonth, o.salesPreviousMonth)} deltaLabel="frente al mes anterior" />
            <StatCard loading={loading} icon="orders" label="Pedidos de hoy" value={integer(o?.ordersToday)}
              foot={o && `${integer(o.pendingOrders)} pendientes · ${integer(o.inProgressOrders)} en curso`} />
            <StatCard loading={loading} icon="receipt" label="Ticket promedio" value={money(o?.averageTicketMonth)}
              foot={o && `${integer(o.saleOrdersMonth)} ${o.saleOrdersMonth === 1 ? 'venta' : 'ventas'} este mes`} />
            <StatCard loading={loading} icon="customers" label="Clientes nuevos" value={integer(o?.newCustomersMonth)}
              delta={o && delta(o.newCustomersMonth, o.newCustomersPreviousMonth)} deltaLabel="este mes" />
            <StatCard loading={loading} icon="inventory" label="Stock bajo" value={integer((o?.lowStockCount || 0) + (o?.outOfStockCount || 0))}
              tone={o && o.outOfStockCount > 0 ? 'danger' : o && o.lowStockCount > 0 ? 'warn' : undefined}
              foot={o && (o.lowStockCount + o.outOfStockCount === 0 ? 'Todo el stock en orden'
                : o.lowStockCount + o.outOfStockCount === 1 ? 'producto requiere reposición' : 'productos requieren reposición')} />
          </div>

          {attention.length > 0 && (
            <div className="fx-grid" style={{ gap: 8, marginBottom: 16 }}>
              {attention.map((item) => (
                <Link key={item.to} to={item.to} className={`fx-alert fx-alert--${item.tone === 'danger' ? 'error' : 'warn'}`} style={{ alignItems: 'center' }}>
                  <Icon name={item.icon} size={16} />
                  <span style={{ flex: 1 }}>{item.text}</span>
                  <Icon name="arrowRight" size={15} />
                </Link>
              ))}
            </div>
          )}

          <div className="fx-split">
            <div className="fx-card">
              <div className="fx-card__head">
                <h2 className="fx-h3">Pedidos recientes</h2>
                <Link to="/dashboard/orders" className="fx-link" style={{ fontSize: 13 }}>Ver todos</Link>
              </div>
              {loading ? (
                <div className="fx-card__body">
                  {Array.from({ length: 4 }).map((_, i) => <div key={i} className="fx-skeleton" style={{ height: 36, marginBottom: 8 }} />)}
                </div>
              ) : !o?.recentOrders?.length ? (
                <EmptyState icon="inbox" title="Todavía no recibiste pedidos"
                  text="Compartí el enlace de tu tienda: los pedidos van a aparecer acá apenas lleguen." />
              ) : (
                <div className="fx-table-wrap">
                  <table className="fx-table fx-table--stack">
                    <tbody>
                      {o.recentOrders.map((order) => (
                        <tr key={order.id} className="is-clickable" onClick={() => navigate(`/dashboard/orders?order=${order.id}`)}>
                          <td className="fx-table__strong fx-cell--lead">#{order.id}</td>
                          <td className="fx-cell--main">
                            <div className="fx-truncate fx-table__name" style={{ maxWidth: 200, color: 'var(--fx-ink)' }}>{order.customerName || 'Sin nombre'}</div>
                            <div className="fx-hint" style={{ fontSize: 12 }}>{dateTime(order.createdAt)}</div>
                          </td>
                          <td className="fx-cell--sub"><Badge config={ORDER_STATUS[order.status]} fallback={order.status} /></td>
                          <td className="fx-table__num fx-table__strong fx-cell--end">{money(order.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="fx-grid" style={{ gap: 16 }}>
              {access.can('INVENTORY_VIEW') && (
                <div className="fx-card">
                  <div className="fx-card__head">
                    <h2 className="fx-h3">Stock bajo</h2>
                    <Link to="/dashboard/inventory?filter=attention" className="fx-link" style={{ fontSize: 13 }}>Inventario</Link>
                  </div>
                  {loading ? (
                    <div className="fx-card__body"><div className="fx-skeleton" style={{ height: 80 }} /></div>
                  ) : !o?.lowStock?.length ? (
                    <div className="fx-card__body fx-row" style={{ gap: 10 }}>
                      <Icon name="checkCircle" size={17} style={{ color: 'var(--fx-ok)' }} />
                      <span className="fx-hint">Ningún producto está por debajo de su stock mínimo.</span>
                    </div>
                  ) : (
                    <ul className="fx-list" style={{ padding: '4px 20px' }}>
                      {o.lowStock.map((p) => (
                        <li key={p.id} className="fx-list__row">
                          <div className="fx-thumb">{p.imageUrl ? <img src={p.imageUrl} alt="" /> : <Icon name="image" size={14} />}</div>
                          <span className="fx-truncate" style={{ flex: 1, fontSize: 13.5, color: 'var(--fx-ink)' }}>{p.name}</span>
                          <span className={`fx-badge ${p.stock <= 0 ? 'fx-badge--danger' : 'fx-badge--warn'}`}>
                            {p.stock <= 0 ? 'Agotado' : `${p.stock} / mín. ${p.minStock}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {storeUrl && (
                <div className="fx-card">
                  <div className="fx-card__body">
                    <p className="fx-eyebrow" style={{ marginBottom: 6 }}>Tu tienda en línea</p>
                    <p className="fx-truncate" style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>{storeUrl}</p>
                    <div className="fx-row" style={{ gap: 8 }}>
                      <button
                        type="button"
                        className="fx-btn fx-btn--secondary fx-btn--sm"
                        onClick={() => navigator.clipboard?.writeText(storeUrl)}
                      >
                        <Icon name="copy" size={14} />
                        Copiar enlace
                      </button>
                      <a href={storeUrl} target="_blank" rel="noreferrer" className="fx-btn fx-btn--ghost fx-btn--sm">
                        <Icon name="external" size={14} />
                        Visitar
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

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
