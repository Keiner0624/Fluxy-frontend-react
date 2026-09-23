// src/modules/dashboard/pages/PlansPage.jsx
// Plan y facturación: plan actual y hasta cuándo está pagado, cambiar de plan (con cotización
// antes de pagar), cancelar al final del periodo, reactivar e historial. El backend decide todo;
// esta pantalla solo lo muestra.
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import { EmptyState, ErrorState, Modal } from '@/modules/dashboard/components/ui'
import Icon from '@/components/Icon'
import { api } from '@/app/api'
import { invalidateAccount } from '@/app/account'
import { newIdempotencyKey } from '@/app/session'
import { legalUrl } from '@/modules/landing/legal/documents'

const RANK = { FREE: 0, PRO: 1, BUSINESS: 2 }

const BENEFITS = {
  FREE: ['Hasta 10 productos', 'Tienda pública con enlace propio', 'Pedidos, clientes y cobros', 'Logo de tu negocio', 'Resumen de ventas'],
  PRO: ['Hasta 100 productos', 'Pedidos por WhatsApp y aviso al cliente', 'Métricas y reportes exportables', 'Cupones de descuento',
    'Estilo de la tienda: color, portada y modo oscuro', 'Equipo con roles y permisos'],
  BUSINESS: ['Productos ilimitados', 'Todo lo de Pro', 'Dominio personalizado', 'Descripciones de productos con IA', 'Tienda sin la marca de Fluxy', 'Soporte prioritario'],
}

const FEATURE_LABELS = {
  METRICS: 'Métricas', REPORTS: 'Reportes', COUPONS: 'Cupones', CUSTOM_STYLE: 'Estilo de la tienda', WHATSAPP: 'Pedidos por WhatsApp',
  CUSTOM_DOMAIN: 'Dominio personalizado', AI_DESCRIPTIONS: 'Descripciones con IA', NO_BRANDING: 'Tienda sin la marca de Fluxy',
}

const REASONS = [
  ['TOO_EXPENSIVE', 'Es muy caro para mí'],
  ['NOT_USING', 'No lo estoy usando'],
  ['MISSING_FEATURES', 'Le faltan funciones que necesito'],
  ['SWITCHING', 'Me cambio a otra herramienta'],
  ['TEMPORARY', 'Es temporal, voy a volver'],
  ['OTHER', 'Otro motivo'],
]

const EVENTS = {
  TRIAL_STARTED: 'Empezó la prueba gratuita',
  SUBSCRIPTION_STARTED: 'Empezó la suscripción',
  RENEWED: 'Renovaste',
  PLAN_UPGRADED: 'Subiste de plan',
  DOWNGRADE_SCHEDULED: 'Programaste un cambio de plan',
  DOWNGRADE_APPLIED: 'Empezó el plan programado',
  CANCELLATION_REQUESTED: 'Pediste cancelar la suscripción',
  CANCELLATION_REVOKED: 'Reactivaste la suscripción',
  SUBSCRIPTION_CANCELED: 'Terminó la suscripción cancelada',
  SUBSCRIPTION_EXPIRED: 'Venció el plan',
  ADMIN_GRANTED: 'Cambio hecho por Fluxy',
}

const KINDS = { NEW: 'Alta', RENEWAL: 'Renovación', UPGRADE: 'Subida de plan', DOWNGRADE: 'Cambio programado' }
const PLAN_NAMES = { FREE: 'Free', PRO: 'Pro', BUSINESS: 'Business' }

const money = (value) => `S/ ${Number(value || 0).toFixed(Number(value) % 1 === 0 ? 0 : 2)}`
const longDate = (value) => value ? new Date(value).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'
const shortDate = (value) => value ? new Date(value).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

function statusBadge(sub) {
  if (sub.status === 'FREE') return <span className="fx-badge">Gratis</span>
  if (sub.cancelAtPeriodEnd) return <span className="fx-badge fx-badge--warn"><Icon name="clock" size={12} /> Se cancela el {shortDate(sub.paidUntil)}</span>
  if (sub.trial) return <span className="fx-badge fx-badge--brand">Prueba gratuita</span>
  return <span className="fx-badge fx-badge--ok"><span className="fx-dot" /> Activo</span>
}

function CurrentPlan({ sub, onRenew, onCancel, onReactivate, onTrial, busy }) {
  const free = sub.status === 'FREE'
  const limit = sub.usage?.productLimit
  const used = sub.usage?.products ?? 0
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0

  return (
    <section className="fx-card fx-billing-current" aria-label="Plan actual">
      <div className="fx-card__body">
        <div className="fx-billing-current__top">
          <div>
            <p className="fx-eyebrow">Plan actual</p>
            <div className="fx-row" style={{ gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
              <h2 className="fx-billing-current__name">{sub.planName}</h2>
              {statusBadge(sub)}
            </div>
          </div>
          {!free && (
            <p className="fx-billing-current__price">{money(sub.monthlyPrice)} <span>/ mes</span></p>
          )}
        </div>

        {free ? (
          <p className="fx-hint" style={{ marginTop: 10 }}>
            {sub.last
              ? `Tu plan ${sub.last.planName} ${sub.last.status === 'CANCELED' ? 'se canceló' : 'venció'} el ${longDate(sub.last.endedAt)}. Tus datos siguen guardados: elegí un plan para recuperar sus funciones.`
              : 'Tu tienda funciona gratis con lo esencial. Cuando necesites más, elegí un plan: se activa apenas se confirma el pago.'}
          </p>
        ) : (
          <dl className="fx-billing-current__facts">
            <div>
              <dt>{sub.cancelAtPeriodEnd ? 'Activo hasta' : sub.trial ? 'Prueba hasta' : 'Pagado hasta'}</dt>
              <dd>{longDate(sub.paidUntil)} <small>{sub.daysLeft === 1 ? 'falta 1 día' : `faltan ${sub.daysLeft} días`}</small></dd>
            </div>
            <div>
              <dt>Renovación</dt>
              <dd>Manual <small>sin cobros automáticos</small></dd>
            </div>
            <div>
              <dt>Después</dt>
              <dd>{sub.pendingChange ? `Plan ${sub.pendingChange.planName}` : sub.cancelAtPeriodEnd ? 'Plan Free' : 'Plan Free si no renovás'}</dd>
            </div>
          </dl>
        )}

        {sub.pendingChange && (
          <div className="fx-alert fx-alert--ok" style={{ marginTop: 14 }}>
            <Icon name="clock" size={16} />
            <span>El {longDate(sub.pendingChange.effectiveAt)} pasás a {sub.pendingChange.planName}, ya pagado hasta el {longDate(sub.pendingChange.paidUntil)}.</span>
          </div>
        )}
        {sub.cancelAtPeriodEnd && (
          <div className="fx-alert fx-alert--warn" style={{ marginTop: 14 }}>
            <Icon name="info" size={16} />
            <span>
              Cancelaste la suscripción. Seguís con {sub.planName} hasta el {longDate(sub.paidUntil)}; después tu tienda pasa al plan Free.
              No se borra nada. Podés reactivarla hasta esa fecha.
            </span>
          </div>
        )}

        {limit != null && (
          <div className="fx-billing-usage">
            <div className="fx-row fx-row--between" style={{ fontSize: 13 }}>
              <span>Productos</span>
              <span className="fx-num">{used}{limit > 0 ? ` de ${limit}` : ' · sin límite'}</span>
            </div>
            {limit > 0 && <div className="fx-progress" aria-hidden="true"><span style={{ width: `${pct}%` }} className={pct >= 90 ? 'is-high' : ''} /></div>}
          </div>
        )}

        <div className="fx-row fx-billing-current__actions">
          {free && sub.trialAvailable && (
            <button type="button" className="fx-btn fx-btn--primary" onClick={onTrial} disabled={busy}>
              <Icon name="sparkles" size={15} /> Probar Pro gratis 1 mes
            </button>
          )}
          {!free && !sub.cancelAtPeriodEnd && (
            <button type="button" className="fx-btn fx-btn--primary" onClick={onRenew} disabled={busy}>
              <Icon name="refresh" size={15} /> Renovar
            </button>
          )}
          <a href="#planes" className="fx-btn fx-btn--secondary">Cambiar plan</a>
          {sub.canReactivate && (
            <button type="button" className="fx-btn fx-btn--primary" onClick={onReactivate} disabled={busy}>
              {busy ? <span className="fx-spinner" /> : <Icon name="undo" size={15} />} Reactivar suscripción
            </button>
          )}
          {sub.canCancel && (
            <button type="button" className="fx-btn fx-btn--ghost fx-billing-current__cancel" onClick={onCancel} disabled={busy}>
              Cancelar suscripción
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

function planAction(plan, sub) {
  if (plan.code === 'FREE') {
    return sub.status === 'FREE' ? { label: 'Plan actual', disabled: true } : { label: 'Plan gratuito', disabled: true }
  }
  if (sub.status === 'FREE') return { label: `Elegir ${plan.name}` }
  if (sub.pendingChange?.plan === plan.code) return { label: 'Sumar meses' }
  if (sub.plan === plan.code) return { label: sub.cancelAtPeriodEnd ? 'Renovar y seguir' : 'Renovar' }
  if (RANK[plan.code] > RANK[sub.plan]) return { label: `Subir a ${plan.name}` }
  return { label: `Cambiar a ${plan.name} al vencer` }
}

function PlanCards({ plans, sub, onPick }) {
  return (
    <div className="fx-plans" id="planes">
      {plans.map((plan) => {
        const current = sub.plan === plan.code
        const action = planAction(plan, sub)
        return (
          <div key={plan.code} className={`fx-plan${current ? ' fx-plan--current' : ''}`}>
            <div className="fx-plan__head">
              <div className="fx-row fx-row--between">
                <h2 className="fx-h2">{plan.name}</h2>
                {current ? <span className="fx-badge fx-badge--brand">Tu plan</span>
                  : sub.pendingChange?.plan === plan.code ? <span className="fx-badge">Programado</span>
                    : plan.code === 'PRO' ? <span className="fx-badge">Más elegido</span> : null}
              </div>
              <p className="fx-plan__price">
                {plan.code === 'FREE' ? 'Gratis' : money(plan.monthlyPrice)}
                {plan.code !== 'FREE' && <span className="fx-plan__period"> / mes</span>}
              </p>
            </div>
            <ul className="fx-plan__list">
              {(BENEFITS[plan.code] || []).map((b) => (
                <li key={b}><Icon name="check" size={15} style={{ color: 'var(--fx-ok)' }} /><span>{b}</span></li>
              ))}
            </ul>
            <div className="fx-plan__foot">
              <button type="button"
                className={`fx-btn fx-btn--block ${action.disabled ? 'fx-btn--secondary' : RANK[plan.code] > RANK[sub.plan] || sub.status === 'FREE' ? 'fx-btn--primary' : 'fx-btn--secondary'}`}
                disabled={action.disabled} onClick={() => onPick(plan)}>
                {action.label}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CheckoutModal({ plan, onClose }) {
  const [months, setMonths] = useState(1)
  const [quote, setQuote] = useState(null)
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)
  const keyRef = useRef(newIdempotencyKey('checkout'))

  useEffect(() => {
    let vigente = true
    setQuote(null)
    setError('')
    api.get('/billing/subscription/quote', { plan: plan.code, months })
      .then((data) => { if (vigente) setQuote(data) })
      .catch((err) => { if (vigente) setError(err.message) })
    return () => { vigente = false }
  }, [plan.code, months])

  const pay = async () => {
    setPaying(true)
    setError('')
    try {
      const data = await api.post('/billing/subscription/checkout', { plan: plan.code, months }, { idempotencyKey: keyRef.current })
      window.location.href = data.checkoutUrl
    } catch (err) {
      setError(err.message)
      setPaying(false)
      keyRef.current = newIdempotencyKey('checkout')
    }
  }

  return (
    <Modal
      title={quote ? `${KINDS[quote.kind] || 'Pago'} · Plan ${plan.name}` : `Plan ${plan.name}`}
      subtitle="Revisá qué pasa antes de pagar."
      onClose={paying ? () => {} : onClose}
      width={520}
      footer={(
        <>
          <button type="button" className="fx-btn fx-btn--ghost" onClick={onClose} disabled={paying}>Volver</button>
          <button type="button" className="fx-btn fx-btn--primary" onClick={pay} disabled={!quote || paying}>
            {paying ? <><span className="fx-spinner" /> Redirigiendo…</> : <>Pagar {quote ? money(quote.amount) : ''} con Mercado Pago</>}
          </button>
        </>
      )}
    >
      <div className="fx-field">
        <span className="fx-label">Duración</span>
        <div className="fx-tabs fx-billing-months" role="radiogroup" aria-label="Cantidad de meses">
          {[1, 3, 6, 12].map((m) => (
            <button key={m} type="button" role="radio" aria-checked={months === m}
              className={`fx-tab${months === m ? ' fx-tab--on' : ''}`} onClick={() => setMonths(m)} disabled={paying}>
              {m === 1 ? '1 mes' : `${m} meses`}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="fx-alert fx-alert--error" style={{ marginBottom: 12 }}><Icon name="alert" size={16} /><span>{error}</span></div>}
      {!quote && !error && <div className="fx-skeleton" style={{ height: 120 }} />}
      {quote && (
        <>
          <dl className="fx-kv fx-billing-quote">
            <dt>Total</dt><dd><strong>{money(quote.amount)}</strong> <span className="fx-hint">({quote.months} × {money(plan.monthlyPrice)}, en soles)</span></dd>
            <dt>Desde</dt><dd>{longDate(quote.periodStart)}</dd>
            <dt>Hasta</dt><dd>{longDate(quote.periodEnd)}</dd>
          </dl>
          <ul className="fx-billing-notes">
            {quote.notes.map((n) => <li key={n}><Icon name="info" size={14} /> {n}</li>)}
          </ul>
          {quote.warnings.length > 0 && (
            <div className="fx-alert fx-alert--warn" style={{ marginTop: 12 }}>
              <Icon name="alert" size={16} />
              <div>{quote.warnings.map((w) => <p key={w} style={{ margin: 0 }}>{w}</p>)}</div>
            </div>
          )}
          <p className="fx-hint" style={{ marginTop: 12 }}>
            Pago único con Mercado Pago. No se guardan tarjetas ni se hacen cobros automáticos. <a href={legalUrl('terms')} target="_blank" rel="noreferrer" className="fx-link">Términos</a>
          </p>
        </>
      )}
    </Modal>
  )
}

function CancelModal({ sub, plans, onClose, onDone }) {
  const [reason, setReason] = useState('')
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const keyRef = useRef(newIdempotencyKey('cancel'))
  const current = plans.find((p) => p.code === sub.plan)
  const lost = (current?.features || []).map((f) => FEATURE_LABELS[f]).filter(Boolean)

  const confirm = async () => {
    setBusy(true)
    try {
      const data = await api.post('/billing/subscription/cancel', { reason: reason || null, comment: comment || null }, { idempotencyKey: keyRef.current })
      onDone(data)
    } catch (err) {
      toast.error(err.message)
      setBusy(false)
    }
  }

  return (
    <Modal
      title="Cancelar suscripción"
      subtitle={`Plan ${sub.planName}`}
      onClose={busy ? () => {} : onClose}
      width={520}
      footer={(
        <>
          <button type="button" className="fx-btn fx-btn--secondary" onClick={onClose} disabled={busy}>Mantener mi plan</button>
          <button type="button" className="fx-btn fx-btn--danger" onClick={confirm} disabled={busy}>
            {busy ? <span className="fx-spinner" /> : null} Cancelar suscripción
          </button>
        </>
      )}
    >
      <div className="fx-billing-impact">
        <div><Icon name="checkCircle" size={18} /><span><strong>Seguís con {sub.planName} hasta el {longDate(sub.paidUntil)}.</strong> Lo que pagaste se respeta completo.</span></div>
        <div><Icon name="clock" size={18} /><span>Ese día tu tienda pasa al plan <strong>Free</strong>. No se hace ningún cobro.</span></div>
        {lost.length > 0 && <div><Icon name="lock" size={18} /><span>Dejan de estar incluidos: {lost.join(', ')}. La configuración se guarda por si volvés.</span></div>}
        <div><Icon name="shield" size={18} /><span>No se borra nada: productos, pedidos, clientes y cobros quedan guardados.</span></div>
        <div><Icon name="undo" size={18} /><span>Podés reactivarla cuando quieras antes del {longDate(sub.paidUntil)}.</span></div>
      </div>

      <fieldset className="fx-billing-reasons">
        <legend className="fx-label">¿Por qué cancelás? <span className="fx-hint">(opcional)</span></legend>
        {REASONS.map(([value, label]) => (
          <label key={value} className="fx-check">
            <input type="radio" name="reason" value={value} checked={reason === value} onChange={() => setReason(value)} />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
      <div className="fx-field" style={{ marginBottom: 0 }}>
        <label className="fx-label" htmlFor="cancel-comment">Comentario <span className="fx-hint">(opcional)</span></label>
        <textarea id="cancel-comment" className="fx-textarea" rows={3} maxLength={500} value={comment} onChange={(e) => setComment(e.target.value)}
          placeholder="¿Qué te hubiera hecho quedarte?" />
      </div>
    </Modal>
  )
}

function History({ history }) {
  if (!history) return null
  const payments = history.payments || []
  const events = history.events || []
  if (!payments.length && !events.length) {
    return <EmptyState icon="receipt" title="Sin movimientos todavía" text="Acá vas a ver tus pagos de plan y cada cambio de la suscripción." />
  }
  return (
    <div className="fx-split">
      <div className="fx-card">
        <div className="fx-card__head"><h2 className="fx-h3">Pagos</h2></div>
        {payments.length === 0 ? <div className="fx-card__body fx-hint">Todavía no hay pagos de plan.</div> : (
          <ul className="fx-list" style={{ padding: '4px 20px' }}>
            {payments.map((p, i) => (
              <li key={i} className="fx-list__row" style={{ gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'var(--fx-ink)', fontSize: 13.5 }}>{KINDS[p.kind]} · Plan {PLAN_NAMES[p.plan]} · {p.months === 1 ? '1 mes' : `${p.months} meses`}</div>
                  <div className="fx-hint" style={{ fontSize: 12 }}>
                    {shortDate(p.periodStart)} → {shortDate(p.periodEnd)}{p.creditDays ? ` · incluye ${p.creditDays} días convertidos` : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="fx-num" style={{ color: 'var(--fx-ink)', fontWeight: 600 }}>{money(p.amount)}</div>
                  <div className="fx-hint" style={{ fontSize: 12 }}>{shortDate(p.paidAt)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="fx-card">
        <div className="fx-card__head"><h2 className="fx-h3">Cambios</h2></div>
        <ul className="fx-list" style={{ padding: '4px 20px' }}>
          {events.slice(0, 20).map((e, i) => (
            <li key={i} className="fx-list__row" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'var(--fx-ink)', fontSize: 13.5 }}>{EVENTS[e.type] || e.type}</div>
                <div className="fx-hint" style={{ fontSize: 12 }}>
                  {[e.fromPlan && e.toPlan && e.fromPlan !== e.toPlan ? `${PLAN_NAMES[e.fromPlan]} → ${PLAN_NAMES[e.toPlan]}` : null,
                    e.actor].filter(Boolean).join(' · ')}
                </div>
              </div>
              <span className="fx-hint" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{shortDate(e.createdAt)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function PlansPage() {
  const [params, setParams] = useSearchParams()
  const [sub, setSub] = useState(null)
  const [plans, setPlans] = useState([])
  const [history, setHistory] = useState(null)
  const [error, setError] = useState(null)
  const [picking, setPicking] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [busy, setBusy] = useState(false)
  const [returnState, setReturnState] = useState(null)

  const load = useCallback(async () => {
    try {
      const [s, p, h] = await Promise.all([api.get('/billing/subscription'), api.get('/billing/plans'), api.get('/billing/history')])
      setSub(s)
      setPlans(p)
      setHistory(h)
      setError(null)
      return s
    } catch (err) {
      setError(err)
      return null
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Vuelta de Mercado Pago: el plan cambia cuando llega el aviso del proveedor, no por esta URL.
  // Se lee una sola vez al entrar; limpiar la URL no debe cortar la espera.
  const [returned] = useState(() => params.get('payment'))
  useEffect(() => {
    if (!returned) return undefined
    setParams({}, { replace: true })
    if (returned !== 'approved') {
      setReturnState(returned === 'rejected' ? 'rejected' : 'pending')
      return undefined
    }
    setReturnState('confirming')
    let vigente = true
    let tries = 0
    const startedAt = Date.now()
    const tick = async () => {
      const h = await api.get('/billing/history').catch(() => null)
      if (!vigente) return
      const last = h?.payments?.[0]?.paidAt
      // Un pago registrado en los últimos minutos es el que acaba de hacer.
      if (last && new Date(last).getTime() > startedAt - 10 * 60 * 1000) {
        setReturnState('confirmed')
        invalidateAccount()
        load()
        return
      }
      tries += 1
      if (tries < 12) setTimeout(tick, 3000)
      else setReturnState('pending')
    }
    tick()
    return () => { vigente = false }
    // Solo al entrar: returned no cambia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returned])

  const reactivate = async () => {
    setBusy(true)
    try {
      setSub(await api.post('/billing/subscription/reactivate', undefined, { idempotencyKey: newIdempotencyKey('reactivate') }))
      toast.success('Listo: tu suscripción sigue activa.')
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  const startTrial = async () => {
    setBusy(true)
    try {
      setSub(await api.post('/billing/subscription/trial', undefined, { idempotencyKey: newIdempotencyKey('trial') }))
      invalidateAccount()
      toast.success('Tu prueba de Pro está activa por 1 mes.')
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="fx-page-head">
        <div>
          <h1>Plan y facturación</h1>
          <p>Tu plan, hasta cuándo está pagado y todos tus cambios. Sin cobros automáticos.</p>
        </div>
      </div>

      {returnState === 'confirming' && (
        <div className="fx-alert fx-alert--warn" role="status" style={{ marginBottom: 14 }}>
          <span className="fx-spinner" /><span>Estamos confirmando tu pago con Mercado Pago. Tarda unos segundos.</span>
        </div>
      )}
      {returnState === 'confirmed' && (
        <div className="fx-alert fx-alert--ok" role="status" style={{ marginBottom: 14 }}>
          <Icon name="checkCircle" size={16} /><span>Pago confirmado. Tu plan ya está actualizado.</span>
        </div>
      )}
      {returnState === 'pending' && (
        <div className="fx-alert fx-alert--warn" role="status" style={{ marginBottom: 14 }}>
          <Icon name="clock" size={16} /><span>Tu pago todavía se está procesando. Cuando Mercado Pago lo confirme, tu plan se actualiza solo y te avisamos por correo.</span>
        </div>
      )}
      {returnState === 'rejected' && (
        <div className="fx-alert fx-alert--error" role="status" style={{ marginBottom: 14 }}>
          <Icon name="alert" size={16} /><span>El pago no se completó. No se hizo ningún cambio en tu plan.</span>
        </div>
      )}

      {error && <ErrorState error={error} onRetry={load} />}
      {!sub && !error && <div className="fx-skeleton" style={{ height: 220, marginBottom: 20 }} />}

      {sub && (
        <>
          <CurrentPlan sub={sub} busy={busy}
            onRenew={() => setPicking(plans.find((p) => p.code === sub.plan))}
            onCancel={() => setCancelling(true)}
            onReactivate={reactivate}
            onTrial={startTrial} />

          <h2 className="fx-h3 fx-billing-title">Planes</h2>
          <PlanCards plans={plans} sub={sub} onPick={setPicking} />
          <p className="fx-hint" style={{ margin: '14px 0 28px', textAlign: 'center' }}>
            Precios en soles. Renovar suma meses al final de lo que ya pagaste. Subir de plan es inmediato y convierte los días que te quedaban;
            bajar de plan empieza cuando termina lo pagado.
          </p>

          <h2 className="fx-h3 fx-billing-title">Historial</h2>
          <History history={history} />
        </>
      )}

      {picking && <CheckoutModal plan={picking} onClose={() => setPicking(null)} />}
      {cancelling && sub && (
        <CancelModal sub={sub} plans={plans} onClose={() => setCancelling(false)}
          onDone={(data) => {
            setSub(data)
            setCancelling(false)
            toast.success(`Listo. Tu plan sigue activo hasta el ${longDate(data.paidUntil)}.`)
            load()
          }} />
      )}
    </DashboardLayout>
  )
}
