// src/modules/dashboard/pages/CouponsPage.jsx
import { useState, useEffect } from 'react'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import { API_URL } from '@/app/config'
import Icon from '@/components/Icon'

function getToken() { return localStorage.getItem('token') || '' }

function formatDate(value) {
  if (!value) return 'Sin vencimiento'
  return new Date(value).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

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
      setSuccess('Cupón creado correctamente.')
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

  const discountLabel = (c) =>
    c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `S/ ${Number(c.discountValue).toFixed(2)}`

  return (
    <DashboardLayout>
      <div className="fx-page-head">
        <div>
          <h1>Cupones</h1>
          <p>{loading ? 'Cargando…' : `${coupons.length} ${coupons.length === 1 ? 'cupón creado' : 'cupones creados'}`}</p>
        </div>
        <div className="fx-page-head__actions">
          <button className="fx-btn fx-btn--primary" onClick={() => { setShowForm(true); setError('') }}>
            <Icon name="plus" size={16} />
            Crear cupón
          </button>
        </div>
      </div>

      {success && (
        <div className="fx-alert fx-alert--ok" style={{ marginBottom: 16 }}>
          <Icon name="checkCircle" size={16} /><span>{success}</span>
        </div>
      )}
      {error && !showForm && (
        <div className="fx-alert fx-alert--error" style={{ marginBottom: 16 }}>
          <Icon name="alert" size={16} /><span>{error}</span>
        </div>
      )}

      <div className="fx-card">
        {loading ? (
          <div className="fx-card__body">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="fx-skeleton" style={{ height: 44, marginBottom: 8 }} />
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <div className="fx-empty">
            <div className="fx-empty__icon"><Icon name="coupons" size={20} /></div>
            <p className="fx-empty__title">Todavía no creaste cupones</p>
            <p className="fx-empty__text">
              Los cupones te permiten ofrecer descuentos por código en el checkout de tu tienda.
            </p>
            <button className="fx-btn fx-btn--primary" style={{ marginTop: 18 }} onClick={() => setShowForm(true)}>
              <Icon name="plus" size={16} />
              Crear cupón
            </button>
          </div>
        ) : (
          <div className="fx-table-wrap">
            <table className="fx-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th className="fx-table__num">Descuento</th>
                  <th className="fx-table__num">Usos</th>
                  <th>Vence</th>
                  <th>Estado</th>
                  <th style={{ width: 84 }} />
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="fx-code">{c.code}</span>
                      {c.minOrderAmount ? (
                        <div style={{ color: 'var(--fx-muted)', fontSize: 12.5, marginTop: 3 }}>
                          Mínimo S/ {Number(c.minOrderAmount).toFixed(2)}
                        </div>
                      ) : null}
                    </td>
                    <td className="fx-table__num fx-table__strong">{discountLabel(c)}</td>
                    <td className="fx-table__num">
                      {c.usedCount || 0}{c.usageLimit ? ` / ${c.usageLimit}` : ''}
                    </td>
                    <td style={{ fontSize: 13 }}>{formatDate(c.expiresAt)}</td>
                    <td>
                      <span className={`fx-badge ${c.active ? 'fx-badge--ok' : ''}`}>
                        <span className="fx-dot" />
                        {c.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="fx-row" style={{ gap: 2, justifyContent: 'flex-end' }}>
                        <button
                          className="fx-btn fx-btn--ghost fx-btn--sm"
                          onClick={() => handleToggle(c.id)}
                        >
                          {c.active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          className="fx-btn fx-btn--ghost fx-btn--icon"
                          style={{ color: 'var(--fx-danger)' }}
                          onClick={() => handleDelete(c.id)}
                          aria-label={`Eliminar ${c.code}`}
                        >
                          <Icon name="trash" size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fx-modal" role="dialog" aria-modal="true" onClick={() => setShowForm(false)}>
          <form className="fx-modal__panel" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()} onSubmit={handleCreate}>
            <div className="fx-modal__head">
              <h2 className="fx-h2">Nuevo cupón</h2>
              <button type="button" className="fx-btn fx-btn--ghost fx-btn--icon" onClick={() => setShowForm(false)} aria-label="Cerrar">
                <Icon name="close" size={17} />
              </button>
            </div>

            <div className="fx-modal__body">
              <div className="fx-field">
                <label className="fx-label" htmlFor="c-code">Código</label>
                <input
                  id="c-code"
                  className="fx-input"
                  style={{ textTransform: 'uppercase', letterSpacing: '.5px' }}
                  placeholder="BIENVENIDA10"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>

              <div className="fx-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="fx-field">
                  <label className="fx-label" htmlFor="c-type">Tipo</label>
                  <select id="c-type" className="fx-select" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                    <option value="PERCENTAGE">Porcentaje (%)</option>
                    <option value="FIXED">Monto fijo (S/)</option>
                  </select>
                </div>
                <div className="fx-field">
                  <label className="fx-label" htmlFor="c-value">Descuento</label>
                  <input id="c-value" className="fx-input" type="number" step="0.01" min="0" placeholder="10" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} />
                </div>
              </div>

              <div className="fx-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="fx-field">
                  <label className="fx-label" htmlFor="c-limit">Límite de usos</label>
                  <input id="c-limit" className="fx-input" type="number" min="1" placeholder="Sin límite" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} />
                </div>
                <div className="fx-field">
                  <label className="fx-label" htmlFor="c-min">Compra mínima (S/)</label>
                  <input id="c-min" className="fx-input" type="number" step="0.01" min="0" placeholder="Sin mínimo" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} />
                </div>
              </div>

              <div className="fx-field">
                <label className="fx-label" htmlFor="c-exp">Vencimiento</label>
                <input id="c-exp" className="fx-input" type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
                <p className="fx-hint" style={{ marginTop: 6, fontSize: 12.5 }}>Dejalo vacío para que no venza.</p>
              </div>

              {error && (
                <div className="fx-alert fx-alert--error">
                  <Icon name="alert" size={16} /><span>{error}</span>
                </div>
              )}
            </div>

            <div className="fx-modal__foot">
              <button type="button" className="fx-btn fx-btn--ghost" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" className="fx-btn fx-btn--primary" disabled={saving}>
                {saving ? <><span className="fx-spinner" /> Creando…</> : 'Crear cupón'}
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  )
}
