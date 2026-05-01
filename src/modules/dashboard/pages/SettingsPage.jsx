import DashboardLayout from '../components/DashboardLayout'

export default function SettingsPage() {
  const company = JSON.parse(localStorage.getItem('company') || '{}') || {}

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
          color: '#fbbf24',
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
          Configuración
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 18 }}>
          Aquí podrás editar la información de tu negocio y la configuración de tu tienda.
        </p>
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14,
          padding: '16px 18px',
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
            Negocio actual
          </div>
          <div style={{ fontSize: 16, color: 'white', fontWeight: 600 }}>
            {company.name || 'Mi negocio'}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
