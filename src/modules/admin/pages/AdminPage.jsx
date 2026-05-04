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

function StatCard({ icon, label, value, color = '#7c83fd', sub }) {
  return (
    <div style={{
      background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 20, padding: '24px',
      borderTop: `3px solid ${color}`,
      transition: 'all 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 900, color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  )
}

export default function AdminPage() {
  const navigate = useNavigate()
  const [metrics, setMetrics]   = useState(null)
  const [vendors, setVendors]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [planFilter, setPlanFilter] = useState('ALL')
  const [editingPlan, setEditingPlan] = useState(null) // { companyId, currentPlan }
  const [newPlan, setNewPlan]   = useState('PRO')
  const [months, setMonths]     = useState('1')
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [msg, setMsg]           = useState('')

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const headers = { Authorization: `Bearer ${getToken()}` }
      const [mRes, vRes] = await Promise.all([
        fetch(`${API_URL}/admin/metrics`, { headers }),
        fetch(`${API_URL}/admin/vendors`,  { headers }),
      ])
      if (mRes.status === 403 || vRes.status === 403) {
        navigate('/dashboard')
        return
      }
      setMetrics(await mRes.json())
      const vData = await vRes.json(); setVendors(Array.isArray(vData) ? vData : [])
    } catch { navigate('/dashboard') }
    finally { setLoading(false) }
  }

  const handleChangePlan = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/admin/vendors/${editingPlan.companyId}/plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ plan: newPlan, months }),
      })
      const data = await res.json()
      setMsg('✅ ' + data.message)
      setEditingPlan(null)
      loadAll()
    } catch { setMsg('⚠️ Error al actualizar plan') }
    finally { setSaving(false); setTimeout(() => setMsg(''), 3000) }
  }

  const handleDelete = async (companyId, name) => {
    if (!window.confirm(`¿Eliminar la tienda "${name}" y todos sus datos? Esta acción no se puede deshacer.`)) return
    setDeleting(companyId)
    try {
      await fetch(`${API_URL}/admin/vendors/${companyId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      setMsg('✅ Vendedor eliminado.')
      setVendors(prev => Array.isArray(prev) ? prev.filter(v => v.companyId !== companyId) : [])
      loadAll()
    } catch { setMsg('⚠️ Error al eliminar') }
    finally { setDeleting(null); setTimeout(() => setMsg(''), 3000) }
  }

  const filtered = vendors.filter(v => {
    const matchSearch = v.companyName?.toLowerCase().includes(search.toLowerCase()) ||
                        v.email?.toLowerCase().includes(search.toLowerCase())
    const matchPlan   = planFilter === 'ALL' || v.plan === planFilter
    return matchSearch && matchPlan
  })

  const formatDate = (str) => {
    if (!str) return '—'
    try { return new Date(str).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) }
    catch { return '—' }
  }

  const daysLeft = (str) => {
    if (!str) return null
    const diff = Math.ceil((new Date(str) - new Date()) / (1000 * 60 * 60 * 24))
    return diff
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#06060f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontFamily: 'DM Sans, sans-serif' }}>
      Cargando panel admin...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#06060f', fontFamily: 'DM Sans, sans-serif', color: 'white' }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0a0a18; } ::-webkit-scrollbar-thumb { background: rgba(124,131,253,0.3); border-radius: 3px; }
      `}</style>

      {/* Fondo */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, background: 'radial-gradient(ellipse 80% 50% at 20% 10%, rgba(124,131,253,0.07) 0%, transparent 55%)' }}/>
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, backgroundImage: 'linear-gradient(rgba(124,131,253,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(124,131,253,0.025) 1px, transparent 1px)', backgroundSize: '60px 60px' }}/>

      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(6,6,15,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 32px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #7c83fd, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: 'white' }}>F</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Fluxy Admin</div>
              <div style={{ fontSize: 10, color: '#7c83fd', fontWeight: 600 }}>Panel de control</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={loadAll} style={{ padding: '7px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted, #9898b8)', fontSize: 12, cursor: 'pointer' }}>
              🔄 Actualizar
            </button>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '7px 14px', borderRadius: 9, background: 'rgba(124,131,253,0.1)', border: '1px solid rgba(124,131,253,0.25)', color: '#7c83fd', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              ← Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: '#7c83fd', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 8 }}>Administrador</div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>Panel de Fluxy</h1>
        </div>

        {/* Mensaje */}
        {msg && (
          <div style={{ background: msg.startsWith('✅') ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${msg.startsWith('✅') ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`, borderRadius: 12, padding: '12px 18px', marginBottom: 24, fontSize: 14, color: msg.startsWith('✅') ? '#34d399' : '#f87171', animation: 'fadeIn 0.3s ease' }}>
            {msg}
          </div>
        )}

        {/* Stats */}
        {metrics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            <StatCard icon="🏪" label="Vendedores totales" value={metrics.totalVendedores} color="#7c83fd" sub="Registrados en Fluxy"/>
            <StatCard icon="⚡" label="Plan Pro" value={metrics.planPro} color="#7c83fd" sub={`S/ ${(metrics.planPro * 19).toFixed(0)}/mes`}/>
            <StatCard icon="🚀" label="Plan Business" value={metrics.planBusiness} color="#34d399" sub={`S/ ${(metrics.planBusiness * 39).toFixed(0)}/mes`}/>
            <StatCard icon="💰" label="Ingresos estimados" value={`S/ ${metrics.ingresosTotales?.toFixed(0)}`} color="#fbbf24" sub="Planes activos este mes"/>
            <StatCard icon="🛒" label="Pedidos totales" value={metrics.totalPedidos} color="#38bdf8" sub="En toda la plataforma"/>
            <StatCard icon="🆓" label="Plan Free" value={metrics.planFree} color="#9ca3af" sub="Sin suscripción activa"/>
          </div>
        )}

        {/* Tabla de vendedores */}
        <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden' }}>

          {/* Header tabla */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>
              Vendedores <span style={{ fontSize: 12, color: 'var(--text-muted, #9898b8)', fontWeight: 400, marginLeft: 8 }}>{filtered.length} de {vendors.length}</span>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {/* Búsqueda */}
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar negocio o email..."
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', color: 'white', fontSize: 13, outline: 'none', width: 220, fontFamily: 'DM Sans, sans-serif' }}
                onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
              {/* Filtro plan */}
              {['ALL', 'FREE', 'PRO', 'BUSINESS'].map(p => (
                <button key={p} onClick={() => setPlanFilter(p)} style={{
                  padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  background: planFilter === p ? 'rgba(124,131,253,0.15)' : 'rgba(255,255,255,0.04)',
                  border: planFilter === p ? '1px solid rgba(124,131,253,0.35)' : '1px solid rgba(255,255,255,0.08)',
                  color: planFilter === p ? '#7c83fd' : 'rgba(255,255,255,0.4)',
                }}>{p}</button>
              ))}
            </div>
          </div>

          {/* Tabla */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['ID', 'Negocio', 'Email', 'Plan', 'Vence', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>No hay vendedores que coincidan</td></tr>
                ) : (
                  filtered.map((v, i) => {
                    const pc      = PLAN_COLORS[v.plan] || PLAN_COLORS.FREE
                    const days    = daysLeft(v.planExpiresAt)
                    const isExp   = days !== null && days <= 3

                    return (
                      <tr key={v.companyId} style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                        transition: 'background 0.15s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,131,253,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}
                      >
                        <td style={{ padding: '14px 16px', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>#{v.companyId}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{v.companyName || '—'}</div>
                          {v.slug && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>/{v.slug}</div>}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{v.email || '—'}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ background: pc.bg, border: `1px solid ${pc.border}`, color: pc.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                            {v.plan}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {v.plan === 'FREE' ? (
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>—</span>
                          ) : (
                            <div>
                              <div style={{ fontSize: 12, color: isExp ? '#f87171' : 'rgba(255,255,255,0.5)' }}>{formatDate(v.planExpiresAt)}</div>
                              {days !== null && (
                                <div style={{ fontSize: 10, color: isExp ? '#f87171' : days <= 7 ? '#fbbf24' : 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                                  {days > 0 ? `${days} días` : 'Vencido'}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            {/* Cambiar plan */}
                            <button onClick={() => { setEditingPlan({ companyId: v.companyId, name: v.companyName }); setNewPlan(v.plan === 'FREE' ? 'PRO' : v.plan) }} style={{
                              padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                              background: 'rgba(124,131,253,0.1)', border: '1px solid rgba(124,131,253,0.25)', color: '#7c83fd',
                            }}>✏️ Plan</button>
                            {/* Eliminar */}
                            <button onClick={() => handleDelete(v.companyId, v.companyName)} disabled={deleting === v.companyId} style={{
                              padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                              background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171',
                              opacity: deleting === v.companyId ? 0.5 : 1,
                            }}>{deleting === v.companyId ? '...' : '🗑️'}</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal cambiar plan */}
      {editingPlan && (
        <div onClick={() => setEditingPlan(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#09091a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 400, animation: 'fadeIn 0.3s ease' }}>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: 'white', marginBottom: 6 }}>Cambiar plan</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>{editingPlan.name}</p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 8 }}>Plan</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { value: 'FREE',     label: 'FREE',     sub: 'Gratis',     color: '#9ca3af' },
                  { value: 'PRO',      label: 'PRO',      sub: 'S/ 19/mes',  color: '#7c83fd' },
                  { value: 'BUSINESS', label: 'BUSINESS', sub: 'S/ 39/mes',  color: '#34d399' },
                ].map(p => (
                  <button key={p.value} type="button" onClick={() => setNewPlan(p.value)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 11, cursor: 'pointer', transition: 'all 0.2s',
                    background: newPlan === p.value ? `${p.color}18` : 'rgba(255,255,255,0.04)',
                    border: newPlan === p.value ? `1px solid ${p.color}50` : '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color }}/>
                      <span style={{ fontSize: 14, fontWeight: 700, color: newPlan === p.value ? p.color : 'white' }}>{p.label}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{p.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {newPlan !== 'FREE' && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 8 }}>Meses</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[1,2,3,6,12].map(m => (
                    <button key={m} type="button" onClick={() => setMonths(String(m))} style={{
                      flex: 1, minWidth: 52, padding: '10px 8px', borderRadius: 10,
                      cursor: 'pointer', transition: 'all 0.2s', fontSize: 13, fontWeight: 600,
                      background: months === String(m) ? 'rgba(124,131,253,0.15)' : 'rgba(255,255,255,0.04)',
                      border: months === String(m) ? '1px solid rgba(124,131,253,0.4)' : '1px solid rgba(255,255,255,0.08)',
                      color: months === String(m) ? '#7c83fd' : 'rgba(255,255,255,0.5)',
                    }}>{m} {m === 1 ? 'mes' : 'meses'}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setEditingPlan(null)} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleChangePlan} disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg, #7c83fd, #4f46e5)', border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Guardando...' : 'Aplicar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}