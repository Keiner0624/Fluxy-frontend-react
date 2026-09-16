// src/modules/admin/components/AdminComplaints.jsx
// Libro de Reclamaciones: hojas pendientes por fecha límite y respuesta al consumidor.
import { useCallback, useEffect, useState } from 'react'
import { API_URL } from '@/app/config'

const card = { background: 'rgba(13,13,26,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, overflow: 'hidden', marginBottom: 20 }
const muted = 'rgba(255,255,255,0.35)'
const DOC = { DNI: 'DNI', CE: 'C.E.', PASAPORTE: 'Pasaporte', RUC: 'RUC' }

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token') || ''}` })
const day = (value) => value ? new Date(`${value}T12:00:00`).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const dateTime = (value) => value ? new Date(value).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

export default function AdminComplaints() {
  const [status, setStatus] = useState('PENDING')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(null)
  const [answer, setAnswer] = useState('')
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    setError('')
    try {
      const query = status ? `?status=${status}&size=50` : '?size=50'
      const res = await fetch(`${API_URL}/admin/complaints${query}`, { headers: authHeaders() })
      if (!res.ok) throw new Error('No se pudo cargar el Libro de Reclamaciones.')
      setData(await res.json())
    } catch (err) {
      setError(err.message)
    }
  }, [status])

  useEffect(() => { load() }, [load])

  const respond = async () => {
    setSending(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/admin/complaints/${open.id}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ response: answer }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.message || 'No se pudo enviar la respuesta.')
      setOpen(null)
      setAnswer('')
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const rows = data?.content || []

  return (
    <div style={card}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>
          Libro de Reclamaciones
          {data && <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 999, fontSize: 11, background: data.pending ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.05)', color: data.pending ? '#fbbf24' : muted }}>{data.pending} pendientes</span>}
        </div>
        <div style={{ display: 'flex', gap: 7 }}>
          {[['PENDING', 'Pendientes'], ['ANSWERED', 'Respondidas'], ['', 'Todas']].map(([value, label]) => (
            <button key={label} type="button" onClick={() => setStatus(value)} style={{ padding: '5px 11px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: status === value ? 'rgba(124,131,253,0.1)' : 'rgba(255,255,255,0.03)', border: status === value ? '1px solid rgba(124,131,253,0.3)' : '1px solid rgba(255,255,255,0.06)', color: status === value ? '#7c83fd' : muted }}>{label}</button>
          ))}
        </div>
      </div>

      {error && <div style={{ padding: '10px 20px', color: '#f87171', fontSize: 12 }}>{error}</div>}

      {rows.length === 0 ? (
        <div style={{ padding: 28, textAlign: 'center', color: muted, fontSize: 13 }}>{data ? 'No hay hojas en esta vista.' : 'Cargando…'}</div>
      ) : (
        <div>
          {rows.map((c) => {
            const expanded = open?.id === c.id
            return (
              <div key={c.id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <button type="button" onClick={() => { setOpen(expanded ? null : c); setAnswer('') }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '12px 20px', background: 'none', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#7c83fd' }}>{c.code}</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.05)' }}>{c.type === 'RECLAMO' ? 'Reclamo' : 'Queja'}</span>
                  <span style={{ flex: 1, minWidth: 140, fontSize: 13 }}>{c.consumerName}</span>
                  <span style={{ fontSize: 12, color: c.status === 'ANSWERED' ? '#34d399' : c.overdue ? '#f87171' : '#fbbf24' }}>
                    {c.status === 'ANSWERED' ? `Respondida ${dateTime(c.respondedAt)}` : `${c.overdue ? 'Vencida' : 'Vence'} ${day(c.dueDate)}`}
                  </span>
                </button>
                {expanded && (
                  <div style={{ padding: '4px 20px 18px', fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
                    <dl style={{ display: 'grid', gridTemplateColumns: 'max-content minmax(0,1fr)', gap: '4px 14px', marginBottom: 12 }}>
                      {[
                        ['Recibida', dateTime(c.receivedAt)],
                        ['Documento', `${DOC[c.documentType] || c.documentType} ${c.documentNumber}`],
                        ['Contacto', [c.email, c.phone].filter(Boolean).join(' · ')],
                        ['Domicilio', c.address],
                        c.minor && ['Apoderado', c.guardianName],
                        [c.itemType === 'PRODUCTO' ? 'Producto' : 'Servicio', c.itemDescription],
                        c.amount != null && ['Monto', `S/ ${Number(c.amount).toFixed(2)}`],
                        ['Detalle', c.detail],
                        ['Pedido', c.consumerRequest],
                        c.response && ['Respuesta', c.response],
                      ].filter(Boolean).map(([label, value]) => (
                        <div key={label} style={{ display: 'contents' }}>
                          <dt style={{ color: muted }}>{label}</dt>
                          <dd style={{ margin: 0, whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>{value}</dd>
                        </div>
                      ))}
                    </dl>
                    {c.status === 'PENDING' && (
                      <>
                        <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} maxLength={3000} rows={5}
                          placeholder="Respuesta al consumidor: qué se revisó y qué acción se tomó."
                          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 12, color: 'white', fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                          <button type="button" onClick={respond} disabled={sending || answer.trim().length < 10} style={{ padding: '9px 16px', borderRadius: 10, background: 'linear-gradient(135deg,#7c83fd,#4f46e5)', border: 'none', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: sending || answer.trim().length < 10 ? 0.5 : 1 }}>
                            {sending ? 'Enviando…' : 'Enviar respuesta por correo'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
