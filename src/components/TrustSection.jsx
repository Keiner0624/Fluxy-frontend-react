// src/components/TrustSection.jsx

const trustItems = [
  { icon: '👤', title: 'Trato directo',     desc: 'Habla directo con el vendedor, sin intermediarios ni bots.', color: '#7c83fd' },
  { icon: '⚡', title: 'Respuesta rápida',  desc: 'Tu pedido confirmado en minutos, no en días.', color: '#fbbf24' },
  { icon: '🔒', title: 'Compra segura',     desc: 'Tu información y pagos siempre protegidos.', color: '#34d399' },
  { icon: '✅', title: 'Negocio verificado', desc: 'Tienda registrada y validada en la plataforma Fluxy.', color: '#f87171' },
]

export default function TrustSection() {
  return (
    <section style={{
      padding: '72px 20px',
      background: 'rgba(8,8,20,0.7)',
      borderTop: '1px solid rgba(255,255,255,0.04)',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ fontSize: 11, color: 'var(--primary, #7c83fd)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 12 }}>
            ¿Por qué elegirnos?
          </div>
          <h3 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 800, color: 'white', letterSpacing: '-0.5px',
          }}>Tu confianza es nuestra prioridad</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {trustItems.map((item, i) => (
            <div key={i} style={{
              background: 'rgba(13,13,26,0.8)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20, padding: '28px 24px',
              transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
              position: 'relative', overflow: 'hidden',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${item.color}30`
                e.currentTarget.style.transform = 'translateY(-5px)'
                e.currentTarget.style.boxShadow = `0 20px 50px rgba(0,0,0,0.4)`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* Glow */}
              <div style={{
                position: 'absolute', top: -30, right: -30, width: 80, height: 80,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${item.color}15 0%, transparent 70%)`,
                pointerEvents: 'none',
              }}/>

              <div style={{
                width: 50, height: 50, borderRadius: 14,
                background: `${item.color}12`,
                border: `1px solid ${item.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, marginBottom: 18,
              }}>{item.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 8 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', lineHeight: 1.7 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}