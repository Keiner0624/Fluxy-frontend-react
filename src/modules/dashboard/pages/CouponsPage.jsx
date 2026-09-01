// src/modules/dashboard/pages/CouponsPage.jsx
import { useState, useEffect } from 'react'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import { API_URL } from '@/app/config'

function getToken() { return localStorage.getItem('token') || '' }

export default function CouponsPage() {
  const [coupons, setCoupons]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [form, setForm] = useState({
    code: '', discountType: 'PERCENTAGE', discountValue: '',
    usageLimit: '', minOrderAmount: '', expiresAt: '',
  })

  useEffect(() => { loadCoupons() }, [])

  const loadCoupons = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/coupons`, { headers: { Authorization: `Bearer ${getToken()}` } })
      if (!res.ok) throw new Error()
      setCoupons(await res.json())
    } catch { setError('Error al cargar cupones') }
    finally { setLoading(false) }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.code || !form.discountValue) { setError('Código y descuento son obligatorios.'); return }
    setSaving(true); setError('')
    try {
      const body = {
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString().slice(0,16) : null,
      }
      const res = await fetch(`${API_URL}/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear cupón')
      setSuccess('✅ Cupón creado correctamente.')
      setShowForm(false)
      setForm({ code: '', discountType: 'PERCENTAGE', discountValue: '', usageLimit: '', minOrderAmount: '', expiresAt: '' })
      loadCoupons()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handleToggle = async (id) => {
    try {
      await fetch(`${API_URL}/coupons/${id}/toggle`, { method: 'PUT', headers: { Authorization: `Bearer ${getToken()}` } })
      loadCoupons()
    } catch { setError('Error al cambiar estado') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este cupón?')) return
    try {
      await fetch(`${API_URL}/coupons/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
      loadCoupons()
    } catch { setError('Error al eliminar') }
  }

  const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 11, padding: '11px 14px', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 7 }

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>Panel de vendedor</div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, color: 'white' }}>Cupones de descuento</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{coupons.length} cupón{coupons.length !== 1 ? 'es' : ''} creado{coupons.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setShowForm(true); setError('') }} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #7c83fd, #4f46e5)', color: 'white', padding: '11px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,131,253,0.3)' }}>
          + Crear cupón
        </button>
      </div>

      {success && <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#34d399' }}>{success}</div>}
      {error && !showForm && <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#f87171' }}>⚠️ {error}</div>}

      {/* Info banner */}
      <div style={{ background: 'rgba(124,131,253,0.06)', border: '1px solid rgba(124,131,253,0.15)', borderRadius: 14, padding: '14px 18px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 20 }}>💡</span>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Los cupones aparecen automáticamente en el checkout de tu tienda. El cliente los ingresa antes de confirmar su pedido y el descuento se aplica al total.
        </div>
      </div>

      {/* Lista de cupones */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Cargando cupones...</div>
      ) : coupons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'rgba(13,13,26,0.6)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎟️</div>
          <h3 style={{ color: 'white', marginBottom: 8, fontFamily: "'Fraunces', serif" }}>Sin cupones aún</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Crea tu primer cupón de descuento para atraer más clientes.</p>
          <button onClick={() => setShowForm(true)} style={{ background: 'linear-gradient(135deg, #7c83fd, #4f46e5)', color: 'white', padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>+ Crear mi primer cupón</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {coupons.map(c => {
            const expired = c.expiresAt && new Date(c.expiresAt) < new Date()
            const limitReached = c.usageLimit && c.usageCount >= c.usageLimit
            const isValid = c.active && !expired && !limitReached

            return (
              <div key={c.id} style={{ background: 'rgba(13,13,26,0.9)', border: `1px solid ${isValid ? 'rgba(255,255,255,0.06)' : 'rgba(248,113,113,0.1)'}`, borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = isValid ? 'rgba(124,131,253,0.2)' : 'rgba(248,113,113,0.2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = isValid ? 'rgba(255,255,255,0.06)' : 'rgba(248,113,113,0.1)'}
              >
                {/* Código */}
                <div style={{ background: isValid ? 'rgba(124,131,253,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isValid ? 'rgba(124,131,253,0.25)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, padding: '8px 16px', fontFamily: 'monospace', fontSize: 16, fontWeight: 800, color: isValid ? '#7c83fd' : 'rgba(255,255,255,0.3)', letterSpacing: '1px', flexShrink: 0 }}>
                  {c.code}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 4 }}>
                    {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% de descuento` : `S/ ${c.discountValue.toFixed(2)} de descuento`}
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {c.minOrderAmount && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Mínimo S/ {c.minOrderAmount.toFixed(2)}</span>}
                    {c.expiresAt && <span style={{ fontSize: 11, color: expired ? '#f87171' : 'var(--text-muted)' }}>Vence: {new Date(c.expiresAt).toLocaleDateString('es-PE')}</span>}
                    {c.usageLimit && <span style={{ fontSize: 11, color: limitReached ? '#f87171' : 'var(--text-muted)' }}>Usos: {c.usageCount}/{c.usageLimit}</span>}
                    {!c.usageLimit && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Usos: {c.usageCount}</span>}
                  </div>
                </div>

                {/* Estado */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: isValid ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.08)', border: `1px solid ${isValid ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.2)'}`, color: isValid ? '#34d399' : '#f87171', flexShrink: 0 }}>
                  {isValid ? '✅ Activo' : expired ? '⏰ Vencido' : limitReached ? '🚫 Agotado' : '⏸️ Inactivo'}
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => handleToggle(c.id)} style={{ padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: c.active ? 'rgba(251,191,36,0.08)' : 'rgba(52,211,153,0.08)', border: `1px solid ${c.active ? 'rgba(251,191,36,0.2)' : 'rgba(52,211,153,0.2)'}`, color: c.active ? '#fbbf24' : '#34d399' }}>
                    {c.active ? 'Pausar' : 'Activar'}
                  </button>
                  <button onClick={() => handleDelete(c.id)} style={{ padding: '7px 10px', borderRadius: 9, fontSize: 12, cursor: 'pointer', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', color: '#f87171' }}>🗑️</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal crear cupón */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#0a0a18', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, width: '100%', maxWidth: 480, boxShadow: '0 40px 80px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '22px 26px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: 'white' }}>Crear cupón</h3>
              <button onClick={() => setShowForm(false)} style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <form onSubmit={handleCreate} style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Código */}
              <div>
                <label style={labelStyle}>Código del cupón *</label>
                <input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="Ej: PROMO20" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>Se convierte automáticamente a mayúsculas.</div>
              </div>

              {/* Tipo de descuento */}
              <div>
                <label style={labelStyle}>Tipo de descuento *</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[{ v: 'PERCENTAGE', l: '% Porcentaje' }, { v: 'FIXED', l: 'S/ Monto fijo' }].map(opt => (
                    <button key={opt.v} type="button" onClick={() => setForm({...form, discountType: opt.v})} style={{ flex: 1, padding: '11px', borderRadius: 11, cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.15s', background: form.discountType === opt.v ? 'rgba(124,131,253,0.15)' : 'rgba(255,255,255,0.04)', border: form.discountType === opt.v ? '1px solid rgba(124,131,253,0.4)' : '1px solid rgba(255,255,255,0.08)', color: form.discountType === opt.v ? '#7c83fd' : 'var(--text-muted)' }}>{opt.l}</button>
                  ))}
                </div>
              </div>

              {/* Valor */}
              <div>
                <label style={labelStyle}>{form.discountType === 'PERCENTAGE' ? 'Porcentaje de descuento *' : 'Monto de descuento (S/) *'}</label>
                <input type="number" min="0" step="0.01" max={form.discountType === 'PERCENTAGE' ? 100 : undefined}
                  value={form.discountValue} onChange={e => setForm({...form, discountValue: e.target.value})}
                  placeholder={form.discountType === 'PERCENTAGE' ? 'Ej: 20 (= 20%)' : 'Ej: 10 (= S/ 10)'}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>

              {/* Opcionales */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Límite de usos</label>
                  <input type="number" min="1" value={form.usageLimit} onChange={e => setForm({...form, usageLimit: e.target.value})} placeholder="Sin límite"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Pedido mínimo (S/)</label>
                  <input type="number" min="0" step="0.01" value={form.minOrderAmount} onChange={e => setForm({...form, minOrderAmount: e.target.value})} placeholder="Sin mínimo"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Fecha de vencimiento</label>
                <input type="datetime-local" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})}
                  style={{ ...inputStyle, colorScheme: 'dark' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>

              {error && <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171' }}>⚠️ {error}</div>}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '13px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: 'var(--text-soft)', fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={saving} style={{ flex: 2, padding: '13px', background: saving ? 'rgba(124,131,253,0.4)' : 'linear-gradient(135deg, #7c83fd, #4f46e5)', border: 'none', borderRadius: 12, color: 'white', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'Creando...' : '🎟️ Crear cupón'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}