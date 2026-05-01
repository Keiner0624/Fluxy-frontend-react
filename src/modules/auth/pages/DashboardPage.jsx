export default function DashboardPage() {
  const company = JSON.parse(localStorage.getItem('company') || '{}')
  
  return (
    <div style={{ 
      color: 'white', padding: 40, 
      background: '#06060f', minHeight: '100vh' 
    }}>
      <h1>¡Bienvenido, {company.name}! 🎉</h1>
      <p style={{ color: '#9898b8', marginTop: 12 }}>
        Tu tienda: <a href={company.storeUrl} style={{ color: '#7c83fd' }}>
          {company.storeUrl}
        </a>
      </p>
    </div>
  )
}