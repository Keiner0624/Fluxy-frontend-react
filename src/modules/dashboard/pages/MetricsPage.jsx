// src/modules/dashboard/pages/MetricsPage.jsx
// Tendencia y comportamiento del negocio. Para administrar registros están los módulos.
import { useState } from 'react'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import PlanGate from '@/components/PlanGate'
import usePlan from '@/hooks/usePlan'
import useAccess from '@/hooks/useAccess'
import useApi from '@/hooks/useApi'
import { api } from '@/app/api'
import { money, integer, delta, ORDER_STATUS, rangeFromPreset, count } from '@/app/format'
import {
  ColumnChart, EmptyState, ErrorState, NoAccess, RangePicker, ShareBar, StatCard
} from '@/modules/dashboard/components/ui'

function MetricsContent() {
  const [range, setRange] = useState(() => rangeFromPreset('30'))
  const [serie, setSerie] = useState('sales')
  const { data, error, reload } = useApi(() => api.get('/dashboard/metrics', { from: range.from, to: range.to }), [range.from, range.to])

  const s = data?.summary
  const statusMax = Math.max(...(data?.byStatus || []).map((b) => b.count), 0)
  const productMax = Math.max(...(data?.topProducts || []).map((p) => p.units), 0)

  return (
    <>
      <div style={{ marginBottom: 16 }}><RangePicker value={range} onChange={setRange} /></div>
      {error && <div style={{ marginBottom: 14 }}><ErrorState error={error} onRetry={reload} /></div>}

      <div className="fx-stats" style={{ marginBottom: 18 }}>
        <StatCard loading={!s} icon="money" label="Ventas" value={money(s?.sales)} delta={s && delta(s.sales, s.previousSales)} deltaLabel="frente al período anterior" />
        <StatCard loading={!s} icon="orders" label="Pedidos recibidos" value={integer(s?.orders)} foot={s && count(s.saleOrders, 'concretado')} />
        <StatCard loading={!s} icon="receipt" label="Ticket promedio" value={money(s?.averageTicket)}
          delta={s && delta(s.averageTicket, s.previousSaleOrders ? s.previousSales / s.previousSaleOrders : 0)} deltaLabel="frente al período anterior" />
        <StatCard loading={!s} icon="trend" label="Conversión" value={`${s?.conversionRate ?? 0}%`} foot="de pedidos recibidos a ventas" />
        <StatCard loading={!data} icon="customers" label="Clientes recurrentes" value={`${data?.repeatRate ?? 0}%`}
          foot={data && `${integer(data.returningCustomers)} de ${integer(data.customers)} volvieron a comprar`} />
        <StatCard loading={!s} icon="close" label="Cancelados" value={integer(s?.cancelledOrders)} foot={s && money(s.cancelledAmount)} />
      </div>

      <div className="fx-card" style={{ marginBottom: 16 }}>
        <div className="fx-card__head" style={{ flexWrap: 'wrap' }}>
          <h2 className="fx-h3">Evolución diaria</h2>
          <div className="fx-tabs" style={{ padding: 3 }}>
            <button type="button" className={`fx-tab${serie === 'sales' ? ' fx-tab--on' : ''}`} onClick={() => setSerie('sales')}>Ventas</button>
            <button type="button" className={`fx-tab${serie === 'orders' ? ' fx-tab--on' : ''}`} onClick={() => setSerie('orders')}>Pedidos</button>
          </div>
        </div>
        <div className="fx-card__body">
          {!data ? <div className="fx-skeleton" style={{ height: 180 }} /> : (
            <ColumnChart data={data.series} labelKey="period" valueKey={serie}
              format={serie === 'sales' ? money : (v) => `${v} pedidos`}
              emptyText={serie === 'sales' ? 'No hubo ventas en este período.' : 'No llegaron pedidos en este período.'} />
          )}
        </div>
      </div>

      <div className="fx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: 16 }}>
        <div className="fx-card">
          <div className="fx-card__head"><h2 className="fx-h3">Pedidos por estado</h2></div>
          <div className="fx-card__body">
            {!data ? <div className="fx-skeleton" style={{ height: 160 }} /> : statusMax === 0 ? (
              <p className="fx-chart__empty">Sin pedidos en el período.</p>
            ) : data.byStatus.map((b) => (
              <ShareBar key={b.status} label={ORDER_STATUS[b.status]?.label || b.status} value={b.count} max={statusMax} right={integer(b.count)} />
            ))}
          </div>
        </div>

        <div className="fx-card">
          <div className="fx-card__head"><h2 className="fx-h3">Productos más vendidos</h2></div>
          {!data ? <div className="fx-card__body"><div className="fx-skeleton" style={{ height: 160 }} /></div>
            : data.topProducts.length === 0 ? <EmptyState icon="products" title="Sin ventas en el período" />
              : (
                <div className="fx-card__body">
                  {data.topProducts.map((p, i) => (
                    <ShareBar key={p.productId} label={`${i + 1}. ${p.name}`} value={p.units} max={productMax}
                      right={`${integer(p.units)} u. · ${money(p.revenue)}`} />
                  ))}
                </div>
              )}
        </div>
      </div>
    </>
  )
}

export default function MetricsPage() {
  const { plan, loading } = usePlan()
  const access = useAccess()

  return (
    <DashboardLayout>
      <div className="fx-page-head">
        <div>
          <h1>Métricas</h1>
          <p>Tendencia y comportamiento de tu negocio</p>
        </div>
      </div>

      {access.ready && !access.can('REPORT_VIEW') ? (
        <NoAccess module="Métricas" />
      ) : !loading && (
        <PlanGate currentPlan={plan} requiredPlan="PRO">
          <MetricsContent />
        </PlanGate>
      )}
    </DashboardLayout>
  )
}
