// src/modules/store/pages/DomainStorePage.jsx
// La tienda en su dominio propio (mitienda.com): averigua qué tienda es y la muestra en la raíz.
// Si el plan ya no incluye dominio propio, lleva al comprador a la tienda en Fluxy.
import { useEffect, useState } from 'react'
import Icon from '@/components/Icon'
import { PLATFORM_URL } from '@/app/config'
import { resolveStoreDomain } from '../api/storeApi'
import StorePage from './StorePage'
import './StorePage.css'

export default function DomainStorePage({ host }) {
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    let alive = true
    resolveStoreDomain(host)
      .then((store) => {
        if (!alive) return
        if (!store.active) {
          // Conserva lo que traía el enlace (campaña, producto) para no perder la visita.
          window.location.replace(`${store.storeUrl}${window.location.search}`)
          return
        }
        setState({ status: 'ready', store })
      })
      .catch((err) => { if (alive) setState({ status: err.status === 404 ? 'missing' : 'error' }) })
    return () => { alive = false }
  }, [host])

  if (state.status === 'ready') return <StorePage slug={state.store.slug} />
  if (state.status === 'loading') return <div style={{ minHeight: '100vh', background: '#f7f5f2' }} aria-busy="true" />

  const missing = state.status === 'missing'
  return (
    <main className="sf-problem">
      <span className="sf-empty__icon"><Icon name="store" size={30} /></span>
      <h1>{missing ? 'Esta tienda no está disponible' : 'No pudimos abrir la tienda'}</h1>
      <p>
        {missing
          ? `El dominio ${host} no está conectado a ninguna tienda.`
          : 'Revisá tu conexión e intentá de nuevo en unos segundos.'}
      </p>
      {missing
        ? <a className="sf-btn sf-btn--ghost" href={PLATFORM_URL}>Ir a Fluxy</a>
        : <button type="button" className="sf-btn sf-btn--ghost" onClick={() => window.location.reload()}>Reintentar</button>}
    </main>
  )
}
