// src/app/ai.js
// Textos generados con IA (plan Business). Siempre son una propuesta editable: nada se guarda solo.
import { api } from '@/app/api'

/** { name, price, category, notes } → { description } */
export const generateProductDescription = (body) => api('/ai/describe', { method: 'POST', body })

/** { type, objective, channel, target, price, couponCode, discount, storeName } → { title, message, callToAction } */
export const generateCampaignCopy = (body) => api('/ai/campaign-copy', { method: 'POST', body })
