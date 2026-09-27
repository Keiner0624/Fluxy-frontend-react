// src/modules/marketing/api/marketingApi.js
// Llamadas del panel al módulo Marketing. La empresa la pone el backend con la sesión.
import { api } from '@/app/api'

export const getOverview = (days = 30) => api('/marketing/overview', { params: { days } })
export const listCampaigns = () => api('/marketing/campaigns')
export const getCampaign = (id) => api(`/marketing/campaigns/${id}`)
export const createCampaign = (body) => api('/marketing/campaigns', { method: 'POST', body })
export const updateCampaign = (id, body) => api(`/marketing/campaigns/${id}`, { method: 'PATCH', body })
export const deleteCampaign = (id) => api(`/marketing/campaigns/${id}`, { method: 'DELETE' })
export const campaignAction = (id, action) => api(`/marketing/campaigns/${id}/${action}`, { method: 'POST' })
export const getAnalytics = (id, params) => api(`/marketing/campaigns/${id}/analytics`, { params })
export const getLink = (id, channel) => api(`/marketing/campaigns/${id}/links`, { method: 'POST', body: { channel } })
export const getOpportunities = () => api('/marketing/opportunities')
export const getSegments = () => api('/marketing/segments')
/** value: etiqueta (TAG), origen (SOURCE) o id de producto (PRODUCT_BUYERS). */
export const getSegmentCustomers = (key, categoryId, value) =>
  api(`/marketing/segments/${key}/customers`, { params: { categoryId, value } })
export const listCustomerTags = () => api('/customers/tags')

/** Empresa de la sesión guardada al entrar (nombre, slug, logo, color). */
export function readStoredCompany() {
  try { return JSON.parse(localStorage.getItem('company') || '{}') || {} } catch { return {} }
}

// Catálogo para elegir qué se promociona.
export const listProducts = () => api('/products')
export const listCategories = () => api('/categories')
export const listCoupons = () => api('/coupons')
