// src/components/Footer.jsx

export default function Footer({ company }) {
  return (
    <footer style={{ padding: '48px 16px 32px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 40, marginBottom: 32,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              {company?.logoUrl ? (
                <img src={company.logoUrl} alt={company.name}
                  style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}/>
              ) : (
                <div style={{
                  width: 36, height: 36,
                  background: 'linear-gradient(135deg, var(--primary, #7c83fd), #4f46e5)',
                  borderRadius: 10, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 16, fontWeight: 800, color: 'white',
                }}>
                  {company?.name?.[0] || 'F'}
                </div>
              )}
              <div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, color: 'white' }}>
                  {company?.name || 'Tienda'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted, #4a4a6a)' }}>via Fluxy</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted, #4a4a6a)', lineHeight: 1.7 }}>
              {company?.description || 'Tu tienda de confianza.'}
            </p>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-soft, #9898b8)', marginBottom: 16 }}>
              Contacto
            </div>
            {company?.address && (
              <div style={{ fontSize: 13, color: 'var(--text-muted, #4a4a6a)', marginBottom: 8 }}>
                📍 {company.address}
              </div>
            )}
            {company?.phone && (
              <div style={{ fontSize: 13, color: 'var(--text-muted, #4a4a6a)' }}>
                📞 {company.phone}
              </div>
            )}
          </div>
        </div>

        <div style={{
          paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted, #4a4a6a)' }}>
            © {new Date().getFullYear()} {company?.name}. Todos los derechos reservados.
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted, #4a4a6a)' }}>
            Powered by <strong style={{ color: 'var(--primary, #7c83fd)' }}>Fluxy</strong>
          </div>
        </div>
      </div>
    </footer>
  )
}