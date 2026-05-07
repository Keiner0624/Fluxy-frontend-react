// src/components/Hero.jsx
import { useState, useEffect } from 'react'

const ALL_PAYMENTS = [
  { key: 'efectivo',      label: '💵', name: 'Efectivo' },
  { key: 'yape',          label: '📱', name: 'Yape' },
  { key: 'plin',          label: '🏦', name: 'Plin' },
  { key: 'tarjeta',       label: '💳', name: 'Tarjeta' },
  { key: 'transferencia', label: '🏧', name: 'Transferencia' },
]

function getPaymentMethods(company) {
  try {
    if (!company?.paymentMethods) return ['efectivo', 'yape', 'plin']
    const raw = company.paymentMethods
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(parsed) ? parsed : ['efectivo', 'yape', 'plin']
  } catch { return ['efectivo', 'yape', 'plin'] }
}

export default function Hero({ company, loading, cartOpen }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 80) }, [])

  const phone = company?.phone?.replace(/[^0-9]/g, '')
  const waMsg = encodeURIComponent(
    `¡Hola! 👋 Vi tu tienda *${company?.name}* y quiero hacer un pedido. ¿Me puedes ayudar?`
  )
  const paymentKeys      = getPaymentMethods(company)
  const acceptedPayments = ALL_PAYMENTS.filter(p => paymentKeys.includes(p.key))

  const scrollToProducts = () => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      padding: '100px 20px 80px', position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 48, alignItems: 'center',
        }}>

          {/* ── Texto izquierda ── */}
          <div style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.7s ease',
          }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(124,131,253,0.08)',
              border: '1px solid rgba(124,131,253,0.2)',
              borderRadius: 50, padding: '6px 16px', marginBottom: 24,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', animation: 'pulse 2s infinite' }}/>
              <span style={{ fontSize: 12, color: '#7c83fd', fontWeight: 600, letterSpacing: '0.5px' }}>
                Tienda oficial
              </span>
            </div>

            {/* Título */}
            <h1 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 'clamp(36px, 6vw, 68px)',
              fontWeight: 900, lineHeight: 1.05,
              letterSpacing: '-2px', marginBottom: 20, color: 'white',
            }}>
              {loading ? (
                <span style={{ opacity: 0.4 }}>Cargando...</span>
              ) : (
                <>
                  Bienvenido a{' '}
                  <span style={{
                    background: 'linear-gradient(135deg, var(--primary, #7c83fd) 0%, #a78bfa 50%, var(--primary, #7c83fd) 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'shimmer 4s linear infinite',
                    display: 'block',
                  }}>
                    {company?.name || 'nuestra tienda'}
                  </span>
                </>
              )}
            </h1>

            {/* Descripción */}
            <p style={{
              fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8,
              maxWidth: 480, marginBottom: 36, fontWeight: 300,
            }}>
              {company?.description || 'Productos de calidad con atención directa y personalizada para ti.'}
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 44 }}>
              <button onClick={scrollToProducts} style={{
                background: 'linear-gradient(135deg, var(--primary, #7c83fd), #4f46e5)',
                color: 'white', padding: '14px 28px', borderRadius: 14,
                fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
                boxShadow: '0 8px 28px rgba(124,131,253,0.35)',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(124,131,253,0.45)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,131,253,0.35)' }}
              >
                Ver productos
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M7 17l9.2-9.2M17 17V7H7"/>
                </svg>
              </button>

              {phone && company?.plan !== 'FREE' && (
                <a href={`https://wa.me/${phone}?text=${waMsg}`} target="_blank" rel="noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(37,211,102,0.08)',
                    border: '1px solid rgba(37,211,102,0.2)',
                    borderRadius: 14, padding: '14px 22px',
                    fontSize: 15, fontWeight: 600, color: '#25d366',
                    textDecoration: 'none', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,211,102,0.14)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(37,211,102,0.08)'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Hablar con el vendedor
                </a>
              )}
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[
                { icon: '⚡', label: 'Respuesta rápida' },
                { icon: '🔒', label: 'Compra segura' },
                { icon: '✅', label: 'Negocio verificado' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14 }}>{s.icon}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Card derecha ── */}
          <div style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.7s ease 0.2s',
            animation: mounted ? 'float 6s ease infinite' : 'none',
          }}>
            <div style={{
              background: 'rgba(10,10,24,0.85)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 24, padding: 28,
              backdropFilter: 'blur(20px)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,131,253,0.08)',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Línea decorativa */}
              <div style={{ position: 'absolute', top: 0, left: 20, right: 20, height: 1, background: 'linear-gradient(to right, transparent, var(--primary, #7c83fd), transparent)' }}/>

              {/* Logo y nombre */}
              {(company?.logoUrl || company?.name) && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20,
                  paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>
                  {company?.logoUrl ? (
                    <img src={company.logoUrl} alt={company.name}
                      style={{ width: 56, height: 56, borderRadius: 16, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}/>
                  ) : (
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, var(--primary, #7c83fd), #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                      {company?.name?.[0]?.toUpperCase() || 'T'}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 4 }}>{company?.name || 'Tienda'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#34d399' }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#34d399', animation: 'pulse 2s infinite' }}/>
                      Negocio verificado
                    </div>
                  </div>
                </div>
              )}

              {/* Info */}
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 14, fontWeight: 700 }}>
                Información de contacto
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  company?.address && { icon: '📍', label: 'Ubicación', text: company.address },
                  company?.phone   && { icon: '📞', label: 'Teléfono',  text: company.phone },
                  { icon: '🕐', label: 'Atención',  text: 'Respuesta inmediata' },
                  { icon: '🔒', label: 'Seguridad', text: 'Compra 100% segura' },
                ].filter(Boolean).map((item, i, arr) => (
                  <div key={i} style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    padding: '12px 0',
                    borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: 'rgba(124,131,253,0.08)', border: '1px solid rgba(124,131,253,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{item.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Métodos de pago */}
              {acceptedPayments.length > 0 && (
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 12, fontWeight: 700 }}>
                    Aceptamos
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {acceptedPayments.map(p => (
                      <div key={p.key} style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 8, padding: '5px 10px', fontSize: 12, color: 'rgba(255,255,255,0.5)',
                      }}>
                        <span style={{ fontSize: 14 }}>{p.label}</span>
                        {p.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Banner inferior */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(135deg, rgba(124,131,253,0.06), rgba(251,191,36,0.04))',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        padding: '10px 16px', textAlign: 'center',
        fontSize: 13, color: '#fbbf24', fontWeight: 500,
      }}>
        🔥 Stock limitado — Asegura tu pedido hoy mismo
      </div>

      {/* WhatsApp flotante */}
      {phone && company?.plan !== 'FREE' && !cartOpen && (
        <a href={`https://wa.me/${phone}?text=${waMsg}`} target="_blank" rel="noreferrer"
          style={{
            position: 'fixed', bottom: 24, left: 16, zIndex: 400,
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'linear-gradient(135deg, #25d366, #128c7e)',
            color: 'white', padding: '12px 20px', borderRadius: 50,
            fontSize: 14, fontWeight: 600,
            boxShadow: '0 8px 28px rgba(37,211,102,0.4)',
            textDecoration: 'none', transition: 'all 0.2s',
            maxWidth: 'calc(100vw - 32px)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(37,211,102,0.5)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(37,211,102,0.4)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{ flexShrink: 0 }}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Habla con el vendedor
        </a>
      )}
    </section>
  )
}