// src/modules/dashboard/components/DashboardLayout.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { getCompanyStoreUrl } from '@/app/config'
import { getMe } from '@/app/account'
import { logout } from '@/app/session'
import AccountBanners from './AccountBanners'
import usePlan from '@/hooks/usePlan'
import useAccess from '@/hooks/useAccess'
import BrandLogo from '@/components/BrandLogo'
import Icon from '@/components/Icon'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { useTheme } from '@/hooks/useTheme'

const PLAN_ORDER = { FREE: 0, PRO: 1, BUSINESS: 2 }
const COLLAPSED_KEY = 'fluxy_sidebar_collapsed'

// Agrupado por tarea del negocio. Cada opción se muestra solo a quien tiene
// permiso de verla; el backend vuelve a validarlo en cada petición.
const NAV_GROUPS = [
  {
    label: 'General',
    items: [
      { path: '/dashboard',            icon: 'overview',   label: 'Resumen',            permission: 'ORDER_VIEW' },
      { path: '/dashboard/metrics',    icon: 'metrics',    label: 'Métricas',           permission: 'REPORT_VIEW', requiredPlan: 'PRO' },
    ],
  },
  {
    label: 'Ventas',
    items: [
      { path: '/dashboard/orders',     icon: 'orders',     label: 'Pedidos',            permission: 'ORDER_VIEW' },
      { path: '/dashboard/customers',  icon: 'customers',  label: 'Clientes',           permission: 'CUSTOMER_VIEW' },
      { path: '/dashboard/payments',   icon: 'payments',   label: 'Pagos',              permission: 'PAYMENT_VIEW' },
      { path: '/dashboard/coupons',    icon: 'coupons',    label: 'Cupones',            permission: 'COUPON_VIEW', requiredPlan: 'PRO' },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { path: '/dashboard/products',   icon: 'products',   label: 'Productos',          permission: 'PRODUCT_VIEW' },
      { path: '/dashboard/categories', icon: 'categories', label: 'Categorías',         permission: 'PRODUCT_VIEW' },
      { path: '/dashboard/inventory',  icon: 'inventory',  label: 'Inventario',         permission: 'INVENTORY_VIEW' },
    ],
  },
  {
    label: 'Análisis',
    items: [
      { path: '/dashboard/reports',    icon: 'reports',    label: 'Reportes',           permission: 'REPORT_VIEW', requiredPlan: 'PRO' },
    ],
  },
  {
    label: 'Tienda',
    items: [
      { path: '/dashboard/style',      icon: 'style',      label: 'Estilo',             permission: 'SETTINGS_MANAGE', requiredPlan: 'PRO' },
      { path: '/dashboard/settings',   icon: 'settings',   label: 'Configuración',      permission: 'SETTINGS_MANAGE' },
    ],
  },
  {
    label: 'Administración',
    items: [
      { path: '/dashboard/team',         icon: 'team',     label: 'Equipo',             permission: 'TEAM_VIEW' },
      { path: '/dashboard/activity',     icon: 'history',  label: 'Actividad',          permission: 'AUDIT_VIEW' },
      { path: '/dashboard/integrations', icon: 'plug',     label: 'Integraciones',      permission: 'INTEGRATION_VIEW' },
      { path: '/dashboard/plans',        icon: 'plans',    label: 'Plan y facturación', permission: 'BILLING_MANAGE' },
    ],
  },
  {
    label: 'Cuenta',
    items: [
      { path: '/dashboard/security',     icon: 'shield',   label: 'Seguridad' },
    ],
  },
]

function readCollapsed() {
  try { return localStorage.getItem(COLLAPSED_KEY) === '1' } catch { return false }
}

export default function DashboardLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const company  = JSON.parse(localStorage.getItem('company') || '{}') || {}
  const storeUrl = getCompanyStoreUrl(company)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(readCollapsed)

  usePushNotifications()
  const { plan } = usePlan()
  const access = useAccess()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    if (!sidebarOpen) return undefined
    const onKey = (event) => { if (event.key === 'Escape') setSidebarOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [sidebarOpen])

  // Cierra el menú móvil al cambiar de ruta
  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      try { localStorage.setItem(COLLAPSED_KEY, prev ? '0' : '1') } catch { /* modo privado */ }
      return !prev
    })
  }

  const planAllows = (requiredPlan) => {
    if (!requiredPlan) return true
    return (PLAN_ORDER[plan] || 0) >= (PLAN_ORDER[requiredPlan] || 0)
  }

  const [loggingOut, setLoggingOut] = useState(false)
  const [me, setMe] = useState(null)

  useEffect(() => {
    let vigente = true
    getMe().then((data) => { if (vigente) setMe(data) }).catch(() => {})
    return () => { vigente = false }
  }, [location.pathname])

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    navigate('/login')
  }

  const isActive = (path) =>
    path === '/dashboard' ? location.pathname === path : location.pathname.startsWith(path)

  // Mientras llega /me no se sabe qué puede ver: mejor un menú vacío que uno que cambia.
  const groups = NAV_GROUPS
    .map((group) => ({ ...group, items: group.items.filter((item) => !item.permission || access.can(item.permission)) }))
    .filter((group) => group.items.length > 0)

  const sidebar = (
    <>
      <div className="fx-sidebar__brand">
        <Link to="/dashboard" aria-label="Ir al resumen">
          <span className="fx-sidebar__brand-full"><BrandLogo size={26} textSize={16} textColor="#fff" /></span>
          <span className="fx-sidebar__brand-mini"><BrandLogo size={26} showWordmark={false} /></span>
        </Link>
        <button
          type="button"
          className="fx-sidebar__collapse"
          onClick={toggleCollapsed}
          title={collapsed ? 'Expandir menú' : 'Contraer menú'}
          aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
          aria-pressed={collapsed}
        >
          <Icon name="sidebar" size={16} />
        </button>
      </div>

      <nav className="fx-sidebar__nav" aria-label="Secciones del panel">
        {groups.map((group) => (
          <div key={group.label} className="fx-sidebar__group">
            <p className="fx-sidebar__group-label">{group.label}</p>
            {group.items.map((item) => {
              const locked = !planAllows(item.requiredPlan)
              return (
                <Link
                  key={item.path}
                  to={locked ? '/dashboard/plans' : item.path}
                  title={collapsed ? item.label : undefined}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                  className={`fx-sidebar__link${isActive(item.path) ? ' is-active' : ''}${locked ? ' is-locked' : ''}`}
                >
                  <Icon name={item.icon} size={17} />
                  <span className="fx-sidebar__label">{item.label}</span>
                  {locked && <Icon name="lock" size={13} className="fx-sidebar__lock" style={{ marginLeft: 'auto', opacity: .6 }} />}
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
          <a href={storeUrl} target="_blank" rel="noreferrer" className="fx-sidebar__action" title={collapsed ? 'Ver mi tienda' : undefined}>
            <Icon name="external" size={15} />
            <span className="fx-sidebar__label">Ver mi tienda</span>
          </a>
        )}

        <button type="button" onClick={handleLogout} disabled={loggingOut} className="fx-sidebar__action" title={collapsed ? 'Cerrar sesión' : undefined}>
          <Icon name="logout" size={15} />
          <span className="fx-sidebar__label">Cerrar sesión</span>
        </button>
      </div>
    </>
  )

  return (
    <div className={`fx fx-shell${collapsed ? ' fx-shell--collapsed' : ''}`}>
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
            <button
              type="button"
              className="fx-btn fx-btn--ghost fx-btn--icon fx-theme-toggle"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
              aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
              aria-pressed={theme === 'dark'}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
            </button>

            {storeUrl && (
              <a href={storeUrl} target="_blank" rel="noreferrer" className="fx-btn fx-btn--secondary fx-btn--sm">
                <Icon name="store" size={15} />
                <span className="fx-hide-sm">Ver tienda</span>
              </a>
            )}
          </div>
        </header>

        <main className="fx-content">
          <AccountBanners me={me} onChange={() => getMe({ force: true }).then(setMe).catch(() => {})} />
          {children}
        </main>
      </div>

      <Toaster
        // En teléfono arriba: abajo tapaba los botones de las hojas y la barra del navegador.
        position={window.matchMedia?.('(max-width: 720px)').matches ? 'top-center' : 'bottom-right'}
        toastOptions={{
          duration: 3500,
          style: {
            background: 'var(--fx-surface)',
            color: 'var(--fx-ink)',
            border: '1px solid var(--fx-line)',
            boxShadow: 'var(--fx-shadow)',
            fontSize: 13.5,
            fontFamily: "'DM Sans', system-ui, sans-serif",
          },
          success: { iconTheme: { primary: 'var(--fx-ok)', secondary: 'var(--fx-surface)' } },
          error: { iconTheme: { primary: 'var(--fx-danger)', secondary: 'var(--fx-surface)' } },
        }}
      />
    </div>
  )
}
