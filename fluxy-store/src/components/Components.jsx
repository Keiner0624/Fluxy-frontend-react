// ═══ ProductGrid.jsx ═══

import ProductCard from './ProductCard'

export function ProductGrid({ products, loading, error, onAddToCart, onViewDetail, company }) {
    return (
        <section id="products" style={{
            padding: '80px 32px 100px',
            background: 'linear-gradient(180deg, var(--bg) 0%, rgba(13,13,26,0.5) 100%)',
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                {/* Header sección */}
                <div style={{ marginBottom: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{
                            fontSize: 11, color: 'var(--primary)', fontWeight: 600,
                            textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 10,
                        }}>Catálogo</div>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: 'clamp(28px, 4vw, 40px)',
                            fontWeight: 700, color: 'white',
                            letterSpacing: '-0.5px', lineHeight: 1.1,
                        }}>Nuestros Productos</h2>
                    </div>
                    {!loading && products.length > 0 && (
                        <div style={{
                            background: 'rgba(124,131,253,0.08)',
                            border: '1px solid rgba(124,131,253,0.15)',
                            borderRadius: 50, padding: '6px 16px',
                            fontSize: 12, color: 'var(--primary)',
                        }}>
                            {products.length} disponibles
                        </div>
                    )}
                </div>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: 32, marginBottom: 16, animation: 'pulse 1.5s infinite' }}>⟳</div>
                        Cargando productos...
                    </div>
                )}

                {error && (
                    <div style={{
                        textAlign: 'center', padding: 60,
                        background: 'rgba(248,113,113,0.05)',
                        border: '1px solid rgba(248,113,113,0.15)',
                        borderRadius: 20, color: 'var(--error)',
                    }}>❌ {error}</div>
                )}

                {!loading && !error && products.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
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

// ═══ TrustSection.jsx ═══
const trustItems = [
    { icon: '👤', title: 'Atención directa', desc: 'Habla directo con el vendedor, sin intermediarios' },
    { icon: '⚡', title: 'Respuesta rápida', desc: 'Tu pedido confirmado en minutos' },
    { icon: '🔒', title: 'Compra segura', desc: 'Tu información siempre protegida' },
    { icon: '✅', title: 'Negocio verificado', desc: 'Tienda registrada y validada en Fluxy' },
]

export function TrustSection() {
    return (
        <section style={{
            padding: '64px 32px',
            background: 'rgba(13,13,26,0.6)',
            borderTop: '1px solid rgba(255,255,255,0.04)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 10 }}>
                        ¿Por qué elegirnos?
                    </div>
                    <h3 style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: 28, fontWeight: 700, color: 'white',
                    }}>Tu confianza es nuestra prioridad</h3>
                </div>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 20,
                }}>
                    {trustItems.map((item, i) => (
                        <div key={i} style={{
                            background: 'rgba(17,17,34,0.8)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 20, padding: '28px 24px',
                            transition: 'all 0.3s',
                            animation: `fadeUp 0.6s ${i * 0.1}s ease both`,
                        }}
                             onMouseEnter={e => {
                                 e.currentTarget.style.borderColor = 'rgba(124,131,253,0.25)'
                                 e.currentTarget.style.transform = 'translateY(-4px)'
                             }}
                             onMouseLeave={e => {
                                 e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                                 e.currentTarget.style.transform = 'translateY(0)'
                             }}
                        >
                            <div style={{
                                width: 48, height: 48, borderRadius: 14,
                                background: 'rgba(124,131,253,0.08)',
                                border: '1px solid rgba(124,131,253,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 22, marginBottom: 16,
                            }}>{item.icon}</div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 8 }}>{item.title}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.desc}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// ═══ Footer.jsx ═══
export function Footer({ company }) {
    return (
        <footer style={{
            padding: '48px 32px 32px',
            borderTop: '1px solid rgba(255,255,255,0.04)',
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr',
                    gap: 48, marginBottom: 40,
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div style={{
                                width: 36, height: 36,
                                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                                borderRadius: 10, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: 16, fontWeight: 800, color: 'white',
                            }}>
                                {company?.name?.[0] || 'F'}
                            </div>
                            <div>
                                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, color: 'white' }}>
                                    {company?.name || 'Tienda'}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>via Fluxy</div>
                            </div>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 280 }}>
                            {company?.description || 'Tu tienda de confianza. Atención directa y personalizada.'}
                        </p>
                    </div>

                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-soft)', marginBottom: 16 }}>
                            Contacto
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {company?.address && (
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                                    <span>📍</span> {company.address}
                                </div>
                            )}
                            {company?.phone && (
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                                    <span>📞</span> {company.phone}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-soft)', marginBottom: 16 }}>
                            Pagos
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {['💵 Efectivo', '📱 Yape', '🏦 Plin', '💳 Tarjeta'].map(p => (
                                <span key={p} style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: 8, padding: '4px 10px',
                                    fontSize: 11, color: 'var(--text-muted)',
                                }}>{p}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{
                    paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        © {new Date().getFullYear()} {company?.name}. Todos los derechos reservados.
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Powered by{' '}
                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Fluxy</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

// ═══ Cart.jsx ═══
export function Cart({ open, cart, total, onClose, onIncrease, onDecrease, onCheckout }) {
    return (
        <>
            {open && (
                <div onClick={onClose} style={{
                    position: 'fixed', inset: 0, zIndex: 500,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                    animation: 'fadeIn 0.2s ease',
                }}/>
            )}
        <div className="cart-sidebar" style={{
            position: 'fixed', top: 0, 
            right: open ? 0 : '-100%',
            width: 'min(100vw, 440px)', height: '100vh',
                background: '#090918',
                borderLeft: '1px solid rgba(255,255,255,0.06)',
                zIndex: 501, transition: 'right 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                display: 'flex', flexDirection: 'column',
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px 28px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <div>
                        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: 'white' }}>Tu pedido</h3>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                            {cart.reduce((s, i) => s + i.quantity, 0)} productos
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'var(--text-muted)', fontSize: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>✕</button>
                </div>

                {/* Items */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
                            <div style={{ fontSize: 15, marginBottom: 6 }}>Tu carrito está vacío</div>
                            <div style={{ fontSize: 13 }}>Agrega productos para continuar</div>
                        </div>
                    ) : cart.map(item => (
                        <div key={item.product.id} style={{
                            display: 'flex', gap: 14, alignItems: 'center',
                            padding: '14px 0',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: 12, overflow: 'hidden',
                                background: 'rgba(255,255,255,0.04)', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {item.product.imageUrl
                                    ? <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                                    : <span style={{ fontSize: 24 }}>📦</span>}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {item.product.name}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    S/ {item.product.price.toFixed(2)} c/u
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <button onClick={() => onDecrease(item.product.id)} style={{
                                    width: 28, height: 28, borderRadius: 8,
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    color: 'white', fontSize: 14, fontWeight: 700,
                                }}>−</button>
                                <span style={{ fontSize: 14, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>
                  {item.quantity}
                </span>
                                <button onClick={() => onIncrease(item.product.id)} style={{
                                    width: 28, height: 28, borderRadius: 8,
                                    background: 'rgba(124,131,253,0.12)',
                                    border: '1px solid rgba(124,131,253,0.2)',
                                    color: 'var(--primary)', fontSize: 14, fontWeight: 700,
                                }}>+</button>
                            </div>
                            <div style={{
                                fontFamily: "'Fraunces', serif",
                                fontSize: 15, fontWeight: 600, color: 'var(--primary)',
                                minWidth: 70, textAlign: 'right',
                            }}>
                                S/ {(item.product.price * item.quantity).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Total del pedido</span>
                            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700 }}>
                S/ {total.toFixed(2)}
              </span>
                        </div>
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 12, padding: '10px 14px', marginBottom: 14,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Pagos aceptados</span>
                            <div style={{ display: 'flex', gap: 8, fontSize: 15 }}>
                                <span title="Efectivo">💵</span>
                                <span title="Yape">📱</span>
                                <span title="Plin">🏦</span>
                                <span title="Tarjeta">💳</span>
                            </div>
                        </div>
                        <button onClick={onCheckout} style={{
                            width: '100%', padding: 15,
                            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                            color: 'white', borderRadius: 14,
                            fontSize: 15, fontWeight: 600,
                            boxShadow: '0 8px 24px rgba(124,131,253,0.25)',
                            transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            marginBottom: 10,
                        }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
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

// ═══ CheckoutModal.jsx ═══
import { useState } from 'react'
import { createOrder } from '../api/storeApi'
import toast from 'react-hot-toast'

export function CheckoutModal({ open, cart, total, company, onClose, onSuccess }) {
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [orderId, setOrderId] = useState(null)

    const handleConfirm = async () => {
        if (!name.trim()) { toast.error('Por favor ingresa tu nombre'); return }
        setLoading(true)
        try {
            const order = await createOrder(company.id, {
                customerName: name.trim(),
                items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity }))
            })
            setOrderId(order.id)
            onSuccess()
        } catch (e) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => { setName(''); setPhone(''); setOrderId(null); onClose() }

    const waPhone = company?.phone?.replace(/[^0-9]/g, '')
    const waMsg = encodeURIComponent(`¡Hola! Acabo de hacer el pedido #${orderId} en tu tienda Fluxy. ¿Cuándo me lo entregas? 🙌`)

    if (!open) return null

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 600,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, animation: 'fadeIn 0.2s ease',
        }}>
            <div style={{
                background: '#0a0a18',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 24, width: '100%', maxWidth: 480,
                boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
                maxHeight: '90vh', overflowY: 'auto',
                animation: 'fadeUp 0.3s ease',
            }}>
                {orderId ? (
                    <div style={{ textAlign: 'center', padding: '48px 36px' }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: '50%',
                            background: 'rgba(52,211,153,0.1)',
                            border: '2px solid rgba(52,211,153,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 32, margin: '0 auto 24px',
                        }}>🎉</div>
                        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, marginBottom: 12 }}>
                            ¡Pedido Confirmado!
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 6 }}>
                            El vendedor fue notificado y te contactará pronto.
                        </p>
                        <div style={{
                            display: 'inline-block',
                            background: 'rgba(124,131,253,0.08)',
                            border: '1px solid rgba(124,131,253,0.2)',
                            borderRadius: 50, padding: '6px 18px',
                            fontSize: 14, color: 'var(--primary)', fontWeight: 600,
                            marginBottom: 28,
                        }}>Pedido #{orderId}</div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {waPhone && (
                                <a href={`https://wa.me/${waPhone}?text=${waMsg}`} target="_blank" rel="noreferrer"
                                   style={{
                                       display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                       background: 'linear-gradient(135deg, #25d366, #128c7e)',
                                       color: 'white', padding: '13px 24px',
                                       borderRadius: 14, fontSize: 14, fontWeight: 600,
                                   }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    Coordinar por WhatsApp
                                </a>
                            )}
                            <button onClick={handleClose} style={{
                                padding: '13px 24px',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 14, fontSize: 14, fontWeight: 500, color: 'white',
                            }}>Seguir comprando</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div style={{
                            padding: '24px 28px',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20 }}>Confirmar pedido</h3>
                            <button onClick={handleClose} style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: 'var(--text-muted)', fontSize: 16,
                            }}>✕</button>
                        </div>

                        <div style={{ padding: '24px 28px' }}>
                            {/* Resumen */}
                            <div style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 14, padding: 16, marginBottom: 20,
                            }}>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>
                                    Resumen del pedido
                                </div>
                                {cart.map(item => (
                                    <div key={item.product.id} style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        fontSize: 13, padding: '6px 0',
                                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                                        color: 'var(--text-soft)',
                                    }}>
                                        <span>{item.product.name} × {item.quantity}</span>
                                        <span>S/ {(item.product.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Campos */}
                            {[
                                { label: 'Tu nombre completo *', value: name, onChange: setName, placeholder: 'Ej: Juan Pérez' },
                                { label: 'Tu teléfono (para coordinar entrega)', value: phone, onChange: setPhone, placeholder: '+51 999 999 999' },
                            ].map(field => (
                                <div key={field.label} style={{ marginBottom: 16 }}>
                                    <label style={{
                                        display: 'block', fontSize: 11, color: 'var(--text-muted)',
                                        fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8,
                                    }}>{field.label}</label>
                                    <input
                                        value={field.value} onChange={e => field.onChange(e.target.value)}
                                        placeholder={field.placeholder}
                                        style={{
                                            width: '100%', background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: 12, padding: '12px 16px',
                                            color: 'white', fontSize: 14, outline: 'none',
                                            fontFamily: 'DM Sans, sans-serif',
                                            transition: 'border-color 0.2s',
                                        }}
                                        onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.4)'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                                    />
                                </div>
                            ))}

                            <div style={{
                                background: 'rgba(124,131,253,0.05)',
                                border: '1px solid rgba(124,131,253,0.1)',
                                borderRadius: 10, padding: '10px 14px',
                                fontSize: 12, color: 'var(--text-muted)',
                                textAlign: 'center', marginBottom: 20,
                            }}>
                                🔒 Tu información es confidencial y solo se usa para este pedido
                            </div>

                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                marginBottom: 20, padding: '16px 0',
                                borderTop: '1px solid rgba(255,255,255,0.06)',
                            }}>
                                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Total a pagar</span>
                                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700 }}>
                  S/ {total.toFixed(2)}
                </span>
                            </div>

                            <button onClick={handleConfirm} disabled={loading} style={{
                                width: '100%', padding: 15,
                                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                                color: 'white', borderRadius: 14,
                                fontSize: 15, fontWeight: 600,
                                opacity: loading ? 0.7 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 8px 24px rgba(124,131,253,0.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            }}>
                                {loading ? 'Procesando...' : '✅ Confirmar pedido'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

// ═══ ProductDetailModal.jsx ═══
export function ProductDetailModal({ product, onClose, onAddToCart, company }) {
    const [adding, setAdding] = useState(false)
    if (!product) return null

    const phone = company?.phone?.replace(/[^0-9]/g, '')
    const waMsg = encodeURIComponent(`¡Hola! Estoy interesado en *${product.name}* de tu tienda *${company?.name}* en Fluxy. ¿Está disponible?`)

    const handleAdd = () => {
        setAdding(true)
        onAddToCart(product)
        setTimeout(() => setAdding(false), 600)
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 600,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, animation: 'fadeIn 0.2s ease',
        }}>
            <div style={{
                background: '#0a0a18',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 24, width: '100%', maxWidth: 520,
                boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
                animation: 'fadeUp 0.3s ease',
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
                        color: 'white', fontSize: 16,
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
                        fontSize: 24, fontWeight: 700, color: 'white',
                        marginBottom: 8, letterSpacing: '-0.3px',
                    }}>{product.name}</h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <span style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 30, fontWeight: 700, color: 'var(--primary)',
            }}>S/ {product.price.toFixed(2)}</span>
                        <span style={{
                            fontSize: 12, color: product.stock <= 5 ? 'var(--warning)' : 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', gap: 4,
                        }}>
              <div style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: product.stock <= 5 ? 'var(--warning)' : 'var(--success)',
              }}/>
                            {product.stock === 0 ? 'Sin stock' : `${product.stock} disponibles`}
            </span>
                    </div>

                    {product.description && (
                        <div style={{
                            fontSize: 14, color: 'var(--text-soft)', lineHeight: 1.7,
                            marginBottom: 20, padding: '14px 16px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 12,
                        }}>{product.description}</div>
                    )}

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={handleAdd} disabled={product.stock === 0} style={{
                            flex: 2, padding: '13px',
                            background: product.stock === 0 ? 'rgba(255,255,255,0.04)' : adding ? 'rgba(52,211,153,0.15)' : 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                            color: product.stock === 0 ? 'var(--text-muted)' : adding ? '#34d399' : 'white',
                            border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 600,
                            cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s',
                        }}>
                            {product.stock === 0 ? 'Sin stock' : adding ? '✓ Agregado' : '+ Agregar al carrito'}
                        </button>

                        {phone && (
                            <a href={`https://wa.me/${phone}?text=${waMsg}`} target="_blank" rel="noreferrer"
                               style={{
                                   flex: 1, padding: '13px',
                                   background: 'rgba(37,211,102,0.08)',
                                   border: '1px solid rgba(37,211,102,0.2)',
                                   borderRadius: 14, fontSize: 13, fontWeight: 600,
                                   color: '#25d366', textAlign: 'center',
                                   display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                               }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
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
