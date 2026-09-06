import { lazy, Suspense } from 'react'
import { Navigate, createBrowserRouter, useParams, useSearchParams } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

const LandingPage = lazy(() => import('@/modules/landing/pages/LandingPage'))
const LoginPage = lazy(() => import('@/modules/auth/pages/LoginPage'))
const RegisterBusinessPage = lazy(() => import('@/modules/auth/pages/RegisterBusinessPage'))
const StorePage = lazy(() => import('@/modules/store/pages/StorePage'))
const DashboardPage = lazy(() => import('@/modules/dashboard/pages/DashboardPage'))
const ProductsPage = lazy(() => import('@/modules/dashboard/pages/ProductsPage'))
const OrdersPage = lazy(() => import('@/modules/dashboard/pages/OrdersPage'))
const SettingsPage = lazy(() => import('@/modules/dashboard/pages/SettingsPage'))
const StylePage = lazy(() => import('@/modules/dashboard/pages/StylePage'))
const MetricsPage = lazy(() => import('@/modules/dashboard/pages/MetricsPage'))
const PlansPage = lazy(() => import('@/modules/dashboard/pages/PlansPage'))
const CouponsPage = lazy(() => import('@/modules/dashboard/pages/CouponsPage'))
const ForgotPasswordPage = lazy(() => import('@/modules/auth/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/modules/auth/pages/ResetPasswordPage'))
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

const render = component => <Suspense fallback={<PageFallback />}>{component}</Suspense>
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

  return render(searchParams.get('store') ? <StorePage /> : <LandingPage />)
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
  { path: '/store/:slug', element: render(<StorePage />) },
  { path: '/dashboard', element: protect(<DashboardPage />) },
  { path: '/dashboard/metrics', element: protect(<MetricsPage />) },
  { path: '/dashboard/products', element: protect(<ProductsPage />) },
  { path: '/dashboard/orders', element: protect(<OrdersPage />) },
  { path: '/dashboard/settings', element: protect(<SettingsPage />) },
  { path: '/dashboard/style', element: protect(<StylePage />) },
  { path: '/dashboard/plans', element: protect(<PlansPage />) },
  { path: '/dashboard/coupons', element: protect(<CouponsPage />) },
  { path: '/payment/:status', element: protect(<PaymentReturnPage />) },
  { path: '/payments/:status', element: protect(<PaymentReturnPage />) },
  { path: '/forgot-password', element: render(<ForgotPasswordPage />) },
  { path: '/reset-password', element: render(<ResetPasswordPage />) },
  { path: '/admin', element: render(<AdminPage />) },
  { path: '/admin/login', element: render(<AdminLoginPage />) },
  { path: '/terms', element: render(<TermsPage />) },
  { path: '*', element: render(<NotFoundPage />) },
])
