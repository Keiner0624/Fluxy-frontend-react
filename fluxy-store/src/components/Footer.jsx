export default function Footer({ company }) {
    return (
        <footer style={{
            padding: '40px 32px', textAlign: 'center',
            color: 'var(--text-muted)', fontSize: 14
        }}>
            <p style={{ fontFamily: 'Playfair Display', fontSize: 18, color: 'var(--text)', marginBottom: 8 }}>
                {company?.name}
            </p>
            <p>© {new Date().getFullYear()} — Todos los derechos reservados</p>
        </footer>
    )
}
