// src/components/ProductDetailModal.jsx
import { useState } from 'react'

export default function ProductDetailModal({ product, onClose, onAddToCart, company }) {
  const [adding, setAdding] = useState(false)
  const [qty, setQty]       = useState(1)

  if (!product) return null

  const phone = company?.phone?.replace(/[^0-9]/g, '')
  const waMsg = encodeURIComponent(
    `¡Hola! Estoy interesado en *${product.name}* de tu tienda *${company?.name}*. ¿Está disponible?`
  )

  const isOut = product.stock === 0
  const isLow = product.stock > 0 && product.stock <= 5

  const handleAdd = () => {
    if (isOut) return
    setAdding(true)
    for (let i = 0; i < qty; i++) onAddToCart(product)
    setTimeout(() => { setAdding(false); onClose() }, 900)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 600,
        background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#09091a',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 26, width: '100%', maxWidth: 540,
          boxShadow: '0 48px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,131,253,0.08)',
          overflow: 'hidden',
          animation: 'modalIn 0.35s cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.95) translateY(20px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* ── Imagen ── */}
        <div style={{
          height: 280, position: 'relative',
          background: 'linear-gradient(135deg, #0a0a1a, #141432)',
          overflow: 'hidden',
        }}>
          {/* Cerrar */}
          <button onClick={onClose} style={{
            position: 'absolute', top: 16, right: 16, zIndex: 10,
            width: 38, height: 38, borderRadius: 11,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white', fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
          >✕</button>

          {/* Stock badge */}
          {isLow && !isOut && (
            <div style={{
              position: 'absolute', top: 16, left: 16, zIndex: 10,
              background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)',
              color: '#fbbf24', borderRadius: 50, padding: '4px 12px',
              fontSize: 11, fontWeight: 700, backdropFilter: 'blur(8px)',
            }}>⚡ Solo {product.stock} disponibles</div>
          )}

          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>📦</div>
          )}

          {/* Gradient */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(to top, #09091a, transparent)', pointerEvents: 'none' }}/>
        </div>

        {/* ── Contenido ── */}
        <div style={{ padding: '24px 28px 28px' }}>
          {/* Nombre y precio */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 12 }}>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 800, color: 'white', lineHeight: 1.2 }}>
              {product.name}
            </h3>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 900, color: 'var(--primary, #7c83fd)', flexShrink: 0 }}>
              S/ {product.price?.toFixed(2)}
            </div>
          </div>

          {/* Stock */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: isOut ? '#f87171' : isLow ? '#fbbf24' : '#34d399', animation: isOut ? 'none' : 'pulse 2s infinite' }}/>
            <span style={{ fontSize: 12, color: isOut ? '#f87171' : isLow ? '#fbbf24' : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
              {isOut ? 'Sin stock disponible' : isLow ? `Solo ${product.stock} unidades restantes` : `${product.stock} unidades disponibles`}
            </span>
          </div>

          {/* Descripción */}
          {product.description && (
            <div style={{
              fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75,
              marginBottom: 22, padding: '14px 16px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12,
            }}>
              {product.description}
            </div>
          )}

          {/* Selector cantidad */}
          {!isOut && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Cantidad:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '4px 8px' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.06)', border: 'none', color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ fontSize: 16, fontWeight: 700, minWidth: 24, textAlign: 'center', color: 'white' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(124,131,253,0.15)', border: '1px solid rgba(124,131,253,0.25)', color: '#7c83fd', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                Total: <strong style={{ color: 'var(--primary, #7c83fd)' }}>S/ {(product.price * qty).toFixed(2)}</strong>
              </span>
            </div>
          )}

          {/* Botones */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleAdd} disabled={isOut} style={{
              flex: 2, padding: '14px',
              background: isOut
                ? 'rgba(255,255,255,0.04)'
                : adding
                ? 'rgba(52,211,153,0.15)'
                : 'linear-gradient(135deg, var(--primary, #7c83fd), #4f46e5)',
              color: isOut ? 'rgba(255,255,255,0.2)' : adding ? '#34d399' : 'white',
              border: isOut ? '1px solid rgba(255,255,255,0.06)' : 'none',
              borderRadius: 14, fontSize: 15, fontWeight: 700,
              cursor: isOut ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: isOut || adding ? 'none' : '0 8px 24px rgba(124,131,253,0.25)',
            }}>
              {isOut ? 'Sin stock' : adding ? '✓ ¡Agregado!' : `+ Agregar ${qty > 1 ? `(${qty})` : ''}`}
            </button>

            {phone && company?.plan !== 'FREE' && (
              <a href={`https://wa.me/${phone}?text=${waMsg}`} target="_blank" rel="noreferrer"
                style={{
                  flex: 1, padding: '14px',
                  background: 'rgba(37,211,102,0.08)',
                  border: '1px solid rgba(37,211,102,0.2)',
                  borderRadius: 14, fontSize: 14, fontWeight: 700,
                  color: '#25d366', textAlign: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  textDecoration: 'none', transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,211,102,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,211,102,0.08)'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Consultar
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}