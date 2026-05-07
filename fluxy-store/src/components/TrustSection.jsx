const items = [
    { icon: '🔒', title: 'Pago seguro', desc: 'Tus datos están protegidos' },
    { icon: '🚚', title: 'Envío rápido', desc: 'Recibe tu pedido en casa' },
    { icon: '↩️', title: 'Devoluciones', desc: 'Fáciles y sin complicaciones' },
    { icon: '💬', title: 'Soporte', desc: 'Estamos para ayudarte' },
]

export default function TrustSection() {
    return (
        <section className="trust-grid" style={{
            borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
            padding: '48px 32px', display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20
        }}>
            {items.map(({ icon, title, desc }) => (
                <div key={title} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
                    <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{title}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{desc}</p>
                </div>
            ))}
        </section>
    )
}
