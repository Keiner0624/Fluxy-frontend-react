// src/modules/dashboard/components/DashboardLayout.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { getCompanyStoreUrl } from '@/app/config'
import { getMe } from '@/app/account'
import { logout } from '@/app/session'
import AccountBanners from './AccountBanners'
import LegalUpdateModal from './LegalUpdateModal'
import usePlan from '@/hooks/usePlan'
import useAccess from '@/hooks/useAccess'
import BrandLogo from '@/components/BrandLogo'
import Icon from '@/components/Icon'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import useBadges from '@/hooks/useBadges'
import { useTheme } from '@/hooks/useTheme'

const PLAN_ORDER = { FREE: 0, PRO: 1, BUSINESS: 2 }

// Qué contador lleva cada sección y cómo se ve. "dot" = aviso sin número.
const BADGES = {
  '/dashboard/orders':    { key: 'orders',    tone: 'brand',  label: (n) => `${n} ${n === 1 ? 'pedido' : 'pedidos'} por confirmar` },
  '/dashboard/customers': { key: 'customers', tone: 'soft',   label: (n) => `${n} ${n === 1 ? 'cliente nuevo' : 'clientes nuevos'}` },
  '/dashboard/payments':  { key: 'payments',  tone: 'brand',  label: (n) => `${n} ${n === 1 ? 'cobro' : 'cobros'} por verificar` },
  '/dashboard/coupons':   { key: 'coupons',   tone: 'warn',   label: (n) => `${n} ${n === 1 ? 'cupón vence' : 'cupones vencen'} en 3 días` },
  '/dashboard/inventory': { key: 'inventory', tone: 'warn',   label: (n) => `${n} ${n === 1 ? 'producto' : 'productos'} con stock bajo o agotados` },
  '/dashboard/team':      { key: 'team',      tone: 'soft',   label: (n) => `${n} ${n === 1 ? 'invitación pendiente' : 'invitaciones pendientes'}` },
  '/dashboard/activity':  { key: 'activity',  tone: 'danger', label: (n) => `${n} ${n === 1 ? 'alerta' : 'alertas'} de seguridad nuevas` },
  '/dashboard/plans':     { key: 'billing',   tone: 'warn',   dot: true, label: () => 'Tu plan termina pronto' },
  '/dashboard/security':  { key: 'security',  tone: 'warn',   dot: true, label: () => 'Verificá tu correo' },
}
// Lo que pide una acción: suma en el título de la pestaña y en el botón del menú del celular.
const ACTIONABLE = ['orders', 'payments']
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

  const badges = useBadges({
    scope: me ? `${me.companyId}_${me.email}` : null,
    pathname: location.pathname,
    enabled: Boolean(me),
  })
  const counts = { ...badges, security: me && me.emailVerified === false ? 1 : 0 }
  const pending = ACTIONABLE.reduce((sum, key) => sum + (Number(counts[key]) || 0), 0)
  const anyBadge = Object.values(BADGES).some((b) => Number(counts[b.key]) > 0)

  // (3) Fluxy: los pedidos por confirmar se ven aunque la pestaña esté en segundo plano.
  useEffect(() => {
    const base = document.title.replace(/^\(\d+\+?\)\s*/, '')
    document.title = pending > 0 ? `(${pending > 99 ? '99+' : pending}) ${base}` : base
    return () => { document.title = document.title.replace(/^\(\d+\+?\)\s*/, '') }
  }, [pending])

  const badgeFor = (path) => {
    const config = BADGES[path]
    const value = config ? Number(counts[config.key]) || 0 : 0
    if (!value) return null
    return { ...config, value, text: config.label(value) }
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
              const badge = locked ? null : badgeFor(item.path)
              return (
                <Link
                  key={item.path}
                  to={locked ? '/dashboard/plans' : item.path}
                  title={collapsed ? (badge ? `${item.label} · ${badge.text}` : item.label) : badge?.text}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                  className={`fx-sidebar__link${isActive(item.path) ? ' is-active' : ''}${locked ? ' is-locked' : ''}`}
                >
                  <span className="fx-sidebar__icon">
                    <Icon name={item.icon} size={17} />
                    {badge && <i className={`fx-sidebar__pip fx-sidebar__pip--${badge.tone}`} aria-hidden="true" />}
                  </span>
                  <span className="fx-sidebar__label">{item.label}</span>
                  {locked && <Icon name="lock" size={13} className="fx-sidebar__lock" style={{ marginLeft: 'auto', opacity: .6 }} />}
                  {badge && (
                    <span className={`fx-sidebar__badge fx-sidebar__badge--${badge.tone}${badge.dot ? ' fx-sidebar__badge--dot' : ''}`}>
                      {badge.dot ? '' : badge.value > 99 ? '99+' : badge.value}
                      <span className="sr-only">{badge.text}</span>
                    </span>
                  )}
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
            aria-label={anyBadge ? 'Abrir menú (hay avisos)' : 'Abrir menú'}
          >
            <Icon name="menu" size={19} />
            {anyBadge && <i className="fx-topbar__menu-dot" aria-hidden="true" />}
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

      <LegalUpdateModal />

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
