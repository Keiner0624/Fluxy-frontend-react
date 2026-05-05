// src/modules/dashboard/pages/ProductsPage.jsx
import { useState, useEffect, useRef } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { API_URL } from '../../../app/config'

const CLOUDINARY_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD || 'dklhbrw7s'
const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET || 'fluxy_unsigned'
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const MAX_IMAGES = 5

function getProductImageUrls(product) {
  if (!product) return []

  let images = []

  if (Array.isArray(product.images)) {
    images = product.images
  } else if (typeof product.images === 'string' && product.images.trim()) {
    try {
      const parsed = JSON.parse(product.images)
      images = Array.isArray(parsed) ? parsed : []
    } catch {
      images = []
    }
  }

  if (product.imageUrl) {
    images = [product.imageUrl, ...images.filter(url => url !== product.imageUrl)]
  }

  return images
    .filter(url => typeof url === 'string' && url.trim())
    .slice(0, MAX_IMAGES)
}

function formatPrice(price) {
  const value = Number(price)
  return Number.isFinite(value) ? value.toFixed(2) : '0.00'
}

function getUploadErrorMessage(errorMessage) {
  if (!errorMessage) return 'Error al subir imagen'

  if (/Upload preset not found/i.test(errorMessage)) {
    return `El preset de Cloudinary "${CLOUDINARY_PRESET}" no existe. Configura VITE_CLOUDINARY_PRESET con un preset unsigned valido o crea ese preset en Cloudinary. Mientras tanto, puedes usar una URL de imagen manual.`
  }

  if (/Upload preset must be specified/i.test(errorMessage)) {
    return 'Falta configurar el preset de Cloudinary. Define VITE_CLOUDINARY_PRESET para habilitar la subida directa.'
  }

  return `Error al subir imagen: ${errorMessage}`
}

async function uploadToCloudinary(file) {
  if (!CLOUDINARY_CLOUD || !CLOUDINARY_PRESET) {
    throw new Error('Falta configurar Cloudinary para subir imagenes.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_PRESET)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
    method: 'POST', body: formData,
  })
  const data = await res.json()

  if (!res.ok) {
    throw new Error(getUploadErrorMessage(data?.error?.message))
  }

  return data.secure_url
}

function getToken() {
  return localStorage.getItem('token') || ''
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [imageItems, setImageItems] = useState([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const fileRef = useRef()
  const imagePreviews = imageItems.map(item => item.src)

  const [form, setForm] = useState({
    name: '', price: '', stock: '', description: '', imageUrl: '',
  })

  useEffect(() => { loadProducts() }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/products`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error()
      setProducts(await res.json())
    } catch {
      setError('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditProduct(null)
    setForm({ name: '', price: '', stock: '', description: '', imageUrl: '' })
    setImageItems([])
    if (fileRef.current) fileRef.current.value = ''
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  const openEdit = (product) => {
    const imageUrls = getProductImageUrls(product)

    setEditProduct(product)
    setForm({
      name: product.name,
      price: String(product.price),
      stock: String(product.stock),
      description: product.description || '',
      imageUrl: product.imageUrl || '',
    })
    setImageItems(imageUrls.map((url, index) => ({
      id: `existing-${index}-${url}`,
      src: url,
      file: null,
    })))
    if (fileRef.current) fileRef.current.value = ''
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const remainingSlots = MAX_IMAGES - imageItems.length
    if (remainingSlots <= 0 || files.length > remainingSlots) {
      setError(`Solo puedes agregar hasta ${MAX_IMAGES} imagenes por producto.`)
      e.target.value = ''
      return
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Selecciona solo archivos de imagen validos.')
        e.target.value = ''
        return
      }

      if (file.size > MAX_IMAGE_SIZE) {
        setError('Una de las imagenes supera los 5MB permitidos.')
        e.target.value = ''
        return
      }
    }

    const newItems = files.map((file, index) => ({
      id: `file-${file.name}-${file.lastModified}-${Date.now()}-${index}`,
      src: URL.createObjectURL(file),
      file,
    }))

    setError('')
    setImageItems(prev => [...prev, ...newItems])
    e.target.value = ''
  }

  const removeImage = (index) => {
    setImageItems(prev => prev.filter((_, itemIndex) => itemIndex !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.stock) {
      setError('Nombre, precio y stock son obligatorios.')
      return
    }

    const manualImageUrl = form.imageUrl.trim()

    if (imageItems.length === 0 && manualImageUrl && !/^https?:\/\//i.test(manualImageUrl)) {
      setError('La URL de la imagen debe empezar con http:// o https://')
      return
    }

    setSaving(true)
    setError('')

    try {
      let imageUrls = []
      const hasNewImages = imageItems.some(item => item.file)

      if (imageItems.length > 0) {
        if (hasNewImages) setUploadingImage(true)
        imageUrls = []

        for (const item of imageItems) {
          if (item.file) {
            imageUrls.push(await uploadToCloudinary(item.file))
          } else if (item.src) {
            imageUrls.push(item.src)
          }
        }

        if (hasNewImages) setUploadingImage(false)
      } else if (manualImageUrl) {
        imageUrls = [manualImageUrl]
      }

      const imageUrl = imageUrls[0] || ''

      const body = {
        name: form.name.trim(),
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        description: form.description.trim(),
        imageUrl,
        images: JSON.stringify(imageUrls),
      }

      const url = editProduct
        ? `${API_URL}/products/${editProduct.id}`
        : `${API_URL}/products`

      const res = await fetch(url, {
        method: editProduct ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Error al guardar producto')

      setSuccess(editProduct ? '✅ Producto actualizado.' : '✅ Producto creado.')
      setShowForm(false)
      loadProducts()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
      setUploadingImage(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      setDeleteId(null)
      loadProducts()
    } catch {
      setError('Error al eliminar producto')
    }
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 32, flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>
            Panel de vendedor
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, color: 'white' }}>
            Mis Productos
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {products.length} producto{products.length !== 1 ? 's' : ''} registrado{products.length !== 1 ? 's' : ''}
          </p>
        </div>

        <button onClick={openCreate} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(135deg, #7c83fd, #4f46e5)',
          color: 'white', padding: '11px 20px',
          borderRadius: 12, fontSize: 14, fontWeight: 600,
          boxShadow: '0 4px 16px rgba(124,131,253,0.3)',
          transition: 'all 0.2s', border: 'none', cursor: 'pointer',
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <span style={{ fontSize: 18 }}>+</span>
          Agregar producto
        </button>
      </div>

      {/* Mensajes */}
      {success && (
        <div style={{
          background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 20,
          fontSize: 13, color: '#34d399',
        }}>{success}</div>
      )}
      {error && !showForm && (
        <div style={{
          background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 20,
          fontSize: 13, color: '#f87171',
        }}>{error}</div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          Cargando productos...
        </div>
      )}

      {/* Grid de productos */}
      {!loading && products.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '80px 24px',
          background: 'rgba(13,13,26,0.6)',
          border: '1px dashed rgba(255,255,255,0.08)',
          borderRadius: 20,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <h3 style={{ color: 'white', marginBottom: 8, fontFamily: "'Fraunces', serif" }}>
            Sin productos aún
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
            Agrega tu primer producto para que tus clientes puedan verlo en tu tienda.
          </p>
          <button onClick={openCreate} style={{
            background: 'linear-gradient(135deg, #7c83fd, #4f46e5)',
            color: 'white', padding: '12px 24px',
            borderRadius: 12, fontSize: 14, fontWeight: 600,
            border: 'none', cursor: 'pointer',
          }}>+ Agregar mi primer producto</button>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 20,
      }}>
        {products.map(product => (
          <div key={product.id} style={{
            background: 'rgba(13,13,26,0.9)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 18, overflow: 'hidden',
            transition: 'all 0.3s',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(124,131,253,0.25)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {/* Imagen */}
            <div style={{
              height: 180, overflow: 'hidden',
              background: 'linear-gradient(135deg, #0d0d1e, #1a1a35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 48, position: 'relative',
            }}>
              {product.imageUrl
                ? <img src={product.imageUrl} alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                : '📦'
              }
              {/* Stock badge */}
              <div style={{
                position: 'absolute', top: 10, right: 10,
                background: product.stock === 0
                  ? 'rgba(248,113,113,0.15)'
                  : product.stock <= 5
                  ? 'rgba(251,191,36,0.15)'
                  : 'rgba(52,211,153,0.15)',
                border: `1px solid ${product.stock === 0 ? 'rgba(248,113,113,0.3)' : product.stock <= 5 ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'}`,
                borderRadius: 50, padding: '3px 10px',
                fontSize: 11, fontWeight: 600,
                color: product.stock === 0 ? '#f87171' : product.stock <= 5 ? '#fbbf24' : '#34d399',
              }}>
                {product.stock === 0 ? 'Sin stock' : `Stock: ${product.stock}`}
              </div>
            </div>

            {/* Info */}
            <div style={{ padding: '16px' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 4 }}>
                {product.name}
              </div>
              {product.description && (
                <div style={{
                  fontSize: 12, color: 'var(--text-muted)', marginBottom: 8,
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>{product.description}</div>
              )}
              <div style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 22, fontWeight: 700,
                color: 'var(--primary)', marginBottom: 14,
              }}>
                S/ {formatPrice(product.price)}
              </div>

              {/* Acciones */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(product)} style={{
                  flex: 1, padding: '9px',
                  background: 'rgba(124,131,253,0.08)',
                  border: '1px solid rgba(124,131,253,0.2)',
                  borderRadius: 10, fontSize: 13, fontWeight: 500,
                  color: 'var(--primary)', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,131,253,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,131,253,0.08)'}
                >✏️ Editar</button>
                <button onClick={() => setDeleteId(product.id)} style={{
                  padding: '9px 14px',
                  background: 'rgba(248,113,113,0.06)',
                  border: '1px solid rgba(248,113,113,0.15)',
                  borderRadius: 10, fontSize: 13,
                  color: '#f87171', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.06)'}
                >🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Formulario */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{
            background: '#0a0a18',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24, width: '100%', maxWidth: 520,
            boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            {/* Header modal */}
            <div style={{
              padding: '22px 26px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: 'white' }}>
                {editProduct ? 'Editar producto' : 'Agregar producto'}
              </h3>
              <button onClick={() => setShowForm(false)} style={{
                width: 34, height: 34, borderRadius: 9,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-muted)', fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px 26px' }}>
              {/* Imagen */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Imágenes del producto</label>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{imagePreviews.length}/{MAX_IMAGES}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8, marginBottom: 10 }}>
                  {imageItems.map((item, idx) => (
                    <div key={item.id} style={{ position: 'relative', height: 88, borderRadius: 10, overflow: 'hidden', border: idx === 0 ? '2px solid rgba(124,131,253,0.6)' : '1px solid rgba(255,255,255,0.08)' }}>
                      <img src={item.src} alt={`img-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                      {idx === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(124,131,253,0.85)', fontSize: 9, fontWeight: 700, color: 'white', textAlign: 'center', padding: '2px' }}>PRINCIPAL</div>}
                      <button type="button" onClick={() => removeImage(idx)} style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%', background: 'rgba(248,113,113,0.9)', border: 'none', color: 'white', fontSize: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>✕</button>
                    </div>
                  ))}
                  {imageItems.length < MAX_IMAGES && (
                    <div onClick={() => fileRef.current?.click()} style={{ height: 88, borderRadius: 10, border: '2px dashed rgba(124,131,253,0.25)', background: 'rgba(124,131,253,0.04)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,131,253,0.5)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(124,131,253,0.25)'}
                    >
                      <span style={{ fontSize: 20 }}>📷</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Agregar</span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageChange}/>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>La primera imagen es la principal. Máximo {MAX_IMAGES} imágenes, PNG/JPG hasta 5MB c/u.</div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: 'block', fontSize: 12, fontWeight: 600,
                  color: 'var(--text-muted)', textTransform: 'uppercase',
                  letterSpacing: '0.8px', marginBottom: 8,
                }}>URL de imagen</label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://ejemplo.com/mi-producto.jpg"
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 11, padding: '12px 14px',
                    color: 'white', fontSize: 14, outline: 'none',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>

              {/* Nombre */}
              <div style={{ marginBottom: 14 }}>
                <label style={{
                  display: 'block', fontSize: 12, fontWeight: 600,
                  color: 'var(--text-muted)', textTransform: 'uppercase',
                  letterSpacing: '0.8px', marginBottom: 8,
                }}>Nombre *</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Café Americano"
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 11, padding: '12px 14px',
                    color: 'white', fontSize: 14, outline: 'none',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>

              {/* Precio y Stock en fila */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{
                    display: 'block', fontSize: 12, fontWeight: 600,
                    color: 'var(--text-muted)', textTransform: 'uppercase',
                    letterSpacing: '0.8px', marginBottom: 8,
                  }}>Precio (S/) *</label>
                  <input
                    type="number" min="0" step="0.01"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    placeholder="0.00"
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 11, padding: '12px 14px',
                      color: 'white', fontSize: 14, outline: 'none',
                      fontFamily: 'DM Sans, sans-serif',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block', fontSize: 12, fontWeight: 600,
                    color: 'var(--text-muted)', textTransform: 'uppercase',
                    letterSpacing: '0.8px', marginBottom: 8,
                  }}>Stock *</label>
                  <input
                    type="number" min="0"
                    value={form.stock}
                    onChange={e => setForm({ ...form, stock: e.target.value })}
                    placeholder="0"
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 11, padding: '12px 14px',
                      color: 'white', fontSize: 14, outline: 'none',
                      fontFamily: 'DM Sans, sans-serif',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>
              </div>

              {/* Descripción */}
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: 'block', fontSize: 12, fontWeight: 600,
                  color: 'var(--text-muted)', textTransform: 'uppercase',
                  letterSpacing: '0.8px', marginBottom: 8,
                }}>Descripción</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe tu producto..."
                  rows={3}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 11, padding: '12px 14px',
                    color: 'white', fontSize: 14, outline: 'none',
                    fontFamily: 'DM Sans, sans-serif', resize: 'vertical',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: 'rgba(248,113,113,0.08)',
                  border: '1px solid rgba(248,113,113,0.2)',
                  borderRadius: 10, padding: '10px 14px',
                  fontSize: 13, color: '#f87171', marginBottom: 16,
                }}>⚠️ {error}</div>
              )}

              {/* Botones */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  flex: 1, padding: '13px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, color: 'var(--text-soft)',
                  fontSize: 14, cursor: 'pointer',
                }}>Cancelar</button>
                <button type="submit" disabled={saving} style={{
                  flex: 2, padding: '13px',
                  background: saving
                    ? 'rgba(124,131,253,0.4)'
                    : 'linear-gradient(135deg, #7c83fd, #4f46e5)',
                  border: 'none', borderRadius: 12,
                  color: 'white', fontSize: 14, fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: saving ? 'none' : '0 4px 16px rgba(124,131,253,0.25)',
                }}>
                  {uploadingImage ? '📤 Subiendo imágenes...'
                    : saving ? 'Guardando...'
                    : editProduct ? '✅ Guardar cambios'
                    : '✅ Crear producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar eliminación */}
      {deleteId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{
            background: '#0a0a18',
            border: '1px solid rgba(248,113,113,0.2)',
            borderRadius: 20, padding: '32px 28px',
            maxWidth: 360, width: '100%', textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🗑️</div>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: 'white', marginBottom: 8 }}>
              ¿Eliminar producto?
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
              Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{
                flex: 1, padding: '12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 11, color: 'var(--text-soft)',
                fontSize: 14, cursor: 'pointer',
              }}>Cancelar</button>
              <button onClick={() => handleDelete(deleteId)} style={{
                flex: 1, padding: '12px',
                background: 'rgba(248,113,113,0.12)',
                border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: 11, color: '#f87171',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
