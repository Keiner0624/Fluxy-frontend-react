// src/modules/auth/authSession.js
// Lo que pasa después de obtener una sesión (login, registro, Google/Apple,
// invitación): guardar tokens, cargar cuenta y empresa, y decidir adónde ir.

import { buildStoreUrl } from '@/app/config'
import { getMe, getMyCompany, invalidateAccount } from '@/app/account'
import { saveSession } from '@/app/session'

export async function startSession(auth) {
  invalidateAccount()
  saveSession(auth)
  localStorage.removeItem('storeStyle')

  // En paralelo y en caché: el panel se monta con los datos ya resueltos.
  const [me, company] = await Promise.all([
    getMe({ force: true }).catch(() => null),
    getMyCompany({ force: true }).catch(() => null),
  ])
  if (me) localStorage.setItem('user', JSON.stringify({ fullName: me.fullName, email: me.email }))
  if (company) {
    localStorage.setItem('company', JSON.stringify({
      id: company.id,
      name: company.name,
      slug: company.slug,
      plan: company.plan || 'FREE',
      logoUrl: company.logoUrl || '',
      storeStyle: company.storeStyle || '',
      storeUrl: buildStoreUrl(company.slug),
    }))
  }
  return { me, company }
}

/** Solo rutas internas del panel: un returnTo externo sería una redirección abierta. */
export function safeReturnTo(value, fallback = '/dashboard') {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback
  return value
}

export const SIGNUP_STORAGE_KEY = 'fluxy_signup'

/** El registro en curso sobrevive a recargar la página durante la verificación. */
export function rememberSignup(state) {
  try {
    if (state?.signupToken) sessionStorage.setItem(SIGNUP_STORAGE_KEY, JSON.stringify({ signupToken: state.signupToken, at: Date.now() }))
  } catch { /* sin almacenamiento */ }
}

export function recallSignupToken() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(SIGNUP_STORAGE_KEY) || 'null')
    return saved && Date.now() - saved.at < 24 * 3600_000 ? saved.signupToken : null
  } catch {
    return null
  }
}

export function forgetSignup() {
  try { sessionStorage.removeItem(SIGNUP_STORAGE_KEY) } catch { /* sin almacenamiento */ }
}
