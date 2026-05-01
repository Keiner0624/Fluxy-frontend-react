// src/modules/dashboard/components/DashboardLayout.jsx
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/dashboard',          icon: '📊', label: 'Resumen' },
  { path: '/dashboard/products', icon: '📦', label: 'Productos' },
  { path: '/dashboard/orders',   icon: '🛒', label: 'Pedidos' },
  { path: '/dashboard/settings', icon: '⚙️', label: 'Configuración' },
]

export default function DashboardLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const company = JSON.parse(localStorage.getItem('company') || '{}')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const Sidebar = ({ mobile = false }) => (
    <div style={{
      width: mobile ? '100%' : 240,
      height: mobile ? 'auto' : '100vh',
      background: '#08080f',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column',
      padding: '0 0 24px',
      position: mobile ? 'relative' : 'fixed',
      top: 0, left: 0, zIndex: mobile ? 'auto' : 200,
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        marginBottom: 8,
      }}>
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #7c83fd, #4f46e5)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 900, color: 'white',
          }}>F</div>
          <span style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 17, fontWeight: 700, color: 'white',
          }}>Fluxy</span>
        </Link>

        {/* Nombre negocio */}
        <div style={{
          marginTop: 12, padding: '8px 10px',
          background: 'rgba(124,131,253,0.08)',
          border: '1px solid rgba(124,131,253,0.15)',
          borderRadius: 10,
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Tu negocio</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {company.name || 'Mi Negocio'}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 12px' }}>
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path}
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10, marginBottom: 4,
                background: active ? 'rgba(124,131,253,0.12)' : 'transparent',
                border: active ? '1px solid rgba(124,131,253,0.2)' : '1px solid transparent',
                color: active ? 'var(--primary)' : 'var(--text-soft)',
                fontSize: 14, fontWeight: active ? 600 : 400,
                transition: 'all 0.2s',
                textDecoration: 'none',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Ver tienda + Logout */}
      <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {company.storeUrl && (
          <a href={company.storeUrl} target="_blank" rel="noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 12px', borderRadius: 10,
            background: 'rgba(52,211,153,0.08)',
            border: '1px solid rgba(52,211,153,0.2)',
            color: '#34d399', fontSize: 13, fontWeight: 500,
            textDecoration: 'none',
          }}>
            <span>🔗</span> Ver mi tienda
            <svg style={{ marginLeft: 'auto' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        )}
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 12px', borderRadius: 10,
          background: 'rgba(248,113,113,0.06)',
          border: '1px solid rgba(248,113,113,0.15)',
          color: '#f87171', fontSize: 13, fontWeight: 500,
          cursor: 'pointer', width: '100%',
        }}>
          <span>🚪</span> Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#06060f' }}>
      {/* Sidebar desktop */}
      <div className="hide-mobile">
        <Sidebar />
      </div>

      {/* Mobile header */}
      <div className="hide-desktop" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
        background: 'rgba(8,8,15,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 16px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28,
            background: 'linear-gradient(135deg, #7c83fd, #4f46e5)',
            borderRadius: 7, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 13, fontWeight: 900, color: 'white',
          }}>F</div>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 700, color: 'white' }}>
            Fluxy
          </span>
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, padding: '6px 10px', color: 'white', fontSize: 16,
        }}>☰</button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 290,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        }} onClick={() => setSidebarOpen(false)}/>
      )}
      {sidebarOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 295,
          width: 260, overflow: 'auto',
        }}>
          <Sidebar mobile />
        </div>
      )}

      {/* Main content */}
      <div style={{
        marginLeft: 240,
        flex: 1, minWidth: 0,
        padding: '32px 32px',
      }} className="dashboard-main">
        {children}
      </div>
    </div>
  )
}