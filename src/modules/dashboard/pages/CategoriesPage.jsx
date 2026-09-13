// src/modules/dashboard/pages/CategoriesPage.jsx
// Organización del catálogo y orden en que se muestra en la tienda.
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import Icon from '@/components/Icon'
import { api } from '@/app/api'
import useApi from '@/hooks/useApi'
import useAccess from '@/hooks/useAccess'
import { integer, count } from '@/app/format'
import { ConfirmDialog, EmptyState, ErrorState, Modal, NoAccess } from '@/modules/dashboard/components/ui'

// El símbolo es un dato que se muestra en la tienda pública, así que se conserva.
const EMOJI_OPTIONS = ['📦','🍕','🍔','🍣','☕','🍰','👕','👗','👟','💄','📱','💻','🎮','🛋️','🌸','💊','🏋️','📚','🎵','🧴','🐾','🌿']

function EmojiSelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onClick = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <div ref={wrapRef} style={{ position: 'relative', flexShrink: 0 }}>
      <button type="button" className="fx-btn fx-btn--secondary" style={{ width: 62, padding: 0, height: 40 }}
        onClick={() => setOpen((prev) => !prev)} aria-label="Elegir símbolo de la categoría">
        <span style={{ fontSize: 17 }}>{value || '📦'}</span>
        <Icon name="chevronDown" size={13} />
      </button>
      {open && (
        <div className="fx-emoji-pop">
          {EMOJI_OPTIONS.map((emoji) => (
            <button key={emoji} type="button" className={`fx-emoji-pop__item${emoji === value ? ' is-on' : ''}`}
              onClick={() => { onChange(emoji); setOpen(false) }}>
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function CategoryForm({ category, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: category?.name || '', emoji: category?.emoji || '📦', description: category?.description || '', active: category?.active ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return }
    setSaving(true)
    setError('')
    try {
      const saved = category ? await api.put(`/categories/${category.id}`, form) : await api.post('/categories', form)
      toast.success(category ? 'Categoría actualizada.' : 'Categoría creada.')
      onSaved(saved)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal as="form" onSubmit={submit} title={category ? 'Editar categoría' : 'Nueva categoría'} onClose={onClose} width={480}
      footer={(
        <>
          <button type="button" className="fx-btn fx-btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="fx-btn fx-btn--primary" disabled={saving}>
            {saving ? <><span className="fx-spinner" /> Guardando…</> : 'Guardar'}
          </button>
        </>
      )}
    >
      <label className="fx-label" htmlFor="cat-name">Nombre</label>
      <div className="fx-row" style={{ gap: 8, marginBottom: 16 }}>
        <EmojiSelect value={form.emoji} onChange={(emoji) => setForm((f) => ({ ...f, emoji }))} />
        <input id="cat-name" className="fx-input" value={form.name} maxLength={80} autoFocus
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Bebidas, accesorios…" />
      </div>
      <div className="fx-field">
        <label className="fx-label" htmlFor="cat-desc">Descripción</label>
        <textarea id="cat-desc" className="fx-textarea" style={{ minHeight: 70 }} maxLength={300} value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Opcional" />
      </div>
      <label className="fx-check">
        <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
        <span>Activa: se muestra en la tienda. Si la desactivás, sus productos siguen visibles pero sin esta categoría como filtro.</span>
      </label>
      {error && <div className="fx-alert fx-alert--error" style={{ marginTop: 14 }}><span>{error}</span></div>}
    </Modal>
  )
}

export default function CategoriesPage() {
  const access = useAccess()
  const canView = access.can('PRODUCT_VIEW')
  const canEdit = access.can('PRODUCT_UPDATE')
  const { data: categories, loading, error, reload, setData } = useApi(() => api.get('/categories'), [], { enabled: canView })
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const move = async (index, offset) => {
    const list = [...categories]
    const target = index + offset
    if (target < 0 || target >= list.length) return
    ;[list[index], list[target]] = [list[target], list[index]]
    setData(list)
    try {
      setData(await api.put('/categories/order', { ids: list.map((c) => c.id) }))
    } catch (err) {
      toast.error(err.message)
      reload()
    }
  }

  const toggleActive = async (category) => {
    try {
      const updated = await api.put(`/categories/${category.id}`, { active: !category.active })
      setData((list) => list.map((c) => (c.id === updated.id ? updated : c)))
      toast.success(updated.active ? `${updated.name} vuelve a mostrarse en la tienda.` : `${updated.name} ya no se muestra en la tienda.`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      const r = await api.del(`/categories/${deleting.id}`)
      toast.success(r.productsUnassigned ? `Categoría eliminada. ${r.productsUnassigned} productos quedaron sin categoría.` : 'Categoría eliminada.')
      setDeleting(null)
      reload()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (access.ready && !canView) return <DashboardLayout><NoAccess module="Categorías" /></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="fx-page-head">
        <div>
          <h1>Categorías</h1>
          <p>{categories ? `${count(categories.length, 'categoría')} · el orden de esta lista es el de tu tienda` : 'Organizá tu catálogo'}</p>
        </div>
        {access.can('PRODUCT_CREATE') && (
          <div className="fx-page-head__actions">
            <button className="fx-btn fx-btn--primary" onClick={() => setEditing('new')}>
              <Icon name="plus" size={16} /> Nueva categoría
            </button>
          </div>
        )}
      </div>

      {error && <div style={{ marginBottom: 14 }}><ErrorState error={error} onRetry={reload} /></div>}

      <div className="fx-card">
        {loading && !categories ? (
          <div className="fx-card__body">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="fx-skeleton" style={{ height: 44, marginBottom: 8 }} />)}</div>
        ) : !categories?.length ? (
          <EmptyState icon="categories" title="Todavía no creaste categorías"
            text="Las categorías agrupan tus productos y aparecen como filtros en la tienda para que tus clientes encuentren rápido lo que buscan."
            action={access.can('PRODUCT_CREATE') && <button className="fx-btn fx-btn--primary" onClick={() => setEditing('new')}><Icon name="plus" size={16} /> Nueva categoría</button>} />
        ) : (
          <div className="fx-table-wrap">
            <table className="fx-table">
              <thead>
                <tr>
                  {canEdit && <th style={{ width: 76 }}>Orden</th>}
                  <th>Categoría</th>
                  <th className="fx-table__num">Productos</th>
                  <th className="fx-hide-sm">Estado</th>
                  <th style={{ width: 120 }} />
                </tr>
              </thead>
              <tbody>
                {categories.map((c, i) => (
                  <tr key={c.id}>
                    {canEdit && (
                      <td>
                        <div className="fx-row" style={{ gap: 0 }}>
                          <button className="fx-btn fx-btn--ghost fx-btn--icon" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Subir ${c.name}`}>
                            <Icon name="arrowUp" size={14} />
                          </button>
                          <button className="fx-btn fx-btn--ghost fx-btn--icon" disabled={i === categories.length - 1} onClick={() => move(i, 1)} aria-label={`Bajar ${c.name}`}>
                            <Icon name="arrowDown" size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                    <td>
                      <div className="fx-row" style={{ gap: 10 }}>
                        <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{c.emoji || '📦'}</span>
                        <div style={{ minWidth: 0 }}>
                          <div className="fx-table__strong">{c.name}</div>
                          {c.description && <div className="fx-hint fx-truncate" style={{ fontSize: 12.5, maxWidth: 360 }}>{c.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="fx-table__num">
                      <Link className="fx-link" to="/dashboard/products" style={{ fontSize: 13.5 }}>{integer(c.productCount)}</Link>
                    </td>
                    <td className="fx-hide-sm">
                      {c.active ? <span className="fx-badge fx-badge--ok"><span className="fx-dot" />Activa</span> : <span className="fx-badge">Inactiva</span>}
                    </td>
                    <td>
                      <div className="fx-row" style={{ gap: 2, justifyContent: 'flex-end' }}>
                        {canEdit && (
                          <>
                            <button className="fx-btn fx-btn--ghost fx-btn--icon" onClick={() => toggleActive(c)} title={c.active ? 'Desactivar' : 'Activar'} aria-label={c.active ? `Desactivar ${c.name}` : `Activar ${c.name}`}>
                              <Icon name={c.active ? 'eyeOff' : 'eye'} size={15} />
                            </button>
                            <button className="fx-btn fx-btn--ghost fx-btn--icon" onClick={() => setEditing(c)} aria-label={`Editar ${c.name}`}>
                              <Icon name="edit" size={15} />
                            </button>
                          </>
                        )}
                        {access.can('PRODUCT_DELETE') && (
                          <button className="fx-btn fx-btn--ghost fx-btn--icon" style={{ color: 'var(--fx-danger)' }} onClick={() => setDeleting(c)} aria-label={`Eliminar ${c.name}`}>
                            <Icon name="trash" size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <CategoryForm category={editing === 'new' ? null : editing} onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload() }} />
      )}
      {deleting && (
        <ConfirmDialog
          title="Eliminar categoría"
          text={deleting.productCount
            ? `“${deleting.name}” tiene ${deleting.productCount} productos. No se borran: quedan sin categoría.`
            : `“${deleting.name}” se eliminará de tu catálogo.`}
          confirmLabel="Eliminar"
          danger
          busy={busy}
          onClose={() => setDeleting(null)}
          onConfirm={remove}
        />
      )}
    </DashboardLayout>
  )
}
