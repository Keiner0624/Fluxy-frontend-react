// src/modules/invoicing/api/invoicingApi.js
// Llamadas del panel a facturación electrónica. La empresa la pone el backend con la sesión.
import { api } from '@/app/api'
import { API_URL } from '@/app/config'
import { getAccessToken } from '@/app/session'
import { downloadBlob } from '@/app/exporters'

export const getStatus = () => api('/invoicing/status')
export const getConfiguration = () => api('/invoicing/configuration')
export const updateSettings = (body) => api('/invoicing/configuration', { method: 'PUT', body })
export const verifyRuc = (body) => api('/invoicing/configuration/verify-ruc', { method: 'POST', body })
export const updateProvider = (body) => api('/invoicing/configuration/provider', { method: 'PUT', body })
export const testConnection = () => api('/invoicing/configuration/test', { method: 'POST' })
export const activate = () => api('/invoicing/configuration/activate', { method: 'POST' })
export const pause = () => api('/invoicing/configuration/pause', { method: 'POST' })
export const createSeries = (body) => api('/invoicing/series', { method: 'POST', body })
export const updateSeries = (id, body) => api(`/invoicing/series/${id}`, { method: 'PUT', body })

export const listDocuments = (params) => api('/invoicing/documents', { params })
export const getDocument = (id) => api(`/invoicing/documents/${id}`)
/** idempotencyKey: un doble clic o un reintento de red devuelve el mismo comprobante. */
export const createDocument = (body, idempotencyKey) => api('/invoicing/documents', { method: 'POST', body, idempotencyKey })
export const resendEmail = (id, email) => api(`/invoicing/documents/${id}/resend-email`, { method: 'POST', body: { email: email || null } })
export const createCreditNote = (id, body, idempotencyKey) => api(`/invoicing/documents/${id}/credit-notes`, { method: 'POST', body, idempotencyKey })
export const retryDocument = (id) => api(`/invoicing/documents/${id}/retry`, { method: 'POST' })
export const revokePublicLink = (id) => api(`/invoicing/documents/${id}/public-link/revoke`, { method: 'POST' })

/** PDF o XML: se piden con la sesión (no hay URLs públicas permanentes). */
export async function fetchDocumentFile(id, kind) {
  let response
  try {
    response = await fetch(`${API_URL}/invoicing/documents/${id}/${kind}`, { headers: { Authorization: `Bearer ${getAccessToken()}` } })
  } catch {
    throw new Error('No se pudo conectar con el servidor.')
  }
  if (!response.ok) {
    let message = 'No se pudo obtener el archivo.'
    try { message = (await response.json()).message || message } catch { /* sin cuerpo */ }
    throw new Error(message)
  }
  const disposition = response.headers.get('Content-Disposition') || ''
  const name = /filename="?([^";]+)"?/.exec(disposition)?.[1] || `comprobante.${kind}`
  return { blob: await response.blob(), name }
}

export async function downloadDocumentFile(id, kind) {
  const { blob, name } = await fetchDocumentFile(id, kind)
  downloadBlob(blob, name)
}

/** Abre el PDF en otra pestaña (el navegador lo muestra). */
export async function openDocumentPdf(id) {
  const popup = window.open('', '_blank')
  try {
    const { blob } = await fetchDocumentFile(id, 'pdf')
    const url = URL.createObjectURL(blob)
    if (popup) popup.location.href = url
    else window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch (error) {
    popup?.close()
    throw error
  }
}

// Tienda pública
export const getPublicDocument = (token) => fetch(`${API_URL}/store/documents/${encodeURIComponent(token)}`)
  .then(async (r) => {
    if (!r.ok) throw new Error(r.status === 404 ? 'Este comprobante no existe o su enlace fue renovado.' : 'No se pudo cargar el comprobante.')
    return r.json()
  })
export const publicPdfUrl = (token) => `${API_URL}/store/documents/${encodeURIComponent(token)}/pdf`
