// src/modules/dashboard/pages/ReportsPage.jsx
// Informes por período, orientados a decidir, y exportables.
import { useState } from 'react'
import toast from 'react-hot-toast'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import PlanGate from '@/components/PlanGate'
import Icon from '@/components/Icon'
import usePlan from '@/hooks/usePlan'
import useAccess from '@/hooks/useAccess'
import useApi from '@/hooks/useApi'
import { api } from '@/app/api'
import { exportCsv, exportPdf, exportXlsx } from '@/app/exporters'
import { money, integer, date, dateTime, delta, rangeFromPreset, count } from '@/app/format'
import {
  ColumnChart, EmptyState, ErrorState, NoAccess, RangePicker, ShareBar, StatCard
} from '@/modules/dashboard/components/ui'

function ExportMenu({ type, range }) {
  const access = useAccess()
  const [busy, setBusy] = useState(null)
  if (!access.can('REPORT_EXPORT')) return null

  const run = async (format) => {
    setBusy(format)
    try {
      const report = await api.get('/reports/export', { type, from: range.from, to: range.to })
      const company = JSON.parse(localStorage.getItem('company') || '{}')
      if (format === 'csv') exportCsv(report)
      if (format === 'xlsx') exportXlsx(report)
      if (format === 'pdf') exportPdf(report, company.name)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="fx-row" style={{ gap: 4 }} aria-label="Exportar">
      {[['csv', 'CSV'], ['xlsx', 'Excel'], ['pdf', 'PDF']].map(([format, label]) => (
        <button key={format} type="button" className="fx-btn fx-btn--ghost fx-btn--sm" disabled={Boolean(busy)} onClick={() => run(format)}>
          {busy === format ? <span className="fx-spinner" /> : <Icon name="download" size={13} />}
          {label}
        </button>
      ))}
    </div>
  )
}

function ReportCard({ title, subtitle, type, range, children }) {
  return (
    <div className="fx-card">
      <div className="fx-card__head" style={{ flexWrap: 'wrap' }}>
        <div>
          <h2 className="fx-h3">{title}</h2>
          {subtitle && <p className="fx-hint" style={{ fontSize: 12.5, marginTop: 2 }}>{subtitle}</p>}
        </div>
        <ExportMenu type={type} range={range} />
      </div>
      {children}
    </div>
  )
}

function Loading({ height = 160 }) {
  return <div className="fx-card__body"><div className="fx-skeleton" style={{ height }} /></div>
}

function ReportsContent() {
  const [range, setRange] = useState(() => rangeFromPreset('30'))
  const [groupBy, setGroupBy] = useState('day')
  const params = { from: range.from, to: range.to }
  const deps = [range.from, range.to]

  const summary = useApi(() => api.get('/reports/summary', params), deps)
  const sales = useApi(() => api.get('/reports/sales', { ...params, groupBy }), [...deps, groupBy])
  const categories = useApi(() => api.get('/reports/categories', params), deps)
  const products = useApi(() => api.get('/reports/top-products', { ...params, limit: 10 }), deps)
  const customers = useApi(() => api.get('/reports/top-customers', { ...params, limit: 10 }), deps)
  const cancelled = useApi(() => api.get('/reports/cancelled', params), deps)

  const s = summary.data
  const maxCategory = Math.max(...(categories.data || []).map((c) => c.revenue), 0)
  const maxProduct = Math.max(...(products.data || []).map((p) => p.units), 0)

  return (
    <>
      <div className="fx-row fx-row--between" style={{ flexWrap: 'wrap', marginBottom: 16 }}>
        <RangePicker value={range} onChange={setRange} />
        <span className="fx-hint">Del {date(range.from)} al {date(range.to)}</span>
      </div>

      {summary.error && <div style={{ marginBottom: 14 }}><ErrorState error={summary.error} onRetry={summary.reload} /></div>}

      <div className="fx-stats" style={{ marginBottom: 18 }}>
        <StatCard loading={!s} icon="money" label="Ventas" value={money(s?.sales)} delta={s && delta(s.sales, s.previousSales)} deltaLabel="frente al período anterior" />
        <StatCard loading={!s} icon="orders" label="Ventas concretadas" value={integer(s?.saleOrders)} foot={s && `de ${integer(s.orders)} pedidos recibidos`} />
        <StatCard loading={!s} icon="receipt" label="Ticket promedio" value={money(s?.averageTicket)} foot={s && count(s.units, 'unidad vendida', 'unidades vendidas')} />
        <StatCard loading={!s} icon="trend" label="Conversión" value={`${s?.conversionRate ?? 0}%`} foot="pedidos que se concretaron" />
        <StatCard loading={!s} icon="close" label="Cancelados" value={integer(s?.cancelledOrders)} foot={s && money(s.cancelledAmount)}
          tone={s?.cancelledOrders ? 'warn' : undefined} />
        <StatCard loading={!s} icon="coupons" label="Descuentos" value={money(s?.discounts)} foot="otorgados con cupones" />
      </div>

      <div className="fx-grid" style={{ gap: 16 }}>
        <ReportCard title="Ventas por período" subtitle="Pedidos confirmados en adelante" type="sales" range={range}>
          <div className="fx-card__body">
            <div className="fx-tabs" style={{ display: 'inline-flex', marginBottom: 16, padding: 3 }}>
              {[['day', 'Día'], ['week', 'Semana'], ['month', 'Mes']].map(([key, label]) => (
                <button key={key} type="button" className={`fx-tab${groupBy === key ? ' fx-tab--on' : ''}`} onClick={() => setGroupBy(key)}>{label}</button>
              ))}
            </div>
            {sales.error ? <ErrorState error={sales.error} onRetry={sales.reload} />
              : !sales.data ? <div className="fx-skeleton" style={{ height: 180 }} />
                : <ColumnChart data={sales.data} valueKey="sales" labelKey="period" format={money} emptyText="No hubo ventas en este período." />}
          </div>
        </ReportCard>

        <div className="fx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: 16 }}>
          <ReportCard title="Ventas por categoría" type="categories" range={range}>
            {!categories.data ? <Loading /> : categories.data.length === 0 ? (
              <EmptyState icon="categories" title="Sin ventas en el período" />
            ) : (
              <div className="fx-card__body">
                {categories.data.map((c) => (
                  <ShareBar key={c.category} label={c.category} value={c.revenue} max={maxCategory}
                    right={`${money(c.revenue)} · ${c.share}%`} />
                ))}
              </div>
            )}
          </ReportCard>

          <ReportCard title="Productos más vendidos" type="products" range={range}>
            {!products.data ? <Loading /> : products.data.length === 0 ? (
              <EmptyState icon="products" title="Sin ventas en el período" />
            ) : (
              <div className="fx-card__body">
                {products.data.map((p, i) => (
                  <ShareBar key={p.productId} label={`${i + 1}. ${p.name}`} value={p.units} max={maxProduct}
                    right={`${integer(p.units)} u. · ${money(p.revenue)}`} />
                ))}
              </div>
            )}
          </ReportCard>
        </div>

        <div className="fx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: 16 }}>
          <ReportCard title="Clientes frecuentes" type="customers" range={range}>
            {!customers.data ? <Loading /> : customers.data.length === 0 ? (
              <EmptyState icon="customers" title="Sin compras en el período" />
            ) : (
              <div className="fx-table-wrap">
                <table className="fx-table">
                  <thead><tr><th>Cliente</th><th className="fx-table__num">Compras</th><th className="fx-table__num">Monto</th></tr></thead>
                  <tbody>
                    {customers.data.map((c) => (
                      <tr key={c.customerId}>
                        <td>
                          <div className="fx-table__strong fx-truncate" style={{ maxWidth: 200 }}>{c.name}</div>
                          <div className="fx-hint" style={{ fontSize: 12 }}>Última: {date(c.lastOrderAt)}</div>
                        </td>
                        <td className="fx-table__num">{integer(c.orders)}</td>
                        <td className="fx-table__num fx-table__strong">{money(c.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ReportCard>

          <ReportCard title="Pedidos cancelados" subtitle={cancelled.data ? `${cancelled.data.length} en el período` : undefined} type="cancelled" range={range}>
            {!cancelled.data ? <Loading /> : cancelled.data.length === 0 ? (
              <EmptyState icon="checkCircle" title="Ningún pedido cancelado" text="En este período no se canceló ningún pedido." />
            ) : (
              <div className="fx-table-wrap" style={{ maxHeight: 360, overflowY: 'auto' }}>
                <table className="fx-table">
                  <thead><tr><th>Pedido</th><th>Motivo</th><th className="fx-table__num">Monto</th></tr></thead>
                  <tbody>
                    {cancelled.data.map((o) => (
                      <tr key={o.orderId}>
                        <td>
                          <div className="fx-table__strong">#{o.orderId}</div>
                          <div className="fx-hint" style={{ fontSize: 12 }}>{dateTime(o.createdAt)}</div>
                        </td>
                        <td style={{ fontSize: 13 }}>{o.reason || <span className="fx-hint">Sin motivo registrado</span>}</td>
                        <td className="fx-table__num">{money(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ReportCard>
        </div>
      </div>
    </>
  )
}

export default function ReportsPage() {
  const { plan, loading } = usePlan()
  const access = useAccess()

  return (
    <DashboardLayout>
      <div className="fx-page-head">
        <div>
          <h1>Reportes</h1>
          <p>Ventas, categorías, productos y clientes del período que elijas</p>
        </div>
      </div>
      {access.ready && !access.can('REPORT_VIEW') ? (
        <NoAccess module="Reportes" />
      ) : !loading && (
        <PlanGate currentPlan={plan} requiredPlan="PRO">
          <ReportsContent />
        </PlanGate>
      )}
    </DashboardLayout>
  )
}
