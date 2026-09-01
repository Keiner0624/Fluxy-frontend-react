// src/modules/dashboard/pages/MetricsPage.jsx
import { useState, useEffect } from 'react'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import PlanGate from '@/components/PlanGate'
import usePlan from '@/hooks/usePlan'
import { API_URL } from '@/app/config'
import { StatCardSkeleton } from '@/components/Skeleton'
import Icon from '@/components/Icon'

function getToken() { return localStorage.getItem('token') || '' }

const BRAND = '#1769e0'

// ─── Gráfico de líneas ───────────────────────────────────────────────────────
function LineChart({ data }) {
  if (!data || data.length < 2) {
    return <p className="fx-chart__empty">Necesitás al menos dos días con ventas para ver la evolución.</p>
  }

  const W = 640, H = 180, PAD_X = 8, PAD_Y = 16
  const values = data.map(d => d.total || 0)
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const span = max - min || 1

  const points = data.map((d, i) => ({
    x: PAD_X + (i * (W - PAD_X * 2)) / (data.length - 1),
    y: PAD_Y + (H - PAD_Y * 2) * (1 - ((d.total || 0) - min) / span),
    ...d,
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaD = `${pathD} L${points[points.length - 1].x.toFixed(1)},${H} L${points[0].x.toFixed(1)},${H} Z`

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" role="img" aria-label="Evolución de ventas">
        <defs>
          <linearGradient id="fxLineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND} stopOpacity="0.16" />
            <stop offset="100%" stopColor={BRAND} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((t) => (
          <line key={t} x1="0" x2={W} y1={PAD_Y + (H - PAD_Y * 2) * t} y2={PAD_Y + (H - PAD_Y * 2) * t} stroke="#e5eaf1" strokeWidth="1" />
        ))}
        <path d={areaD} fill="url(#fxLineFill)" />
        <path d={pathD} fill="none" stroke={BRAND} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#fff" stroke={BRAND} strokeWidth="2">
            <title>{`${p.date}: S/ ${(p.total || 0).toFixed(2)}`}</title>
          </circle>
        ))}
      </svg>
      <div className="fx-row fx-row--between" style={{ marginTop: 6 }}>
        <span className="fx-hint" style={{ fontSize: 12 }}>{data[0]?.date}</span>
        <span className="fx-hint" style={{ fontSize: 12 }}>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  )
}

// ─── Gráfico de barras ───────────────────────────────────────────────────────
function BarChart({ data, valueKey = 'value', labelKey = 'label', prefix = '' }) {
  if (!data || data.length === 0) {
    return <p className="fx-chart__empty">Sin datos para mostrar.</p>
  }
  const max = Math.max(...data.map(d => d[valueKey] || 0), 1)

  return (
    <div className="fx-bars">
      {data.map((item, i) => {
        const pct = ((item[valueKey] || 0) / max) * 100
        return (
          <div key={i} className="fx-bars__col" title={`${item[labelKey]}: ${prefix}${(item[valueKey] || 0).toFixed(0)}`}>
            <div className="fx-bars__track">
              <div className="fx-bars__fill" style={{ height: `${Math.max(pct, 2)}%` }} />
            </div>
            <span className="fx-bars__label fx-truncate">{item[labelKey]}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Contenido ───────────────────────────────────────────────────────────────
function MetricsContent() {
  const [metrics, setMetrics]         = useState(null)
  const [salesPerDay, setSalesPerDay] = useState([])
  const [topMonth, setTopMonth]       = useState([])
  const [topToday, setTopToday]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [rankView, setRankView]       = useState('month')

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true); setError('')
    try {
      const headers = { Authorization: `Bearer ${getToken()}` }
      const [mRes, sRes, tmRes, ttRes] = await Promise.all([
        fetch(`${API_URL}/dashboard`, { headers }),
        fetch(`${API_URL}/dashboard/sales-per-day`, { headers }),
        fetch(`${API_URL}/dashboard/top-products?period=month`, { headers }),
        fetch(`${API_URL}/dashboard/top-products?period=today`, { headers }),
      ])
      if (!mRes.ok) throw new Error('Error al cargar métricas')
      const [m, s, tm, tt] = await Promise.all([mRes.json(), sRes.json(), tmRes.json(), ttRes.json()])
      setMetrics(m)
      setSalesPerDay(s.sort((a, b) => a.date.localeCompare(b.date)))
      setTopMonth(tm)
      setTopToday(tt)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  if (loading) {
    return (
      <div className="fx-stats">
        {Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    )
  }

  if (error) {
    return (
      <div className="fx-alert fx-alert--error">
        <Icon name="alert" size={16} /><span>{error}</span>
      </div>
    )
  }

  const kpis = [
    { label: 'Ventas totales',   value: `S/ ${(metrics?.totalSales || 0).toFixed(2)}`, icon: 'money' },
    { label: 'Ticket promedio',  value: `S/ ${(metrics?.averageTicket || 0).toFixed(2)}`, icon: 'card' },
    { label: 'Total de pedidos', value: metrics?.ordersCount || 0, icon: 'inbox' },
    { label: 'Completados',      value: metrics?.completedOrders || 0, icon: 'checkCircle' },
    { label: 'Pendientes',       value: metrics?.pendingOrders || 0, icon: 'clock' },
    { label: 'Tasa de conversión', value: `${metrics?.conversionRate || 0}%`, icon: 'metrics' },
  ]

  const ranking = rankView === 'month' ? topMonth : topToday

  return (
    <>
      <div className="fx-stats" style={{ marginBottom: 20 }}>
        {kpis.map((k) => (
          <div key={k.label} className="fx-stat">
            <span className="fx-stat__label"><Icon name={k.icon} size={14} />{k.label}</span>
            <p className="fx-stat__value">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="fx-card" style={{ marginBottom: 20 }}>
        <div className="fx-card__head">
          <h2 className="fx-h3">Evolución de ventas</h2>
          <span className="fx-hint" style={{ fontSize: 12.5 }}>Últimos días con actividad</span>
        </div>
        <div className="fx-card__body">
          <LineChart data={salesPerDay} />
        </div>
      </div>

      <div className="fx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <div className="fx-card">
          <div className="fx-card__head">
            <h2 className="fx-h3">Productos más vendidos</h2>
            <div className="fx-tabs" style={{ padding: 3 }}>
              <button className={`fx-tab${rankView === 'month' ? ' fx-tab--on' : ''}`} onClick={() => setRankView('month')}>Mes</button>
              <button className={`fx-tab${rankView === 'today' ? ' fx-tab--on' : ''}`} onClick={() => setRankView('today')}>Hoy</button>
            </div>
          </div>
          {ranking?.length ? (
            <div className="fx-table-wrap">
              <table className="fx-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Producto</th>
                    <th className="fx-table__num">Unidades</th>
                    <th className="fx-table__num">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((p, i) => (
                    <tr key={i}>
                      <td className="fx-table__strong">{i + 1}</td>
                      <td className="fx-table__strong">{p.productName || p.name || 'Producto'}</td>
                      <td className="fx-table__num">{p.quantity ?? p.totalQuantity ?? 0}</td>
                      <td className="fx-table__num">S/ {Number(p.revenue ?? p.totalRevenue ?? 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="fx-empty" style={{ padding: '40px 24px' }}>
              <p className="fx-empty__text">
                {rankView === 'today' ? 'Todavía no hubo ventas hoy.' : 'Todavía no hubo ventas este mes.'}
              </p>
            </div>
          )}
        </div>

        <div className="fx-card">
          <div className="fx-card__head">
            <h2 className="fx-h3">Ventas por día</h2>
          </div>
          <div className="fx-card__body">
            <BarChart
              data={salesPerDay.slice(-12).map(d => ({ label: String(d.date).slice(5), value: d.total || 0 }))}
              prefix="S/ "
            />
          </div>
        </div>
      </div>
    </>
  )
}

// ─── MetricsPage ─────────────────────────────────────────────────────────────
export default function MetricsPage() {
  const { plan, loading } = usePlan()

  return (
    <DashboardLayout>
      <div className="fx-page-head">
        <div>
          <h1>Métricas</h1>
          <p>Resumen del rendimiento de tu negocio</p>
        </div>
      </div>

      {!loading && (
        <PlanGate currentPlan={plan} requiredPlan="PRO">
          <MetricsContent />
        </PlanGate>
      )}
    </DashboardLayout>
  )
}
