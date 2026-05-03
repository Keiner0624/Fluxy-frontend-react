// src/components/ProductGrid.jsx
import { useState } from 'react'
import ProductCard from './ProductCard'

export default function ProductGrid({ products, loading, error, onAddToCart, onViewDetail, company }) {
  const [filter, setFilter] = useState('all')

  const available = products.filter(p => p.stock > 0)
  const outOfStock = products.filter(p => p.stock === 0)

  const filtered = filter === 'available' ? available
    : filter === 'out' ? outOfStock
    : products

  return (
    <section id="products" style={{ padding: '80px 20px 100px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 40, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--primary, #7c83fd)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 10 }}>
              Catálogo
            </div>
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 800, color: 'white', letterSpacing: '-1px',
            }}>
              Nuestros Productos
            </h2>
          </div>

          {!loading && products.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: `Todos (${products.length})` },
                { key: 'available', label: `Disponibles (${available.length})` },
              ].map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)} style={{
                  padding: '7px 16px', borderRadius: 50, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: filter === f.key ? 'rgba(124,131,253,0.15)' : 'rgba(255,255,255,0.04)',
                  border: filter === f.key ? '1px solid rgba(124,131,253,0.35)' : '1px solid rgba(255,255,255,0.08)',
                  color: filter === f.key ? 'var(--primary, #7c83fd)' : 'rgba(255,255,255,0.4)',
                }}>{f.label}</button>
              ))}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: 32, marginBottom: 16, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</div>
            <div style={{ fontSize: 15 }}>Cargando productos...</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            textAlign: 'center', padding: 60,
            background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)',
            borderRadius: 20, color: '#f87171', fontSize: 15,
          }}>❌ {error}</div>
        )}

        {/* Empty */}
        {!loading && !error && products.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
            background: 'rgba(13,13,26,0.6)',
            border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 24,
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'white', marginBottom: 8, fontFamily: "'Fraunces', serif" }}>
              Aún no hay productos
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>
              Vuelve pronto, el catálogo se está preparando.
            </div>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 24,
          }}>
            {filtered.map((p, i) => (
              <ProductCard
                key={p.id} product={p} index={i}
                company={company}
                onAddToCart={onAddToCart}
                onViewDetail={onViewDetail}
              />
            ))}
          </div>
        )}

        {/* No results filter */}
        {!loading && !error && products.length > 0 && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.3)' }}>
            No hay productos en esta categoría.
          </div>
        )}
      </div>
    </section>
  )
}