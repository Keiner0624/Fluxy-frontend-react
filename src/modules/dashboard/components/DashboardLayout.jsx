// src/modules/dashboard/components/DashboardLayout.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getCompanyStoreUrl, API_URL } from '../../../app/config'
import BrandLogo from '../../../components/BrandLogo'

function getToken() { return localStorage.getItem('token') || '' }

const PLAN_ORDER = { FREE: 0, PRO: 1, BUSINESS: 2 }
const PLAN_COLORS = {
  FREE:     { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', text: '#9ca3af' },
  PRO:      { bg: 'rgba(124,131,253,0.15)', border: 'rgba(124,131,253,0.35)', text: '#7c83fd' },
  BUSINESS: { bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.30)',  text: '#34d399' },
}

const NAV_ITEMS = [
  { path: '/dashboard',          icon: '📊', label: 'Resumen' },
  { path: '/dashboard/products', icon: '📦', label: 'Productos' },
  { path: '/dashboard/orders',   icon: '🛒', label: 'Pedidos' },
  { path: '/dashboard/metrics',  icon: '📈', label: 'Métricas',      requiredPlan: 'PRO' },
  { path: '/dashboard/coupons',  icon: '🎟️', label: 'Cupones',       requiredPlan: 'PRO' },
  { path: '/dashboard/style',    icon: '🎨', label: 'Estilo',        requiredPlan: 'PRO' },
  { path: '/dashboard/settings', icon: '⚙️', label: 'Configuración' },
  { path: '/dashboard/plans',    icon: '⚡', label: 'Mejorar plan' },
]