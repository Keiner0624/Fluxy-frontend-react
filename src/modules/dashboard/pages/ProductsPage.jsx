// src/modules/dashboard/pages/ProductsPage.jsx
import { useState, useEffect, useRef } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { API_URL } from '../../../app/config'
import { ProductCardSkeleton } from '../../../components/Skeleton'

const CLOUDINARY_CLOUD  = import.meta.env.VITE_CLOUDINARY_CLOUD  || 'dklhbrw7s'
const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET || 'fluxy_unsigned'
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

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

const EMOJI_OPTIONS = ['📦','🍕','🍔','🍣','☕','🍰','👕','👗','👟','💄','📱','💻','🎮','🛋️','🌸','💊','🏋️','📚','🎵','🧴','🐾','🌿']

// ─── Modal gestión de categorías ─────────────────────────────────────────────
function CategoriesModal({ onClose, categories, setCategories }) {
  const [newName, setNewName]   = useState('')
  const [newEmoji, setNewEmoji] = useState('📦')
  const [saving, setSaving]     = useState(false)
  const [editId, setEditId]     = useState(null)
  const [editName, setEditName] = useState('')
  const [editEmoji, setEditEmoji] = useState('')

  const inputStyle = { flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }

  const handleCreate = async () => {
    if (!newName.trim()) return
    setSaving(true)
    try {
      const res  = await fetch(`${API_URL}/categories`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ name: newName.trim(), emoji: newEmoji }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCategories(prev => [...prev, data])
      setNewName(''); setNewEmoji('📦')
    } catch (err) { alert(err.message) }
    finally { setSaving(false) }
  }

  const handleEdit = async (id) => {
    try {
      const res  = await fetch(`${API_URL}/categories/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ name: editName, emoji: editEmoji }) })
      const data = await res.json()
      setCategories(prev => prev.map(c => c.id === id ? data : c))
      setEditId(null)
    } catch { alert('Error al editar') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar categoría? Los productos quedarán sin categoría.')) return
    try {
      await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
      setCategories(prev => prev.filter(c => c.id !== id))
    } catch { alert('Error al eliminar') }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#0a0a18', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, width: '100%', maxWidth: 480, boxShadow: '0 40px 80px rgba(0,0,0,0.6)', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ padding: '22px 26px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: 'white' }}>Gestionar categorías</h3>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ padding: '20px 26px' }}>
          {/* Crear nueva */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Nueva categoría</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <select value={newEmoji} onChange={e => setNewEmoji(e.target.value)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 12px', color: 'white', fontSize: 18, outline: 'none', cursor: 'pointer' }}>
                {EMOJI_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre de la categoría" style={inputStyle} onKeyDown={e => e.key === 'Enter' && handleCreate()}
                onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
              <button onClick={handleCreate} disabled={saving || !newName.trim()} style={{ padding: '10px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #7c83fd, #4f46e5)', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', opacity: !newName.trim() ? 0.5 : 1 }}>
                {saving ? '...' : '+ Crear'}
              </button>
            </div>
          </div>

          {/* Lista */}
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
            Categorías ({categories.length})
          </div>
          {categories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>Sin categorías aún. Crea la primera.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {categories.map(cat => (
                <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '10px 14px' }}>
                  {editId === cat.id ? (
                    <>
                      <select value={editEmoji} onChange={e => setEditEmoji(e.target.value)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 8px', color: 'white', fontSize: 16, outline: 'none' }}>
                        {EMOJI_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                      <input value={editName} onChange={e => setEditName(e.target.value)} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(124,131,253,0.4)', borderRadius: 8, padding: '6px 10px', color: 'white', fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
                        onKeyDown={e => e.key === 'Enter' && handleEdit(cat.id)}
                      />
                      <button onClick={() => handleEdit(cat.id)} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399', fontSize: 12, cursor: 'pointer' }}>✓</button>
                      <button onClick={() => setEditId(null)} style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>✕</button>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 20 }}>{cat.emoji || '📦'}</span>
                      <span style={{ flex: 1, fontSize: 14, color: 'white', fontWeight: 500 }}>{cat.name}</span>
                      <button onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditEmoji(cat.emoji || '📦') }} style={{ padding: '5px 10px', borderRadius: 7, background: 'rgba(124,131,253,0.08)', border: '1px solid rgba(124,131,253,0.2)', color: '#7c83fd', fontSize: 12, cursor: 'pointer' }}>✏️</button>
                      <button onClick={() => handleDelete(cat.id)} style={{ padding: '5px 8px', borderRadius: 7, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', color: '#f87171', fontSize: 12, cursor: 'pointer' }}>🗑️</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const [products, setProducts]       = useState([])
  const [categories, setCategories]   = useState([])
  const [filterCat, setFilterCat]     = useState('all')
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [showForm, setShowForm]       = useState(false)
  const [showCatModal, setShowCatModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [imageFile, setImageFile]     = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const fileRef = useRef()

  const [form, setForm] = useState({ name: '', price: '', stock: '', description: '', imageUrl: '', categoryId: '' })

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const headers = { Authorization: `Bearer ${getToken()}` }
      const [pRes, cRes] = await Promise.all([
        fetch(`${API_URL}/products`, { headers }),
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
    if (!file.type.startsWith('image/')) { setError('Imagen inválida.'); e.target.value = ''; return }
    if (file.size > MAX_IMAGE_SIZE) { setError('La imagen supera los 5MB.'); e.target.value = ''; return }
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
        method: editProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Error al guardar producto')
      setSuccess(editProduct ? '✅ Producto actualizado.' : '✅ Producto creado.')
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

  // Filtrado por categoría
  const filtered = filterCat === 'all' ? products
    : filterCat === 'none' ? products.filter(p => !p.category)
    : products.filter(p => p.category?.id === parseInt(filterCat))

  const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 11, padding: '12px 14px', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>Panel de vendedor</div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, color: 'white' }}>Mis Productos</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{products.length} producto{products.length !== 1 ? 's' : ''} registrado{products.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowCatModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 16px', color: 'var(--text-soft)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            🗂️ Categorías
          </button>
          <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #7c83fd, #4f46e5)', color: 'white', padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, boxShadow: '0 4px 16px rgba(124,131,253,0.3)', transition: 'all 0.2s', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span style={{ fontSize: 18 }}>+</span> Agregar producto
          </button>
        </div>
      </div>

      {success && <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#34d399' }}>{success}</div>}
      {error && !showForm && <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#f87171' }}>{error}</div>}

      {/* Filtros por categoría */}
      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[{ id: 'all', name: `Todos (${products.length})`, emoji: '🔍' }, ...categories.map(c => ({ ...c, id: String(c.id), count: products.filter(p => p.category?.id === c.id).length })), { id: 'none', name: `Sin categoría (${products.filter(p => !p.category).length})`, emoji: '📦' }]
            .map(cat => (
              <button key={cat.id} onClick={() => setFilterCat(cat.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 50, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', background: filterCat === cat.id ? 'rgba(124,131,253,0.15)' : 'rgba(255,255,255,0.04)', border: filterCat === cat.id ? '1px solid rgba(124,131,253,0.35)' : '1px solid rgba(255,255,255,0.08)', color: filterCat === cat.id ? 'var(--primary)' : 'var(--text-muted)' }}>
                <span>{cat.emoji}</span> {cat.name}{cat.count !== undefined ? ` (${cat.count})` : ''}
              </button>
            ))}
        </div>
      )}

      {/* Skeleton */}
      {loading && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>{[1,2,3,4,5,6].map(i => <ProductCardSkeleton key={i}/>)}</div>}

      {/* Sin productos */}
      {!loading && products.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(13,13,26,0.6)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <h3 style={{ color: 'white', marginBottom: 8, fontFamily: "'Fraunces', serif" }}>Sin productos aún</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Agrega tu primer producto para que tus clientes puedan verlo.</p>
          <button onClick={openCreate} style={{ background: 'linear-gradient(135deg, #7c83fd, #4f46e5)', color: 'white', padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>+ Agregar mi primer producto</button>
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {filtered.map(product => (
            <div key={product.id} style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, overflow: 'hidden', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,131,253,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ height: 180, overflow: 'hidden', background: 'linear-gradient(135deg, #0d0d1e, #1a1a35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, position: 'relative' }}>
                {product.imageUrl ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : '📦'}
                <div style={{ position: 'absolute', top: 10, right: 10, background: product.stock === 0 ? 'rgba(248,113,113,0.15)' : product.stock <= 5 ? 'rgba(251,191,36,0.15)' : 'rgba(52,211,153,0.15)', border: `1px solid ${product.stock === 0 ? 'rgba(248,113,113,0.3)' : product.stock <= 5 ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'}`, borderRadius: 50, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: product.stock === 0 ? '#f87171' : product.stock <= 5 ? '#fbbf24' : '#34d399' }}>
                  {product.stock === 0 ? 'Sin stock' : `Stock: ${product.stock}`}
                </div>
                {product.category && (
                  <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {product.category.emoji} {product.category.name}
                  </div>
                )}
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 4 }}>{product.name}</div>
                {product.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</div>}
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: 'var(--primary)', marginBottom: 14 }}>S/ {formatPrice(product.price)}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEdit(product)} style={{ flex: 1, padding: '9px', background: 'rgba(124,131,253,0.08)', border: '1px solid rgba(124,131,253,0.2)', borderRadius: 10, fontSize: 13, fontWeight: 500, color: 'var(--primary)', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,131,253,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,131,253,0.08)'}
                  >✏️ Editar</button>
                  <button onClick={() => setDeleteId(product.id)} style={{ padding: '9px 14px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 10, fontSize: 13, color: '#f87171', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.12)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.06)'}
                  >🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Formulario */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#0a0a18', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, width: '100%', maxWidth: 520, boxShadow: '0 40px 80px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '22px 26px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: 'white' }}>{editProduct ? 'Editar producto' : 'Agregar producto'}</h3>
              <button onClick={() => setShowForm(false)} style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Imagen */}
              <div>
                <label style={labelStyle}>Imagen</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  {imagePreview ? (
                    <div style={{ position: 'relative', width: 88, height: 88, borderRadius: 10, overflow: 'hidden', border: '2px solid rgba(124,131,253,0.6)', flexShrink: 0 }}>
                      <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); setForm(f => ({...f, imageUrl: ''})) }} style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%', background: 'rgba(248,113,113,0.9)', border: 'none', color: 'white', fontSize: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>✕</button>
                    </div>
                  ) : (
                    <div onClick={() => fileRef.current?.click()} style={{ width: 88, height: 88, borderRadius: 10, border: '2px dashed rgba(124,131,253,0.25)', background: 'rgba(124,131,253,0.04)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, flexShrink: 0 }}>
                      <span style={{ fontSize: 20 }}>📷</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Subir</span>
                    </div>
                  )}
                  <input value={form.imageUrl} onChange={e => { setForm({...form, imageUrl: e.target.value}); if(e.target.value) setImagePreview(e.target.value) }} placeholder="O pega una URL de imagen" style={{ ...inputStyle, flex: 1 }}
                    onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange}/>
              </div>

              {/* Nombre */}
              <div>
                <label style={labelStyle}>Nombre *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ej: Café Americano" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>

              {/* Precio y Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Precio (S/) *</label>
                  <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0.00" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Stock *</label>
                  <input type="number" min="0" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} placeholder="0" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label style={labelStyle}>Categoría</label>
                <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} style={{ ...inputStyle, cursor: 'pointer', colorScheme: 'dark' }}>
                  <option value="">Sin categoría</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                </select>
                {categories.length === 0 && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>Crea categorías con el botón 🗂️ Categorías.</div>}
              </div>

              {/* Descripción */}
              <div>
                <label style={labelStyle}>Descripción</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe tu producto..." rows={3} style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>

              {error && <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171' }}>⚠️ {error}</div>}

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '13px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: 'var(--text-soft)', fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={saving} style={{ flex: 2, padding: '13px', background: saving ? 'rgba(124,131,253,0.4)' : 'linear-gradient(135deg, #7c83fd, #4f46e5)', border: 'none', borderRadius: 12, color: 'white', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {uploadingImage ? '📤 Subiendo...' : saving ? 'Guardando...' : editProduct ? '✅ Guardar cambios' : '✅ Crear producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal eliminar */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#0a0a18', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 20, padding: '32px 28px', maxWidth: 360, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🗑️</div>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: 'white', marginBottom: 8 }}>¿Eliminar producto?</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 11, color: 'var(--text-soft)', fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => handleDelete(deleteId)} style={{ flex: 1, padding: '12px', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 11, color: '#f87171', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal categorías */}
      {showCatModal && <CategoriesModal onClose={() => setShowCatModal(false)} categories={categories} setCategories={setCategories}/>}
    </DashboardLayout>
  )
}