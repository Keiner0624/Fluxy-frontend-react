import { useState } from 'react'

export default function ProductCard({ product, onAddToCart, onViewDetail, index, company }) {
  const [hovered, setHovered] = useState(false)
  const [adding, setAdding] = useState(false)

  const isLowStock = product.stock > 0 && product.stock <= 5
  const isOut = product.stock === 0
  const isTop = index === 0 && product.stock > 0
  const isNew = index <= 2 && product.stock > 10

  const phone = company?.phone?.replace(/[^0-9]/g, '')
  const waMsg = encodeURIComponent(`¡Hola! 👋 Estoy interesado en *${product.name}* que vi en tu tienda *${company?.name}* en Fluxy. ¿Está disponible?`)

  const label = isOut ? null
    : isLowStock ? { text: '⚡ Últimas unidades', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' }
    : isTop      ? { text: '🔥 Más vendido',      color: '#f87171', bg: 'rgba(248,113,113,0.1)' }
    : isNew      ? { text: '✨ Nuevo',             color: '#7c83fd', bg: 'rgba(124,131,253,0.1)' }
    : null

  const handleAdd = async () => {
    if (isOut) return
    setAdding(true)
    onAddToCart(product)
    setTimeout(() => setAdding(false), 800)
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(17,17,34,0.95)' : 'var(--bg-card)',
        border: hovered ? '1px solid rgba(124,131,253,0.3)' : '1px solid rgba(255,255,255,0.06)',
        borderRadius: 20,
        overflow: 'hidden',
        transition: 'all 0.35s cubic-bezier(0.23, 1, 0.32, 1)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,131,253,0.1)'
          : '0 4px 24px rgba(0,0,0,0.2)',
        animation: `fadeUp 0.6s ${index * 0.08}s ease both`,
      }}
    >
      {/* Imagen */}
      <div style={{
        height: 220, position: 'relative',
        background: 'linear-gradient(135deg, #0d0d1e, #1a1a35)',
        overflow: 'hidden',
      }}>
        {label && (
          <div style={{
            position: 'absolute', top: 12, left: 12, zIndex: 2,
            background: label.bg, color: label.color,
            borderRadius: 50, padding: '4px 12px',
            fontSize: 11, fontWeight: 700,
            border: `1px solid ${label.color}33`,
            backdropFilter: 'blur(8px)',
          }}>{label.text}</div>
        )}

        {isOut && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            background: 'rgba(6,6,15,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}>
            <span style={{
              background: 'rgba(248,113,113,0.15)',
              border: '1px solid rgba(248,113,113,0.3)',
              color: '#f87171', borderRadius: 50,
              padding: '6px 16px', fontSize: 13, fontWeight: 600,
            }}>Sin stock</span>
          </div>
        )}

        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.5s ease',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            filter: isOut ? 'grayscale(50%)' : 'none',
          }}/>
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 56,
            animation: hovered ? 'float 3s ease infinite' : 'none',
          }}>📦</div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '20px 20px 16px' }}>
        <div style={{
          fontSize: 15, fontWeight: 600, marginBottom: 6,
          color: 'white', lineHeight: 1.3,
        }}>{product.name}</div>

        {product.description && (
          <div style={{
            fontSize: 12, color: 'var(--text-muted)',
            marginBottom: 12, lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{product.description}</div>
        )}

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
          <span style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 26, fontWeight: 700,
            color: 'var(--primary)',
          }}>S/ {product.price.toFixed(2)}</span>
        </div>

        <div style={{
          fontSize: 11, marginBottom: 16,
          color: isOut ? 'var(--error)' : isLowStock ? 'var(--warning)' : 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%',
            background: isOut ? 'var(--error)' : isLowStock ? 'var(--warning)' : 'var(--success)',
          }}/>
          {isOut ? 'Agotado'
            : isLowStock ? `Solo ${product.stock} disponibles`
            : `${product.stock} en stock`}
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={handleAdd} disabled={isOut} style={{
            width: '100%', padding: '11px',
            background: isOut
              ? 'rgba(255,255,255,0.04)'
              : adding
              ? 'rgba(52,211,153,0.2)'
              : 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            color: isOut ? 'var(--text-muted)' : adding ? '#34d399' : 'white',
            border: isOut ? '1px solid rgba(255,255,255,0.06)' : 'none',
            borderRadius: 12, fontSize: 13, fontWeight: 600,
            transition: 'all 0.3s',
            cursor: isOut ? 'not-allowed' : 'pointer',
            boxShadow: !isOut && !adding ? '0 4px 16px rgba(124,131,253,0.25)' : 'none',
          }}>
            {isOut ? 'No disponible' : adding ? '✓ Agregado' : '+ Agregar al carrito'}
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onViewDetail(product)} style={{
              flex: 1, padding: '9px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10, fontSize: 12,
              color: 'var(--text-soft)', fontWeight: 500,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,131,253,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
            >
              Ver detalles
            </button>

            {phone && (
              <a href={`https://wa.me/${phone}?text=${waMsg}`} target="_blank" rel="noreferrer"
                style={{
                  flex: 1, padding: '9px',
                  background: 'rgba(37,211,102,0.07)',
                  border: '1px solid rgba(37,211,102,0.15)',
                  borderRadius: 10, fontSize: 12,
                  color: '#25d366', fontWeight: 500,
                  textAlign: 'center', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,211,102,0.13)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,211,102,0.07)'}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
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