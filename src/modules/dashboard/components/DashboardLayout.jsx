// src/modules/dashboard/components/DashboardLayout.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getCompanyStoreUrl, API_URL } from '@/app/config'
import BrandLogo from '@/components/BrandLogo'
import Icon from '@/components/Icon'
import { usePushNotifications } from '@/hooks/usePushNotifications'

function getToken() { return localStorage.getItem('token') || '' }

const PLAN_ORDER = { FREE: 0, PRO: 1, BUSINESS: 2 }

const NAV_GROUPS = [
  {
    label: 'General',
    items: [
      { path: '/dashboard',          icon: 'overview', label: 'Resumen' },
      { path: '/dashboard/metrics',  icon: 'metrics',  label: 'Métricas', requiredPlan: 'PRO' },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { path: '/dashboard/products', icon: 'products', label: 'Productos' },
      { path: '/dashboard/orders',   icon: 'orders',   label: 'Pedidos' },
      { path: '/dashboard/coupons',  icon: 'coupons',  label: 'Cupones', requiredPlan: 'PRO' },
    ],
  },
  {
    label: 'Tienda',
    items: [
      { path: '/dashboard/style',    icon: 'style',    label: 'Estilo', requiredPlan: 'PRO' },
      { path: '/dashboard/settings', icon: 'settings', label: 'Configuración' },
      { path: '/dashboard/plans',    icon: 'plans',    label: 'Plan y facturación' },
    ],
  },
]

export default function DashboardLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const company  = JSON.parse(localStorage.getItem('company') || '{}') || {}
  const storeUrl = getCompanyStoreUrl(company)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [plan, setPlan]               = useState('FREE')

  usePushNotifications()

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
        if (!res.ok) return
        const data = await res.json()
        if (data.planName) setPlan(data.planName)
      } catch { /* silencioso */ }
    }
    load()
  }, [])

  // Cierra el menú móvil al cambiar de ruta
  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  const canAccess = (requiredPlan) => {
    if (!requiredPlan) return true
    return (PLAN_ORDER[plan] || 0) >= (PLAN_ORDER[requiredPlan] || 0)
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const isActive = (path) =>
    path === '/dashboard' ? location.pathname === path : location.pathname.startsWith(path)

  const sidebar = (
    <>
      <div className="fx-sidebar__brand">
        <Link to="/dashboard">
          <BrandLogo size={26} textSize={16} textColor="#fff" />
        </Link>
      </div>

      <nav className="fx-sidebar__nav">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="fx-sidebar__group">
            <p className="fx-sidebar__group-label">{group.label}</p>
            {group.items.map((item) => {
              const locked = !canAccess(item.requiredPlan)
              return (
                <Link
                  key={item.path}
                  to={locked ? '/dashboard/plans' : item.path}
                  className={`fx-sidebar__link${isActive(item.path) ? ' is-active' : ''}${locked ? ' is-locked' : ''}`}
                >
                  <Icon name={item.icon} size={17} />
                  <span>{item.label}</span>
                  {locked && <Icon name="lock" size={13} style={{ marginLeft: 'auto', opacity: .6 }} />}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="fx-sidebar__foot">
        <div className="fx-sidebar__company">
          <span className="fx-sidebar__company-name fx-truncate">{company.name || 'Mi negocio'}</span>
          <span className={`fx-plan-tag fx-plan-tag--${plan.toLowerCase()}`}>{plan}</span>
        </div>

        {storeUrl && (
          <a href={storeUrl} target="_blank" rel="noreferrer" className="fx-sidebar__action">
            <Icon name="external" size={15} />
            Ver mi tienda
          </a>
        )}

        <button type="button" onClick={handleLogout} className="fx-sidebar__action">
          <Icon name="logout" size={15} />
          Cerrar sesión
        </button>
      </div>
    </>
  )

  return (
    <div className="fx fx-shell">
      <aside className="fx-sidebar fx-sidebar--desktop">{sidebar}</aside>

      {sidebarOpen && (
        <>
          <div className="fx-sidebar__overlay" onClick={() => setSidebarOpen(false)} />
          <aside className="fx-sidebar fx-sidebar--mobile">{sidebar}</aside>
        </>
      )}

      <div className="fx-shell__main">
        <header className="fx-topbar">
          <button
            type="button"
            className="fx-btn fx-btn--ghost fx-btn--icon fx-topbar__menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <Icon name="menu" size={19} />
          </button>

          <div className="fx-topbar__brand">
            <BrandLogo size={24} textSize={15} textColor="var(--fx-ink)" />
          </div>

          <div className="fx-topbar__right">
            {storeUrl && (
              <a href={storeUrl} target="_blank" rel="noreferrer" className="fx-btn fx-btn--secondary fx-btn--sm">
                <Icon name="store" size={15} />
                <span className="fx-hide-sm">Ver tienda</span>
              </a>
            )}
          </div>
        </header>

        <main className="fx-content">{children}</main>
      </div>
    </div>
  )
}
