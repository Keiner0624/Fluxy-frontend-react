// src/modules/auth/components/AuthShell.jsx
// Pantalla dividida del acceso y el registro: el formulario a la izquierda y, en pantallas
// grandes, una imagen a la derecha con el mensaje sobre un degradado de Fluxy.
import { Link } from 'react-router-dom'
import BrandLogo from '@/components/BrandLogo'
import Icon from '@/components/Icon'
import { legalUrl } from '@/modules/landing/legal/documents'

/** position: qué parte de la imagen queda a la vista cuando el panel la recorta. */
const COPY = {
  login: {
    title: 'Tu tienda, tus pedidos y tus clientes en un solo lugar.',
    text: 'Entrá al panel para ver lo que vendiste hoy, responder pedidos y seguir creciendo.',
    image: '/auth/login.webp',
    position: '12% center',
  },
  register: {
    title: 'Creá tu tienda online y empezá a vender hoy.',
    text: 'Catálogo, pedidos por WhatsApp, cobros con Yape o Plin y clientes organizados. Gratis para empezar.',
    image: '/auth/register.webp',
    position: '72% center',
  },
}

const POINTS = ['Sin tarjeta de crédito', 'Lista en minutos', 'Soporte en español']

export default function AuthShell({ variant = 'login', topAction, children }) {
  const copy = COPY[variant] || COPY.login
  return (
    <div className="fx fx-signin fx-auth2">
      <section className="fx-auth2__side">
        <header className="fx-auth2__top">
          <Link to="/" aria-label="Fluxy, ir al inicio"><BrandLogo size={30} textSize={19} textColor="var(--fx-ink)" /></Link>
          {topAction}
        </header>

        <main className="fx-auth2__main">
          <div className="fx-auth2__panel">{children}</div>
        </main>

        <footer className="fx-auth2__footer">
          <span>© {new Date().getFullYear()} Fluxy</span>
          <Link to={legalUrl('terms')}>Términos</Link>
          <Link to={legalUrl('privacy')}>Privacidad</Link>
        </footer>
      </section>

      <aside className="fx-auth2__visual" aria-hidden="true">
        <img className="fx-auth2__image" src={copy.image} alt="" style={{ objectPosition: copy.position }}
          decoding="async" loading="lazy" />
        <div className="fx-auth2__copy">
          <h2>{copy.title}</h2>
          <p>{copy.text}</p>
          <ul>
            {POINTS.map((point) => (
              <li key={point}><Icon name="check" size={14} /> {point}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}
