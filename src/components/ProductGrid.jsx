// src/components/ProductGrid.jsx
import ProductCard from './ProductCard'

export default function ProductGrid({ products, loading, error, onAddToCart, onViewDetail, company }) {
  return (
    <section id="products" style={{ padding: '80px 16px 100px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--primary, #7c83fd)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 10 }}>
              Catálogo
            </div>
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 700, color: 'white', letterSpacing: '-0.5px',
            }}>
              Nuestros Productos
            </h2>
          </div>
          {!loading && products.length > 0 && (
            <div style={{
              background: 'rgba(124,131,253,0.08)',
              border: '1px solid rgba(124,131,253,0.15)',
              borderRadius: 50, padding: '6px 16px',
              fontSize: 12, color: 'var(--primary, #7c83fd)',
            }}>
              {products.length} disponibles
            </div>
          )}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted, #4a4a6a)' }}>
            Cargando productos...
          </div>
        )}

        {error && (
          <div style={{
            textAlign: 'center', padding: 60,
            background: 'rgba(248,113,113,0.05)',
            border: '1px solid rgba(248,113,113,0.15)',
            borderRadius: 20, color: '#f87171',
          }}>❌ {error}</div>
        )}

        {!loading && !error && products.length === 0 && (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted, #4a4a6a)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            No hay productos disponibles aún.
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 24,
        }}>
          {products.map((p, i) => (
            <ProductCard
              key={p.id} product={p} index={i}
              company={company}
              onAddToCart={onAddToCart}
              onViewDetail={onViewDetail}
            />
          ))}
        </div>
      </div>
    </section>
  )
}