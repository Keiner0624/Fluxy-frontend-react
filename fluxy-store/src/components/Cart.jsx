export default function Cart({ open, cart, total, onClose, onIncrease, onDecrease, onCheckout }) {
    return (
        <>
            {open && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200 }} />}
            <aside style={{
                position: 'fixed', top: 0, right: 0, height: '100vh', width: 380,
                background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
                zIndex: 201, display: 'flex', flexDirection: 'column',
                transform: open ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform .3s ease'
            }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontFamily: 'Playfair Display', fontSize: 20, color: 'var(--text)' }}>Carrito</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 22, cursor: 'pointer' }}>✕</button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 64 }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
                            <p>Tu carrito está vacío</p>
                        </div>
                    ) : cart.map(({ product, quantity }) => (
                        <div key={product.id} style={{
                            display: 'flex', gap: 12, alignItems: 'center',
                            padding: '12px 0', borderBottom: '1px solid var(--border)'
                        }}>
                            <div style={{ flex: 1 }}>
                                <p style={{ color: 'var(--text)', fontSize: 14, fontWeight: 500 }}>{product.name}</p>
                                <p style={{ color: 'var(--primary)', fontSize: 14 }}>${(product.price * quantity).toFixed(2)}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <button onClick={() => onDecrease(product.id)} style={btnStyle}>−</button>
                                <span style={{ color: 'var(--text)', fontSize: 14, minWidth: 20, textAlign: 'center' }}>{quantity}</span>
                                <button onClick={() => onIncrease(product.id)} style={btnStyle}>+</button>
                            </div>
                        </div>
                    ))}
                </div>

                {cart.length > 0 && (
                    <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <span style={{ color: 'var(--text-muted)' }}>Total</span>
                            <span style={{ fontFamily: 'Playfair Display', fontSize: 20, color: 'var(--text)', fontWeight: 700 }}>
                                ${total.toFixed(2)}
                            </span>
                        </div>
                        <button onClick={onCheckout} style={{
                            width: '100%', padding: 14, borderRadius: 12, border: 'none',
                            background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer'
                        }}>
                            Finalizar pedido
                        </button>
                    </div>
                )}
            </aside>
        </>
    )
}

const btnStyle = {
    width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)',
    background: 'var(--bg-glass)', color: 'var(--text)', fontSize: 16, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
}
