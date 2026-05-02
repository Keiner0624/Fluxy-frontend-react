// src/components/TrustSection.jsx

const trustItems = [
  { icon: '👤', title: 'Atención directa',   desc: 'Habla directo con el vendedor, sin intermediarios' },
  { icon: '⚡', title: 'Respuesta rápida',   desc: 'Tu pedido confirmado en minutos' },
  { icon: '🔒', title: 'Compra segura',      desc: 'Tu información siempre protegida' },
  { icon: '✅', title: 'Negocio verificado', desc: 'Tienda registrada y validada en Fluxy' },
]

export default function TrustSection() {
  return (
    <section style={{
      padding: '64px 16px',
      background: 'rgba(13,13,26,0.6)',
      borderTop: '1px solid rgba(255,255,255,0.04)',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            fontSize: 11, color: 'var(--primary, #7c83fd)', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 10,
          }}>¿Por qué elegirnos?</div>
          <h3 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 28, fontWeight: 700, color: 'white',
          }}>Tu confianza es nuestra prioridad</h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
        }}>
          {trustItems.map((item, i) => (
            <div key={i} style={{
              background: 'rgba(17,17,34,0.8)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20, padding: '28px 24px',
              transition: 'all 0.3s',
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
              <div style={{ fontSize: 13, color: 'var(--text-muted, #4a4a6a)', lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}