// src/app/router.jsx
import { Navigate, createBrowserRouter, useParams, useSearchParams } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import LandingPage from '../modules/landing/pages/LandingPage'
import LoginPage from '../modules/auth/pages/LoginPage'
import RegisterBusinessPage from '../modules/auth/pages/RegisterBusinessPage'
import StorePage from '../modules/dashboard/pages/StorePage'
import DashboardPage from '../modules/dashboard/pages/DashboardPage'
import ProductsPage from '../modules/dashboard/pages/ProductsPage'
import OrdersPage from '../modules/dashboard/pages/OrdersPage'
import SettingsPage from '../modules/dashboard/pages/SettingsPage'
import StylePage from '../modules/dashboard/pages/StylePage'
import MetricsPage from '../modules/dashboard/pages/MetricsPage'
import PlansPage from '../modules/dashboard/pages/PlansPage'
import ForgotPasswordPage from '../modules/auth/ForgotPasswordPage'
import ResetPasswordPage from '../modules/auth/ResetPasswordPage'

const PAYMENT_STATUS_MAP = {
  approved: 'success',
  rejected: 'failure',
  cancelled: 'failure',
  in_process: 'pending',
  in_mediation: 'pending',
}

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

  return searchParams.get('store') ? <StorePage /> : <LandingPage />
}

function PaymentReturnPage() {
  const { status } = useParams()
  const [searchParams] = useSearchParams()
  const payment = getNormalizedPaymentStatus(searchParams, status || 'pending')
  const plan = searchParams.get('plan') || localStorage.getItem('fluxy_pending_plan_checkout') || ''
  const params = new URLSearchParams({ payment })

  if (plan) {
    params.set('plan', plan)
  }

  return <Navigate to={`/dashboard?${params.toString()}`} replace />
}

const protect = (element) => <ProtectedRoute>{element}</ProtectedRoute>

export const router = createBrowserRouter([
  { path: '/',                    element: <RootPage /> },
  { path: '/login',               element: <LoginPage /> },
  { path: '/register-business',   element: <RegisterBusinessPage /> },
  { path: '/store/:slug',         element: <StorePage /> },
  { path: '/dashboard',           element: protect(<DashboardPage />) },
  { path: '/dashboard/metrics',   element: protect(<MetricsPage />) },
  { path: '/dashboard/products',  element: protect(<ProductsPage />) },
  { path: '/dashboard/orders',    element: protect(<OrdersPage />) },
  { path: '/dashboard/settings',  element: protect(<SettingsPage />) },
  { path: '/dashboard/style',     element: protect(<StylePage />) },
  { path: '/payment/:status',     element: protect(<PaymentReturnPage />) },
  { path: '/payments/:status',    element: protect(<PaymentReturnPage />) },
  { path: '/dashboard/plans', element: protect(<PlansPage />) },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
{ path: '/reset-password',  element: <ResetPasswordPage /> },
])
