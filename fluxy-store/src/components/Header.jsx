import { useState, useEffect } from 'react'

export default function Header({ company, cartCount, onCartOpen }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const phone = company?.phone?.replace(/[^0-9]/g, '')
  const waMsg = encodeURIComponent(`¡Hola! 👋 Vi tu tienda *${company?.name}* en Fluxy y quiero hacer un pedido.`)

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      padding: '0 16px',
      background: 'rgba(6,6,15,0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      transition: 'all 0.4s ease',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        height: 64, gap: 8,
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
          <div style={{
            width: 34, height: 34, flexShrink: 0,
            background: 'linear-gradient(135deg, #7c83fd, #4f46e5)',
            borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 800, color: 'white',
            boxShadow: '0 4px 12px rgba(124,131,253,0.35)',
          }}>
            {company?.name?.[0]?.toUpperCase() || 'F'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 15, fontWeight: 600, color: 'white',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: '30vw',
            }}>
              {company?.name || 'Tienda'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>via Fluxy</div>
          </div>
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

          {/* Badge verificado — oculto en móvil */}
          <div className="hide-mobile" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(52,211,153,0.08)',
            border: '1px solid rgba(52,211,153,0.2)',
            borderRadius: 50, padding: '5px 12px',
            fontSize: 11, color: '#34d399', fontWeight: 600,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }}/>
            Verificado
          </div>

          {/* WhatsApp — oculto en móvil */}
          {phone && (
            <a href={`https://wa.me/${phone}?text=${waMsg}`} target="_blank" rel="noreferrer"
              className="hide-mobile"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(37,211,102,0.1)',
                border: '1px solid rgba(37,211,102,0.25)',
                borderRadius: 12, padding: '8px 16px',
                fontSize: 13, fontWeight: 600, color: '#25d366',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contactar
            </a>
          )}

          {/* Carrito — siempre visible */}
          <button onClick={onCartOpen} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(124,131,253,0.15)',
            border: '1px solid rgba(124,131,253,0.35)',
            borderRadius: 12, padding: '9px 14px',
            color: 'white', fontSize: 13, fontWeight: 600,
            flexShrink: 0,
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <span className="hide-mobile">Carrito</span>
            {cartCount > 0 && (
              <span style={{
                background: 'var(--primary)', color: 'white',
                borderRadius: '50%', width: 20, height: 20,
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{cartCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}