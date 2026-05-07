export default function Footer({ company }) {
    return (
        <footer style={{
            padding: '40px 32px', textAlign: 'center',
            color: 'var(--text-muted)', fontSize: 14
        }}>
            <div className="footer-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 40, marginBottom: 32,
            }}>
                <p style={{ fontFamily: 'Playfair Display', fontSize: 18, color: 'var(--text)', marginBottom: 8 }}>
                    {company?.name}
                </p>
            </div>
            <p>© {new Date().getFullYear()} — Todos los derechos reservados</p>
        </footer>
    )
}
