// src/modules/marketing/pages/CampaignPage.jsx
// Detalle de una campaña: estado y acciones, resultados atribuidos, audiencia y compartir.
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import { ColumnChart, ConfirmDialog, EmptyState, ErrorState, NoAccess, ShareBar, StatCard } from '@/modules/dashboard/components/ui'
import Icon from '@/components/Icon'
import useAccess from '@/hooks/useAccess'
import useApi from '@/hooks/useApi'
import { getCompanyStoreUrl } from '@/app/config'
import { daysAgo, dateTime, integer, money } from '@/app/format'
import { exportCsv } from '@/app/exporters'
import CampaignWizard from '../components/CampaignWizard'
import SharePanel from '../components/SharePanel'
import {
  campaignAction, deleteCampaign, getAnalytics, getCampaign, getLink, getOverview, getSegmentCustomers, readStoredCompany,
} from '../api/marketingApi'
import {
  CHANNELS, FUNNEL, OBJECTIVES, STATUS, TYPES, campaignActions, composeMessage, percent, personalMessage, rebaseLink, whatsappShare,
} from '../lib/marketingFormat'

const RANGES = [
  { key: 'all', label: 'Todo' },
  { key: '7', label: '7 días' },
  { key: '30', label: '30 días' },
]

const CONFIRM = {
  finish: { title: 'Finalizar campaña', text: 'Deja de contar visitas y pedidos. Los resultados se conservan y no se puede volver a activar.', label: 'Finalizar', danger: true },
  archive: { title: 'Archivar campaña', text: 'Sale de la lista principal y queda en Archivadas con sus resultados.', label: 'Archivar' },
  delete: { title: 'Eliminar borrador', text: 'El borrador se elimina. Esta acción no se puede deshacer.', label: 'Eliminar', danger: true },
}

export default function CampaignPage() {
  const access = useAccess()
  if (access.ready && !access.can('MARKETING_VIEW')) {
    return <DashboardLayout><NoAccess module="Marketing" /></DashboardLayout>
  }
  return <CampaignContent access={access} />
}

function CampaignContent({ access }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const campaign = useApi(() => getCampaign(id), [id])
  const overview = useApi(() => getOverview(30), [])
  const [editing, setEditing] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState(location.state?.activationError || '')
  const shareRef = useRef(null)
  const c = campaign.data
  const capabilities = overview.data?.capabilities
  const actions = campaignActions(c, access.can)

  // Recién creada: se lleva a Compartir.
  useEffect(() => {
    if (location.state?.share && c && shareRef.current) {
      shareRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.state, c])

  const run = async (action) => {
    setBusy(action)
    setNotice('')
    try {
      if (action === 'delete') {
        await deleteCampaign(c.id)
        toast.success('Borrador eliminado')
        navigate('/dashboard/marketing')
        return
      }
      const updated = await campaignAction(c.id, action)
      campaign.setData(updated)
      toast.success({ activate: updated.status === 'SCHEDULED' ? 'Campaña programada' : 'Campaña activa', pause: 'Campaña pausada', finish: 'Campaña finalizada', archive: 'Campaña archivada' }[action])
    } catch (e) {
      setNotice(e.message)
    } finally {
      setBusy('')
      setConfirm(null)
    }
  }

  if (campaign.error) {
    return (
      <DashboardLayout>
        <Link to="/dashboard/marketing" className="fx-link" style={{ display: 'inline-flex', gap: 6, marginBottom: 14 }}><Icon name="arrowLeft" size={14} /> Marketing</Link>
        <ErrorState error={campaign.error} onRetry={campaign.reload} />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Link to="/dashboard/marketing" className="fx-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 13.5 }}>
        <Icon name="arrowLeft" size={14} /> Marketing
      </Link>

      {!c ? (
        <div className="fx-skeleton" style={{ height: 120 }} />
      ) : (
        <>
          <div className="fx-page-head">
            <div style={{ minWidth: 0 }}>
              <div className="fx-row" style={{ gap: 10, flexWrap: 'wrap' }}>
                <h1 className="fx-truncate">{c.name}</h1>
                <span className={`fx-badge ${STATUS[c.status]?.badge || ''}`}><span className="fx-dot" />{STATUS[c.status]?.label}</span>
              </div>
              <p>
                {TYPES[c.type]?.label}{c.targetName ? `: ${c.targetName}` : ''} · {OBJECTIVES[c.objective]?.label} · {CHANNELS[c.channel]?.label}
              </p>
            </div>
            <div className="fx-page-head__actions">
              {actions.edit && (
                <button type="button" className="fx-btn fx-btn--secondary" onClick={() => setEditing(true)}><Icon name="edit" size={14} /> Editar</button>
              )}
              {actions.pause && (
                <button type="button" className="fx-btn fx-btn--secondary" onClick={() => run('pause')} disabled={Boolean(busy)}>Pausar</button>
              )}
              {actions.finish && (
                <button type="button" className="fx-btn fx-btn--ghost" onClick={() => setConfirm('finish')} disabled={Boolean(busy)}>Finalizar</button>
              )}
              {actions.archive && (
                <button type="button" className="fx-btn fx-btn--ghost" onClick={() => setConfirm('archive')} disabled={Boolean(busy)}>Archivar</button>
              )}
              {actions.remove && (
                <button type="button" className="fx-btn fx-btn--ghost" style={{ color: 'var(--fx-danger)' }} onClick={() => setConfirm('delete')} disabled={Boolean(busy)}>
                  <Icon name="trash" size={14} /> Eliminar
                </button>
              )}
              {actions.activate && (
                <button type="button" className="fx-btn fx-btn--primary" onClick={() => run('activate')} disabled={Boolean(busy)}>
                  {busy === 'activate' ? <><span className="fx-spinner" /> Activando…</> : <><Icon name="megaphone" size={15} /> {c.status === 'PAUSED' ? 'Reanudar' : 'Activar'}</>}
                </button>
              )}
            </div>
          </div>

          {notice && (
            <div className="fx-alert fx-alert--error" style={{ marginBottom: 16 }}>
              <Icon name="alert" size={16} /><span style={{ flex: 1 }}>{notice}</span>
              {/límite|plan/i.test(notice) && access.can('BILLING_MANAGE') && <Link to="/dashboard/plans" className="fx-btn fx-btn--secondary fx-btn--sm">Ver planes</Link>}
              <button type="button" className="fx-alert__close" aria-label="Cerrar" onClick={() => setNotice('')}><Icon name="close" size={14} /></button>
            </div>
          )}

          <div className="fx-split">
            <div className="fx-stack" style={{ gap: 16 }}>
              {access.can('MARKETING_ANALYTICS') ? <Results campaign={c} /> : (
                <div className="fx-card"><div className="fx-card__body"><p className="fx-hint">Tu rol no incluye ver los resultados de las campañas.</p></div></div>
              )}
              {c.segment && access.can('CUSTOMER_VIEW') && <Audience campaign={c} />}
            </div>
            <div className="fx-stack" style={{ gap: 16 }} ref={shareRef}>
              {c.status !== 'ARCHIVED' && c.status !== 'FINISHED' && <SharePanel campaign={c} capabilities={capabilities} />}
              <Details campaign={c} />
            </div>
          </div>
        </>
      )}

      {editing && c && (
        <CampaignWizard
          campaign={c}
          capabilities={capabilities}
          canPublish={access.can('MARKETING_PUBLISH')}
          onClose={() => setEditing(false)}
          onSaved={(saved, { activationError }) => {
            setEditing(false)
            campaign.setData(saved)
            if (activationError) setNotice(activationError)
            else toast.success('Cambios guardados')
          }}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title={CONFIRM[confirm].title}
          text={CONFIRM[confirm].text}
          confirmLabel={CONFIRM[confirm].label}
          danger={CONFIRM[confirm].danger}
          busy={busy === confirm}
          onConfirm={() => run(confirm)}
          onClose={() => setConfirm(null)}
        />
      )}
    </DashboardLayout>
  )
}

function Details({ campaign: c }) {
  return (
    <div className="fx-card">
      <div className="fx-card__head"><h2 className="fx-h3">Detalles</h2></div>
      <div className="fx-card__body">
        <dl className="fx-kv" style={{ gap: '7px 14px' }}>
          <dt>Creada</dt><dd>{dateTime(c.createdAt)}</dd>
          {c.activatedAt && <><dt>Activada</dt><dd>{dateTime(c.activatedAt)}</dd></>}
          <dt>Vigencia</dt><dd>{c.startsAt ? dateTime(c.startsAt) : 'Al activarla'} → {c.endsAt ? dateTime(c.endsAt) : 'Hasta finalizarla'}</dd>
          {c.finishedAt && <><dt>Finalizada</dt><dd>{dateTime(c.finishedAt)}</dd></>}
          {c.couponCode && <><dt>Cupón</dt><dd><span className="fx-code">{c.couponCode}</span></dd></>}
          <dt>Código</dt><dd><span className="fx-code">{c.trackingCode}</span></dd>
        </dl>
        <p className="fx-hint" style={{ marginTop: 12, fontSize: 12.5 }}>
          Un pedido se atribuye a la última campaña cuyo enlace abrió el comprador en los 7 días anteriores, si la campaña sigue activa.
        </p>
      </div>
    </div>
  )
}

function Results({ campaign }) {
  const [range, setRange] = useState('all')
  const [chart, setChart] = useState('visits')
  const params = range === 'all' ? {} : { from: daysAgo(Number(range) - 1) }
  const analytics = useApi(() => getAnalytics(campaign.id, params), [campaign.id, range, campaign.status])
  const a = analytics.data
  const t = a?.totals
  const funnelMax = a?.funnel?.[0]?.count || 0

  const exportDaily = () => {
    exportCsv({
      title: `Campaña ${campaign.name}`,
      from: String(a.from).slice(0, 10),
      to: String(a.to).slice(0, 10),
      columns: [
        { key: 'date', label: 'Día', type: 'text' },
        { key: 'visits', label: 'Visitas', type: 'number' },
        { key: 'orders', label: 'Pedidos', type: 'number' },
        { key: 'amount', label: 'Importe (S/)', type: 'number' },
      ],
      rows: a.daily,
    })
  }

  return (
    <div className="fx-card">
      <div className="fx-card__head">
        <div>
          <h2 className="fx-h3">Resultados</h2>
          <p className="fx-hint">Visitas y pedidos que llegaron por los enlaces de esta campaña.</p>
        </div>
        <div className="fx-row" style={{ gap: 8 }}>
          {a?.canExport && a.daily?.length > 0 && (
            <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={exportDaily}><Icon name="download" size={14} /> CSV</button>
          )}
          <select className="fx-select fx-select--sm" value={range} onChange={(e) => setRange(e.target.value)} aria-label="Período">
            {RANGES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
        </div>
      </div>
      <div className="fx-card__body">
        {analytics.error && <ErrorState error={analytics.error} onRetry={analytics.reload} />}
        <div className="fx-stats" style={{ marginBottom: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <StatCard loading={analytics.loading} label="Visitas" icon="eye" value={integer(t?.visits)} foot={`${integer(t?.visitors)} ${t?.visitors === 1 ? 'visitante' : 'visitantes'}`} />
          <StatCard loading={analytics.loading} label="Pedidos" icon="orders" value={integer(t?.orders)}
            foot={t?.cancelledOrders ? `${t.cancelledOrders} cancelado${t.cancelledOrders === 1 ? '' : 's'} no suman` : `Conversión ${percent(t?.conversionRate)}`} />
          <StatCard loading={analytics.loading} label="Ventas atribuidas" icon="money" value={money(t?.sales)}
            foot={t?.pendingSales ? `+ ${money(t.pendingSales)} por confirmar` : `Ticket promedio ${money(t?.averageTicket)}`} />
        </div>

        {a && !a.full && (
          <div className="fx-alert fx-alert--warn" style={{ marginBottom: 12 }}>
            <Icon name="lock" size={16} />
            <span style={{ flex: 1 }}>Embudo, canales, evolución diaria y productos vendidos están en el plan Pro.</span>
            <Link to="/dashboard/plans" className="fx-btn fx-btn--secondary fx-btn--sm">Ver planes</Link>
          </div>
        )}

        {a?.full && (
          <>
            <h3 className="fx-label" style={{ marginTop: 4 }}>Embudo</h3>
            <div className="fx-stack" style={{ gap: 10, marginBottom: 20 }}>
              {a.funnel.map((step, i) => (
                <ShareBar key={step.type} label={FUNNEL[step.type] || step.type} value={step.count} max={funnelMax}
                  right={`${integer(step.count)}${i > 0 ? ` · ${percent(step.rate)}` : ''}`} />
              ))}
            </div>

            <div className="fx-row fx-row--between" style={{ marginBottom: 8 }}>
              <h3 className="fx-label" style={{ margin: 0 }}>Por día</h3>
              <div className="fx-row" style={{ gap: 4 }}>
                {[['visits', 'Visitas'], ['orders', 'Pedidos'], ['amount', 'Importe']].map(([key, label]) => (
                  <button key={key} type="button" className={`fx-btn fx-btn--sm ${chart === key ? 'fx-btn--secondary' : 'fx-btn--ghost'}`} onClick={() => setChart(key)}>{label}</button>
                ))}
              </div>
            </div>
            <ColumnChart data={a.daily} valueKey={chart} labelKey="date" format={chart === 'amount' ? money : integer} height={160}
              emptyText="Todavía no hay visitas en este período." />

            <div className="fx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18, marginTop: 20 }}>
              <div>
                <h3 className="fx-label">Por canal</h3>
                {a.channels.length === 0 ? <p className="fx-hint">Sin visitas todavía.</p> : (
                  <ul className="fx-list">
                    {a.channels.map((row) => (
                      <li key={row.channel} className="fx-list__row">
                        <Icon name={CHANNELS[row.channel]?.icon || 'link'} size={14} />
                        <span style={{ flex: 1 }}>{CHANNELS[row.channel]?.label || row.channel}</span>
                        <span className="fx-hint fx-num">{integer(row.visits)} vis. · {integer(row.orders)} ped. · {money(row.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h3 className="fx-label">Productos vendidos</h3>
                {a.products.length === 0 ? <p className="fx-hint">Sin pedidos atribuidos todavía.</p> : (
                  <ul className="fx-list">
                    {a.products.map((p) => (
                      <li key={p.productId} className="fx-list__row">
                        <span className="fx-truncate" style={{ flex: 1 }}>{p.name}</span>
                        <span className="fx-hint fx-num">{integer(p.units)} u. · {money(p.revenue)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}

        {a?.coupon && (
          <div style={{ marginTop: 20, padding: '12px 14px', border: '1px solid var(--fx-line)', borderRadius: 12 }}>
            <p className="fx-label" style={{ marginBottom: 4 }}>Cupón <span className="fx-code">{a.coupon.code}</span></p>
            <p className="fx-hint">
              {integer(a.coupon.orders)} {a.coupon.orders === 1 ? 'pedido lo usó' : 'pedidos lo usaron'} mientras la campaña estuvo publicada
              ({money(a.coupon.sales)}, {money(a.coupon.discount)} de descuento). {integer(a.coupon.attributedOrders)} {a.coupon.attributedOrders === 1 ? 'llegó' : 'llegaron'} por el enlace.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function Audience({ campaign }) {
  const customers = useApi(() => getSegmentCustomers(campaign.segment, campaign.segmentCategoryId), [campaign.segment, campaign.segmentCategoryId])
  const link = useApi(() => getLink(campaign.id, 'WHATSAPP'), [campaign.id])
  const [shown, setShown] = useState(20)
  const [sent, setSent] = useState(() => new Set())
  const [company] = useState(readStoredCompany)
  const url = rebaseLink(link.data, getCompanyStoreUrl(company))
  const text = url ? composeMessage(campaign, url) : ''
  const list = customers.data || []
  const reachable = list.filter((x) => x.phone)

  return (
    <div className="fx-card">
      <div className="fx-card__head">
        <div>
          <h2 className="fx-h3">Audiencia</h2>
          <p className="fx-hint">{reachable.length} de {list.length} clientes del segmento tienen teléfono. Escribiles uno a uno con el enlace de la campaña.</p>
        </div>
      </div>
      <div className="fx-card__body">
        {customers.error && <ErrorState error={customers.error} onRetry={customers.reload} />}
        {customers.loading ? <div className="fx-skeleton" style={{ height: 80 }} /> : list.length === 0 ? (
          <EmptyState icon="customers" title="Nadie en este segmento por ahora" text="Cuando haya clientes que cumplan la regla, aparecen acá." />
        ) : (
          <>
            {!campaign.acceptingAttribution && (
              <p className="fx-hint" style={{ marginBottom: 10 }}>Activá la campaña antes de escribirles: si no, sus visitas no se cuentan.</p>
            )}
            <ul className="fx-list">
              {list.slice(0, shown).map((x) => (
                <li key={x.id} className="fx-list__row">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link to={`/dashboard/customers?customer=${x.id}`} className="fx-truncate" style={{ display: 'block', color: 'var(--fx-ink)', fontWeight: 600 }}>{x.name}</Link>
                    <span className="fx-hint" style={{ fontSize: 12.5 }}>{x.orders} {x.orders === 1 ? 'pedido' : 'pedidos'} · {money(x.spent)}{x.lastOrderAt ? ` · última compra ${dateTime(x.lastOrderAt).split(',')[0]}` : ''}</span>
                  </div>
                  {x.phone && text ? (
                    <a
                      className={`fx-btn fx-btn--sm ${sent.has(x.id) ? 'fx-btn--ghost' : 'fx-btn--secondary'}`}
                      href={whatsappShare(personalMessage(x.name, text), x.phone)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setSent((s) => new Set(s).add(x.id))}
                    >
                      <Icon name={sent.has(x.id) ? 'check' : 'whatsapp'} size={14} /> {sent.has(x.id) ? 'Abierto' : 'WhatsApp'}
                    </a>
                  ) : <span className="fx-hint" style={{ fontSize: 12.5 }}>Sin teléfono</span>}
                </li>
              ))}
            </ul>
            {list.length > shown && (
              <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" style={{ marginTop: 8 }} onClick={() => setShown((n) => n + 20)}>
                Ver más ({list.length - shown})
              </button>
            )}
            <p className="fx-hint" style={{ marginTop: 10, fontSize: 12.5 }}>
              Quienes pidieron no recibir promociones no aparecen. Si alguien te lo pide, marcalo en su ficha de Clientes.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
