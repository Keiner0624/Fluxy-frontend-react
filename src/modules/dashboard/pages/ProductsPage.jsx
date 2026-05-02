// src/modules/dashboard/pages/ProductsPage.jsx
import { useState, useEffect, useRef } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { API_URL } from '../../../app/config'

const CLOUDINARY_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD || 'dklhbrw7s'
const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET || 'fluxy_unsigned'
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const PLAN_LABELS = { FREE: 'Free', PRO: 'Pro', BUSINESS: 'Business' }
const PLAN_COLORS = {
  FREE:     { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', text: '#9ca3af' },
  PRO:      { bg: 'rgba(124,131,253,0.10)', border: 'rgba(124,131,253,0.30)', text: '#7c83fd' },
  BUSINESS: { bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.30)',  text: '#34d399' },
}

function getUploadErrorMessage(errorMessage) {
  if (!errorMessage) return 'Error al subir imagen'
  if (/Upload preset not found/i.test(errorMessage))
    return `El preset de Cloudinary "${CLOUDINARY_PRESET}" no existe.`
  if (/Upload preset must be specified/i.test(errorMessage))
    return 'Falta configurar el preset de Cloudinary.'
  return `Error al subir imagen: ${errorMessage}`
}

async function uploadToCloudinary(file) {
  if (!CLOUDINARY_CLOUD || !CLOUDINARY_PRESET)
    throw new Error('Falta configurar Cloudinary para subir imagenes.')
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_PRESET)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
    method: 'POST', body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(getUploadErrorMessage(data?.error?.message))
  return data.secure_url
}

function getToken() {
  return localStorage.getItem('token') || ''
}

export default function ProductsPage() {
  const [products, setProducts]             = useState([])
  const [loading, setLoading]               = useState(true)
  const [saving, setSaving]                 = useState(false)
  const [showForm, setShowForm]             = useState(false)
  const [editProduct, setEditProduct]       = useState(null)
  const [imageFile, setImageFile]           = useState(null)
  const [imagePreview, setImagePreview]     = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError]                   = useState('')
  const [success, setSuccess]               = useState('')
  const [deleteId, setDeleteId]             = useState(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [loadingPayment, setLoadingPayment] = useState(false)
  const [paymentError, setPaymentError]     = useState('')
  const [planName, setPlanName]             = useState('FREE')
  const [planLimit, setPlanLimit]           = useState(10)

  const fileRef = useRef()
  const [form, setForm] = useState({ name: '', price: '', stock: '', description: '', imageUrl: '' })

  const isAtLimit     = products.length >= planLimit
  const planColor     = PLAN_COLORS[planName] || PLAN_COLORS.FREE
  const progressPct   = planLimit >= 999999 ? 0 : Math.min((products.length / planLimit) * 100, 100)
  const progressColor = progressPct >= 100 ? '#f87171' : progressPct >= 80 ? '#fbbf24' : 'var(--primary)'

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 11,
    padding: '12px 14px', color: 'white', fontSize: 14,
    outline: 'none', fontFamily: 'DM Sans, sans-serif',
  }
  const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8,
  }

  useEffect(() => { loadPlan(); loadProducts() }, [])

  const loadPlan = async () => {
    try {
      const res = await fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${getToken()}` } })
      if (!res.ok) return
      const data = await res.json()
      if (data.planName)  setPlanName(data.planName)
      if (data.planLimit) setPlanLimit(data.planLimit)
    } catch { /* silencioso */ }
  }

  const loadProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/products`, { headers: { Authorization: `Bearer ${getToken()}` } })
      if (!res.ok) throw new Error()
      setProducts(await res.json())
    } catch { setError('Error al cargar productos') }
    finally { setLoading(false) }
  }

  // ─── Mercado Pago ─────────────────────────────────────────────────────────
  const handleUpgrade = async (plan) => {
    setLoadingPayment(true)
    setPaymentError('')
    try {
      const res = await fetch(`${API_URL}/payments/create-preference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ plan, months: '1' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear preferencia')
      if (data.initPoint) window.location.href = data.initPoint
    } catch (err) {
      setPaymentError(err.message || 'Error al iniciar el pago. Intenta de nuevo.')
    } finally {
      setLoadingPayment(false)
    }
  }

  const openCreate = () => {
    if (isAtLimit) { setShowUpgradeModal(true); return }
    setEditProduct(null)
    setForm({ name: '', price: '', stock: '', description: '', imageUrl: '' })
    setImageFile(null); setImagePreview(null); setError(''); setSuccess('')
    setShowForm(true)
  }

  const openEdit = (product) => {
    setEditProduct(product)
    setForm({ name: product.name, price: String(product.price), stock: String(product.stock), description: product.description || '', imageUrl: product.imageUrl || '' })
    setImagePreview(product.imageUrl || null); setImageFile(null); setError(''); setSuccess('')
    setShowForm(true)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Selecciona un archivo de imagen valido.'); e.target.value = ''; return }
    if (file.size > MAX_IMAGE_SIZE) { setError('La imagen supera los 5MB permitidos.'); e.target.value = ''; return }
    setError(''); setImageFile(file); setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.stock) { setError('Nombre, precio y stock son obligatorios.'); return }
    if (!imageFile && form.imageUrl && !/^https?:\/\//i.test(form.imageUrl.trim())) { setError('La URL debe empezar con http:// o https://'); return }
    setSaving(true); setError('')
    try {
      let imageUrl = form.imageUrl.trim()
      if (imageFile) { setUploadingImage(true); imageUrl = await uploadToCloudinary(imageFile); setUploadingImage(false) }
      const body = { name: form.name.trim(), price: parseFloat(form.price), stock: parseInt(form.stock), description: form.description.trim(), imageUrl }
      const url = editProduct ? `${API_URL}/products/${editProduct.id}` : `${API_URL}/products`
      const res = await fetch(url, {
        method: editProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      })
      if (res.status === 403) {
        const data = await res.json()
        if (data.upgradeRequired) { setShowForm(false); setShowUpgradeModal(true); return }
        throw new Error(data.message || 'Error de permisos')
      }
      if (!res.ok) throw new Error('Error al guardar producto')
      setSuccess(editProduct ? '✅ Producto actualizado.' : '✅ Producto creado.')
      setShowForm(false); await loadProducts()
    } catch (err) { setError(err.message) }
    finally { setSaving(false); setUploadingImage(false) }
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
      setDeleteId(null); loadProducts()
    } catch { setError('Error al eliminar producto') }
  }

  return (
    <DashboardLayout>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>Panel de vendedor</div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, color: 'white' }}>Mis Productos</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {products.length} producto{products.length !== 1 ? 's' : ''} registrado{products.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={openCreate} disabled={isAtLimit} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: isAtLimit ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #7c83fd, #4f46e5)',
          color: isAtLimit ? '#6b7280' : 'white', padding: '11px 20px', borderRadius: 12,
          fontSize: 14, fontWeight: 600, border: isAtLimit ? '1px solid rgba(255,255,255,0.08)' : 'none',
          boxShadow: isAtLimit ? 'none' : '0 4px 16px rgba(124,131,253,0.3)',
          cursor: isAtLimit ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { if (!isAtLimit) e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <span style={{ fontSize: 18 }}>+</span>
          {isAtLimit ? 'Límite alcanzado' : 'Agregar producto'}
        </button>
      </div>

      {/* ── Banner de plan ── */}
      <div style={{
        background: planColor.bg, border: `1px solid ${planColor.border}`,
        borderRadius: 14, padding: '14px 18px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 }}>
          <div style={{ background: planColor.border, borderRadius: 8, padding: '3px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: planColor.text, whiteSpace: 'nowrap' }}>
            {PLAN_LABELS[planName] || planName}
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Productos usados</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: progressColor }}>{products.length} / {planLimit >= 999999 ? '∞' : planLimit}</span>
            </div>
            {planLimit < 999999 && (
              <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.08)' }}>
                <div style={{ height: '100%', borderRadius: 99, width: `${progressPct}%`, background: progressColor, transition: 'width 0.5s ease' }} />
              </div>
            )}
          </div>
        </div>
        {planName === 'FREE' && (
          <button onClick={() => setShowUpgradeModal(true)} style={{
            background: 'linear-gradient(135deg, #7c83fd, #4f46e5)', color: 'white',
            border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 12,
            fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>⚡ Mejorar plan</button>
        )}
      </div>

      {/* ── Mensajes ── */}
      {success && <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#34d399' }}>{success}</div>}
      {error && !showForm && <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#f87171' }}>{error}</div>}
      {loading && <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Cargando productos...</div>}

      {/* ── Empty state ── */}
      {!loading && products.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(13,13,26,0.6)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <h3 style={{ color: 'white', marginBottom: 8, fontFamily: "'Fraunces', serif" }}>Sin productos aún</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Agrega tu primer producto para que tus clientes puedan verlo en tu tienda.</p>
          <button onClick={openCreate} style={{ background: 'linear-gradient(135deg, #7c83fd, #4f46e5)', color: 'white', padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>+ Agregar mi primer producto</button>
        </div>
      )}

      {/* ── Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
        {products.map(product => (
          <div key={product.id} style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, overflow: 'hidden', transition: 'all 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,131,253,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ height: 180, overflow: 'hidden', background: 'linear-gradient(135deg, #0d0d1e, #1a1a35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, position: 'relative' }}>
              {product.imageUrl ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : '📦'}
              <div style={{
                position: 'absolute', top: 10, right: 10,
                background: product.stock === 0 ? 'rgba(248,113,113,0.15)' : product.stock <= 5 ? 'rgba(251,191,36,0.15)' : 'rgba(52,211,153,0.15)',
                border: `1px solid ${product.stock === 0 ? 'rgba(248,113,113,0.3)' : product.stock <= 5 ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'}`,
                borderRadius: 50, padding: '3px 10px', fontSize: 11, fontWeight: 600,
                color: product.stock === 0 ? '#f87171' : product.stock <= 5 ? '#fbbf24' : '#34d399',
              }}>
                {product.stock === 0 ? 'Sin stock' : `Stock: ${product.stock}`}
              </div>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 4 }}>{product.name}</div>
              {product.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</div>}
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: 'var(--primary)', marginBottom: 14 }}>S/ {product.price?.toFixed(2)}</div>
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

      {/* ── Modal Formulario ── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#0a0a18', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, width: '100%', maxWidth: 520, boxShadow: '0 40px 80px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '22px 26px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: 'white' }}>{editProduct ? 'Editar producto' : 'Agregar producto'}</h3>
              <button onClick={() => setShowForm(false)} style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '24px 26px' }}>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Imagen del producto</label>
                <div onClick={() => fileRef.current?.click()} style={{ height: 160, borderRadius: 14, overflow: 'hidden', border: '2px dashed rgba(124,131,253,0.25)', background: 'rgba(124,131,253,0.04)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,131,253,0.5)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(124,131,253,0.25)'}
                >
                  {imagePreview ? <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                      <div style={{ fontSize: 13 }}>Clic para subir imagen</div>
                      <div style={{ fontSize: 11, marginTop: 4 }}>PNG, JPG hasta 5MB</div>
                    </div>
                  )}
                  {imagePreview && <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.7)', color: 'white', borderRadius: 8, padding: '4px 10px', fontSize: 11 }}>Cambiar</div>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange}/>
                <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>Si la subida directa falla, puedes pegar una URL publica de imagen aqui abajo.</div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>URL de imagen</label>
                <input type="url" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://ejemplo.com/mi-producto.jpg" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}/>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Nombre *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Café Americano" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}/>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Precio (S/) *</label>
                  <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}/>
                </div>
                <div>
                  <label style={labelStyle}>Stock *</label>
                  <input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="0" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}/>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Descripción</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe tu producto..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}/>
              </div>
              {error && <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: 16 }}>⚠️ {error}</div>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '13px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: 'var(--text-soft)', fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={saving} style={{ flex: 2, padding: '13px', background: saving ? 'rgba(124,131,253,0.4)' : 'linear-gradient(135deg, #7c83fd, #4f46e5)', border: 'none', borderRadius: 12, color: 'white', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 4px 16px rgba(124,131,253,0.25)' }}>
                  {uploadingImage ? '📤 Subiendo imagen...' : saving ? 'Guardando...' : editProduct ? '✅ Guardar cambios' : '✅ Crear producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Eliminar ── */}
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

      {/* ── Modal Upgrade con Mercado Pago ── */}
      {showUpgradeModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#0a0a18', border: '1px solid rgba(124,131,253,0.2)', borderRadius: 24, width: '100%', maxWidth: 460, boxShadow: '0 40px 80px rgba(0,0,0,0.7)', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, rgba(124,131,253,0.15), rgba(79,70,229,0.15))', borderBottom: '1px solid rgba(124,131,253,0.15)', padding: '28px 28px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>⚡</div>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: 'white', marginBottom: 6 }}>
                {isAtLimit ? 'Límite alcanzado' : 'Mejora tu plan'}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {isAtLimit
                  ? <>Plan <strong style={{ color: '#7c83fd' }}>FREE</strong>: máximo <strong style={{ color: 'white' }}>10 productos</strong>. Mejora para seguir creciendo.</>
                  : 'Desbloquea más funciones para tu negocio.'
                }
              </p>
            </div>

            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* PRO */}
              <button onClick={() => handleUpgrade('PRO')} disabled={loadingPayment} style={{ width: '100%', textAlign: 'left', background: 'rgba(124,131,253,0.08)', border: '1px solid rgba(124,131,253,0.25)', borderRadius: 14, padding: '16px 18px', cursor: loadingPayment ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: loadingPayment ? 0.6 : 1 }}
                onMouseEnter={e => { if (!loadingPayment) e.currentTarget.style.background = 'rgba(124,131,253,0.15)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,131,253,0.08)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ background: 'rgba(124,131,253,0.2)', color: '#7c83fd', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>PRO</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>S/ 19 / mes</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Hasta 100 productos · WhatsApp automático · Estadísticas</div>
                  </div>
                  <span style={{ fontSize: 20, color: '#7c83fd', marginLeft: 12 }}>→</span>
                </div>
              </button>

              {/* BUSINESS */}
              <button onClick={() => handleUpgrade('BUSINESS')} disabled={loadingPayment} style={{ width: '100%', textAlign: 'left', background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.20)', borderRadius: 14, padding: '16px 18px', cursor: loadingPayment ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: loadingPayment ? 0.6 : 1 }}
                onMouseEnter={e => { if (!loadingPayment) e.currentTarget.style.background = 'rgba(52,211,153,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.06)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>BUSINESS</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>S/ 39 / mes</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ilimitados · Dominio propio · Sin branding Fluxy</div>
                  </div>
                  <span style={{ fontSize: 20, color: '#34d399', marginLeft: 12 }}>→</span>
                </div>
              </button>

              {/* Spinner */}
              {loadingPayment && (
                <div style={{ textAlign: 'center', padding: '8px', fontSize: 13, color: '#7c83fd', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(124,131,253,0.3)', borderTopColor: '#7c83fd', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  Redirigiendo a Mercado Pago...
                </div>
              )}

              {/* Error de pago */}
              {paymentError && (
                <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171' }}>⚠️ {paymentError}</div>
              )}

              {/* Badge MP */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Pago seguro con</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#00bcff', background: 'rgba(0,188,255,0.1)', padding: '2px 8px', borderRadius: 6 }}>Mercado Pago</span>
              </div>

              <button onClick={() => { setShowUpgradeModal(false); setPaymentError('') }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', padding: '8px' }}>
                Ahora no
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}