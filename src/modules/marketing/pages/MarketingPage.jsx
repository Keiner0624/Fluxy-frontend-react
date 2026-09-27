// src/modules/marketing/pages/MarketingPage.jsx
// Dashboard de Marketing: resultados atribuidos, oportunidades, acciones rápidas y campañas.
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import { EmptyState, ErrorState, NoAccess, StatCard } from '@/modules/dashboard/components/ui'
import Icon from '@/components/Icon'
import useAccess from '@/hooks/useAccess'
import useApi from '@/hooks/useApi'
import { integer, money } from '@/app/format'
import CampaignWizard from '../components/CampaignWizard'
import { getOpportunities, getOverview, listCampaigns } from '../api/marketingApi'
import { CHANNELS, PRIORITY, STATUS, TYPES, limitLabel, percent } from '../lib/marketingFormat'

const TABS = [
  { key: 'live', label: 'En curso', statuses: ['ACTIVE', 'SCHEDULED', 'PAUSED'] },
  { key: 'draft', label: 'Borradores', statuses: ['DRAFT'] },
  { key: 'finished', label: 'Finalizadas', statuses: ['FINISHED'] },
  { key: 'archived', label: 'Archivadas', statuses: ['ARCHIVED'] },
]
const DISMISSED_KEY = 'fluxy_marketing_dismissed'
const DISMISS_DAYS = 7

function readDismissed() {
  try {
    const raw = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '{}')
    const now = Date.now()
    return Object.fromEntries(Object.entries(raw).filter(([, until]) => until > now))
  } catch {
    return {}
  }
}

export default function MarketingPage() {
  const access = useAccess()
  if (access.ready && !access.can('MARKETING_VIEW')) {
    return <DashboardLayout><NoAccess module="Marketing" /></DashboardLayout>
  }
  return <MarketingContent access={access} />
}

function MarketingContent({ access }) {
  const navigate = useNavigate()
  const canCreate = access.can('MARKETING_CREATE')
  const canPublish = access.can('MARKETING_PUBLISH')
  const canAnalytics = access.can('MARKETING_ANALYTICS')
  const overview = useApi(() => getOverview(30), [])
  const campaigns = useApi(listCampaigns, [])
  const opportunities = useApi(getOpportunities, [])
  const [tab, setTab] = useState('live')
  const [wizard, setWizard] = useState(null)
  const [dismissed, setDismissed] = useState(readDismissed)

  const list = useMemo(() => campaigns.data || [], [campaigns.data])
  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t.key, list.filter((c) => t.statuses.includes(c.status)).length])), [list])
  const current = TABS.find((t) => t.key === tab)
  const visible = list.filter((c) => current.statuses.includes(c.status))
  const capabilities = overview.data?.capabilities
  const totals = overview.data?.totals
  const ideas = (opportunities.data || []).filter((o) => !dismissed[o.key])

  const dismiss = (key) => {
    const next = { ...dismissed, [key]: Date.now() + DISMISS_DAYS * 86400000 }
    setDismissed(next)
    try { localStorage.setItem(DISMISSED_KEY, JSON.stringify(next)) } catch { /* modo privado */ }
  }

  const openWizard = (preset = null) => setWizard({ preset })

  const onSaved = (campaign, { activationError }) => {
    setWizard(null)
    toast.success(activationError ? 'Campaña guardada como borrador' : campaign.status === 'DRAFT' ? 'Borrador guardado' : 'Campaña activa')
    navigate(`/dashboard/marketing/${campaign.id}`, { state: { share: true, activationError } })
  }

  const quick = [
    { key: 'campaign', icon: 'megaphone', title: 'Crear campaña', text: 'Paso a paso: qué, para qué y por dónde.', onClick: () => openWizard() },
    { key: 'link', icon: 'link', title: 'Generar enlace', text: 'Un enlace rastreable a tu tienda.', onClick: () => openWizard({ type: 'STORE', channel: 'DIRECT', name: 'Enlace de la tienda' }) },
    { key: 'qr', icon: 'qr', title: 'Crear QR', text: 'Para el local, bolsas y volantes.', onClick: () => openWizard({ type: 'STORE', channel: 'QR', name: 'QR del local' }) },
    { key: 'product', icon: 'whatsapp', title: 'Compartir producto', text: 'Un producto por WhatsApp o redes.', onClick: () => openWizard({ type: 'PRODUCT', channel: 'WHATSAPP' }) },
  ]

  return (
    <DashboardLayout>
      <div className="fx-page-head">
        <div>
          <h1>Marketing</h1>
          <p>Promocioná tu tienda, compartí enlaces y mirá qué campañas traen ventas.</p>
        </div>
        {canCreate && (
          <div className="fx-page-head__actions">
            <button type="button" className="fx-btn fx-btn--primary" onClick={() => openWizard()}>
              <Icon name="plus" size={16} /> Crear campaña
            </button>
          </div>
        )}
      </div>

      {overview.error && <div style={{ marginBottom: 16 }}><ErrorState error={overview.error} onRetry={overview.reload} /></div>}

      <div className="fx-stats" style={{ marginBottom: 18 }}>
        {canAnalytics && (
          <>
            <StatCard loading={overview.loading} icon="eye" label="Visitas atribuidas" value={integer(totals?.visits)}
              foot={`${integer(totals?.visitors)} ${totals?.visitors === 1 ? 'visitante' : 'visitantes'} · 30 días`} />
            <StatCard loading={overview.loading} icon="orders" label="Pedidos por campañas" value={integer(totals?.orders)}
              foot={`Conversión ${percent(totals?.conversionRate)}`} />
            <StatCard loading={overview.loading} icon="money" label="Ventas atribuidas" value={money(totals?.sales)}
              foot={totals?.pendingSales ? `+ ${money(totals.pendingSales)} por confirmar` : 'Pedidos confirmados'} />
          </>
        )}
        <StatCard loading={overview.loading} icon="megaphone" label="Campañas en curso"
          value={integer(overview.data?.liveCampaigns)}
          foot={overview.data ? limitLabel(overview.data.liveCampaigns, overview.data.liveCampaignLimit) + ` · plan ${overview.data.plan === 'FREE' ? 'Free' : overview.data.plan === 'PRO' ? 'Pro' : 'Business'}` : ''} />
      </div>

      {canCreate && (
        <div className="fx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 18 }}>
          {quick.map((q) => (
            <button key={q.key} type="button" className="fx-shortcut" style={{ textAlign: 'left', width: '100%', font: 'inherit', cursor: 'pointer' }} onClick={q.onClick}>
              <span className="fx-shortcut__icon"><Icon name={q.icon} size={17} /></span>
              <span className="fx-shortcut__title">{q.title}</span>
              <span className="fx-shortcut__text fx-hide-sm">{q.text}</span>
              <span className="fx-shortcut__go"><Icon name="arrowRight" size={15} /></span>
            </button>
          ))}
          {access.can('COUPON_VIEW') && (
            <Link to={capabilities?.coupons === false ? '/dashboard/plans' : '/dashboard/coupons'} className="fx-shortcut">
              <span className="fx-shortcut__icon"><Icon name="coupons" size={17} /></span>
              <span className="fx-shortcut__title">Crear cupón {capabilities?.coupons === false && <span className="fx-plan-tag fx-plan-tag--pro">Pro</span>}</span>
              <span className="fx-shortcut__text fx-hide-sm">Un descuento para usar en tus campañas.</span>
              <span className="fx-shortcut__go"><Icon name="arrowRight" size={15} /></span>
            </Link>
          )}
        </div>
      )}

      {ideas.length > 0 && (
        <div className="fx-card" style={{ marginBottom: 18 }}>
          <div className="fx-card__head">
            <div>
              <h2 className="fx-h3">Oportunidades</h2>
              <p className="fx-hint">Lo que Fluxy ve en tus pedidos y campañas, con el motivo.</p>
            </div>
          </div>
          <div className="fx-card__body" style={{ display: 'grid', gap: 10, gridTemplateColumns: 'minmax(0, 1fr)' }}>
            {ideas.map((o) => (
              <div key={o.key} className="fx-row" style={{ gap: 12, alignItems: 'flex-start', padding: '12px 14px', border: '1px solid var(--fx-line)', borderRadius: 12 }}>
                <span className="fx-shortcut__icon" style={{ margin: 0 }}><Icon name={o.key === 'SALES_DROP' ? 'trend' : o.key === 'INACTIVE_CUSTOMERS' ? 'customers' : o.key === 'GROWING_CATEGORY' ? 'categories' : 'products'} size={16} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="fx-row" style={{ gap: 8, flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: 14 }}>{o.title}</strong>
                    <span className={`fx-badge ${PRIORITY[o.priority]?.badge || ''}`}>{PRIORITY[o.priority]?.label || o.priority}</span>
                  </div>
                  <p className="fx-hint" style={{ marginTop: 3 }}>{o.reason}</p>
                  {canCreate && (
                    <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" style={{ marginTop: 9, maxWidth: '100%', height: 'auto', minHeight: 32, whiteSpace: 'normal', textAlign: 'left' }}
                      onClick={() => openWizard({ ...o.suggestion, channel: o.suggestion.segment ? 'WHATSAPP' : undefined })}>
                      {o.actionLabel} <Icon name="arrowRight" size={13} />
                    </button>
                  )}
                </div>
                <button type="button" className="fx-btn fx-btn--ghost fx-btn--icon" aria-label="Ocultar por una semana" title="Ocultar por una semana" onClick={() => dismiss(o.key)}>
                  <Icon name="close" size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="fx-tabs" role="tablist" style={{ marginBottom: 12 }}>
        {TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className={`fx-tab${tab === t.key ? ' fx-tab--on' : ''}`} onClick={() => setTab(t.key)}>
            {t.label} <span className="fx-tab__count">{counts[t.key] || 0}</span>
          </button>
        ))}
      </div>

      <div className="fx-card">
        {campaigns.error ? (
          <div className="fx-card__body"><ErrorState error={campaigns.error} onRetry={campaigns.reload} /></div>
        ) : campaigns.loading ? (
          <div className="fx-card__body">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="fx-skeleton" style={{ height: 44, marginBottom: 8 }} />)}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon="megaphone"
            title={list.length === 0 ? 'Todavía no creaste campañas' : `No hay campañas ${current.label.toLowerCase()}`}
            text={list.length === 0 ? 'Creá una campaña, compartí su enlace y mirá cuántas visitas y pedidos trae.' : ''}
            action={list.length === 0 && canCreate ? (
              <button type="button" className="fx-btn fx-btn--primary" onClick={() => openWizard()}><Icon name="plus" size={16} /> Crear campaña</button>
            ) : null}
          />
        ) : (
          <div className="fx-table-wrap">
            <table className="fx-table fx-table--stack">
              <thead>
                <tr>
                  <th>Campaña</th>
                  <th className="fx-hide-md">Canal</th>
                  <th>Estado</th>
                  {canAnalytics && <th className="fx-table__num">Visitas</th>}
                  {canAnalytics && <th className="fx-table__num">Pedidos</th>}
                  {canAnalytics && <th className="fx-table__num">Ventas</th>}
                </tr>
              </thead>
              <tbody>
                {visible.map((c) => (
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/dashboard/marketing/${c.id}`)}>
                    <td className="fx-cell--main">
                      <Link to={`/dashboard/marketing/${c.id}`} className="fx-table__name" style={{ display: 'block', color: 'var(--fx-ink)', fontWeight: 600 }} onClick={(e) => e.stopPropagation()}>
                        {c.name}
                      </Link>
                      <span className="fx-hint" style={{ fontSize: 12.5 }}>
                        {TYPES[c.type]?.label}{c.targetName ? ` · ${c.targetName}` : ''}{c.couponCode && c.type !== 'COUPON' ? ` · ${c.couponCode}` : ''}
                      </span>
                    </td>
                    <td className="fx-hide-md">
                      <span className="fx-row" style={{ gap: 6 }}><Icon name={CHANNELS[c.channel]?.icon} size={14} />{CHANNELS[c.channel]?.label}</span>
                    </td>
                    <td className="fx-cell--sub">
                      <span className={`fx-badge ${STATUS[c.status]?.badge || ''}`}><span className="fx-dot" />{STATUS[c.status]?.label || c.status}</span>
                    </td>
                    {canAnalytics && <td className="fx-table__num fx-hide-sm">{integer(c.metrics?.visits)}</td>}
                    {canAnalytics && <td className="fx-table__num fx-hide-sm">{integer(c.metrics?.orders)}</td>}
                    {canAnalytics && <td className="fx-table__num fx-table__strong fx-cell--end">{money(c.metrics?.sales)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {wizard && (
        <CampaignWizard
          preset={wizard.preset}
          capabilities={capabilities}
          canPublish={canPublish}
          onClose={() => setWizard(null)}
          onSaved={onSaved}
        />
      )}
    </DashboardLayout>
  )
}
