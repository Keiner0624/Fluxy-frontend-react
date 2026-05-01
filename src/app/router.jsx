import { createBrowserRouter } from 'react-router-dom'
import LandingPage from '../modules/landing/pages/LandingPage'
import LoginPage from '../modules/auth/pages/LoginPage'
import RegisterBusinessPage from '../modules/auth/pages/RegisterBusinessPage'
import StorePage from '../modules/store/pages/StorePage'
import DashboardPage from '../modules/dashboard/pages/DashboardPage'
import ProductsPage from '../modules/dashboard/pages/ProductsPage'

export const router = createBrowserRouter([
  { path: '/',                    element: <LandingPage /> },
  { path: '/login',               element: <LoginPage /> },
  { path: '/register-business',   element: <RegisterBusinessPage /> },
  { path: '/store/:slug',         element: <StorePage /> },
  { path: '/dashboard',           element: <DashboardPage /> },
  { path: '/dashboard/products',  element: <ProductsPage /> },
])
