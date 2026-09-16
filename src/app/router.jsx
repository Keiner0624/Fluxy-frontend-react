import { lazy, Suspense } from 'react'
import { Navigate, createBrowserRouter, useParams, useSearchParams } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

const LandingPage = lazy(() => import('@/modules/landing/pages/LandingPage'))
const LoginPage = lazy(() => import('@/modules/auth/pages/LoginPage'))
const RegisterBusinessPage = lazy(() => import('@/modules/auth/pages/RegisterBusinessPage'))
const BusinessOnboardingPage = lazy(() => import('@/modules/auth/pages/BusinessOnboardingPage'))
const StorePage = lazy(() => import('@/modules/store/pages/StorePage'))
const DashboardPage = lazy(() => import('@/modules/dashboard/pages/DashboardPage'))
const ProductsPage = lazy(() => import('@/modules/dashboard/pages/ProductsPage'))
const OrdersPage = lazy(() => import('@/modules/dashboard/pages/OrdersPage'))
const SettingsPage = lazy(() => import('@/modules/dashboard/pages/SettingsPage'))
const StylePage = lazy(() => import('@/modules/dashboard/pages/StylePage'))
const MetricsPage = lazy(() => import('@/modules/dashboard/pages/MetricsPage'))
const PlansPage = lazy(() => import('@/modules/dashboard/pages/PlansPage'))
const CouponsPage = lazy(() => import('@/modules/dashboard/pages/CouponsPage'))
const CustomersPage = lazy(() => import('@/modules/dashboard/pages/CustomersPage'))
const PaymentsPage = lazy(() => import('@/modules/dashboard/pages/PaymentsPage'))
const CategoriesPage = lazy(() => import('@/modules/dashboard/pages/CategoriesPage'))
const InventoryPage = lazy(() => import('@/modules/dashboard/pages/InventoryPage'))
const ReportsPage = lazy(() => import('@/modules/dashboard/pages/ReportsPage'))
const TeamPage = lazy(() => import('@/modules/dashboard/pages/TeamPage'))
const IntegrationsPage = lazy(() => import('@/modules/dashboard/pages/IntegrationsPage'))
const SecurityPage = lazy(() => import('@/modules/dashboard/pages/SecurityPage'))
const ActivityPage = lazy(() => import('@/modules/dashboard/pages/ActivityPage'))
const AcceptInvitePage = lazy(() => import('@/modules/auth/pages/AcceptInvitePage'))
const PermissionRoute = lazy(() => import('@/modules/dashboard/components/PermissionRoute'))
const ForgotPasswordPage = lazy(() => import('@/modules/auth/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/modules/auth/pages/ResetPasswordPage'))
const ComplaintsPage = lazy(() => import('@/modules/landing/pages/ComplaintsPage'))
const AdminPage = lazy(() => import('@/modules/admin/pages/AdminPage'))
const AdminLoginPage = lazy(() => import('@/modules/admin/pages/AdminLoginPage'))
const TermsPage = lazy(() => import('@/modules/landing/pages/TermsPage'))
const NotFoundPage = lazy(() => import('@/app/NotFoundPage'))

const PAYMENT_STATUS_MAP = {
  approved: 'success',
  rejected: 'failure',
  cancelled: 'failure',
  in_process: 'pending',
  in_mediation: 'pending',
}

function PageFallback() {
  return (
    <div style={{ display: 'grid', minHeight: '100vh', placeItems: 'center', background: '#080b12', color: 'rgba(255,255,255,.62)', fontFamily: 'DM Sans, sans-serif', fontSize: 13 }}>
      Cargando página
    </div>
  )
}

/** La tienda es clara: su espera no puede ser la pantalla oscura del resto. */
function StoreFallback() {
  return <div style={{ minHeight: '100vh', background: '#f7f5f2' }} aria-busy="true" />
}

const render = component => <Suspense fallback={<PageFallback />}>{component}</Suspense>
const renderStore = component => <Suspense fallback={<StoreFallback />}>{component}</Suspense>
const protect = component => <ProtectedRoute>{render(component)}</ProtectedRoute>

function getNormalizedPaymentStatus(searchParams, fallbackStatus = 'pending') {
  const rawStatus = searchParams.get('payment')
    || searchParams.get('status')
    || searchParams.get('collection_status')
    || fallbackStatus
  return PAYMENT_STATUS_MAP[rawStatus] || rawStatus
}

function RootPage() {
  const [searchParams] = useSearchParams()
  const paymentStatus = getNormalizedPaymentStatus(searchParams, '')
  const plan = searchParams.get('plan') || localStorage.getItem('fluxy_pending_plan_checkout') || ''

  if (paymentStatus) {
    const params = new URLSearchParams({ payment: paymentStatus })
    if (plan) params.set('plan', plan)
    return <Navigate to={`/dashboard?${params.toString()}`} replace />
  }

  return searchParams.get('store') ? renderStore(<StorePage />) : render(<LandingPage />)
}

function PaymentReturnPage() {
  const { status } = useParams()
  const [searchParams] = useSearchParams()
  const payment = getNormalizedPaymentStatus(searchParams, status || 'pending')
  const plan = searchParams.get('plan') || localStorage.getItem('fluxy_pending_plan_checkout') || ''
  const params = new URLSearchParams({ payment })
  if (plan) params.set('plan', plan)
  return <Navigate to={`/dashboard?${params.toString()}`} replace />
}

export const router = createBrowserRouter([
  { path: '/', element: <RootPage /> },
  { path: '/login', element: render(<LoginPage />) },
  { path: '/register-business', element: render(<RegisterBusinessPage />) },
  { path: '/store/:slug', element: renderStore(<StorePage />) },
  { path: '/dashboard', element: protect(<DashboardPage />) },
  { path: '/dashboard/metrics', element: protect(<MetricsPage />) },
  { path: '/dashboard/products', element: protect(<ProductsPage />) },
  { path: '/dashboard/orders', element: protect(<OrdersPage />) },
  { path: '/dashboard/settings', element: protect(<PermissionRoute permission="SETTINGS_MANAGE" module="Configuración"><SettingsPage /></PermissionRoute>) },
  { path: '/dashboard/onboarding', element: protect(<BusinessOnboardingPage />) },
  { path: '/dashboard/style', element: protect(<PermissionRoute permission="SETTINGS_MANAGE" module="Estilo"><StylePage /></PermissionRoute>) },
  { path: '/dashboard/plans', element: protect(<PermissionRoute permission="BILLING_MANAGE" module="Plan y facturación"><PlansPage /></PermissionRoute>) },
  { path: '/dashboard/coupons', element: protect(<CouponsPage />) },
  { path: '/dashboard/customers', element: protect(<CustomersPage />) },
  { path: '/dashboard/payments', element: protect(<PaymentsPage />) },
  { path: '/dashboard/categories', element: protect(<CategoriesPage />) },
  { path: '/dashboard/inventory', element: protect(<InventoryPage />) },
  { path: '/dashboard/reports', element: protect(<ReportsPage />) },
  { path: '/dashboard/team', element: protect(<TeamPage />) },
  { path: '/dashboard/integrations', element: protect(<IntegrationsPage />) },
  { path: '/dashboard/security', element: protect(<SecurityPage />) },
  { path: '/dashboard/activity', element: protect(<ActivityPage />) },
  { path: '/invite/:token', element: render(<AcceptInvitePage />) },
  { path: '/payment/:status', element: protect(<PaymentReturnPage />) },
  { path: '/payments/:status', element: protect(<PaymentReturnPage />) },
  { path: '/forgot-password', element: render(<ForgotPasswordPage />) },
  { path: '/reset-password', element: render(<ResetPasswordPage />) },
  { path: '/admin', element: render(<AdminPage />) },
  { path: '/admin/login', element: render(<AdminLoginPage />) },
  { path: '/terms', element: render(<TermsPage />) },
  { path: '/libro-de-reclamaciones', element: render(<ComplaintsPage />) },
  { path: '*', element: render(<NotFoundPage />) },
])
