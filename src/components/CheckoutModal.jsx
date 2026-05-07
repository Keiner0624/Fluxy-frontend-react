// src/components/CheckoutModal.jsx
import { useState } from 'react'
import { createOrder } from '../api/storeApi'
import toast from 'react-hot-toast'

export default function CheckoutModal({ open, cart, total, company, onClose, onSuccess }) {
  const [name, setName]           = useState('')
  const [phone, setPhone]         = useState('')
  const [address, setAddress]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [orderId, setOrderId]     = useState(null)
  const [whatsappUrl, setWhatsappUrl] = useState(null) // ← URL generada por el backend

  const handleConfirm = async () => {
    if (!name.trim()) { toast.error('Por favor ingresa tu nombre'); return }
    setLoading(true)
    try {
      const data = await createOrder(company.id, {
        customerName:    name.trim(),
        customerPhone:   phone.trim(),
        customerAddress: address.trim(),
        items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity })),
      })

      // El backend ahora retorna { order, orderId, total, whatsappUrl? }
      const id  = data.orderId || data.order?.id || data.id
      const url = data.whatsappUrl || null

      setOrderId(id)
      setWhatsappUrl(url)
      onSuccess()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName(''); setPhone(''); setAddress('')
    setOrderId(null); setWhatsappUrl(null)
    onClose()
  }

  if (!open) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 600,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: '#0a0a18',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24, width: '100%', maxWidth: 480,
        boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* ── Pantalla de confirmación ── */}
        {orderId ? (
          <div style={{ textAlign: 'center', padding: '48px 36px' }}>
            <div style={{ fontSize: 52, marginBottom: 18 }}>🎉</div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, marginBottom: 12 }}>
              ¡Pedido Confirmado!
            </h2>
            <p style={{ color: 'var(--text-muted, #4a4a6a)', fontSize: 14, marginBottom: 6 }}>
              El vendedor fue notificado y te contactará pronto.
            </p>
            <div style={{
              display: 'inline-block',
              background: 'rgba(124,131,253,0.08)', border: '1px solid rgba(124,131,253,0.2)',
              borderRadius: 50, padding: '6px 18px',
              fontSize: 14, color: 'var(--primary, #7c83fd)', fontWeight: 600, marginBottom: 28,
            }}>Pedido #{orderId}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* ✅ Botón WhatsApp — aparece solo si el backend lo retorna (plan PRO/BUSINESS) */}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: 'linear-gradient(135deg, #25d366, #128c7e)',
                    color: 'white', padding: '13px 24px', borderRadius: 14,
                    fontSize: 14, fontWeight: 600, textDecoration: 'none',
                  }}
                >
                  💬 Coordinar por WhatsApp
                </a>
              )}

              <button onClick={handleClose} style={{
                padding: '13px 24px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14, fontSize: 14, fontWeight: 500,
                color: 'white', cursor: 'pointer',
              }}>Seguir comprando</button>
            </div>
          </div>
        ) : (
          <>
            {/* ── Formulario ── */}
            <div style={{
              padding: '22px 26px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20 }}>Confirmar pedido</h3>
              <button onClick={handleClose} style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-muted, #4a4a6a)', fontSize: 16,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>

            <div style={{ padding: '24px 26px' }}>
              {/* Resumen del carrito */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14, padding: 16, marginBottom: 20,
              }}>
                {cart.map(item => (
                  <div key={item.product.id} style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 13, padding: '6px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    color: 'var(--text-soft, #9898b8)',
                  }}>
                    <span>{item.product.name} × {item.quantity}</span>
                    <span>S/ {(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Campos del cliente */}
              {[
                { label: 'Tu nombre completo *',    value: name,    onChange: setName,    placeholder: 'Ej: Juan Pérez' },
                { label: 'Tu teléfono',             value: phone,   onChange: setPhone,   placeholder: '+51 999 999 999' },
                { label: 'Tu dirección de entrega', value: address, onChange: setAddress, placeholder: 'Ej: Av. Ejemplo 123, Lima' },
              ].map(field => (
                <div key={field.label} style={{ marginBottom: 16 }}>
                  <label style={{
                    display: 'block', fontSize: 11, color: 'var(--text-muted, #4a4a6a)',
                    fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8,
                  }}>{field.label}</label>
                  <input
                    value={field.value}
                    onChange={e => field.onChange(e.target.value)}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 12, padding: '12px 16px',
                      color: 'white', fontSize: 14, outline: 'none',
                      fontFamily: 'DM Sans, sans-serif',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(124,131,253,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>
              ))}

              {/* Total */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 20, padding: '16px 0',
                borderTop: '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{ fontSize: 14, color: 'var(--text-muted, #4a4a6a)' }}>Total a pagar</span>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700 }}>
                  S/ {total.toFixed(2)}
                </span>
              </div>

              <button onClick={handleConfirm} disabled={loading} style={{
                width: '100%', padding: 15,
                background: 'linear-gradient(135deg, var(--primary, #7c83fd), #4f46e5)',
                color: 'white', borderRadius: 14, fontSize: 15, fontWeight: 600,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer', border: 'none',
              }}>
                {loading ? 'Procesando...' : '✅ Confirmar Pedido'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}