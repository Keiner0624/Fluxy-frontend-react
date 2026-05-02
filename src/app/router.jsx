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

function RootPage() {
  const [searchParams] = useSearchParams()
  return searchParams.get('store') ? <StorePage /> : <LandingPage />
}

function PaymentReturnPage() {
  const { status } = useParams()
  const [searchParams] = useSearchParams()
  const rawStatus = searchParams.get('payment')
    || searchParams.get('status')
    || searchParams.get('collection_status')
    || status
    || 'pending'
  const normalizedStatuses = {
    approved: 'success',
    rejected: 'failure',
    cancelled: 'failure',
    in_process: 'pending',
    in_mediation: 'pending',
  }
  const payment = normalizedStatuses[rawStatus] || rawStatus
  const plan = searchParams.get('plan')
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
])
