// src/components/ProductDetailModal.jsx
import { useState } from 'react'

export default function ProductDetailModal({ product, onClose, onAddToCart, company }) {
  const [adding, setAdding] = useState(false)
  if (!product) return null

  const phone = company?.phone?.replace(/[^0-9]/g, '')
  const waMsg = encodeURIComponent(
    `¡Hola! Estoy interesado en *${product.name}* de tu tienda *${company?.name}* en Fluxy. ¿Está disponible?`
  )

  const handleAdd = () => {
    setAdding(true)
    onAddToCart(product)
    setTimeout(() => setAdding(false), 600)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 600,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: '#0a0a18',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24, width: '100%', maxWidth: 520,
        boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        overflow: 'hidden',
      }}>
        {/* Imagen */}
        <div style={{
          height: 260, position: 'relative',
          background: 'linear-gradient(135deg, #0d0d1e, #1a1a35)',
          overflow: 'hidden',
        }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: 16, right: 16, zIndex: 10,
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white', fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>

          {product.imageUrl
            ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72 }}>📦</div>
          }
        </div>

        {/* Contenido */}
        <div style={{ padding: '24px 28px' }}>
          <h3 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 8,
          }}>{product.name}</h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <span style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 30, fontWeight: 700, color: 'var(--primary, #7c83fd)',
            }}>S/ {product.price?.toFixed(2)}</span>
            <span style={{
              fontSize: 12, color: product.stock <= 5 ? '#fbbf24' : 'var(--text-muted, #4a4a6a)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: product.stock <= 5 ? '#fbbf24' : '#34d399' }}/>
              {product.stock === 0 ? 'Sin stock' : `${product.stock} disponibles`}
            </span>
          </div>

          {product.description && (
            <div style={{
              fontSize: 14, color: 'var(--text-soft, #9898b8)', lineHeight: 1.7,
              marginBottom: 20, padding: '14px 16px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12,
            }}>
              {product.description}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleAdd} disabled={product.stock === 0} style={{
              flex: 2, padding: 13,
              background: product.stock === 0
                ? 'rgba(255,255,255,0.04)'
                : adding
                ? 'rgba(52,211,153,0.15)'
                : 'linear-gradient(135deg, var(--primary, #7c83fd), #4f46e5)',
              color: product.stock === 0 ? 'var(--text-muted, #4a4a6a)' : adding ? '#34d399' : 'white',
              border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 600,
              cursor: product.stock === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.3s',
            }}>
              {product.stock === 0 ? 'Sin stock' : adding ? '✓ Agregado' : '+ Agregar al carrito'}
            </button>

            {phone && (
              <a href={`https://wa.me/${phone}?text=${waMsg}`} target="_blank" rel="noreferrer"
                style={{
                  flex: 1, padding: 13,
                  background: 'rgba(37,211,102,0.08)',
                  border: '1px solid rgba(37,211,102,0.2)',
                  borderRadius: 14, fontSize: 13, fontWeight: 600,
                  color: '#25d366', textAlign: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                💬 Consultar
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}