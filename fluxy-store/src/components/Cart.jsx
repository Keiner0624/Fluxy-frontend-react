export default function Cart({ open, cart, total, onClose, onIncrease, onDecrease, onClear, onCheckout }) {
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 500,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease',
          }}
        />
      )}

      {/* Sidebar */}
      <div
        className="cart-sidebar"
        style={{
          position: 'fixed', top: 0,
          right: open ? 0 : '-100%',
          width: 'min(100vw, 440px)',
          height: '100vh',
          height: '100dvh',
          background: '#08080f',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          zIndex: 501,
          transition: 'right 0.35s cubic-bezier(0.23, 1, 0.32, 1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0,
        }}>
          <div>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 19, color: 'white' }}>
              Tu pedido
            </h3>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {cart.reduce((s, i) => s + i.quantity, 0)} producto(s)
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-muted)', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        {/* Items */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '12px 16px',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {cart.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '100%', color: 'var(--text-muted)', gap: 12,
            }}>
              <div style={{ fontSize: 48 }}>🛒</div>
              <div style={{ fontSize: 15 }}>Tu carrito está vacío</div>
              <div style={{ fontSize: 13 }}>Agrega productos para continuar</div>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} style={{
                display: 'flex', gap: 12, alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                {/* Imagen */}
                <div style={{
                  width: 52, height: 52, borderRadius: 10,
                  overflow: 'hidden', flexShrink: 0,
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.product.imageUrl
                    ? <img src={item.product.imageUrl} alt={item.product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                    : <span style={{ fontSize: 22 }}>📦</span>
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: 'white',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    marginBottom: 3,
                  }}>
                    {item.product.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    S/ {item.product.price.toFixed(2)} c/u
                  </div>
                </div>

                {/* Controles */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => onDecrease(item.product.id)}
                    style={{
                      width: 30, height: 30, borderRadius: 8,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white', fontSize: 16, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >−</button>
                  <span style={{ fontSize: 15, fontWeight: 700, minWidth: 18, textAlign: 'center' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onIncrease(item.product.id)}
                    style={{
                      width: 30, height: 30, borderRadius: 8,
                      background: 'rgba(124,131,253,0.15)',
                      border: '1px solid rgba(124,131,253,0.25)',
                      color: 'var(--primary)', fontSize: 16, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >+</button>
                </div>

                {/* Subtotal */}
                <div style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 14, fontWeight: 700,
                  color: 'var(--primary)',
                  minWidth: 60, textAlign: 'right', flexShrink: 0,
                }}>
                  S/ {(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
  <button
    onClick={() => { onClear(); onClose(); }}
    style={{
      padding: '7px 14px', borderRadius: 10,
      background: 'rgba(248,113,113,0.08)',
      border: '1px solid rgba(248,113,113,0.2)',
      color: '#f87171', fontSize: 12, fontWeight: 600,
    }}
  >
    🗑️ Vaciar
  </button>
)}

        {/* Footer — solo si hay items */}
        {cart.length > 0 && (
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
            paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          }}>
            {/* Total */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 14,
            }}>
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Total del pedido</span>
              <span style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 24, fontWeight: 700, color: 'white',
              }}>
                S/ {total.toFixed(2)}
              </span>
            </div>

            {/* Pagos */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, padding: '10px 14px',
              marginBottom: 12,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Pagos aceptados</span>
              <div style={{ display: 'flex', gap: 10, fontSize: 18 }}>
                <span title="Efectivo">💵</span>
                <span title="Yape">📱</span>
                <span title="Plin">🏦</span>
                <span title="Tarjeta">💳</span>
              </div>
            </div>

            {/* Botón confirmar */}
            <button
              onClick={onCheckout}
              style={{
                width: '100%', padding: '15px',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                color: 'white', borderRadius: 14,
                fontSize: 15, fontWeight: 600,
                boxShadow: '0 8px 24px rgba(124,131,253,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginBottom: 10,
              }}
            >
              Confirmar pedido
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>

            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
              También puedes consultar por WhatsApp 💬
            </div>
          </div>
        )}
      </div>
    </>
  )
}