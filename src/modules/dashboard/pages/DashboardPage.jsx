// src/modules/dashboard/pages/DashboardPage.jsx
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'

export default function DashboardPage() {
  const navigate = useNavigate()
  const company = JSON.parse(localStorage.getItem('company') || '{}')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return (
    <DashboardLayout>
      {/* Bienvenida */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,131,253,0.1), rgba(79,70,229,0.05))',
        border: '1px solid rgba(124,131,253,0.2)',
        borderRadius: 20, padding: '28px 32px',
        marginBottom: 28, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(to right, transparent, var(--primary), transparent)',
        }}/>
        <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8 }}>
          Panel de control
        </div>
        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 6,
        }}>
          ¡Bienvenido, {company.name || user.fullName}! 👋
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-soft)' }}>
          Desde aquí gestionas todo tu negocio en Fluxy.
        </p>
      </div>

      {/* Cards rápidas */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16, marginBottom: 28,
      }}>
        {[
          { icon: '📦', label: 'Productos', desc: 'Gestiona tu catálogo', path: '/dashboard/products', color: '#7c83fd' },
          { icon: '🛒', label: 'Pedidos', desc: 'Ver pedidos recibidos', path: '/dashboard/orders', color: '#34d399' },
          { icon: '⚙️', label: 'Configuración', desc: 'Edita tu tienda', path: '/dashboard/settings', color: '#fbbf24' },
        ].map(card => (
          <button key={card.path} onClick={() => navigate(card.path)} style={{
            background: 'rgba(13,13,26,0.9)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16, padding: '20px',
            textAlign: 'left', cursor: 'pointer',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = `${card.color}40`
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: `${card.color}15`,
              border: `1px solid ${card.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, marginBottom: 12,
            }}>{card.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 4 }}>
              {card.label}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{card.desc}</div>
          </button>
        ))}
      </div>

      {/* Link a la tienda */}
      {company.storeUrl && (
        <div style={{
          background: 'rgba(13,13,26,0.8)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16, padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
              🔗 Tu tienda pública
            </div>
            <div style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 500 }}>
              {company.storeUrl}
            </div>
          </div>
          <a href={company.storeUrl} target="_blank" rel="noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(52,211,153,0.08)',
            border: '1px solid rgba(52,211,153,0.2)',
            borderRadius: 10, padding: '8px 16px',
            fontSize: 13, fontWeight: 600, color: '#34d399',
          }}>
            Ver tienda
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      )}
    </DashboardLayout>
  )
}
