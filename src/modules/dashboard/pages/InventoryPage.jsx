// src/modules/dashboard/pages/InventoryPage.jsx
// Control de existencias y trazabilidad: cada cambio de stock deja un movimiento.
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import Icon from '@/components/Icon'
import { api } from '@/app/api'
import useApi, { useDebounced } from '@/hooks/useApi'
import useAccess from '@/hooks/useAccess'
import { money, dateTime, integer, count } from '@/app/format'
import { EmptyState, ErrorState, Modal, NoAccess, Pagination, StatCard } from '@/modules/dashboard/components/ui'

const STOCK_FILTERS = [
  { key: 'all',       label: 'Todos' },
  { key: 'attention', label: 'Requieren atención' },
  { key: 'low',       label: 'Stock bajo' },
  { key: 'out',       label: 'Agotados' },
  { key: 'ok',        label: 'En orden' },
]

const MOVEMENT = {
  INITIAL:      { label: 'Stock inicial', badge: '' },
  ENTRY:        { label: 'Entrada',       badge: 'fx-badge--ok' },
  EXIT:         { label: 'Salida',        badge: 'fx-badge--warn' },
  ADJUSTMENT:   { label: 'Ajuste',        badge: 'fx-badge--brand' },
  SALE:         { label: 'Venta',         badge: '' },
  CANCELLATION: { label: 'Cancelación',   badge: 'fx-badge--ok' },
}

const STOCK_STATUS = {
  OUT: { label: 'Agotado', badge: 'fx-badge--danger' },
  LOW: { label: 'Stock bajo', badge: 'fx-badge--warn' },
  OK:  { label: 'En orden', badge: 'fx-badge--ok' },
}

const TYPES = [
  { key: 'ENTRY',      label: 'Entrada',          hint: 'Compra o reposición: suma al stock.' },
  { key: 'EXIT',       label: 'Salida',           hint: 'Merma, pérdida o consumo interno: resta del stock.' },
  { key: 'ADJUSTMENT', label: 'Ajuste por conteo', hint: 'Ingresá lo que contaste; se registra la diferencia.' },
]

function AdjustModal({ product, initialType = 'ENTRY', onClose, onSaved }) {
  const [type, setType] = useState(initialType)
  const [quantity, setQuantity] = useState(type === 'ADJUSTMENT' ? String(product.stock) : '')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const qty = Number.parseInt(quantity, 10)
  const valid = Number.isFinite(qty) && qty >= 0
  const after = !valid ? null : type === 'ENTRY' ? product.stock + qty : type === 'EXIT' ? product.stock - qty : qty
  const needsReason = type !== 'ENTRY'

  const submit = async (e) => {
    e.preventDefault()
    if (!valid || (type !== 'ADJUSTMENT' && qty === 0)) { setError('Ingresá una cantidad válida.'); return }
    if (after < 0) { setError(`No podés sacar más de lo que hay (${product.stock}).`); return }
    if (needsReason && !reason.trim()) { setError('Indicá el motivo: queda en el historial.'); return }
    setSaving(true)
    setError('')
    try {
      const movement = await api.post(`/inventory/products/${product.id}/movements`, { type, quantity: qty, reason })
      toast.success(`${product.name}: stock ${movement.stockBefore} → ${movement.stockAfter}.`)
      onSaved(movement)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal as="form" onSubmit={submit} title={product.name} subtitle={`Stock actual: ${product.stock} · mínimo ${product.minStock}`} onClose={onClose} width={480}
      footer={(
        <>
          <button type="button" className="fx-btn fx-btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="fx-btn fx-btn--primary" disabled={saving}>
            {saving ? <><span className="fx-spinner" /> Guardando…</> : 'Registrar movimiento'}
          </button>
        </>
      )}
    >
      <div className="fx-roles" style={{ marginBottom: 16 }}>
        {TYPES.map((t) => (
          <button key={t.key} type="button" className={`fx-role${type === t.key ? ' is-on' : ''}`}
            onClick={() => { setType(t.key); setQuantity(t.key === 'ADJUSTMENT' ? String(product.stock) : ''); setError('') }}>
            <strong>{t.label}</strong>
            <span>{t.hint}</span>
          </button>
        ))}
      </div>
      <div className="fx-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'end' }}>
        <div className="fx-field">
          <label className="fx-label" htmlFor="mv-qty">{type === 'ADJUSTMENT' ? 'Stock contado' : 'Cantidad'}</label>
          <input id="mv-qty" className="fx-input" type="number" min="0" step="1" value={quantity} autoFocus onChange={(e) => setQuantity(e.target.value)} />
        </div>
        <div className="fx-field">
          <div className="fx-hint" style={{ fontSize: 13.5, paddingBottom: 10 }}>
            Quedará en <strong className="fx-num" style={{ color: after !== null && after < 0 ? 'var(--fx-danger)' : 'var(--fx-ink)' }}>{after ?? '—'}</strong>
          </div>
        </div>
      </div>
      <div className="fx-field" style={{ marginBottom: 0 }}>
        <label className="fx-label" htmlFor="mv-reason">Motivo{needsReason ? '' : ' (opcional)'}</label>
        <input id="mv-reason" className="fx-input" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300}
          placeholder={type === 'ENTRY' ? 'Compra a proveedor, factura…' : type === 'EXIT' ? 'Producto vencido, dañado…' : 'Conteo de fin de mes…'} />
      </div>
      {error && <div className="fx-alert fx-alert--error" style={{ marginTop: 14 }}><span>{error}</span></div>}
    </Modal>
  )
}

function MinStockCell({ item, canEdit, onSaved }) {
  const [value, setValue] = useState(String(item.minStock))
  if (!canEdit) return <span className="fx-num">{item.minStock}</span>
  const commit = async () => {
    const next = Number.parseInt(value, 10)
    if (!Number.isFinite(next) || next < 0) { setValue(String(item.minStock)); return }
    if (next === item.minStock) return
    try {
      onSaved(await api.put(`/inventory/products/${item.id}/min-stock`, { minStock: next }))
      toast.success('Stock mínimo actualizado.')
    } catch (err) {
      toast.error(err.message)
      setValue(String(item.minStock))
    }
  }
  return (
    <input className="fx-inline-edit" style={{ width: 70 }} type="number" min="0" value={value} aria-label={`Stock mínimo de ${item.name}`}
      onChange={(e) => setValue(e.target.value)} onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }} />
  )
}

export default function InventoryPage() {
  const access = useAccess()
  const canView = access.can('INVENTORY_VIEW')
  const canAdjust = access.can('INVENTORY_ADJUST')
  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setView] = useState(() => (searchParams.get('product') ? 'movements' : 'stock'))
  const [filter, setFilter] = useState(() => searchParams.get('filter') || 'all')
  const [query, setQuery] = useState('')
  const [stockPage, setStockPage] = useState(0)
  const [movementType, setMovementType] = useState('')
  const [movementPage, setMovementPage] = useState(0)
  const [productFilter, setProductFilter] = useState(() => {
    const id = Number(searchParams.get('product'))
    return id ? { id, name: `Producto #${id}` } : null
  })
  const [adjusting, setAdjusting] = useState(null)
  const debouncedQuery = useDebounced(query)

  const summary = useApi(() => api.get('/inventory/summary'), [], { enabled: canView })
  const stock = useApi(() => api.get('/inventory/stock', { q: debouncedQuery, filter, page: stockPage, size: 20 }),
    [debouncedQuery, filter, stockPage], { enabled: canView && view === 'stock' })
  const movements = useApi(() => api.get('/inventory/movements', {
    productId: productFilter?.id, type: movementType, page: movementPage, size: 30,
  }), [productFilter?.id, movementType, movementPage], { enabled: canView && view === 'movements' })

  const showHistory = (item) => {
    setProductFilter({ id: item.id, name: item.name })
    setMovementPage(0)
    setView('movements')
    setSearchParams({ product: item.id }, { replace: true })
  }

  const clearProduct = () => {
    setProductFilter(null)
    setMovementPage(0)
    setSearchParams({}, { replace: true })
  }

  if (access.ready && !canView) return <DashboardLayout><NoAccess module="Inventario" /></DashboardLayout>

  const s = summary.data
  const stockResult = stock.data
  const movementResult = movements.data
  // El nombre real llega con los movimientos cuando se entró por URL.
  const productName = productFilter && movementResult?.content?.[0]?.productId === productFilter.id
    ? movementResult.content[0].productName : productFilter?.name

  return (
    <DashboardLayout>
      <div className="fx-page-head">
        <div>
          <h1>Inventario</h1>
          <p>Stock, alertas y movimientos de tus productos</p>
        </div>
      </div>

      <div className="fx-stats" style={{ marginBottom: 18 }}>
        <StatCard loading={!s} icon="products" label="Productos" value={integer(s?.products)} foot="con control de stock" />
        <StatCard loading={!s} icon="inventory" label="Stock bajo" value={integer(s?.lowStock)} foot="por debajo del mínimo" tone={s?.lowStock ? 'warn' : undefined} />
        <StatCard loading={!s} icon="warning" label="Agotados" value={integer(s?.outOfStock)} foot="sin unidades" tone={s?.outOfStock ? 'danger' : undefined} />
        <StatCard loading={!s} icon="money" label="Valor del stock" value={money(s?.inventoryValue)}
          foot={s && (s.withoutCost ? `${count(s.withoutCost, 'producto')} sin costo cargado` : 'valorizado a costo')} />
      </div>

      <div className="fx-tabs" style={{ marginBottom: 14, display: 'inline-flex' }} role="tablist">
        <button role="tab" aria-selected={view === 'stock'} className={`fx-tab${view === 'stock' ? ' fx-tab--on' : ''}`} onClick={() => setView('stock')}>Stock</button>
        <button role="tab" aria-selected={view === 'movements'} className={`fx-tab${view === 'movements' ? ' fx-tab--on' : ''}`} onClick={() => setView('movements')}>
          <Icon name="history" size={14} /> Movimientos
        </button>
      </div>

      {view === 'stock' ? (
        <>
          <div className="fx-toolbar">
            <div className="fx-search">
              <Icon name="search" size={16} />
              <input className="fx-input" placeholder="Buscar por nombre o SKU" value={query} onChange={(e) => { setQuery(e.target.value); setStockPage(0) }} />
            </div>
            <select className="fx-select" style={{ maxWidth: 200 }} value={filter} onChange={(e) => { setFilter(e.target.value); setStockPage(0) }} aria-label="Filtrar stock">
              {STOCK_FILTERS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
            </select>
          </div>

          {stock.error && <div style={{ marginBottom: 14 }}><ErrorState error={stock.error} onRetry={stock.reload} /></div>}

          <div className="fx-card">
            {stock.loading && !stockResult ? (
              <div className="fx-card__body">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="fx-skeleton" style={{ height: 44, marginBottom: 8 }} />)}</div>
            ) : !stockResult?.content?.length ? (
              <EmptyState icon="inventory"
                title={filter !== 'all' || debouncedQuery ? 'Ningún producto en esta vista' : 'Todavía no hay productos'}
                text={filter === 'attention' || filter === 'low' || filter === 'out'
                  ? 'Buenas noticias: ningún producto está por debajo de su stock mínimo.'
                  : 'Cuando cargues productos, vas a controlar su stock desde acá.'} />
            ) : (
              <>
                <div className="fx-table-wrap" style={{ opacity: stock.loading ? .6 : 1 }}>
                  <table className="fx-table fx-table--stack">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th className="fx-hide-md">Categoría</th>
                        <th className="fx-table__num">Stock</th>
                        <th className="fx-table__num">Mínimo</th>
                        <th className="fx-hide-sm">Estado</th>
                        <th style={{ width: 150 }} />
                      </tr>
                    </thead>
                    <tbody>
                      {stockResult.content.map((item) => (
                        <tr key={item.id}>
                          <td className="fx-cell--main">
                            <div className="fx-row" style={{ gap: 10 }}>
                              <div className="fx-thumb">{item.imageUrl ? <img src={item.imageUrl} alt="" /> : <Icon name="image" size={14} />}</div>
                              <div style={{ minWidth: 0 }}>
                                <div className="fx-table__strong fx-truncate fx-table__name" style={{ maxWidth: 240 }}>{item.name}</div>
                                <div className="fx-hint" style={{ fontSize: 12 }}>{item.sku ? `SKU ${item.sku}` : 'Sin SKU'}{item.status === 'HIDDEN' ? ' · Oculto' : ''}</div>
                              </div>
                            </div>
                          </td>
                          <td className="fx-hide-md">{item.category || <span className="fx-hint">—</span>}</td>
                          <td className="fx-table__num fx-table__strong fx-cell--sub" style={{ fontSize: 15 }}><span className="fx-show-sm fx-hint">Stock </span>{integer(item.stock)}</td>
                          <td className="fx-table__num fx-cell--end">
                            <span className="fx-show-sm fx-hint">Mínimo </span>
                            <MinStockCell key={`${item.id}-${item.minStock}`} item={item} canEdit={canAdjust}
                              onSaved={(updated) => { stock.setData((d) => ({ ...d, content: d.content.map((x) => (x.id === updated.id ? updated : x)) })); summary.refresh() }} />
                          </td>
                          <td className="fx-hide-sm"><span className={`fx-badge ${STOCK_STATUS[item.stockStatus].badge}`}>{STOCK_STATUS[item.stockStatus].label}</span></td>
                          <td className="fx-cell--actions">
                            <div className="fx-row" style={{ gap: 2, justifyContent: 'flex-end' }}>
                              {canAdjust && (
                                <>
                                  <button className="fx-btn fx-btn--ghost fx-btn--icon" title="Entrada" aria-label={`Registrar entrada de ${item.name}`} onClick={() => setAdjusting({ item, type: 'ENTRY' })}>
                                    <Icon name="plus" size={15} />
                                  </button>
                                  <button className="fx-btn fx-btn--ghost fx-btn--icon" title="Salida" aria-label={`Registrar salida de ${item.name}`} onClick={() => setAdjusting({ item, type: 'EXIT' })}>
                                    <Icon name="minus" size={15} />
                                  </button>
                                  <button className="fx-btn fx-btn--ghost fx-btn--icon" title="Ajuste por conteo" aria-label={`Ajustar stock de ${item.name}`} onClick={() => setAdjusting({ item, type: 'ADJUSTMENT' })}>
                                    <Icon name="sliders" size={15} />
                                  </button>
                                </>
                              )}
                              <button className="fx-btn fx-btn--ghost fx-btn--icon" title="Historial" aria-label={`Historial de ${item.name}`} onClick={() => showHistory(item)}>
                                <Icon name="history" size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={stockResult.page} totalPages={stockResult.totalPages} totalElements={stockResult.totalElements}
                  size={stockResult.size} onChange={setStockPage} noun="productos" />
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="fx-toolbar" style={{ alignItems: 'center' }}>
            <select className="fx-select" style={{ maxWidth: 200 }} value={movementType} onChange={(e) => { setMovementType(e.target.value); setMovementPage(0) }} aria-label="Tipo de movimiento">
              <option value="">Todos los movimientos</option>
              {Object.entries(MOVEMENT).map(([key, m]) => <option key={key} value={key}>{m.label}</option>)}
            </select>
            {productFilter && (
              <span className="fx-chip" style={{ padding: '5px 10px', fontSize: 13 }}>
                {productName}
                <button type="button" onClick={clearProduct} aria-label="Ver todos los productos"><Icon name="close" size={12} /></button>
              </span>
            )}
          </div>

          {movements.error && <div style={{ marginBottom: 14 }}><ErrorState error={movements.error} onRetry={movements.reload} /></div>}

          <div className="fx-card">
            {movements.loading && !movementResult ? (
              <div className="fx-card__body">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="fx-skeleton" style={{ height: 40, marginBottom: 8 }} />)}</div>
            ) : !movementResult?.content?.length ? (
              <EmptyState icon="history" title="Sin movimientos" text="Las ventas, cancelaciones, entradas y ajustes van a quedar registrados acá." />
            ) : (
              <>
                <div className="fx-table-wrap" style={{ opacity: movements.loading ? .6 : 1 }}>
                  <table className="fx-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Producto</th>
                        <th>Tipo</th>
                        <th className="fx-table__num">Cantidad</th>
                        <th className="fx-table__num fx-hide-sm">Stock</th>
                        <th className="fx-hide-md">Detalle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movementResult.content.map((m) => (
                        <tr key={m.id}>
                          <td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{dateTime(m.createdAt)}</td>
                          <td className="fx-table__strong fx-truncate" style={{ maxWidth: 200 }}>{m.productName}</td>
                          <td><span className={`fx-badge ${MOVEMENT[m.type]?.badge || ''}`}>{MOVEMENT[m.type]?.label || m.type}</span></td>
                          <td className="fx-table__num fx-table__strong" style={{ color: m.quantity > 0 ? 'var(--fx-ok)' : m.quantity < 0 ? 'var(--fx-danger)' : undefined }}>
                            {m.quantity > 0 ? '+' : ''}{m.quantity}
                          </td>
                          <td className="fx-table__num fx-hide-sm fx-hint">{m.stockBefore} → <strong style={{ color: 'var(--fx-ink)' }}>{m.stockAfter}</strong></td>
                          <td className="fx-hide-md" style={{ fontSize: 13 }}>
                            <div>{m.reason || m.reference || '—'}</div>
                            <div className="fx-hint" style={{ fontSize: 12 }}>{[m.reason && m.reference, m.createdBy].filter(Boolean).join(' · ')}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={movementResult.page} totalPages={movementResult.totalPages} totalElements={movementResult.totalElements}
                  size={movementResult.size} onChange={setMovementPage} noun="movimientos" />
              </>
            )}
          </div>
        </>
      )}

      {adjusting && (
        <AdjustModal
          product={adjusting.item}
          initialType={adjusting.type}
          onClose={() => setAdjusting(null)}
          onSaved={() => { setAdjusting(null); stock.refresh(); summary.refresh(); if (view === 'movements') movements.refresh() }}
        />
      )}
    </DashboardLayout>
  )
}
