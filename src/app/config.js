// src/app/config.js
const DEFAULT_APP_URL = 'https://fluxy-frontend-react-xtsb.vercel.app'

export const API_URL = import.meta.env.VITE_API_URL || 'https://fluxy-backend-production.up.railway.app'
export const APP_URL = (import.meta.env.VITE_APP_URL || DEFAULT_APP_URL).replace(/\/$/, '')

export function buildStoreUrl(slug) {
  if (!slug) return APP_URL
  return `${APP_URL}/?store=${encodeURIComponent(slug)}`
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
