// src/modules/dashboard/pages/MetricsPage.jsx
import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import PlanGate from '../../auth/components/PlanGate'
import usePlan from '../../../hooks/usePlan'
import { API_URL } from '../../../app/config'

function getToken() { return localStorage.getItem('token') || '' }

function BarChart({ data, color = 'var(--primary, #7c83fd)', valueKey = 'value', labelKey = 'label' }) {
  if (!data || data.length === 0) return (
    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted, #4a4a6a)', fontSize: 13 }}>
      Sin datos disponibles
    </div>
  )
  const max = Math.max(...data.map(d => d[valueKey] || 0), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160, padding: '0 4px' }}>
      {data.map((item, i) => {
        const pct = ((item[valueKey] || 0) / max) * 100
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted, #4a4a6a)', textAlign: 'center' }}>
              {typeof item[valueKey] === 'number' ? item[valueKey].toFixed(0) : item[valueKey]}
            </div>
            <div style={{
              width: '100%', borderRadius: '6px 6px 0 0', background: color,
              height: `${Math.max(pct, 4)}%`, opacity: 0.85,
              transition: 'height 0.8s ease', boxShadow: `0 0 12px ${color}40`, minHeight: 4,
            }}/>
            <div style={{ fontSize: 9, color: 'var(--text-muted, #4a4a6a)', textAlign: 'center', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item[labelKey]}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function LineChart({ data, color = 'var(--primary, #7c83fd)' }) {
  if (!data || data.length < 2) return (
    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted, #4a4a6a)', fontSize: 13 }}>
      Necesitas al menos 2 ventas para ver la evolución
    </div>
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
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map(t => (
          <line key={t} x1={PAD} y1={PAD + t * (H - PAD * 2)} x2={W - PAD} y2={PAD + t * (H - PAD * 2)} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
        ))}
        <path d={areaD} fill="url(#areaGrad)"/>
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} stroke="#0a0a18" strokeWidth="2">
            <title>S/ {p.total?.toFixed(2)} — {p.date}</title>
          </circle>
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted, #4a4a6a)' }}>{data[0]?.date}</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted, #4a4a6a)' }}>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color = 'var(--primary, #7c83fd)', sub }) {
  return (
    <div style={{
      background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 20, padding: '24px', position: 'relative', overflow: 'hidden', transition: 'all 0.3s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.transform = 'translateY(-3px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`, pointerEvents: 'none' }}/>
      <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted, #4a4a6a)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted, #4a4a6a)', marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

function MetricsContent() {
  const [metrics, setMetrics]         = useState(null)
  const [salesPerDay, setSalesPerDay] = useState([])
  const [topMonth, setTopMonth]       = useState([])
  const [topToday, setTopToday]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true); setError('')
    try {
      const headers = { Authorization: `Bearer ${getToken()}` }
      const [metricsRes, salesRes, topMonthRes, topTodayRes] = await Promise.all([
        fetch(`${API_URL}/dashboard`, { headers }),
        fetch(`${API_URL}/dashboard/sales-per-day`, { headers }),
        fetch(`${API_URL}/dashboard/top-products?period=month`, { headers }),
        fetch(`${API_URL}/dashboard/top-products?period=today`, { headers }),
      ])
      if (!metricsRes.ok) throw new Error('Error al cargar métricas')
      const [m, s, tm, tt] = await Promise.all([metricsRes.json(), salesRes.json(), topMonthRes.json(), topTodayRes.json()])
      setMetrics(m)
      setSalesPerDay(s.sort((a, b) => a.date.localeCompare(b.date)))
      setTopMonth(tm)
      setTopToday(tt)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>Cargando métricas...</div>
  if (error) return <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#f87171' }}>⚠️ {error}</div>

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard icon="💰" label="Ventas totales"   value={`S/ ${(metrics?.totalSales || 0).toFixed(2)}`} color="#7c83fd" sub="Pedidos completados"/>
        <StatCard icon="🛒" label="Total pedidos"    value={metrics?.ordersCount || 0} color="#34d399" sub="Todos los estados"/>
        <StatCard icon="📦" label="Productos activos" value={metrics?.totalProducts || 0} color="#f59e0b" sub="En tu catálogo"/>
        <StatCard icon="🏆" label="Producto top"     value={metrics?.topProduct || '—'} color="#f43f5e" sub="Más vendido"/>
      </div>

      <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px', marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 4 }}>📈 Evolución de ventas</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Ventas diarias completadas (S/)</div>
        <LineChart data={salesPerDay} color="#7c83fd"/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 20 }}>
        <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 4 }}>🏆 Top productos del mes</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Por cantidad vendida</div>
          <BarChart data={topMonth.map(p => ({ label: p.productName, value: p.quantitySold }))} color="#7c83fd"/>
        </div>
        <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 4 }}>🔥 Top productos hoy</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Por cantidad vendida hoy</div>
          <BarChart data={topToday.map(p => ({ label: p.productName, value: p.quantitySold }))} color="#f59e0b"/>
        </div>
      </div>

      <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 20 }}>📊 Ranking del mes</div>
        {topMonth.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>No hay ventas completadas este mes.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topMonth.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                background: i === 0 ? 'rgba(124,131,253,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${i === 0 ? 'rgba(124,131,253,0.2)' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: 12,
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: i === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : i === 1 ? 'rgba(148,163,184,0.15)' : i === 2 ? 'rgba(180,120,80,0.15)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: i === 0 ? '#fff' : 'var(--text-muted)' }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.productName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{p.quantitySold} unidades</div>
                </div>
                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden', minWidth: 80 }}>
                  <div style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(135deg, var(--primary), #4f46e5)', width: `${(p.quantitySold / topMonth[0].quantitySold) * 100}%`, transition: 'width 1s ease' }}/>
                </div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, color: 'var(--primary)', minWidth: 80, textAlign: 'right', flexShrink: 0 }}>S/ {p.totalRevenue?.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default function MetricsPage() {
  const { plan, loading } = usePlan()

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
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