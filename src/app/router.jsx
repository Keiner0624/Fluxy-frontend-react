import { createBrowserRouter } from 'react-router-dom'
import LandingPage from '../modules/landing/pages/LandingPage'
import LoginPage from '../modules/auth/pages/LoginPage'
import RegisterBusinessPage from '../modules/auth/pages/RegisterBusinessPage'
import DashboardPage from '../modules/auth/pages/DashboardPage'
import StorePage from '../modules/auth/pages/StorePage'

export const router = createBrowserRouter([
  { path: '/',                  element: <LandingPage /> },
  { path: '/login',             element: <LoginPage /> },
  { path: '/register-business', element: <RegisterBusinessPage /> },
  { path: '/store/:slug',       element: <StorePage /> },
  { path: '/dashboard',         element: <DashboardPage /> },
])
