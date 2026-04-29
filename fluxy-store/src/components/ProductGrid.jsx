import ProductCard from './ProductCard'

export default function ProductGrid({ products, loading, error, onAddToCart, onViewDetail }) {
    if (loading) return (
        <section id="products" style={{ padding: '40px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
            {[...Array(6)].map((_, i) => (
                <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 16, height: 340, border: '1px solid var(--border)', opacity: 0.5 }} />
            ))}
        </section>
    )

    if (error) return (
        <section id="products" style={{ padding: '80px 32px', textAlign: 'center' }}>
            <p style={{ color: 'var(--error)', fontSize: 16 }}>{error}</p>
        </section>
    )

    if (!products.length) return (
        <section id="products" style={{ padding: '80px 32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏪</div>
            <p>No hay productos disponibles.</p>
        </section>
    )

    return (
        <section id="products" style={{ padding: '0 32px 64px' }}>
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 32 }}>
                Productos
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
                {products.map(p => (
                    <ProductCard
                        key={p.id}
                        product={p}
                        onAddToCart={onAddToCart}
                        onViewDetail={onViewDetail}
                    />
                ))}
            </div>
        </section>
    )
}
