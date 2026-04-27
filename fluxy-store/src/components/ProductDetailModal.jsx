export default function ProductDetailModal({ product, onClose, onAddToCart }) {
    if (!product) return null
    const outOfStock = product.stock === 0
    const imgSrc = product.image_url ?? product.imageUrl ?? product.image ?? null

    return (
        <>
            <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300 }} />
            <div style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20,
                width: '90%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', zIndex: 301
            }}>
                {imgSrc && (
                    <div style={{ height: 260, overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
                        <img src={imgSrc} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                )}

                <div style={{ padding: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, color: 'var(--text)', flex: 1 }}>
                            {product.name}
                        </h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 22, cursor: 'pointer', marginLeft: 12 }}>✕</button>
                    </div>

                    {product.description && (
                        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>
                            {product.description}
                        </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                        <span style={{ fontFamily: 'Playfair Display', fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>
                            ${Number(product.price).toFixed(2)}
                        </span>
                        <span style={{ color: outOfStock ? 'var(--error)' : 'var(--text-muted)', fontSize: 13 }}>
                            {outOfStock ? 'Sin stock' : `${product.stock} disponibles`}
                        </span>
                    </div>

                    <button
                        disabled={outOfStock}
                        onClick={() => onAddToCart(product)}
                        style={{
                            width: '100%', padding: 14, borderRadius: 12, border: 'none',
                            background: outOfStock ? 'var(--bg-glass)' : 'var(--primary)',
                            color: outOfStock ? 'var(--text-muted)' : '#fff',
                            fontWeight: 700, fontSize: 16, cursor: outOfStock ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {outOfStock ? 'Agotado' : 'Agregar al carrito'}
                    </button>
                </div>
            </div>
        </>
    )
}
