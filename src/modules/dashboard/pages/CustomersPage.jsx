// src/modules/dashboard/pages/CustomersPage.jsx
// CRM ligero: cada comprador con lo que gastó, sus pedidos, notas y etiquetas.
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import OrderDetailModal from '@/modules/dashboard/components/OrderDetailModal'
import Icon from '@/components/Icon'
import { api } from '@/app/api'
import useApi, { useDebounced } from '@/hooks/useApi'
import useAccess from '@/hooks/useAccess'
import { money, date, dateTime, integer, ORDER_STATUS, count } from '@/app/format'
import {
  Badge, EmptyState, ErrorState, Modal, NoAccess, Pagination, StatCard,
} from '@/modules/dashboard/components/ui'

const SORTS = [
  { key: 'lastOrderAt', label: 'Última compra' },
  { key: 'totalSpent',  label: 'Mayor gasto' },
  { key: 'ordersCount', label: 'Más pedidos' },
  { key: 'createdAt',   label: 'Más recientes' },
  { key: 'name',        label: 'Nombre (A-Z)' },
]

function Tags({ tags }) {
  if (!tags?.length) return null
  return <div className="fx-chips" style={{ marginTop: 4 }}>{tags.map((t) => <span key={t} className="fx-chip">{t}</span>)}</div>
}

function CustomerForm({ initial, title, onClose, onSaved, customerId }) {
  const [form, setForm] = useState({
    name: initial?.name || '', phone: initial?.phone || '', email: initial?.email || '', address: initial?.address || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return }
    setSaving(true)
    setError('')
    try {
      const saved = customerId
        ? await api.put(`/customers/${customerId}`, form)
        : await api.post('/customers', form)
      toast.success(customerId ? 'Datos actualizados.' : 'Cliente creado.')
      onSaved(saved)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal as="form" onSubmit={submit} title={title} onClose={onClose} width={480}
      footer={(
        <>
          <button type="button" className="fx-btn fx-btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="fx-btn fx-btn--primary" disabled={saving}>
            {saving ? <><span className="fx-spinner" /> Guardando…</> : 'Guardar'}
          </button>
        </>
      )}
    >
      <div className="fx-field">
        <label className="fx-label" htmlFor="c-name">Nombre</label>
        <input id="c-name" className="fx-input" value={form.name} onChange={set('name')} maxLength={150} autoFocus />
      </div>
      <div className="fx-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="fx-field">
          <label className="fx-label" htmlFor="c-phone">Teléfono</label>
          <input id="c-phone" className="fx-input" value={form.phone} onChange={set('phone')} maxLength={30} placeholder="987 654 321" />
        </div>
        <div className="fx-field">
          <label className="fx-label" htmlFor="c-email">Correo</label>
          <input id="c-email" className="fx-input" type="email" value={form.email} onChange={set('email')} maxLength={150} />
        </div>
      </div>
      <div className="fx-field" style={{ marginBottom: 0 }}>
        <label className="fx-label" htmlFor="c-address">Dirección</label>
        <input id="c-address" className="fx-input" value={form.address} onChange={set('address')} maxLength={300} />
      </div>
      {error && <div className="fx-alert fx-alert--error" style={{ marginTop: 14 }}><span>{error}</span></div>}
    </Modal>
  )
}

function CustomerDetail({ customerId, onClose, onChanged }) {
  const access = useAccess()
  const canEdit = access.can('CUSTOMER_UPDATE')
  const { data: c, loading, error, reload, setData } = useApi(() => api.get(`/customers/${customerId}`), [customerId])
  const [notes, setNotes] = useState(null)
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [orderId, setOrderId] = useState(null)

  const save = async (body, message) => {
    setSaving(true)
    try {
      const updated = await api.put(`/customers/${customerId}`, body)
      setData(updated)
      toast.success(message)
      onChanged()
      return true
    } catch (err) {
      toast.error(err.message)
      return false
    } finally {
      setSaving(false)
    }
  }

  const addTag = async () => {
    const tag = tagInput.trim().toLowerCase()
    if (!tag || c.tags.includes(tag)) { setTagInput(''); return }
    if (await save({ tags: [...c.tags, tag] }, 'Etiqueta agregada.')) setTagInput('')
  }

  const currentNotes = notes ?? c?.notes ?? ''

  return (
    <>
      <Modal title={c?.name || 'Cliente'} subtitle={c ? `Cliente desde ${date(c.createdAt)}` : undefined} onClose={onClose} width={720}
        footer={canEdit && c ? (
          <button type="button" className="fx-btn fx-btn--secondary" onClick={() => setEditing(true)}>
            <Icon name="edit" size={15} /> Editar datos
          </button>
        ) : null}
      >
        {error && <ErrorState error={error} onRetry={reload} />}
        {loading && !c && <div className="fx-skeleton" style={{ height: 200 }} />}
        {c && (
          <>
            <div className="fx-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', marginBottom: 20 }}>
              <StatCard label="Total gastado" value={money(c.totalSpent)} />
              <StatCard label="Compras" value={integer(c.saleOrders)} foot={`${count(c.ordersCount, 'pedido')} en total`} />
              <StatCard label="Ticket promedio" value={money(c.averageTicket)} />
              <StatCard label="Última compra" value={<span style={{ fontSize: 16 }}>{c.lastOrderAt ? date(c.lastOrderAt) : '—'}</span>} />
            </div>

            <div className="fx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
              <section>
                <p className="fx-eyebrow" style={{ marginBottom: 8 }}>Contacto</p>
                <dl className="fx-deflist">
                  <div><dt>Teléfono</dt><dd>{c.phone
                    ? <a className="fx-link" href={`https://wa.me/${c.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">{c.phone}</a>
                    : '—'}</dd></div>
                  <div><dt>Correo</dt><dd>{c.email || '—'}</dd></div>
                  <div><dt>Dirección</dt><dd>{c.address || '—'}</dd></div>
                </dl>
              </section>

              <section>
                <p className="fx-eyebrow" style={{ marginBottom: 8 }}>Etiquetas</p>
                <div className="fx-chips" style={{ marginBottom: 10, minHeight: 22 }}>
                  {c.tags.length === 0 && <span className="fx-hint">Sin etiquetas</span>}
                  {c.tags.map((t) => (
                    <span key={t} className="fx-chip">
                      {t}
                      {canEdit && (
                        <button type="button" aria-label={`Quitar ${t}`} disabled={saving}
                          onClick={() => save({ tags: c.tags.filter((x) => x !== t) }, 'Etiqueta quitada.')}>
                          <Icon name="close" size={11} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {canEdit && (
                  <div className="fx-row" style={{ gap: 6 }}>
                    <input className="fx-input fx-input--sm" placeholder="vip, mayorista…" value={tagInput} maxLength={30}
                      onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} />
                    <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" onClick={addTag} disabled={saving || !tagInput.trim()}>Agregar</button>
                  </div>
                )}
              </section>
            </div>

            <p className="fx-eyebrow" style={{ margin: '20px 0 8px' }}>Notas internas</p>
            <textarea
              className="fx-textarea"
              value={currentNotes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={canEdit ? 'Preferencias, horarios de entrega, acuerdos… Solo lo ve tu equipo.' : 'Sin notas'}
              readOnly={!canEdit}
              maxLength={4000}
            />
            {canEdit && notes !== null && notes !== (c.notes || '') && (
              <div className="fx-row" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={() => setNotes(null)}>Descartar</button>
                <button type="button" className="fx-btn fx-btn--primary fx-btn--sm" disabled={saving}
                  onClick={async () => { if (await save({ notes }, 'Notas guardadas.')) setNotes(null) }}>
                  Guardar notas
                </button>
              </div>
            )}

            <p className="fx-eyebrow" style={{ margin: '22px 0 8px' }}>Pedidos</p>
            {c.recentOrders.length === 0 ? (
              <p className="fx-hint">Este cliente todavía no hizo pedidos.</p>
            ) : (
              <div className="fx-table-wrap" style={{ border: '1px solid var(--fx-line)', borderRadius: 'var(--fx-r)' }}>
                <table className="fx-table">
                  <tbody>
                    {c.recentOrders.map((o) => (
                      <tr key={o.id} className={access.can('ORDER_VIEW') ? 'is-clickable' : ''}
                        onClick={() => access.can('ORDER_VIEW') && setOrderId(o.id)}>
                        <td className="fx-table__strong">#{o.id}</td>
                        <td style={{ fontSize: 13 }}>{dateTime(o.createdAt)}</td>
                        <td><Badge config={ORDER_STATUS[o.status]} fallback={o.status} /></td>
                        <td className="fx-table__num fx-table__strong">{money(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Modal>

      {editing && c && (
        <CustomerForm title="Editar cliente" initial={c} customerId={c.id} onClose={() => setEditing(false)}
          onSaved={(updated) => { setData(updated); setEditing(false); onChanged() }} />
      )}
      {orderId && <OrderDetailModal orderId={orderId} onClose={() => setOrderId(null)} onChanged={() => { reload(); onChanged() }} />}
    </>
  )
}

export default function CustomersPage() {
  const access = useAccess()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState('')
  const [sort, setSort] = useState('lastOrderAt')
  const [page, setPage] = useState(0)
  const [creating, setCreating] = useState(false)
  const debouncedQuery = useDebounced(query)
  const canView = access.can('CUSTOMER_VIEW')
  const openId = Number(searchParams.get('customer')) || null

  const tags = useApi(() => api.get('/customers/tags'), [], { enabled: canView })
  const list = useApi(() => api.get('/customers', {
    q: debouncedQuery, tag, sort, direction: sort === 'name' ? 'asc' : 'desc', page, size: 20,
  }), [debouncedQuery, tag, sort, page], { enabled: canView })

  const openCustomer = (id) => {
    const next = new URLSearchParams(searchParams)
    if (id) next.set('customer', id); else next.delete('customer')
    setSearchParams(next, { replace: true })
  }

  if (access.ready && !canView) return <DashboardLayout><NoAccess module="Clientes" /></DashboardLayout>

  const result = list.data
  const filtered = debouncedQuery || tag

  return (
    <DashboardLayout>
      <div className="fx-page-head">
        <div>
          <h1>Clientes</h1>
          <p>{result ? `${integer(result.totalElements)} ${result.totalElements === 1 ? 'cliente' : 'clientes'}${filtered ? ' con estos filtros' : ''}` : 'Quiénes te compran y cuánto'}</p>
        </div>
        {access.can('CUSTOMER_UPDATE') && (
          <div className="fx-page-head__actions">
            <button className="fx-btn fx-btn--primary" onClick={() => setCreating(true)}>
              <Icon name="plus" size={16} /> Nuevo cliente
            </button>
          </div>
        )}
      </div>

      <div className="fx-toolbar">
        <div className="fx-search">
          <Icon name="search" size={16} />
          <input className="fx-input" placeholder="Buscar por nombre, teléfono o correo" value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0) }} />
        </div>
        {tags.data?.length > 0 && (
          <select className="fx-select" style={{ maxWidth: 180 }} value={tag} onChange={(e) => { setTag(e.target.value); setPage(0) }} aria-label="Etiqueta">
            <option value="">Todas las etiquetas</option>
            {tags.data.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
        <select className="fx-select" style={{ maxWidth: 180 }} value={sort} onChange={(e) => { setSort(e.target.value); setPage(0) }} aria-label="Ordenar">
          {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      {list.error && <div style={{ marginBottom: 14 }}><ErrorState error={list.error} onRetry={list.reload} /></div>}

      <div className="fx-card">
        {list.loading && !result ? (
          <div className="fx-card__body">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="fx-skeleton" style={{ height: 40, marginBottom: 8 }} />)}</div>
        ) : !result?.content?.length ? (
          <EmptyState icon="customers"
            title={filtered ? 'Ningún cliente coincide' : 'Todavía no tenés clientes'}
            text={filtered ? 'Probá con otro nombre, teléfono o etiqueta.' : 'Cada pedido de tu tienda registra al cliente automáticamente, con su teléfono y lo que compró.'} />
        ) : (
          <>
            <div className="fx-table-wrap" style={{ opacity: list.loading ? .6 : 1 }}>
              <table className="fx-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th className="fx-hide-sm">Contacto</th>
                    <th className="fx-table__num">Compras</th>
                    <th className="fx-table__num">Total gastado</th>
                    <th className="fx-hide-md">Última compra</th>
                    <th style={{ width: 36 }} />
                  </tr>
                </thead>
                <tbody>
                  {result.content.map((c) => (
                    <tr key={c.id} className="is-clickable" onClick={() => openCustomer(c.id)}>
                      <td>
                        <div className="fx-table__strong fx-truncate" style={{ maxWidth: 240 }}>{c.name}</div>
                        <Tags tags={c.tags} />
                      </td>
                      <td className="fx-hide-sm" style={{ fontSize: 13 }}>
                        <div>{c.phone || '—'}</div>
                        {c.email && <div className="fx-hint" style={{ fontSize: 12 }}>{c.email}</div>}
                      </td>
                      <td className="fx-table__num">{integer(c.saleOrders)}</td>
                      <td className="fx-table__num fx-table__strong">{money(c.totalSpent)}</td>
                      <td className="fx-hide-md" style={{ fontSize: 13 }}>{c.lastOrderAt ? date(c.lastOrderAt) : '—'}</td>
                      <td><Icon name="chevronRight" size={15} style={{ color: 'var(--fx-muted)' }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={result.page} totalPages={result.totalPages} totalElements={result.totalElements}
              size={result.size} onChange={setPage} noun="clientes" />
          </>
        )}
      </div>

      {openId && <CustomerDetail customerId={openId} onClose={() => openCustomer(null)} onChanged={() => { list.refresh(); tags.refresh() }} />}
      {creating && (
        <CustomerForm title="Nuevo cliente" onClose={() => setCreating(false)}
          onSaved={(created) => { setCreating(false); list.refresh(); openCustomer(created.id) }} />
      )}
    </DashboardLayout>
  )
}
