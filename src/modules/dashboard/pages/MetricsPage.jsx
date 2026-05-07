// src/modules/dashboard/pages/MetricsPage.jsx
import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import PlanGate from '../../../components/PlanGate'
import usePlan from '../../../hooks/usePlan'
import { API_URL } from '../../../app/config'

function getToken() { return localStorage.getItem('token') || '' }

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ w = '100%', h = 16, r = 8 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
      backgroundSize: '600px 100%',
      animation: 'shimmer 1.4s infinite linear',
    }}/>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color = '#7c83fd', sub, trend }) {
  const trendPositive = trend > 0
  return (
    <div style={{
      background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 20, padding: '22px', position: 'relative', overflow: 'hidden',
      transition: 'all 0.3s', cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.transform = 'translateY(-3px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`, pointerEvents: 'none' }}/>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icon}</div>
        {trend !== undefined && (
          <div style={{ fontSize: 11, fontWeight: 700, color: trendPositive ? '#34d399' : '#f87171', background: trendPositive ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${trendPositive ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`, borderRadius: 20, padding: '2px 8px' }}>
            {trendPositive ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 700, color, lineHeight: 1, marginBottom: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{sub}</div>}
    </div>
  )
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ data, color = '#7c83fd', valueKey = 'value', labelKey = 'label', prefix = '' }) {
  if (!data || data.length === 0) return (
    <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>Sin datos disponibles</div>
  )
  const max = Math.max(...data.map(d => d[valueKey] || 0), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 160, padding: '0 4px' }}>
      {data.map((item, i) => {
        const pct = ((item[valueKey] || 0) / max) * 100
        return (
          <div key={i} title={`${item[labelKey]}: ${prefix}${(item[valueKey] || 0).toFixed(0)}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
            {pct > 15 && <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>{prefix}{typeof item[valueKey] === 'number' ? item[valueKey].toFixed(0) : item[valueKey]}</div>}
            <div style={{ width: '100%', borderRadius: '5px 5px 0 0', background: `linear-gradient(to top, ${color}, ${color}99)`, height: `${Math.max(pct, 3)}%`, transition: 'height 0.8s ease', boxShadow: `0 0 10px ${color}30`, minHeight: 4 }}/>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textAlign: 'center', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item[labelKey]}</div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Line Chart ───────────────────────────────────────────────────────────────
function LineChart({ data, color = '#7c83fd' }) {
  if (!data || data.length < 2) return (
    <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>Necesitas al menos 2 ventas para ver la evolución</div>
  )
  const values = data.map(d => d.total)
  const max = Math.max(...values, 1)
  const min = Math.min(...values)
  const W = 500, H = 140, PAD = 20
  const points = data.map((d, i) => ({
    x: PAD + (i / (data.length - 1)) * (W - PAD * 2),
    y: PAD + ((max - d.total) / (max - min || 1)) * (H - PAD * 2),
    ...d,
  }))
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = `${pathD} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 160, overflow: 'visible' }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map(t => (
          <line key={t} x1={PAD} y1={PAD + t * (H - PAD * 2)} x2={W - PAD} y2={PAD + t * (H - PAD * 2)} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
        ))}
        <path d={areaD} fill="url(#lineGrad)"/>
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} stroke="#0a0a18" strokeWidth="2">
            <title>S/ {p.total?.toFixed(2)} — {p.date}</title>
          </circle>
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{data[0]?.date}</span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  )
}

// ─── MetricsContent ───────────────────────────────────────────────────────────
function MetricsContent() {
  const [metrics, setMetrics]         = useState(null)
  const [salesPerDay, setSalesPerDay] = useState([])
  const [topMonth, setTopMonth]       = useState([])
  const [topToday, setTopToday]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [rankView, setRankView]       = useState('qty') // 'qty' | 'revenue'
  const [chartView, setChartView]     = useState('sales') // 'sales' | 'qty'

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

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{'@keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}'}</style>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Skeleton w={40} h={40} r={12}/><Skeleton w="40%" h={11}/><Skeleton w="65%" h={28}/><Skeleton w="55%" h={12}/>
          </div>
        ))}
      </div>
      <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Skeleton h={16} w="30%"/><Skeleton h={160}/>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#f87171' }}>⚠️ {error}</div>
  )

  const convRate  = metrics?.conversionRate || 0
  const avgTicket = metrics?.averageTicket  || 0

  return (
    <>
      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        <StatCard icon="💰" label="Ventas totales"     value={`S/ ${(metrics?.totalSales || 0).toFixed(2)}`}  color="#7c83fd" sub="Pedidos completados"/>
        <StatCard icon="🎯" label="Ticket promedio"    value={`S/ ${avgTicket.toFixed(2)}`}                    color="#a78bfa" sub="Por pedido completado"/>
        <StatCard icon="📈" label="Tasa conversión"    value={`${convRate}%`}                                  color="#34d399" sub="Completados / total"/>
        <StatCard icon="🛒" label="Total pedidos"      value={metrics?.ordersCount || 0}                       color="#38bdf8" sub="Todos los estados"/>
        <StatCard icon="✅" label="Completados"        value={metrics?.completedOrders || 0}                   color="#34d399" sub="Pedidos pagados"/>
        <StatCard icon="⏳" label="Pendientes"         value={metrics?.pendingOrders || 0}                     color="#fbbf24" sub="Por confirmar"/>
      </div>

      {/* ── Gráfica evolución ── */}
      <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '22px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 2 }}>📈 Evolución de ventas</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Ingresos diarios de pedidos completados</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[{ k: 'sales', l: 'Ingresos' }, { k: 'qty', l: 'Cantidad' }].map(v => (
              <button key={v.k} onClick={() => setChartView(v.k)} style={{ padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: chartView === v.k ? 'rgba(124,131,253,0.15)' : 'rgba(255,255,255,0.04)', border: chartView === v.k ? '1px solid rgba(124,131,253,0.3)' : '1px solid rgba(255,255,255,0.08)', color: chartView === v.k ? '#7c83fd' : 'rgba(255,255,255,0.35)' }}>{v.l}</button>
            ))}
          </div>
        </div>
        <LineChart data={salesPerDay} color="#7c83fd"/>
      </div>

      {/* ── Top productos ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 16 }}>
        <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '22px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 4 }}>🏆 Top del mes</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 18 }}>Por cantidad vendida</div>
          <BarChart data={topMonth.map(p => ({ label: p.productName, value: p.quantitySold }))} color="#7c83fd"/>
        </div>
        <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '22px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 4 }}>🔥 Top hoy</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 18 }}>Por cantidad vendida hoy</div>
          <BarChart data={topToday.map(p => ({ label: p.productName, value: p.quantitySold }))} color="#fbbf24"/>
        </div>
      </div>

      {/* ── Ranking detallado ── */}
      <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>📊 Ranking del mes</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[{ k: 'qty', l: 'Cantidad' }, { k: 'revenue', l: 'Ingresos' }].map(v => (
              <button key={v.k} onClick={() => setRankView(v.k)} style={{ padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: rankView === v.k ? 'rgba(124,131,253,0.15)' : 'rgba(255,255,255,0.04)', border: rankView === v.k ? '1px solid rgba(124,131,253,0.3)' : '1px solid rgba(255,255,255,0.08)', color: rankView === v.k ? '#7c83fd' : 'rgba(255,255,255,0.35)' }}>{v.l}</button>
            ))}
          </div>
        </div>

        {topMonth.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No hay ventas completadas este mes.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...topMonth]
              .sort((a, b) => rankView === 'revenue' ? b.totalRevenue - a.totalRevenue : b.quantitySold - a.quantitySold)
              .map((p, i) => {
                const maxVal = rankView === 'revenue'
                  ? Math.max(...topMonth.map(x => x.totalRevenue), 1)
                  : Math.max(...topMonth.map(x => x.quantitySold), 1)
                const val    = rankView === 'revenue' ? p.totalRevenue : p.quantitySold
                const pct    = (val / maxVal) * 100
                const medals = ['🥇', '🥈', '🥉']

                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                    background: i === 0 ? 'rgba(124,131,253,0.06)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${i === 0 ? 'rgba(124,131,253,0.15)' : 'rgba(255,255,255,0.04)'}`,
                    borderRadius: 14, transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,131,253,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = i === 0 ? 'rgba(124,131,253,0.15)' : 'rgba(255,255,255,0.04)'}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: i < 3 ? 18 : 13, fontWeight: 700, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {i < 3 ? medals[i] : i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6 }}>{p.productName}</div>
                      <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(135deg, #7c83fd, #4f46e5)', width: `${pct}%`, transition: 'width 0.8s ease' }}/>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, gap: 2 }}>
                      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, color: '#7c83fd' }}>
                        {rankView === 'revenue' ? `S/ ${p.totalRevenue?.toFixed(2)}` : `${p.quantitySold} uds`}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                        {rankView === 'revenue' ? `${p.quantitySold} unidades` : `S/ ${p.totalRevenue?.toFixed(2)}`}
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </>
  )
}

// ─── MetricsPage ──────────────────────────────────────────────────────────────
export default function MetricsPage() {
  const { plan, loading } = usePlan()

  return (
    <DashboardLayout>
      <style>{'@keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}'}</style>
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>Panel de vendedor</div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, color: 'white' }}>Métricas</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Resumen del rendimiento de tu negocio</p>
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