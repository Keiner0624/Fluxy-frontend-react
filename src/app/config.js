// src/app/config.js
const DEFAULT_SELLER_APP_URL = 'https://fluxyweb.vercel.app'
const RUNTIME_ORIGIN = typeof window !== 'undefined'
  ? window.location.origin
  : DEFAULT_SELLER_APP_URL

export const API_URL = import.meta.env.VITE_API_URL || 'https://fluxy-backend-production.up.railway.app'
export const APP_URL = (import.meta.env.VITE_STORE_APP_URL || RUNTIME_ORIGIN).replace(/\/$/, '')
export const SELLER_APP_URL = (import.meta.env.VITE_SELLER_APP_URL || RUNTIME_ORIGIN).replace(/\/$/, '')

export function buildStoreUrl(slug) {
  if (!slug) return APP_URL
  return `${APP_URL}/store/${encodeURIComponent(slug)}`
}

export function buildSellerPaymentReturnUrl(payment, plan) {
  const params = new URLSearchParams({ payment })

  if (plan) {
    params.set('plan', plan)
  }

  return `${SELLER_APP_URL}/dashboard?${params.toString()}`
}

export function getCompanyStoreUrl(company) {
  if (!company) return ''

  if (company.slug) {
    return buildStoreUrl(company.slug)
  }

  const rawStoreUrl = company.storeUrl || ''
  if (!rawStoreUrl) return ''

  try {
    const url = new URL(rawStoreUrl)
    const querySlug = url.searchParams.get('store')
    if (querySlug) {
      return buildStoreUrl(querySlug)
    }

    const legacyMatch = url.pathname.match(/\/store\/([^/]+)/)
    if (legacyMatch) {
      return buildStoreUrl(decodeURIComponent(legacyMatch[1]))
    }
  } catch {
    return rawStoreUrl
  }

  return rawStoreUrl
}
