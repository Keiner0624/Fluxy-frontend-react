import DashboardLayout from '../components/DashboardLayout'

export default function OrdersPage() {
  return (
    <DashboardLayout>
      <div style={{
        background: 'rgba(13,13,26,0.88)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 20,
        padding: '32px 28px',
      }}>
        <div style={{
          fontSize: 11,
          color: '#34d399',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          marginBottom: 8,
        }}>
          Panel de vendedor
        </div>
        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 28,
          fontWeight: 700,
          color: 'white',
          marginBottom: 10,
        }}>
          Pedidos
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>
          Esta vista ya quedó conectada al router. El siguiente paso es mostrar aquí
          los pedidos reales de tu tienda.
        </p>
      </div>
    </DashboardLayout>
  )
}
