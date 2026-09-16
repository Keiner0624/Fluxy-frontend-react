// src/modules/dashboard/pages/ProductsPage.jsx
// Administración del catálogo. El stock se muestra, pero se mueve en Inventario.
import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import Icon from '@/components/Icon'
import { api } from '@/app/api'
import { uploadImage, validateImage } from '@/app/cloudinary'
import useApi, { useDebounced } from '@/hooks/useApi'
import useAccess from '@/hooks/useAccess'
import { money, integer, count } from '@/app/format'
import {
  ConfirmDialog, EmptyState, ErrorState, Modal, NoAccess, Pagination, StatCard,
} from '@/modules/dashboard/components/ui'

const SORTS = [
  { key: 'createdAt:desc', label: 'Más recientes' },
  { key: 'name:asc',       label: 'Nombre (A-Z)' },
  { key: 'price:asc',      label: 'Precio: menor a mayor' },
  { key: 'price:desc',     label: 'Precio: mayor a menor' },
  { key: 'stock:asc',      label: 'Stock: menor a mayor' },
  { key: 'stock:desc',     label: 'Stock: mayor a menor' },
]
const EMPTY_FORM = { name: '', sku: '', price: '', cost: '', stock: '', minStock: '5', categoryId: '', status: 'ACTIVE', description: '', imageUrl: '' }

function stockState(p) {
  if (p.stock <= 0) return { label: 'Agotado', badge: 'fx-badge--danger' }
  if (p.stock <= (p.minStock ?? 5)) return { label: `${p.stock} · bajo`, badge: 'fx-badge--warn' }
  return { label: String(p.stock), badge: '' }
}

function PriceCell({ product, canEdit, onSaved }) {
  const [value, setValue] = useState(product.price.toFixed(2))
  const [saving, setSaving] = useState(false)
  if (!canEdit) return <span className="fx-table__strong">{money(product.price)}</span>

  const commit = async () => {
    const price = Number(value)
    if (!Number.isFinite(price) || price < 0) { setValue(product.price.toFixed(2)); toast.error('Precio inválido.'); return }
    if (Math.abs(price - product.price) < 0.001) { setValue(product.price.toFixed(2)); return }
    setSaving(true)
    try {
      const updated = await api.patch(`/products/${product.id}`, { price })
      toast.success(`Precio de ${updated.name} actualizado.`)
      onSaved(updated)
    } catch (err) {
      toast.error(err.message)
      setValue(product.price.toFixed(2))
    } finally {
      setSaving(false)
    }
  }

  return (
    <label className="fx-row" style={{ gap: 4, justifyContent: 'flex-end' }} title="Editar precio">
      <span className="fx-hint" style={{ fontSize: 12.5 }}>S/</span>
      <input
        className="fx-inline-edit"
        type="number" min="0" step="0.01"
        value={value}
        disabled={saving}
        aria-label={`Precio de ${product.name}`}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') { setValue(product.price.toFixed(2)); e.currentTarget.blur() } }}
      />
    </label>
  )
}

function ProductForm({ product, categories, onClose, onSaved }) {
  const editing = Boolean(product)
  const [form, setForm] = useState(() => product ? {
    name: product.name, sku: product.sku || '', price: String(product.price), cost: product.cost ?? '',
    stock: String(product.stock), minStock: String(product.minStock ?? 5), categoryId: product.category?.id || '',
    status: product.status || 'ACTIVE', description: product.description || '', imageUrl: product.imageUrl || '',
  } : EMPTY_FORM)
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(product?.imageUrl || null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const onImage = (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    const invalid = validateImage(file)
    if (invalid) { setError(invalid); return }
    setError('')
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || form.price === '' || form.stock === '') { setError('Nombre, precio y stock son obligatorios.'); return }
    setSaving(true)
    setError('')
    try {
      let imageUrl = form.imageUrl.trim()
      if (imageFile) {
        setUploading(true)
        imageUrl = await uploadImage(imageFile)
        setUploading(false)
      }
      const body = {
        name: form.name.trim(),
        sku: form.sku.trim() || null,
        price: Number(form.price),
        cost: form.cost === '' ? null : Number(form.cost),
        stock: Number.parseInt(form.stock, 10),
        minStock: form.minStock === '' ? 5 : Number.parseInt(form.minStock, 10),
        status: form.status,
        description: form.description.trim(),
        imageUrl,
        category: form.categoryId ? { id: Number(form.categoryId) } : null,
      }
      const saved = editing ? await api.put(`/products/${product.id}`, body) : await api.post('/products', body)
      toast.success(editing ? 'Producto actualizado.' : 'Producto creado.')
      onSaved(saved)
    } catch (err) {
      setError(err.data?.upgradeRequired ? `${err.message}. Mejorá tu plan para cargar más productos.` : err.message)
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  return (
    <Modal as="form" onSubmit={submit} title={editing ? 'Editar producto' : 'Nuevo producto'} onClose={onClose} width={620}
      footer={(
        <>
          <button type="button" className="fx-btn fx-btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="fx-btn fx-btn--primary" disabled={saving}>
            {saving ? <><span className="fx-spinner" /> {uploading ? 'Subiendo imagen…' : 'Guardando…'}</> : editing ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </>
      )}
    >
      <div className="fx-grid fx-grid--main-side" style={{ gap: 12 }}>
        <div className="fx-field">
          <label className="fx-label" htmlFor="p-name">Nombre</label>
          <input id="p-name" className="fx-input" value={form.name} onChange={set('name')} maxLength={200} placeholder="Nombre del producto" />
        </div>
        <div className="fx-field">
          <label className="fx-label" htmlFor="p-sku">SKU</label>
          <input id="p-sku" className="fx-input" value={form.sku} onChange={set('sku')} maxLength={64} placeholder="Opcional" style={{ textTransform: 'uppercase' }} />
        </div>
      </div>

      <div className="fx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
        <div className="fx-field">
          <label className="fx-label" htmlFor="p-price">Precio (S/)</label>
          <input id="p-price" className="fx-input" type="number" step="0.01" min="0" value={form.price} onChange={set('price')} placeholder="0.00" />
        </div>
        <div className="fx-field">
          <label className="fx-label" htmlFor="p-cost">Costo (S/)</label>
          <input id="p-cost" className="fx-input" type="number" step="0.01" min="0" value={form.cost} onChange={set('cost')} placeholder="Opcional" />
        </div>
        <div className="fx-field">
          <label className="fx-label" htmlFor="p-stock">{editing ? 'Stock actual' : 'Stock inicial'}</label>
          <input id="p-stock" className="fx-input" type="number" min="0" value={form.stock} onChange={set('stock')} placeholder="0" disabled={editing} />
        </div>
        <div className="fx-field">
          <label className="fx-label" htmlFor="p-min">Stock mínimo</label>
          <input id="p-min" className="fx-input" type="number" min="0" value={form.minStock} onChange={set('minStock')} />
        </div>
      </div>
      {editing && (
        <p className="fx-hint" style={{ marginTop: -8, marginBottom: 14, fontSize: 12.5 }}>
          El stock se ajusta en <Link className="fx-link" to={`/dashboard/inventory?product=${product.id}`}>Inventario</Link>, donde queda registrado cada movimiento.
        </p>
      )}

      <div className="fx-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="fx-field">
          <label className="fx-label" htmlFor="p-cat">Categoría</label>
          <select id="p-cat" className="fx-select" value={form.categoryId} onChange={set('categoryId')}>
            <option value="">Sin categoría</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="fx-field">
          <label className="fx-label" htmlFor="p-status">Estado</label>
          <select id="p-status" className="fx-select" value={form.status} onChange={set('status')}>
            <option value="ACTIVE">Activo: visible en la tienda</option>
            <option value="HIDDEN">Oculto: no se muestra</option>
          </select>
        </div>
      </div>

      <div className="fx-field">
        <label className="fx-label" htmlFor="p-desc">Descripción</label>
        <textarea id="p-desc" className="fx-textarea" value={form.description} onChange={set('description')} placeholder="Detalles del producto (opcional)" />
      </div>

      <div className="fx-field" style={{ marginBottom: 0 }}>
        <span className="fx-label">Imagen</span>
        <div className="fx-row" style={{ gap: 12 }}>
          <div className="fx-thumb fx-thumb--lg">{preview ? <img src={preview} alt="" /> : <Icon name="image" size={20} />}</div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onImage} style={{ display: 'none' }} />
            <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" onClick={() => fileRef.current?.click()}>
              <Icon name="upload" size={15} /> {preview ? 'Cambiar imagen' : 'Subir imagen'}
            </button>
            <p className="fx-hint" style={{ marginTop: 6, fontSize: 12.5 }}>JPG o PNG, hasta 5 MB.</p>
          </div>
        </div>
      </div>

      {error && <div className="fx-alert fx-alert--error" style={{ marginTop: 14 }}><Icon name="alert" size={16} /><span>{error}</span></div>}
    </Modal>
  )
}

export default function ProductsPage() {
  const access = useAccess()
  const canView = access.can('PRODUCT_VIEW')
  const canUpdate = access.can('PRODUCT_UPDATE')
  const canDelete = access.can('PRODUCT_DELETE')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [stock, setStock] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sort, setSort] = useState('createdAt:desc')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState(() => new Set())
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [bulkBusy, setBulkBusy] = useState(false)
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)
  const debouncedQuery = useDebounced(query)
  const debouncedMin = useDebounced(minPrice, 500)
  const debouncedMax = useDebounced(maxPrice, 500)

  const [sortKey, direction] = sort.split(':')
  const stats = useApi(() => api.get('/products/stats'), [], { enabled: canView })
  const categories = useApi(() => api.get('/categories'), [], { enabled: canView })
  const list = useApi(() => api.get('/products/search', {
    q: debouncedQuery, category, status, stock, minPrice: debouncedMin, maxPrice: debouncedMax,
    sort: sortKey, direction, page, size: 20,
  }), [debouncedQuery, category, status, stock, debouncedMin, debouncedMax, sort, page], { enabled: canView })

  const filter = (setter) => (e) => { setter(e.target.value); setPage(0); setSelected(new Set()) }
  const refreshAll = () => { list.refresh(); stats.refresh() }
  const result = list.data
  const rows = result?.content || []
  const filtered = debouncedQuery || category || status || stock || debouncedMin || debouncedMax
  const allSelected = rows.length > 0 && rows.every((p) => selected.has(p.id))

  const toggle = (id) => setSelected((prev) => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id); else next.add(id)
    return next
  })
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(rows.map((p) => p.id)))

  const replaceRow = (updated) => list.setData((data) => data && ({
    ...data, content: data.content.map((p) => (p.id === updated.id ? updated : p)),
  }))

  const bulk = async (action, extra = {}) => {
    setBulkBusy(true)
    try {
      const r = await api.post('/products/bulk', { ids: [...selected], action, ...extra })
      const messages = {
        ACTIVATE: `${r.updated} productos activados.`,
        HIDE: `${r.updated} productos ocultos.`,
        SET_CATEGORY: `Categoría actualizada en ${r.updated} productos.`,
        DELETE: `${r.deleted} eliminados${r.hiddenInstead ? `; ${r.hiddenInstead} con pedidos quedaron ocultos` : ''}.`,
      }
      toast.success(messages[action])
      setSelected(new Set())
      setConfirmBulkDelete(false)
      refreshAll()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBulkBusy(false)
    }
  }

  const toggleStatus = async (p) => {
    try {
      const updated = await api.patch(`/products/${p.id}`, { status: p.status === 'HIDDEN' ? 'ACTIVE' : 'HIDDEN' })
      replaceRow(updated)
      stats.refresh()
      toast.success(updated.status === 'HIDDEN' ? `${updated.name} ya no se muestra en la tienda.` : `${updated.name} vuelve a estar visible.`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const remove = async () => {
    const product = deleting
    try {
      await api.del(`/products/${product.id}`)
      toast.success('Producto eliminado.')
      setDeleting(null)
      refreshAll()
    } catch (err) {
      if (err.code === 'PRODUCT_HAS_ORDERS') {
        setDeleting({ ...product, hasOrders: true, message: err.message })
      } else {
        toast.error(err.message)
      }
    }
  }

  if (access.ready && !canView) return <DashboardLayout><NoAccess module="Productos" /></DashboardLayout>

  const s = stats.data

  return (
    <DashboardLayout>
      <div className="fx-page-head">
        <div>
          <h1>Productos</h1>
          <p>{s ? `${integer(s.total)} ${s.total === 1 ? 'producto' : 'productos'} en tu catálogo` : 'Tu catálogo'}</p>
        </div>
        <div className="fx-page-head__actions">
          <Link to="/dashboard/categories" className="fx-btn fx-btn--secondary">
            <Icon name="categories" size={15} /> Categorías
          </Link>
          {access.can('PRODUCT_CREATE') && (
            <button className="fx-btn fx-btn--primary" onClick={() => setEditing('new')}>
              <Icon name="plus" size={16} /> Nuevo producto
            </button>
          )}
        </div>
      </div>

      <div className="fx-stats" style={{ marginBottom: 18 }}>
        <StatCard loading={!s} icon="products" label="Productos" value={integer(s?.active)} foot={s && `activos en catálogo${s.hidden ? ` · ${s.hidden} ocultos` : ''}`} />
        <StatCard loading={!s} icon="inventory" label="Stock bajo" value={integer(s?.lowStock)} foot="por debajo del mínimo" tone={s?.lowStock ? 'warn' : undefined} />
        <StatCard loading={!s} icon="warning" label="Agotados" value={integer(s?.outOfStock)} foot="sin disponibilidad" tone={s?.outOfStock ? 'danger' : undefined} />
        <StatCard loading={!s} icon="money" label="Valor del inventario" value={money(s?.inventoryValue)}
          foot={s && (s.withoutCost ? `${count(s.withoutCost, 'producto')} sin costo, a precio de venta` : 'a costo')} />
      </div>

      <div className="fx-toolbar">
        <div className="fx-search">
          <Icon name="search" size={16} />
          <input className="fx-input" placeholder="Buscar por nombre o SKU" value={query} onChange={filter(setQuery)} />
        </div>
        <select className="fx-select" style={{ maxWidth: 190 }} value={category} onChange={filter(setCategory)} aria-label="Categoría">
          <option value="">Categorías</option>
          <option value="none">Sin categoría</option>
          {(categories.data || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="fx-select" style={{ maxWidth: 150 }} value={status} onChange={filter(setStatus)} aria-label="Estado">
          <option value="">Estados</option>
          <option value="ACTIVE">Activos</option>
          <option value="HIDDEN">Ocultos</option>
        </select>
        <select className="fx-select" style={{ maxWidth: 150 }} value={stock} onChange={filter(setStock)} aria-label="Stock">
          <option value="">Todo el stock</option>
          <option value="low">Stock bajo</option>
          <option value="out">Agotados</option>
          <option value="in">Con stock</option>
        </select>
        <div className="fx-row" style={{ gap: 6 }}>
          <input className="fx-input" style={{ width: 92 }} type="number" min="0" placeholder="S/ mín." value={minPrice} onChange={filter(setMinPrice)} aria-label="Precio mínimo" />
          <input className="fx-input" style={{ width: 92 }} type="number" min="0" placeholder="S/ máx." value={maxPrice} onChange={filter(setMaxPrice)} aria-label="Precio máximo" />
        </div>
        <select className="fx-select" style={{ maxWidth: 200 }} value={sort} onChange={filter(setSort)} aria-label="Ordenar">
          {SORTS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
      </div>

      {list.error && <div style={{ marginBottom: 14 }}><ErrorState error={list.error} onRetry={list.reload} /></div>}

      <div className="fx-card">
        {selected.size > 0 && (canUpdate || canDelete) && (
          <div className="fx-bulkbar">
            <strong>{selected.size} {selected.size === 1 ? 'seleccionado' : 'seleccionados'}</strong>
            <span style={{ flex: 1 }} />
            {canUpdate && (
              <>
                <button className="fx-btn fx-btn--secondary fx-btn--sm" disabled={bulkBusy} onClick={() => bulk('ACTIVATE')}>Activar</button>
                <button className="fx-btn fx-btn--secondary fx-btn--sm" disabled={bulkBusy} onClick={() => bulk('HIDE')}>Ocultar</button>
                <select className="fx-select fx-select--sm" style={{ width: 'auto' }} value="" disabled={bulkBusy} aria-label="Cambiar categoría"
                  onChange={(e) => e.target.value && bulk('SET_CATEGORY', { categoryId: e.target.value === 'none' ? null : Number(e.target.value) })}>
                  <option value="">Cambiar categoría…</option>
                  <option value="none">Sin categoría</option>
                  {(categories.data || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </>
            )}
            {canDelete && (
              <button className="fx-btn fx-btn--danger fx-btn--sm" disabled={bulkBusy} onClick={() => setConfirmBulkDelete(true)}>
                <Icon name="trash" size={14} /> Eliminar
              </button>
            )}
            <button className="fx-btn fx-btn--ghost fx-btn--sm" onClick={() => setSelected(new Set())}>Limpiar</button>
          </div>
        )}

        {list.loading && !result ? (
          <div className="fx-card__body">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="fx-skeleton" style={{ height: 44, marginBottom: 8 }} />)}</div>
        ) : rows.length === 0 ? (
          <EmptyState icon="products"
            title={filtered ? 'Ningún producto coincide' : 'Todavía no cargaste productos'}
            text={filtered ? 'Probá con otro término o quitá algún filtro.' : 'Cargá tu primer producto para que aparezca en tu tienda.'}
            action={!filtered && access.can('PRODUCT_CREATE') && (
              <button className="fx-btn fx-btn--primary" onClick={() => setEditing('new')}><Icon name="plus" size={16} /> Nuevo producto</button>
            )} />
        ) : (
          <>
            <div className="fx-table-wrap" style={{ opacity: list.loading ? .6 : 1 }}>
              <table className="fx-table fx-table--stack">
                <thead>
                  <tr>
                    {(canUpdate || canDelete) && (
                      <th className="fx-table__check"><input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Seleccionar todos" /></th>
                    )}
                    <th className="fx-hide-sm" style={{ width: 52 }} />
                    <th>Producto</th>
                    <th className="fx-hide-md">Categoría</th>
                    <th className="fx-table__num">Precio</th>
                    <th className="fx-table__num">Stock</th>
                    <th className="fx-hide-sm">Estado</th>
                    <th style={{ width: 84 }} />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => {
                    const st = stockState(p)
                    return (
                      <tr key={p.id} className={selected.has(p.id) ? 'is-selected' : ''}>
                        {(canUpdate || canDelete) && (
                          <td className="fx-table__check"><input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} aria-label={`Seleccionar ${p.name}`} /></td>
                        )}
                        <td className="fx-hide-sm"><div className="fx-thumb">{p.imageUrl ? <img src={p.imageUrl} alt="" /> : <Icon name="image" size={15} />}</div></td>
                        <td className="fx-cell--main">
                          <div className="fx-table__strong fx-truncate fx-table__name">{p.name}</div>
                          <div className="fx-hint" style={{ fontSize: 12 }}>{p.sku ? `SKU ${p.sku}` : 'Sin SKU'}</div>
                        </td>
                        <td className="fx-hide-md">
                          {p.category ? <span className="fx-badge">{p.category.name}</span> : <span className="fx-hint">—</span>}
                        </td>
                        <td className="fx-table__num fx-cell--sub">
                          <PriceCell key={`${p.id}-${p.price}`} product={p} canEdit={canUpdate} onSaved={(u) => { replaceRow(u); stats.refresh() }} />
                        </td>
                        <td className="fx-table__num fx-cell--end"><span className={`fx-badge ${st.badge}`}>{st.label}</span></td>
                        <td className="fx-hide-sm">
                          {p.status === 'HIDDEN'
                            ? <span className="fx-badge">Oculto</span>
                            : p.stock <= 0 ? <span className="fx-badge fx-badge--danger">Agotado</span>
                              : <span className="fx-badge fx-badge--ok"><span className="fx-dot" />Activo</span>}
                        </td>
                        <td className="fx-cell--actions">
                          <div className="fx-row" style={{ gap: 2, justifyContent: 'flex-end' }}>
                            {canUpdate && (
                              <button className="fx-btn fx-btn--ghost fx-btn--icon" onClick={() => toggleStatus(p)}
                                title={p.status === 'HIDDEN' ? 'Mostrar en la tienda' : 'Ocultar de la tienda'} aria-label={p.status === 'HIDDEN' ? `Mostrar ${p.name}` : `Ocultar ${p.name}`}>
                                <Icon name={p.status === 'HIDDEN' ? 'eye' : 'eyeOff'} size={15} />
                              </button>
                            )}
                            {canUpdate && (
                              <button className="fx-btn fx-btn--ghost fx-btn--icon" onClick={() => setEditing(p)} aria-label={`Editar ${p.name}`} title="Editar">
                                <Icon name="edit" size={15} />
                              </button>
                            )}
                            {canDelete && (
                              <button className="fx-btn fx-btn--ghost fx-btn--icon" style={{ color: 'var(--fx-danger)' }} onClick={() => setDeleting(p)} aria-label={`Eliminar ${p.name}`} title="Eliminar">
                                <Icon name="trash" size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={result.page} totalPages={result.totalPages} totalElements={result.totalElements}
              size={result.size} onChange={(p) => { setPage(p); setSelected(new Set()) }} noun="productos" />
          </>
        )}
      </div>

      {editing && (
        <ProductForm
          product={editing === 'new' ? null : editing}
          categories={categories.data || []}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refreshAll(); categories.refresh() }}
        />
      )}

      {deleting && (
        deleting.hasOrders ? (
          <ConfirmDialog
            title="No se puede eliminar"
            text={deleting.message}
            confirmLabel={canUpdate ? 'Ocultar producto' : 'Entendido'}
            onClose={() => setDeleting(null)}
            onConfirm={async () => {
              if (canUpdate && deleting.status !== 'HIDDEN') await toggleStatus(deleting)
              setDeleting(null)
            }}
          />
        ) : (
          <ConfirmDialog
            title="Eliminar producto"
            text={`“${deleting.name}” se eliminará de tu catálogo y dejará de verse en la tienda. Esta acción no se puede deshacer.`}
            confirmLabel="Eliminar"
            danger
            onClose={() => setDeleting(null)}
            onConfirm={remove}
          />
        )
      )}

      {confirmBulkDelete && (
        <ConfirmDialog
          title={`Eliminar ${selected.size} productos`}
          text="Los productos con pedidos registrados no se borran: quedan ocultos para conservar el historial de ventas."
          confirmLabel="Eliminar"
          danger
          busy={bulkBusy}
          onClose={() => setConfirmBulkDelete(false)}
          onConfirm={() => bulk('DELETE')}
        />
      )}
    </DashboardLayout>
  )
}
