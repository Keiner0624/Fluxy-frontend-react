// src/components/ProductGrid.jsx
import { useState } from 'react'
import ProductCard from './ProductCard'

export default function ProductGrid({ products, loading, error, onAddToCart, onViewDetail, company }) {
  const [filter, setFilter]   = useState('all')
  const [search, setSearch]   = useState('')
  const [focused, setFocused] = useState(false)

  const available = products.filter(p => p.stock > 0)

  const primary = (() => {
    try {
      const s = company?.storeStyle
      if (!s) return '#7c83fd'
      return (typeof s === 'string' ? JSON.parse(s) : s).primary || '#7c83fd'
    } catch { return '#7c83fd' }
  })()

  const byFilter = filter === 'available' ? available : products
  const filtered = search.trim()
    ? byFilter.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      )
    : byFilter

  return (
    <section id="products" style={{ padding: '80px 20px 100px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: primary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 10 }}>Catálogo</div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: 'white', letterSpacing: '-1px' }}>Nuestros Productos</h2>
          </div>
          {!loading && products.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { key: 'all',       label: `Todos (${products.length})` },
                { key: 'available', label: `Disponibles (${available.length})` },
              ].map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)} style={{
                  padding: '7px 16px', borderRadius: 50, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  background: filter === f.key ? `${primary}20` : 'rgba(255,255,255,0.04)',
                  border: filter === f.key ? `1px solid ${primary}50` : '1px solid rgba(255,255,255,0.08)',
                  color: filter === f.key ? primary : 'rgba(255,255,255,0.4)',
                }}>{f.label}</button>
              ))}
            </div>
          )}
        </div>

        {/* Búsqueda */}
        {!loading && products.length > 0 && (
          <div style={{ marginBottom: 32, position: 'relative', maxWidth: 480 }}>
            <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: focused ? primary : 'rgba(255,255,255,0.25)', fontSize: 16, transition: 'color 0.2s', pointerEvents: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <input
              type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Buscar productos..."
              style={{
                width: '100%', background: focused ? `${primary}08` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${focused ? `${primary}40` : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 50, padding: '12px 44px 12px 46px',
                color: 'white', fontSize: 14, outline: 'none',
                fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
              }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.1)', border: 'none', width: 22, height: 22,
                borderRadius: '50%', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>x</button>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: 32, marginBottom: 16, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</div>
            <div style={{ fontSize: 15 }}>Cargando productos...</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ textAlign: 'center', padding: 60, background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 20, color: '#f87171', fontSize: 15 }}> {error}</div>
        )}

        {/* Sin productos */}
        {!loading && !error && products.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(13,13,26,0.6)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 24 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}></div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'white', marginBottom: 8, fontFamily: "'Fraunces', serif" }}>Aún no hay productos</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>Vuelve pronto, el catálogo se está preparando.</div>
          </div>
        )}

        {/* Sin resultados de búsqueda */}
        {!loading && !error && products.length > 0 && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'rgba(13,13,26,0.4)', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: 20 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}></div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 8, fontFamily: "'Fraunces', serif" }}>Sin resultados para "{search}"</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>Intenta con otro nombre o limpia la búsqueda.</div>
            <button onClick={() => setSearch('')} style={{ background: `${primary}15`, border: `1px solid ${primary}30`, color: primary, borderRadius: 10, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Ver todos los productos
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filtered.length > 0 && (
          <>
            {search && (
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 20 }}>
                {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} para "<span style={{ color: primary }}>{search}</span>"
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} company={company} onAddToCart={onAddToCart} onViewDetail={onViewDetail}/>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
