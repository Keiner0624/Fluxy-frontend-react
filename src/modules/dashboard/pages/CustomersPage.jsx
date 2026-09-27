// src/modules/dashboard/pages/CustomersPage.jsx
// CRM ligero: cada comprador con lo que gastó, sus segmentos automáticos, su origen, su actividad,
// sus pedidos, notas y etiquetas. Los segmentos los calcula el servidor; las etiquetas son manuales.
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import OrderDetailModal from '@/modules/dashboard/components/OrderDetailModal'
import Icon from '@/components/Icon'
import { api } from '@/app/api'
import useApi, { useDebounced } from '@/hooks/useApi'
import useAccess from '@/hooks/useAccess'
import {
  money, date, dateTime, integer, ORDER_STATUS, count, CUSTOMER_SEGMENTS, CUSTOMER_SOURCES, CUSTOMER_ACTIVITY,
} from '@/app/format'
import {
  Badge, EmptyState, ErrorState, Modal, NoAccess, Pagination, StatCard,
} from '@/modules/dashboard/components/ui'

const PLAIN_LIST = { listStyle: 'none', margin: 0, padding: 0 }

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

/** Segmentos automáticos: badges, distintos de las etiquetas manuales (chips). */
function Segments({ segments, rules }) {
  if (!segments?.length) return null
  return (
    <div className="fx-row" style={{ gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
      {segments.map((s) => {
        const key = typeof s === 'string' ? s : s.type
        return (
          <span key={key} title={rules ? s.rule : undefined}>
            <Badge config={CUSTOMER_SEGMENTS[key]} fallback={key} />
          </span>
        )
      })}
    </div>
  )
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

// ─── Perfil: Resumen ─────────────────────────────────────────────────────────

function SummaryTab({ c, save, saving }) {
  const access = useAccess()
  const canEdit = access.can('CUSTOMER_UPDATE')
  const canTag = access.can('CUSTOMER_TAGS')
  const canNote = access.can('CUSTOMER_NOTES')
  const [notes, setNotes] = useState(null)
  const [tagInput, setTagInput] = useState('')
  const prefs = c.preferences || {}

  const addTag = async () => {
    const tag = tagInput.trim().toLowerCase()
    if (!tag || c.tags.includes(tag)) { setTagInput(''); return }
    if (await save({ tags: [...c.tags, tag] }, 'Etiqueta agregada.')) setTagInput('')
  }
  const currentNotes = notes ?? c.notes ?? ''

  return (
    <>
      <div className="fx-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', marginBottom: 20 }}>
        <StatCard label="Total gastado" value={money(c.totalSpent)} />
        <StatCard label="Compras" value={integer(c.saleOrders)} foot={`${count(c.ordersCount, 'pedido')} en total`} />
        <StatCard label="Ticket promedio" value={money(c.averageTicket)} />
        <StatCard label="Última compra" value={<span style={{ fontSize: 16 }}>{c.lastOrderAt ? date(c.lastOrderAt) : '—'}</span>}
          foot={c.daysSinceLastPurchase == null ? 'Sin compras' : c.daysSinceLastPurchase === 0 ? 'Hoy' : `Hace ${count(c.daysSinceLastPurchase, 'día')}`} />
      </div>

      <div className="fx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: 20 }}>
        <section>
          <p className="fx-eyebrow" style={{ marginBottom: 8 }}>Segmentación automática</p>
          {c.segments.length === 0
            ? <p className="fx-hint">Sin segmentos: todavía no compró.</p>
            : (
              <ul style={{ ...PLAIN_LIST, display: 'grid', gap: 6 }}>
                {c.segments.map((s) => (
                  <li key={s.type} className="fx-row" style={{ gap: 8, alignItems: 'flex-start' }}>
                    <Badge config={CUSTOMER_SEGMENTS[s.type]} fallback={s.label} />
                    <span className="fx-hint" style={{ fontSize: 12.5 }}>{s.rule}</span>
                  </li>
                ))}
              </ul>
            )}

          <p className="fx-eyebrow" style={{ margin: '16px 0 8px' }}>Etiquetas manuales</p>
          <div className="fx-chips" style={{ marginBottom: 10, minHeight: 22 }}>
            {c.tags.length === 0 && <span className="fx-hint">Sin etiquetas</span>}
            {c.tags.map((t) => (
              <span key={t} className="fx-chip">
                {t}
                {canTag && (
                  <button type="button" aria-label={`Quitar ${t}`} disabled={saving}
                    onClick={() => save({ tags: c.tags.filter((x) => x !== t) }, 'Etiqueta quitada.')}>
                    <Icon name="close" size={11} />
                  </button>
                )}
              </span>
            ))}
          </div>
          {canTag && (
            <div className="fx-row" style={{ gap: 6 }}>
              <input className="fx-input fx-input--sm" placeholder="vip, mayorista…" value={tagInput} maxLength={30} aria-label="Nueva etiqueta"
                onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} />
              <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" onClick={addTag} disabled={saving || !tagInput.trim()}>Agregar</button>
            </div>
          )}
        </section>

        <section>
          <p className="fx-eyebrow" style={{ marginBottom: 8 }}>Contacto</p>
          <dl className="fx-deflist">
            <div><dt>Teléfono</dt><dd>{c.phone
              ? <a className="fx-link" href={`https://wa.me/${c.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">{c.phone}</a>
              : '—'}</dd></div>
            <div><dt>Correo</dt><dd>{c.email || '—'}</dd></div>
            <div><dt>Dirección</dt><dd>{c.address || '—'}</dd></div>
            <div><dt>Origen</dt><dd>{c.sourceLabel || CUSTOMER_SOURCES[c.source] || '—'}</dd></div>
          </dl>
          {/* Baja de promociones: queda fuera de las audiencias de Marketing. */}
          <label className="fx-check" style={{ marginTop: 10 }}>
            <input type="checkbox" checked={Boolean(c.marketingOptOut)} disabled={!canEdit || saving}
              onChange={(e) => save({ marketingOptOut: e.target.checked },
                e.target.checked ? 'No va a aparecer en las campañas.' : 'Vuelve a aparecer en las campañas.')} />
            No quiere recibir promociones
          </label>
        </section>

        <section>
          <p className="fx-eyebrow" style={{ marginBottom: 8 }}>Preferencias</p>
          <dl className="fx-deflist">
            <div><dt>Categoría favorita</dt><dd>{prefs.favoriteCategory || '—'}</dd></div>
            <div><dt>Producto más comprado</dt><dd>{prefs.mostPurchasedProduct || '—'}</dd></div>
            <div><dt>Productos comprados</dt><dd>{integer(prefs.totalProductsPurchased || 0)}</dd></div>
          </dl>
        </section>
      </div>

      {/* Las notas solo llegan del servidor a quien tiene permiso para verlas. */}
      {c.notesVisible && (
        <>
          <p className="fx-eyebrow" style={{ margin: '20px 0 8px' }}>Notas internas</p>
          <textarea
            className="fx-textarea"
            value={currentNotes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={canNote ? 'Preferencias, horarios de entrega, acuerdos… Solo lo ve tu equipo.' : 'Sin notas'}
            readOnly={!canNote}
            maxLength={4000}
            aria-label="Notas internas"
          />
          {canNote && notes !== null && notes !== (c.notes || '') && (
            <div className="fx-row" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={() => setNotes(null)}>Descartar</button>
              <button type="button" className="fx-btn fx-btn--primary fx-btn--sm" disabled={saving}
                onClick={async () => { if (await save({ notes }, 'Notas guardadas.')) setNotes(null) }}>
                Guardar notas
              </button>
            </div>
          )}
        </>
      )}
    </>
  )
}

// ─── Perfil: Actividad ───────────────────────────────────────────────────────

function ActivityTab({ customerId, version }) {
  const [page, setPage] = useState(0)
  const { data, loading, error, reload } = useApi(
    () => api.get(`/customers/${customerId}/activity`, { page, size: 15 }), [customerId, page, version])

  if (error) return <ErrorState error={error} onRetry={reload} />
  if (loading && !data) return Array.from({ length: 4 }).map((_, i) => <div key={i} className="fx-skeleton" style={{ height: 44, marginBottom: 8 }} />)
  if (!data?.content?.length) return <EmptyState icon="history" title="Sin actividad" text="Pedidos, pagos, etiquetas y notas aparecen acá." />

  return (
    <>
      <ol style={{ ...PLAIN_LIST, opacity: loading ? .6 : 1 }}>
        {data.content.map((a) => {
          const meta = CUSTOMER_ACTIVITY[a.type] || { label: a.type, icon: 'info' }
          return (
            <li key={a.id} className="fx-row" style={{ gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--fx-line)' }}>
              <span style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, flexShrink: 0, borderRadius: 999, background: 'var(--fx-soft)', color: 'var(--fx-copy)' }}>
                <Icon name={meta.icon} size={14} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14 }}>{a.description}</div>
                <div className="fx-hint" style={{ fontSize: 12 }}>
                  {dateTime(a.createdAt)}{a.actor ? ` · ${a.actor}` : ''}
                </div>
              </div>
              {a.amount != null && <span className="fx-table__strong" style={{ fontSize: 13.5, whiteSpace: 'nowrap' }}>{money(a.amount)}</span>}
            </li>
          )
        })}
      </ol>
      <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements}
        size={data.size} onChange={setPage} noun="eventos" />
    </>
  )
}

// ─── Perfil: Pedidos ─────────────────────────────────────────────────────────

function OrdersTab({ customerId, version, onOpen }) {
  const [page, setPage] = useState(0)
  const { data, loading, error, reload } = useApi(
    () => api.get(`/customers/${customerId}/orders`, { page, size: 10 }), [customerId, page, version])

  if (error) return <ErrorState error={error} onRetry={reload} />
  if (loading && !data) return <div className="fx-skeleton" style={{ height: 160 }} />
  if (!data?.content?.length) return <EmptyState icon="orders" title="Sin pedidos" text="Este cliente todavía no hizo pedidos." />

  return (
    <>
      <div className="fx-table-wrap" style={{ border: '1px solid var(--fx-line)', borderRadius: 'var(--fx-r)', opacity: loading ? .6 : 1 }}>
        <table className="fx-table">
          <tbody>
            {data.content.map((o) => (
              <tr key={o.id} className="is-clickable" onClick={() => onOpen(o.id)}>
                <td className="fx-table__strong">#{o.id}</td>
                <td style={{ fontSize: 13 }}>{dateTime(o.createdAt)}</td>
                <td className="fx-hide-sm" style={{ fontSize: 13 }}>{count(o.items, 'producto')}</td>
                <td><Badge config={ORDER_STATUS[o.status]} fallback={o.status} /></td>
                <td className="fx-table__num fx-table__strong">{money(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements}
        size={data.size} onChange={setPage} noun="pedidos" />
    </>
  )
}

function CustomerDetail({ customerId, onClose, onChanged }) {
  const access = useAccess()
  const canEdit = access.can('CUSTOMER_UPDATE')
  const canOrders = access.can('ORDER_VIEW')
  const { data: c, loading, error, reload, setData } = useApi(() => api.get(`/customers/${customerId}`), [customerId])
  const [tab, setTab] = useState('summary')
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [orderId, setOrderId] = useState(null)
  // Cambia con cada edición: la actividad y los pedidos se vuelven a pedir.
  const [version, setVersion] = useState(0)

  const changed = (updated) => {
    if (updated) setData(updated)
    setVersion((v) => v + 1)
    onChanged()
  }

  const save = async (body, message) => {
    setSaving(true)
    try {
      changed(await api.put(`/customers/${customerId}`, body))
      toast.success(message)
      return true
    } catch (err) {
      toast.error(err.message)
      return false
    } finally {
      setSaving(false)
    }
  }

  const tabs = [['summary', 'Resumen', 'user'], ['activity', 'Actividad', 'history'], ...(canOrders ? [['orders', 'Pedidos', 'orders']] : [])]

  return (
    <>
      <Modal title={c?.name || 'Cliente'} subtitle={c ? `Cliente desde ${date(c.createdAt)}` : undefined} onClose={onClose} width={760}
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
            <div className="fx-tabs" style={{ marginBottom: 16, display: 'inline-flex' }} role="tablist">
              {tabs.map(([key, label, icon]) => (
                <button key={key} type="button" role="tab" aria-selected={tab === key}
                  className={`fx-tab${tab === key ? ' fx-tab--on' : ''}`} onClick={() => setTab(key)}>
                  <Icon name={icon} size={14} /> {label}
                </button>
              ))}
            </div>
            {tab === 'summary' && <SummaryTab c={c} save={save} saving={saving} />}
            {tab === 'activity' && <ActivityTab customerId={customerId} version={version} />}
            {tab === 'orders' && <OrdersTab customerId={customerId} version={version} onOpen={setOrderId} />}
          </>
        )}
      </Modal>

      {editing && c && (
        <CustomerForm title="Editar cliente" initial={c} customerId={c.id} onClose={() => setEditing(false)}
          onSaved={(updated) => { setEditing(false); changed(updated) }} />
      )}
      {orderId && <OrderDetailModal orderId={orderId} onClose={() => setOrderId(null)} onChanged={() => { reload(); changed() }} />}
    </>
  )
}

// ─── Listado ─────────────────────────────────────────────────────────────────

const NO_FILTERS = { segment: '', source: '', marketingAllowed: '', lastPurchaseFrom: '', lastPurchaseTo: '' }

export default function CustomersPage() {
  const access = useAccess()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState('')
  const [filters, setFilters] = useState(NO_FILTERS)
  const [moreFilters, setMoreFilters] = useState(false)
  const [sort, setSort] = useState('lastOrderAt')
  const [page, setPage] = useState(0)
  const [creating, setCreating] = useState(false)
  const debouncedQuery = useDebounced(query)
  const canView = access.can('CUSTOMER_VIEW')
  const openId = Number(searchParams.get('customer')) || null

  const tags = useApi(() => api.get('/customers/tags'), [], { enabled: canView })
  const list = useApi(() => api.get('/customers', {
    q: debouncedQuery, tag, ...filters, sort, direction: sort === 'name' ? 'asc' : 'desc', page, size: 20,
  }), [debouncedQuery, tag, filters, sort, page], { enabled: canView })

  const setFilter = (key) => (e) => { setFilters((f) => ({ ...f, [key]: e.target.value })); setPage(0) }

  const openCustomer = (id) => {
    const next = new URLSearchParams(searchParams)
    if (id) next.set('customer', id); else next.delete('customer')
    setSearchParams(next, { replace: true })
  }

  if (access.ready && !canView) return <DashboardLayout><NoAccess module="Clientes" /></DashboardLayout>

  const result = list.data
  const extraFilters = Object.values(filters).filter(Boolean).length
  const filtered = debouncedQuery || tag || extraFilters > 0

  return (
    <DashboardLayout>
      <div className="fx-page-head">
        <div>
          <h1>Clientes</h1>
          <p>{result ? `${integer(result.totalElements)} ${result.totalElements === 1 ? 'cliente' : 'clientes'}${filtered ? ' con estos filtros' : ''}` : 'Quiénes te compran y cuánto'}</p>
        </div>
        {access.can('CUSTOMER_CREATE') && (
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
        <select className="fx-select" style={{ maxWidth: 170 }} value={filters.segment} onChange={setFilter('segment')} aria-label="Segmento">
          <option value="">Todos los segmentos</option>
          {Object.entries(CUSTOMER_SEGMENTS).map(([key, s]) => <option key={key} value={key}>{s.label}</option>)}
        </select>
        {tags.data?.length > 0 && (
          <select className="fx-select" style={{ maxWidth: 170 }} value={tag} onChange={(e) => { setTag(e.target.value); setPage(0) }} aria-label="Etiqueta">
            <option value="">Todas las etiquetas</option>
            {tags.data.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
        <select className="fx-select" style={{ maxWidth: 170 }} value={sort} onChange={(e) => { setSort(e.target.value); setPage(0) }} aria-label="Ordenar">
          {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <button type="button" className={`fx-btn ${moreFilters ? 'fx-btn--secondary' : 'fx-btn--ghost'}`} aria-expanded={moreFilters}
          onClick={() => setMoreFilters((v) => !v)}>
          <Icon name="sliders" size={15} /> Más filtros{extraFilters - (filters.segment ? 1 : 0) > 0 ? ` (${extraFilters - (filters.segment ? 1 : 0)})` : ''}
        </button>
      </div>

      {moreFilters && (
        <div className="fx-toolbar" style={{ marginTop: -4 }}>
          <select className="fx-select" style={{ maxWidth: 180 }} value={filters.source} onChange={setFilter('source')} aria-label="Origen">
            <option value="">Cualquier origen</option>
            {Object.entries(CUSTOMER_SOURCES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          <select className="fx-select" style={{ maxWidth: 200 }} value={filters.marketingAllowed} onChange={setFilter('marketingAllowed')} aria-label="Promociones">
            <option value="">Promociones: todos</option>
            <option value="true">Aceptan promociones</option>
            <option value="false">No quieren promociones</option>
          </select>
          <label className="fx-row" style={{ gap: 6, fontSize: 13 }}>
            Compró desde
            <input type="date" className="fx-input fx-input--sm" value={filters.lastPurchaseFrom} onChange={setFilter('lastPurchaseFrom')} />
          </label>
          <label className="fx-row" style={{ gap: 6, fontSize: 13 }}>
            hasta
            <input type="date" className="fx-input fx-input--sm" value={filters.lastPurchaseTo} onChange={setFilter('lastPurchaseTo')} />
          </label>
          {extraFilters > 0 && (
            <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={() => { setFilters(NO_FILTERS); setPage(0) }}>
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {list.error && <div style={{ marginBottom: 14 }}><ErrorState error={list.error} onRetry={list.reload} /></div>}

      <div className="fx-card">
        {list.loading && !result ? (
          <div className="fx-card__body">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="fx-skeleton" style={{ height: 40, marginBottom: 8 }} />)}</div>
        ) : !result?.content?.length ? (
          <EmptyState icon="customers"
            title={filtered ? 'Ningún cliente coincide' : 'Todavía no tenés clientes'}
            text={filtered ? 'Probá con otro nombre, segmento o filtro.' : 'Cada pedido de tu tienda registra al cliente automáticamente, con su teléfono y lo que compró.'} />
        ) : (
          <>
            <div className="fx-table-wrap" style={{ opacity: list.loading ? .6 : 1 }}>
              <table className="fx-table fx-table--stack">
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
                      <td className="fx-cell--main">
                        <div className="fx-table__strong fx-truncate fx-table__name" style={{ maxWidth: 240 }}>
                          {c.name}
                          {c.marketingOptOut && (
                            <span title="No quiere recibir promociones" style={{ marginLeft: 6, color: 'var(--fx-muted)' }}>
                              <Icon name="bell" size={12} />
                            </span>
                          )}
                        </div>
                        <Segments segments={c.segments} />
                        <Tags tags={c.tags} />
                      </td>
                      <td className="fx-hide-sm" style={{ fontSize: 13 }}>
                        <div>{c.phone || '—'}</div>
                        {c.email && <div className="fx-hint" style={{ fontSize: 12 }}>{c.email}</div>}
                        {c.source && <div className="fx-hint" style={{ fontSize: 12 }}>{CUSTOMER_SOURCES[c.source] || c.source}</div>}
                      </td>
                      <td className="fx-table__num fx-cell--sub"><span className="fx-show-sm fx-hint">Compras </span>{integer(c.saleOrders)}</td>
                      <td className="fx-table__num fx-table__strong fx-cell--end">{money(c.totalSpent)}</td>
                      <td className="fx-hide-md" style={{ fontSize: 13 }}>{c.lastOrderAt ? date(c.lastOrderAt) : '—'}</td>
                      <td className="fx-cell--actions"><Icon name="chevronRight" size={15} style={{ color: 'var(--fx-muted)' }} /></td>
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
