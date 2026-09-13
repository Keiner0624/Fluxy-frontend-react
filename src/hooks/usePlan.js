// src/hooks/usePlan.js
import { useState, useEffect } from 'react'
import { getMe } from '@/app/account'

export const PLAN_LIMITS = {
  FREE:     { products: 10,     label: 'Free' },
  PRO:      { products: 100,    label: 'Pro' },
  BUSINESS: { products: 999999, label: 'Business' },
}

// Qué plan mínimo se necesita para cada feature
export const FEATURE_PLAN = {
  metrics:     'PRO',
  whatsapp:    'PRO',
  orderStatus: 'PRO',
  style:       'PRO',
  domain:      'BUSINESS',
  noBranding:  'BUSINESS',
}

const PLAN_ORDER = { FREE: 0, PRO: 1, BUSINESS: 2 }

export function hasAccess(currentPlan, requiredPlan) {
  return (PLAN_ORDER[currentPlan] || 0) >= (PLAN_ORDER[requiredPlan] || 0)
}

export default function usePlan() {
  const [plan, setPlan]       = useState('FREE')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let vigente = true
    // Compartido: si el layout o la página ya lo pidieron, no sale otra petición.
    getMe()
      .then((data) => { if (vigente && data.planName) setPlan(data.planName) })
      .catch(() => { /* silencioso */ })
      .finally(() => { if (vigente) setLoading(false) })
    return () => { vigente = false }
  }, [])

  return {
    plan,
    loading,
    isPro:      hasAccess(plan, 'PRO'),
    isBusiness: hasAccess(plan, 'BUSINESS'),
    isFree:     plan === 'FREE',
    canAccess:  (feature) => hasAccess(plan, FEATURE_PLAN[feature] || 'FREE'),
  }
}