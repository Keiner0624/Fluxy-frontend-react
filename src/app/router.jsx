import { createBrowserRouter, useSearchParams } from 'react-router-dom'
import LandingPage from '../modules/landing/pages/LandingPage'
import LoginPage from '../modules/auth/pages/LoginPage'
import RegisterBusinessPage from '../modules/auth/pages/RegisterBusinessPage'
import StorePage from '../modules/store/pages/StorePage'
import DashboardPage from '../modules/dashboard/pages/DashboardPage'
import ProductsPage from '../modules/dashboard/pages/ProductsPage'
import OrdersPage from '../modules/dashboard/pages/OrdersPage'
import SettingsPage from '../modules/dashboard/pages/SettingsPage'

function RootPage() {
  const [searchParams] = useSearchParams()

  return searchParams.get('store') ? <StorePage /> : <LandingPage />
}

export const router = createBrowserRouter([
  { path: '/',                    element: <RootPage /> },
  { path: '/login',               element: <LoginPage /> },
  { path: '/register-business',   element: <RegisterBusinessPage /> },
  { path: '/store/:slug',         element: <StorePage /> },
  { path: '/dashboard',           element: <DashboardPage /> },
  { path: '/dashboard/products',  element: <ProductsPage /> },
  { path: '/dashboard/orders',    element: <OrdersPage /> },
  { path: '/dashboard/settings',  element: <SettingsPage /> },
])
