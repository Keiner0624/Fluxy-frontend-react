// src/modules/admin/pages/AdminPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../../../app/config'

function getToken() { return localStorage.getItem('token') || '' }

const PLAN_COLORS = {
  FREE:     { color: '#9ca3af', bg: 'rgba(156,163,175,0.1)',  border: 'rgba(156,163,175,0.2)'  },
  PRO:      { color: '#7c83fd', bg: 'rgba(124,131,253,0.1)', border: 'rgba(124,131,253,0.25)' },
  BUSINESS: { color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)'  },
}

function Sparkline({ data, color = '#7c83fd', height = 36 }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data, 1)
  const w = 100, h = height
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ')
  const area = `0,${h} ` + pts + ` ${w},${h}`
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={`sg${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#sg${color.replace('#','')})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function BarChart({ data, valueKey, labelKey, color = '#7c83fd', height = 160 }) {
  if (!data || data.length === 0) return <div style={{ height, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.15)', fontSize:13 }}>Sin datos aún</div>
  const show = data.slice(-20)
  const max  = Math.max(...show.map(d => d[valueKey]), 1)
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:3, height, paddingBottom:24 }}>
      {show.map((d,i) => {
        const pct = (d[valueKey] / max) * 100
        return (
          <div key={i} title={`${d[labelKey]}: ${d[valueKey]}`} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', height:'100%', gap:4 }}>
            <div style={{ width:'100%', borderRadius:'3px 3px 0 0', height:`${Math.max(pct,2)}%`, background: pct>0 ? `linear-gradient(to top, ${color}, ${color}88)` : 'rgba(255,255,255,0.03)', boxShadow: pct>0 ? `0 0 6px ${color}30` : 'none', transition:'height 0.6s ease' }}/>
            {(i===0 || i===Math.floor(show.length/2) || i===show.length-1) && (
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.2)', position:'absolute', marginTop:2 }}>{d[labelKey]}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function LineChart({ data, valueKey, labelKey, color = '#fbbf24', height = 160 }) {
  if (!data || data.length < 2) return <div style={{ height, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.15)', fontSize:13 }}>Sin datos aún</div>
  const max = Math.max(...data.map(d => d[valueKey]), 1)
  const W=100, H=80
  const pts = data.map((d,i) => [
    (i/(data.length-1))*W,
    H - (d[valueKey]/max)*H*0.85 - H*0.05
  ])
  const pathD = pts.map((p,i)=>`${i===0?'M':'L'}${p[0]},${p[1]}`).join(' ')
  const areaD = `M0,${H} `+pts.map(p=>`L${p[0]},${p[1]}`).join(' ')+` L${W},${H} Z`
  return (
    <div style={{ height }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:'85%', overflow:'visible' }}>
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#lg)"/>
        <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        {pts.map((p,i)=>data[i][valueKey]>0&&<circle key={i} cx={p[0]} cy={p[1]} r="1.5" fill={color}/>)}
      </svg>
      <div style={{ display:'flex', justifyContent:'space-between', padding:'4px 2px 0' }}>
        {[data[0], data[Math.floor(data.length/2)], data[data.length-1]].map((d,i)=>(
          <span key={i} style={{ fontSize:10, color:'rgba(255,255,255,0.2)' }}>{d[labelKey]}</span>
        ))}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub, color='#7c83fd', sparkData, trend }) {
  return (
    <div style={{ background:'rgba(13,13,26,0.95)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, padding:'20px 22px', transition:'all 0.2s' }}
      onMouseEnter={e=>{ e.currentTarget.style.borderColor=`${color}50`; e.currentTarget.style.transform='translateY(-2px)' }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'; e.currentTarget.style.transform='translateY(0)' }}
    >
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', fontWeight:600, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</div>
          <div style={{ fontFamily:"'Fraunces', serif", fontSize:30, fontWeight:900, color:'white', lineHeight:1 }}>{value}</div>
          {sub && <div style={{ fontSize:11, color: trend>0?'#34d399': trend<0?'#f87171':'rgba(255,255,255,0.3)', marginTop:6, fontWeight:600 }}>{trend>0?'↑':trend<0?'↓':''} {sub}</div>}
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
          <div style={{ width:38, height:38, borderRadius:11, background:`${color}15`, border:`1px solid ${color}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>{icon}</div>
          {sparkData && <Sparkline data={sparkData} color={color}/>}
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const navigate = useNavigate()
  const [metrics, setMetrics]             = useState(null)
  const [vendors, setVendors]             = useState([])
  const [vendorsPerDay, setVendorsPerDay] = useState([])
  const [revenuePerMonth, setRevenuePerMonth] = useState([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [planFilter, setPlanFilter]       = useState('ALL')
  const [editingPlan, setEditingPlan]     = useState(null)
  const [newPlan, setNewPlan]             = useState('PRO')
  const [months, setMonths]               = useState('1')
  const [saving, setSaving]               = useState(false)
  const [deleting, setDeleting]           = useState(null)
  const [msg, setMsg]                     = useState('')

  useEffect(() => {
    if (!getToken()) { navigate('/admin/login'); return }
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const h = { Authorization: `Bearer ${getToken()}` }
      const [mR, vR, vdR, rmR] = await Promise.all([
        fetch(`${API_URL}/admin/metrics`,                  { headers: h }),
        fetch(`${API_URL}/admin/vendors`,                  { headers: h }),
        fetch(`${API_URL}/admin/metrics/vendors-per-day`,  { headers: h }),
        fetch(`${API_URL}/admin/metrics/revenue-per-month`,{ headers: h }),
      ])
      if (mR.status === 403) { navigate('/admin/login'); return }
      setMetrics(await mR.json())
      const vd = await vR.json(); setVendors(Array.isArray(vd) ? vd : [])
      const vpd = await vdR.json(); setVendorsPerDay(Array.isArray(vpd) ? vpd : [])
      const rpm = await rmR.json(); setRevenuePerMonth(Array.isArray(rpm) ? rpm : [])
    } catch { navigate('/admin/login') }
    finally { setLoading(false) }
  }

  const handleChangePlan = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/admin/vendors/${editingPlan.companyId}/plan`, {
        method:'PUT', headers:{'Content-Type':'application/json', Authorization:`Bearer ${getToken()}`},
        body: JSON.stringify({ plan: newPlan, months }),
      })
      const d = await res.json()
      setMsg('✅ ' + d.message); setEditingPlan(null); loadAll()
    } catch { setMsg('⚠️ Error al actualizar') }
    finally { setSaving(false); setTimeout(()=>setMsg(''),3000) }
  }

  const handleDelete = async (companyId, name) => {
    if (!window.confirm(`¿Eliminar "${name}" y todos sus datos?`)) return
    setDeleting(companyId)
    try {
      await fetch(`${API_URL}/admin/vendors/${companyId}`, { method:'DELETE', headers:{ Authorization:`Bearer ${getToken()}` } })
      setMsg('✅ Vendedor eliminado.')
      setVendors(p => Array.isArray(p) ? p.filter(v => v.companyId !== companyId) : [])
    } catch { setMsg('⚠️ Error al eliminar') }
    finally { setDeleting(null); setTimeout(()=>setMsg(''),3000) }
  }

  const filtered = vendors.filter(v => {
    const ms = v.companyName?.toLowerCase().includes(search.toLowerCase()) || v.email?.toLowerCase().includes(search.toLowerCase())
    const mp = planFilter==='ALL' || v.plan===planFilter
    return ms && mp
  })

  const fmt = str => { if(!str) return '—'; try { return new Date(str).toLocaleDateString('es-PE',{day:'2-digit',month:'short',year:'numeric'}) } catch { return '—' } }
  const daysLeft = str => { if(!str) return null; return Math.ceil((new Date(str)-new Date())/(1000*60*60*24)) }

  const sparkV = vendorsPerDay.slice(-10).map(d=>d.count)
  const sparkR = revenuePerMonth.map(d=>d.revenue)

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#06060f', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'DM Sans, sans-serif' }}>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      <div style={{ textAlign:'center', color:'white' }}>
        <div style={{ width:36,height:36,border:'2px solid rgba(124,131,253,0.2)',borderTopColor:'#7c83fd',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 14px' }}/>
        Cargando...
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#06060f', fontFamily:'DM Sans, sans-serif', color:'white' }}>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:rgba(124,131,253,0.2);border-radius:3px}
        @media(max-width:768px){.admin-grid{grid-template-columns:repeat(2,1fr)!important}.admin-charts{grid-template-columns:1fr!important}}
        @media(max-width:480px){.admin-grid{grid-template-columns:1fr!important}}
      `}</style>

      <div style={{ position:'fixed', inset:0, zIndex:0, background:'radial-gradient(ellipse 60% 40% at 15% 5%, rgba(124,131,253,0.06) 0%, transparent 60%)' }}/>
      <div style={{ position:'fixed', inset:0, zIndex:0, backgroundImage:'linear-gradient(rgba(124,131,253,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(124,131,253,0.02) 1px, transparent 1px)', backgroundSize:'48px 48px' }}/>

      {/* Navbar */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background:'rgba(6,6,15,0.96)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.05)', padding:'0 24px' }}>
        <div style={{ maxWidth:1400, margin:'0 auto', height:58, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:28,height:28,borderRadius:8,background:'linear-gradient(135deg,#7c83fd,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:900,color:'white' }}>F</div>
            <div>
              <div style={{ fontSize:13,fontWeight:700,color:'white',lineHeight:1.2 }}>Fluxy Admin</div>
              <div style={{ fontSize:9,color:'#7c83fd' }}>Panel de control</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={loadAll} style={{ padding:'6px 11px',borderRadius:8,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.35)',fontSize:11,cursor:'pointer' }}>🔄</button>
            <button onClick={()=>navigate('/dashboard')} style={{ padding:'6px 12px',borderRadius:8,background:'rgba(124,131,253,0.08)',border:'1px solid rgba(124,131,253,0.2)',color:'#7c83fd',fontSize:11,fontWeight:600,cursor:'pointer' }}>Dashboard</button>
            <button onClick={()=>{ localStorage.removeItem('token'); navigate('/admin/login') }} style={{ padding:'6px 12px',borderRadius:8,background:'rgba(248,113,113,0.06)',border:'1px solid rgba(248,113,113,0.15)',color:'#f87171',fontSize:11,fontWeight:600,cursor:'pointer' }}>Salir</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:1400, margin:'0 auto', padding:'26px 20px 60px', position:'relative', zIndex:1 }}>

        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:10,color:'#7c83fd',fontWeight:700,textTransform:'uppercase',letterSpacing:'2.5px',marginBottom:5 }}>Fluxy · Admin</div>
          <h1 style={{ fontFamily:"'Fraunces', serif", fontSize:30,fontWeight:900,color:'white',letterSpacing:'-0.5px' }}>Dashboard</h1>
        </div>

        {msg && <div style={{ background:msg.startsWith('✅')?'rgba(52,211,153,0.08)':'rgba(248,113,113,0.08)', border:`1px solid ${msg.startsWith('✅')?'rgba(52,211,153,0.25)':'rgba(248,113,113,0.25)'}`, borderRadius:12, padding:'11px 16px', marginBottom:20, fontSize:13, color:msg.startsWith('✅')?'#34d399':'#f87171', animation:'fadeIn 0.3s ease' }}>{msg}</div>}

        {/* Stats */}
        {metrics && (
          <div className="admin-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px,1fr))', gap:12, marginBottom:20 }}>
            <StatCard icon="🏪" label="Vendedores" value={metrics.totalVendedores} sub={`${metrics.nuevosSemana} esta semana`} trend={metrics.nuevosSemana} color="#7c83fd" sparkData={sparkV}/>
            <StatCard icon="💰" label="Ingresos estimados" value={`S/ ${metrics.ingresosTotales?.toFixed(0)}`} sub="planes activos" color="#fbbf24" sparkData={sparkR}/>
            <StatCard icon="⚡" label="Plan Pro" value={metrics.planPro} sub={`S/ ${(metrics.planPro*19).toFixed(0)}/mes`} color="#7c83fd"/>
            <StatCard icon="🚀" label="Plan Business" value={metrics.planBusiness} sub={`S/ ${(metrics.planBusiness*39).toFixed(0)}/mes`} color="#34d399"/>
            <StatCard icon="🛒" label="Pedidos totales" value={metrics.totalPedidos} color="#38bdf8"/>
            <StatCard icon="🆓" label="Plan Free" value={metrics.planFree} color="#9ca3af"/>
          </div>
        )}

        {/* Gráficas */}
        <div className="admin-charts" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }}>
          <div style={{ background:'rgba(13,13,26,0.95)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, padding:'20px 22px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <div>
                <div style={{ fontSize:13,fontWeight:700,color:'white' }}>Registros nuevos</div>
                <div style={{ fontSize:11,color:'rgba(255,255,255,0.3)',marginTop:2 }}>Últimos 30 días</div>
              </div>
              <div style={{ fontSize:11,color:'#7c83fd',fontWeight:700,background:'rgba(124,131,253,0.08)',border:'1px solid rgba(124,131,253,0.2)',borderRadius:8,padding:'3px 10px' }}>
                {vendorsPerDay.reduce((s,d)=>s+d.count,0)} registros
              </div>
            </div>
            <BarChart data={vendorsPerDay} valueKey="count" labelKey="date" color="#7c83fd" height={150}/>
          </div>

          <div style={{ background:'rgba(13,13,26,0.95)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, padding:'20px 22px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <div>
                <div style={{ fontSize:13,fontWeight:700,color:'white' }}>Ingresos por mes</div>
                <div style={{ fontSize:11,color:'rgba(255,255,255,0.3)',marginTop:2 }}>Últimos 6 meses</div>
              </div>
              <div style={{ fontSize:11,color:'#fbbf24',fontWeight:700,background:'rgba(251,191,36,0.08)',border:'1px solid rgba(251,191,36,0.2)',borderRadius:8,padding:'3px 10px' }}>
                S/ {revenuePerMonth.reduce((s,d)=>s+d.revenue,0).toFixed(0)} total
              </div>
            </div>
            <LineChart data={revenuePerMonth} valueKey="revenue" labelKey="month" color="#fbbf24" height={150}/>
          </div>
        </div>

        {/* Distribución planes */}
        {metrics && (
          <div style={{ background:'rgba(13,13,26,0.95)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, padding:'20px 22px', marginBottom:16 }}>
            <div style={{ fontSize:13,fontWeight:700,color:'white',marginBottom:16 }}>Distribución de planes</div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                { label:'Free',     value:metrics.planFree,     color:'#9ca3af' },
                { label:'Pro',      value:metrics.planPro,      color:'#7c83fd' },
                { label:'Business', value:metrics.planBusiness, color:'#34d399' },
              ].map(p => {
                const pct = metrics.totalVendedores>0 ? Math.round((p.value/metrics.totalVendedores)*100) : 0
                return (
                  <div key={p.label}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ fontSize:12,color:p.color,fontWeight:600 }}>{p.label}</span>
                      <span style={{ fontSize:11,color:'rgba(255,255,255,0.3)' }}>{p.value} · {pct}%</span>
                    </div>
                    <div style={{ height:5,borderRadius:99,background:'rgba(255,255,255,0.04)' }}>
                      <div style={{ height:'100%',borderRadius:99,width:`${pct}%`,background:p.color,boxShadow:`0 0 6px ${p.color}50`,transition:'width 0.8s ease' }}/>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tabla vendedores */}
        <div style={{ background:'rgba(13,13,26,0.95)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            <div style={{ fontSize:13,fontWeight:700,color:'white' }}>
              Vendedores <span style={{ fontSize:11,color:'rgba(255,255,255,0.25)',fontWeight:400,marginLeft:6 }}>{filtered.length}/{vendors.length}</span>
            </div>
            <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar..."
                style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:8,padding:'6px 11px',color:'white',fontSize:12,outline:'none',width:170,fontFamily:'DM Sans, sans-serif' }}
                onFocus={e=>e.target.style.borderColor='rgba(124,131,253,0.4)'}
                onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.07)'}
              />
              {['ALL','FREE','PRO','BUSINESS'].map(p=>(
                <button key={p} onClick={()=>setPlanFilter(p)} style={{ padding:'5px 11px',borderRadius:7,fontSize:10,fontWeight:600,cursor:'pointer',transition:'all 0.15s', background:planFilter===p?'rgba(124,131,253,0.1)':'rgba(255,255,255,0.03)', border:planFilter===p?'1px solid rgba(124,131,253,0.3)':'1px solid rgba(255,255,255,0.06)', color:planFilter===p?'#7c83fd':'rgba(255,255,255,0.25)' }}>{p}</button>
              ))}
            </div>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                  {['#','Negocio','Email','Plan','Vence','Registro','Acciones'].map(h=>(
                    <th key={h} style={{ padding:'10px 14px',textAlign:'left',fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.2)',textTransform:'uppercase',letterSpacing:'1px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 ? (
                  <tr><td colSpan={7} style={{ padding:'36px',textAlign:'center',color:'rgba(255,255,255,0.15)',fontSize:13 }}>No hay vendedores</td></tr>
                ) : filtered.map((v,i)=>{
                  const pc   = PLAN_COLORS[v.plan]||PLAN_COLORS.FREE
                  const days = daysLeft(v.planExpiresAt)
                  const isExp = days!==null && days<=3
                  return (
                    <tr key={v.companyId} style={{ borderBottom:'1px solid rgba(255,255,255,0.025)', transition:'background 0.12s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(124,131,253,0.03)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                    >
                      <td style={{ padding:'12px 14px',fontSize:10,color:'rgba(255,255,255,0.2)' }}>#{v.companyId}</td>
                      <td style={{ padding:'12px 14px' }}>
                        <div style={{ fontSize:13,fontWeight:600,color:'white' }}>{v.companyName||'—'}</div>
                        {v.slug&&<div style={{ fontSize:10,color:'rgba(255,255,255,0.2)',marginTop:1 }}>/{v.slug}</div>}
                      </td>
                      <td style={{ padding:'12px 14px',fontSize:11,color:'rgba(255,255,255,0.35)' }}>{v.email||'—'}</td>
                      <td style={{ padding:'12px 14px' }}>
                        <span style={{ background:pc.bg,border:`1px solid ${pc.border}`,color:pc.color,borderRadius:20,padding:'3px 9px',fontSize:10,fontWeight:700 }}>{v.plan}</span>
                      </td>
                      <td style={{ padding:'12px 14px' }}>
                        {v.plan==='FREE'?<span style={{ fontSize:10,color:'rgba(255,255,255,0.15)' }}>—</span>:(
                          <div>
                            <div style={{ fontSize:11,color:isExp?'#f87171':'rgba(255,255,255,0.35)' }}>{fmt(v.planExpiresAt)}</div>
                            {days!==null&&<div style={{ fontSize:9,color:isExp?'#f87171':days<=7?'#fbbf24':'rgba(255,255,255,0.2)',marginTop:1 }}>{days>0?`${days}d`:'Vencido'}</div>}
                          </div>
                        )}
                      </td>
                      <td style={{ padding:'12px 14px',fontSize:11,color:'rgba(255,255,255,0.25)' }}>{fmt(v.createdAt)}</td>
                      <td style={{ padding:'12px 14px' }}>
                        <div style={{ display:'flex',gap:6 }}>
                          <button onClick={()=>{ setEditingPlan({companyId:v.companyId,name:v.companyName}); setNewPlan(v.plan==='FREE'?'PRO':v.plan) }} style={{ padding:'5px 9px',borderRadius:7,fontSize:10,fontWeight:600,cursor:'pointer',background:'rgba(124,131,253,0.08)',border:'1px solid rgba(124,131,253,0.2)',color:'#7c83fd' }}>✏️ Plan</button>
                          <button onClick={()=>handleDelete(v.companyId,v.companyName)} disabled={deleting===v.companyId} style={{ padding:'5px 9px',borderRadius:7,fontSize:10,cursor:'pointer',background:'rgba(248,113,113,0.06)',border:'1px solid rgba(248,113,113,0.12)',color:'#f87171',opacity:deleting===v.companyId?0.5:1 }}>{deleting===v.companyId?'...':'🗑️'}</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal plan */}
      {editingPlan&&(
        <div onClick={()=>setEditingPlan(null)} style={{ position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,0.85)',backdropFilter:'blur(10px)',display:'flex',alignItems:'center',justifyContent:'center',padding:24 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:'#09091a',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,padding:'26px',width:'100%',maxWidth:360,animation:'fadeIn 0.3s ease' }}>
            <h3 style={{ fontFamily:"'Fraunces', serif",fontSize:18,color:'white',marginBottom:4 }}>Cambiar plan</h3>
            <p style={{ fontSize:12,color:'rgba(255,255,255,0.3)',marginBottom:20 }}>{editingPlan.name}</p>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.25)',textTransform:'uppercase',letterSpacing:'1px',display:'block',marginBottom:10 }}>Plan</label>
              <div style={{ display:'flex',flexDirection:'column',gap:7 }}>
                {[{value:'FREE',label:'FREE',sub:'Gratis',color:'#9ca3af'},{value:'PRO',label:'PRO',sub:'S/19/mes',color:'#7c83fd'},{value:'BUSINESS',label:'BUSINESS',sub:'S/39/mes',color:'#34d399'}].map(p=>(
                  <button key={p.value} type="button" onClick={()=>setNewPlan(p.value)} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 13px',borderRadius:10,cursor:'pointer',transition:'all 0.15s',background:newPlan===p.value?`${p.color}15`:'rgba(255,255,255,0.03)',border:newPlan===p.value?`1px solid ${p.color}45`:'1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display:'flex',alignItems:'center',gap:9 }}>
                      <div style={{ width:7,height:7,borderRadius:'50%',background:p.color }}/>
                      <span style={{ fontSize:12,fontWeight:700,color:newPlan===p.value?p.color:'white' }}>{p.label}</span>
                    </div>
                    <span style={{ fontSize:10,color:'rgba(255,255,255,0.3)' }}>{p.sub}</span>
                  </button>
                ))}
              </div>
            </div>
            {newPlan!=='FREE'&&(
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.25)',textTransform:'uppercase',letterSpacing:'1px',display:'block',marginBottom:10 }}>Meses</label>
                <div style={{ display:'flex',gap:7,flexWrap:'wrap' }}>
                  {[1,2,3,6,12].map(m=>(
                    <button key={m} type="button" onClick={()=>setMonths(String(m))} style={{ flex:1,minWidth:44,padding:'8px 4px',borderRadius:8,cursor:'pointer',fontSize:11,fontWeight:600,background:months===String(m)?'rgba(124,131,253,0.12)':'rgba(255,255,255,0.03)',border:months===String(m)?'1px solid rgba(124,131,253,0.35)':'1px solid rgba(255,255,255,0.06)',color:months===String(m)?'#7c83fd':'rgba(255,255,255,0.35)' }}>{m}m</button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display:'flex',gap:9 }}>
              <button onClick={()=>setEditingPlan(null)} style={{ flex:1,padding:'10px',borderRadius:10,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.35)',fontSize:13,cursor:'pointer' }}>Cancelar</button>
              <button onClick={handleChangePlan} disabled={saving} style={{ flex:1,padding:'10px',borderRadius:10,background:'linear-gradient(135deg,#7c83fd,#4f46e5)',border:'none',color:'white',fontSize:13,fontWeight:700,cursor:'pointer',opacity:saving?0.6:1 }}>{saving?'Guardando...':'Aplicar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}