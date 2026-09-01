// src/modules/dashboard/pages/ProductsPage.jsx
import { useState, useEffect, useRef } from 'react'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import { API_URL } from '@/app/config'
import { ProductCardSkeleton } from '@/components/Skeleton'
import Icon from '@/components/Icon'

const CLOUDINARY_CLOUD  = import.meta.env.VITE_CLOUDINARY_CLOUD  || 'dklhbrw7s'
const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET || 'fluxy_unsigned'
const MAX_IMAGE_SIZE    = 5 * 1024 * 1024

function formatPrice(price) {
  const value = Number(price)
  return Number.isFinite(value) ? value.toFixed(2) : '0.00'
}

async function uploadToCloudinary(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_PRESET)
  const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: 'POST', body: formData })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || 'Error al subir imagen')
  return data.secure_url
}

function getToken() { return localStorage.getItem('token') || '' }

// El emoji de la categoría es un dato que se muestra en la tienda pública,
// así que se conserva; sólo cambia la presentación del selector.
const EMOJI_OPTIONS = ['📦','🍕','🍔','🍣','☕','🍰','👕','👗','👟','💄','📱','💻','🎮','🛋️','🌸','💊','🏋️','📚','🎵','🧴','🐾','🌿']

function EmojiSelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false) }
    const handleKey   = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown',   handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown',   handleKey)
    }
  }, [open])

  return (
    <div ref={wrapRef} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        className="fx-btn fx-btn--secondary"
        style={{ width: 62, padding: 0, height: 40 }}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Elegir símbolo de la categoría"
      >
        <span style={{ fontSize: 17 }}>{value || '📦'}</span>
        <Icon name="chevronDown" size={13} />
      </button>

      {open && (
        <div className="fx-emoji-pop">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={`fx-emoji-pop__item${emoji === value ? ' is-on' : ''}`}
              onClick={() => { onChange(emoji); setOpen(false) }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Modal categorías ────────────────────────────────────────────────────────
function CategoriesModal({ onClose, categories, setCategories }) {
  const [newName, setNewName]     = useState('')
  const [newEmoji, setNewEmoji]   = useState('📦')
  const [saving, setSaving]       = useState(false)
  const [editId, setEditId]       = useState(null)
  const [editName, setEditName]   = useState('')
  const [editEmoji, setEditEmoji] = useState('')
  const [error, setError]         = useState('')

  const handleCreate = async () => {
    if (!newName.trim()) return
    setSaving(true); setError('')
    try {
      const res  = await fetch(`${API_URL}/categories`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ name: newName.trim(), emoji: newEmoji }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCategories(prev => [...prev, data]); setNewName(''); setNewEmoji('📦')
    } catch (err) { setError(err.message || 'No se pudo crear la categoría') }
    finally { setSaving(false) }
  }

  const handleEdit = async (id) => {
    setError('')
    try {
      const res  = await fetch(`${API_URL}/categories/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ name: editName, emoji: editEmoji }) })
      const data = await res.json()
      setCategories(prev => prev.map(c => c.id === id ? data : c)); setEditId(null)
    } catch { setError('No se pudo editar la categoría') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return
    setError('')
    try {
      await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
      setCategories(prev => prev.filter(c => c.id !== id))
    } catch { setError('No se pudo eliminar la categoría') }
  }

  return (
    <div className="fx-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="fx-modal__panel" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="fx-modal__head">
          <h2 className="fx-h2">Categorías</h2>
          <button className="fx-btn fx-btn--ghost fx-btn--icon" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" size={17} />
          </button>
        </div>

        <div className="fx-modal__body">
          <p className="fx-eyebrow" style={{ marginBottom: 9 }}>Nueva categoría</p>
          <div className="fx-row" style={{ gap: 8, marginBottom: 20 }}>
            <EmojiSelect value={newEmoji} onChange={setNewEmoji} />
            <input
              className="fx-input"
              placeholder="Nombre de la categoría"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
            />
            <button className="fx-btn fx-btn--primary" onClick={handleCreate} disabled={saving || !newName.trim()}>
              {saving ? <span className="fx-spinner" /> : <Icon name="plus" size={16} />}
            </button>
          </div>

          {error && (
            <div className="fx-alert fx-alert--error" style={{ marginBottom: 16 }}>
              <Icon name="alert" size={16} /><span>{error}</span>
            </div>
          )}

          {categories.length === 0 ? (
            <p className="fx-hint">Todavía no creaste ninguna categoría.</p>
          ) : (
            <ul className="fx-list">
              {categories.map((c) => (
                <li key={c.id} className="fx-list__row">
                  {editId === c.id ? (
                    <>
                      <EmojiSelect value={editEmoji} onChange={setEditEmoji} />
                      <input
                        className="fx-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(c.id) }}
                        autoFocus
                      />
                      <button className="fx-btn fx-btn--primary fx-btn--sm" onClick={() => handleEdit(c.id)}>Guardar</button>
                      <button className="fx-btn fx-btn--ghost fx-btn--sm" onClick={() => setEditId(null)}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 17, width: 26, textAlign: 'center' }}>{c.emoji || '📦'}</span>
                      <span style={{ flex: 1, fontSize: 14 }}>{c.name}</span>
                      <button
                        className="fx-btn fx-btn--ghost fx-btn--icon"
                        onClick={() => { setEditId(c.id); setEditName(c.name); setEditEmoji(c.emoji || '📦') }}
                        aria-label={`Editar ${c.name}`}
                      >
                        <Icon name="edit" size={15} />
                      </button>
                      <button
                        className="fx-btn fx-btn--ghost fx-btn--icon"
                        style={{ color: 'var(--fx-danger)' }}
                        onClick={() => handleDelete(c.id)}
                        aria-label={`Eliminar ${c.name}`}
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const [products,      setProducts]      = useState([])
  const [categories,    setCategories]    = useState([])
  const [filterCat,     setFilterCat]     = useState('all')
  const [loading,       setLoading]       = useState(true)
  const [saving,        setSaving]        = useState(false)
  const [showForm,      setShowForm]      = useState(false)
  const [showCatModal,  setShowCatModal]  = useState(false)
  const [editProduct,   setEditProduct]   = useState(null)
  const [imageFile,     setImageFile]     = useState(null)
  const [imagePreview,  setImagePreview]  = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [search, setSearch] = useState('')
  const fileRef = useRef(null)

  const [form, setForm] = useState({ name: '', price: '', stock: '', description: '', imageUrl: '', categoryId: '' })

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const headers = { Authorization: `Bearer ${getToken()}` }
      const [pRes, cRes] = await Promise.all([
        fetch(`${API_URL}/products`,   { headers }),
        fetch(`${API_URL}/categories`, { headers }),
      ])
      if (!pRes.ok) throw new Error()
      setProducts(await pRes.json())
      if (cRes.ok) setCategories(await cRes.json())
    } catch { setError('Error al cargar') }
    finally { setLoading(false) }
  }

  const openCreate = () => {
    setEditProduct(null)
    setForm({ name: '', price: '', stock: '', description: '', imageUrl: '', categoryId: '' })
    setImageFile(null); setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
    setError(''); setSuccess(''); setShowForm(true)
  }

  const openEdit = (product) => {
    setEditProduct(product)
    setForm({ name: product.name, price: String(product.price), stock: String(product.stock), description: product.description || '', imageUrl: product.imageUrl || '', categoryId: product.category?.id || '' })
    setImagePreview(product.imageUrl || null)
    setImageFile(null); setError(''); setSuccess(''); setShowForm(true)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/'))  { setError('Imagen inválida.'); e.target.value = ''; return }
    if (file.size > MAX_IMAGE_SIZE)        { setError('La imagen supera los 5MB.'); e.target.value = ''; return }
    setError(''); setImageFile(file); setImagePreview(URL.createObjectURL(file)); e.target.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.stock) { setError('Nombre, precio y stock son obligatorios.'); return }
    setSaving(true); setError('')
    try {
      let imageUrl = form.imageUrl.trim()
      if (imageFile) { setUploadingImage(true); imageUrl = await uploadToCloudinary(imageFile); setUploadingImage(false) }
      const body = { name: form.name.trim(), price: parseFloat(form.price), stock: parseInt(form.stock), description: form.description.trim(), imageUrl, category: form.categoryId ? { id: parseInt(form.categoryId) } : null }
      const res = await fetch(editProduct ? `${API_URL}/products/${editProduct.id}` : `${API_URL}/products`, {
        method:  editProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Error al guardar producto')
      setSuccess(editProduct ? 'Producto actualizado.' : 'Producto creado.')
      setShowForm(false); loadAll()
    } catch (err) { setError(err.message) }
    finally { setSaving(false); setUploadingImage(false) }
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
      setDeleteId(null); loadAll()
    } catch { setError('Error al eliminar producto') }
  }

  const byCategory = filterCat === 'all'  ? products
    : filterCat === 'none' ? products.filter(p => !p.category)
    : products.filter(p => p.category?.id === parseInt(filterCat))

  const filtered = search.trim()
    ? byCategory.filter(p => p.name.toLowerCase().includes(search.trim().toLowerCase()))
    : byCategory

  const deleteTarget = products.find(p => p.id === deleteId)

  return (
    <DashboardLayout>
      <div className="fx-page-head">
        <div>
          <h1>Productos</h1>
          <p>{loading ? 'Cargando…' : `${products.length} ${products.length === 1 ? 'producto' : 'productos'} en tu catálogo`}</p>
        </div>
        <div className="fx-page-head__actions">
          <button className="fx-btn fx-btn--secondary" onClick={() => setShowCatModal(true)}>
            <Icon name="tag" size={15} />
            Categorías
          </button>
          <button className="fx-btn fx-btn--primary" onClick={openCreate}>
            <Icon name="plus" size={16} />
            Nuevo producto
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

      <div className="fx-toolbar">
        <div className="fx-search">
          <Icon name="search" size={16} />
          <input
            className="fx-input"
            placeholder="Buscar producto"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="fx-select" style={{ maxWidth: 210 }} value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="all">Todas las categorías</option>
          <option value="none">Sin categoría</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="fx-card">
        {loading ? (
          <div className="fx-grid" style={{ padding: 20, gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}>
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="fx-empty">
            <div className="fx-empty__icon"><Icon name="products" size={20} /></div>
            <p className="fx-empty__title">
              {products.length === 0 ? 'Todavía no cargaste productos' : 'Sin resultados'}
            </p>
            <p className="fx-empty__text">
              {products.length === 0
                ? 'Cargá tu primer producto para que aparezca en tu tienda.'
                : 'Probá con otro término de búsqueda o cambiá el filtro de categoría.'}
            </p>
            {products.length === 0 && (
              <button className="fx-btn fx-btn--primary" style={{ marginTop: 18 }} onClick={openCreate}>
                <Icon name="plus" size={16} />
                Nuevo producto
              </button>
            )}
          </div>
        ) : (
          <div className="fx-table-wrap">
            <table className="fx-table">
              <thead>
                <tr>
                  <th style={{ width: 52 }} />
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th className="fx-table__num">Precio</th>
                  <th className="fx-table__num">Stock</th>
                  <th style={{ width: 84 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="fx-thumb">
                        {p.imageUrl
                          ? <img src={p.imageUrl} alt="" />
                          : <Icon name="image" size={15} />}
                      </div>
                    </td>
                    <td>
                      <div className="fx-table__strong">{p.name}</div>
                      {p.description && (
                        <div className="fx-truncate" style={{ maxWidth: 320, color: 'var(--fx-muted)', fontSize: 12.5, marginTop: 2 }}>
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td>
                      {p.category
                        ? <span className="fx-badge">{p.category.emoji || ''} {p.category.name}</span>
                        : <span style={{ color: 'var(--fx-muted)' }}>—</span>}
                    </td>
                    <td className="fx-table__num fx-table__strong">S/ {formatPrice(p.price)}</td>
                    <td className="fx-table__num">
                      <span className={`fx-badge${p.stock === 0 ? ' fx-badge--danger' : p.stock <= 5 ? ' fx-badge--warn' : ''}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      <div className="fx-row" style={{ gap: 2, justifyContent: 'flex-end' }}>
                        <button className="fx-btn fx-btn--ghost fx-btn--icon" onClick={() => openEdit(p)} aria-label={`Editar ${p.name}`}>
                          <Icon name="edit" size={15} />
                        </button>
                        <button
                          className="fx-btn fx-btn--ghost fx-btn--icon"
                          style={{ color: 'var(--fx-danger)' }}
                          onClick={() => setDeleteId(p.id)}
                          aria-label={`Eliminar ${p.name}`}
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

      {/* Formulario de producto */}
      {showForm && (
        <div className="fx-modal" role="dialog" aria-modal="true" onClick={() => setShowForm(false)}>
          <form className="fx-modal__panel" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <div className="fx-modal__head">
              <h2 className="fx-h2">{editProduct ? 'Editar producto' : 'Nuevo producto'}</h2>
              <button type="button" className="fx-btn fx-btn--ghost fx-btn--icon" onClick={() => setShowForm(false)} aria-label="Cerrar">
                <Icon name="close" size={17} />
              </button>
            </div>

            <div className="fx-modal__body">
              <div className="fx-field">
                <label className="fx-label" htmlFor="p-name">Nombre</label>
                <input id="p-name" className="fx-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre del producto" />
              </div>

              <div className="fx-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="fx-field">
                  <label className="fx-label" htmlFor="p-price">Precio (S/)</label>
                  <input id="p-price" className="fx-input" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
                </div>
                <div className="fx-field">
                  <label className="fx-label" htmlFor="p-stock">Stock</label>
                  <input id="p-stock" className="fx-input" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" />
                </div>
              </div>

              <div className="fx-field">
                <label className="fx-label" htmlFor="p-cat">Categoría</label>
                <select id="p-cat" className="fx-select" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                  <option value="">Sin categoría</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="fx-field">
                <label className="fx-label" htmlFor="p-desc">Descripción</label>
                <textarea id="p-desc" className="fx-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detalles del producto (opcional)" />
              </div>

              <div className="fx-field">
                <span className="fx-label">Imagen</span>
                <div className="fx-row" style={{ gap: 12 }}>
                  <div className="fx-thumb fx-thumb--lg">
                    {imagePreview
                      ? <img src={imagePreview} alt="" />
                      : <Icon name="image" size={20} />}
                  </div>
                  <div>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} id="p-file" />
                    <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" onClick={() => fileRef.current?.click()}>
                      <Icon name="upload" size={15} />
                      {imagePreview ? 'Cambiar imagen' : 'Subir imagen'}
                    </button>
                    <p className="fx-hint" style={{ marginTop: 6, fontSize: 12.5 }}>JPG o PNG, hasta 5 MB.</p>
                  </div>
                </div>
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
                {saving
                  ? <><span className="fx-spinner" /> {uploadingImage ? 'Subiendo imagen…' : 'Guardando…'}</>
                  : editProduct ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirmación de borrado */}
      {deleteId && (
        <div className="fx-modal" role="dialog" aria-modal="true" onClick={() => setDeleteId(null)}>
          <div className="fx-modal__panel" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="fx-modal__body">
              <h2 className="fx-h2" style={{ marginBottom: 8 }}>Eliminar producto</h2>
              <p className="fx-hint">
                {deleteTarget ? `“${deleteTarget.name}” se eliminará de tu catálogo y dejará de verse en la tienda.` : 'Esta acción no se puede deshacer.'}
              </p>
            </div>
            <div className="fx-modal__foot">
              <button className="fx-btn fx-btn--ghost" onClick={() => setDeleteId(null)}>Cancelar</button>
              <button className="fx-btn fx-btn--danger" onClick={() => handleDelete(deleteId)}>
                <Icon name="trash" size={15} />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showCatModal && (
        <CategoriesModal onClose={() => setShowCatModal(false)} categories={categories} setCategories={setCategories} />
      )}
    </DashboardLayout>
  )
}
