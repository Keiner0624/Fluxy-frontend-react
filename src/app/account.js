// src/app/account.js
// Datos de la cuenta del vendedor (/me y /companies/my-company), compartidos
// entre todo el panel.
//
// Antes cada componente pedía lo suyo al montarse: el layout pedía /me para el
// plan, la página volvía a pedir /me, y usePlan una tercera vez. Entrar al
// panel disparaba cinco peticiones con dos repetidas, cada una de ~0,5 s hasta
// Render. Aquí se resuelven una sola vez y se reutilizan.

import { API_URL } from '@/app/config'

/**
 * Cuánto se reutiliza un dato antes de volver a pedirlo. Cubre el salto del
 * login al panel y la navegación entre páginas, y es corto porque el plan puede
 * cambiar en el servidor (un pago acreditado, un plan que vence). Los cambios
 * que hace el propio vendedor invalidan la caché explícitamente.
 */
const TTL_MS = 30_000

const RECURSOS = {
  me:      '/me',
  company: '/companies/my-company',
}

// Por recurso: el dato, cuándo se obtuvo, con qué token, y la petición en curso.
const cache = {
  me:      { data: null, at: 0, token: null, promise: null },
  company: { data: null, at: 0, token: null, promise: null },
}

function getToken() {
  return localStorage.getItem('token') || ''
}

async function cargar(clave, { force = false } = {}) {
  const entrada = cache[clave]
  const token = getToken()

  // Un dato de otra sesión nunca sirve: cubre cualquier forma de cerrar sesión.
  const vigente = entrada.data
    && entrada.token === token
    && Date.now() - entrada.at < TTL_MS

  if (!force && vigente) return entrada.data

  // Si otro componente ya lo está pidiendo, se espera esa misma respuesta.
  if (!force && entrada.promise && entrada.token === token) return entrada.promise

  const promesa = fetch(`${API_URL}${RECURSOS[clave]}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      if (!res.ok) throw new Error(`${RECURSOS[clave]} respondió ${res.status}`)
      return res.json()
    })
    .then((data) => {
      entrada.data = data
      entrada.at = Date.now()
      entrada.token = token
      return data
    })
    .finally(() => {
      if (entrada.promise === promesa) entrada.promise = null
    })

  entrada.promise = promesa
  entrada.token = token
  return promesa
}

/** Usuario autenticado: nombre, plan, vencimiento, cumpleaños. */
export function getMe(opciones) {
  return cargar('me', opciones)
}

/** Empresa del vendedor: nombre, slug, logo, estilo de la tienda. */
export function getMyCompany(opciones) {
  return cargar('company', opciones)
}

/**
 * Último /me conocido para esta sesión, aunque haya vencido el TTL. Sirve para
 * pintar el menú al instante mientras llega la versión fresca.
 */
export function peekMe() {
  const entrada = cache.me
  return entrada.data && entrada.token === getToken() ? entrada.data : null
}

/**
 * Siembra la caché con datos ya obtenidos. El login los pide antes de navegar,
 * así el panel se monta con todo resuelto en vez de volver a pedirlo.
 */
export function primeAccount({ me, company } = {}) {
  const token = getToken()
  const ahora = Date.now()
  if (me)      Object.assign(cache.me,      { data: me,      at: ahora, token })
  if (company) Object.assign(cache.company, { data: company, at: ahora, token })
}

/**
 * Descarta datos para que la próxima lectura vaya al servidor. Se llama después
 * de cualquier cambio que haga el vendedor: guardar la configuración, activar la
 * prueba, cerrar sesión.
 */
export function invalidateAccount(clave) {
  const claves = clave ? [clave] : Object.keys(cache)
  for (const c of claves) {
    Object.assign(cache[c], { data: null, at: 0, token: null, promise: null })
  }
}
