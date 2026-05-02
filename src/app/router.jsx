// src/app/router.jsx
import { createBrowserRouter, useSearchParams } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import LandingPage from '../modules/landing/pages/LandingPage'
import LoginPage from '../modules/auth/pages/LoginPage'
import RegisterBusinessPage from '../modules/auth/pages/RegisterBusinessPage'
import StorePage from '../modules/store/pages/StorePage'
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
])