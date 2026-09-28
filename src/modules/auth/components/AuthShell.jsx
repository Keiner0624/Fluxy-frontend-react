// src/modules/auth/components/AuthShell.jsx
// Pantalla dividida del acceso y el registro: el formulario a la izquierda y, en pantallas
// grandes, un panel con los colores de Fluxy y una vista previa de una tienda a la derecha.
import { Link } from 'react-router-dom'
import BrandLogo from '@/components/BrandLogo'
import Icon from '@/components/Icon'
import { legalUrl } from '@/modules/landing/legal/documents'

const COPY = {
  login: {
    title: 'Tu tienda, tus pedidos y tus clientes en un solo lugar.',
    text: 'Entrá al panel para ver lo que vendiste hoy, responder pedidos y seguir creciendo.',
  },
  register: {
    title: 'Creá tu tienda online y empezá a vender hoy.',
    text: 'Catálogo, pedidos por WhatsApp, cobros con Yape o Plin y clientes organizados. Gratis para empezar.',
  },
}

const POINTS = ['Sin tarjeta de crédito', 'Lista en minutos', 'Soporte en español']

/** Vista previa ilustrativa de una tienda con pedidos (no son datos reales). */
function StorePreview() {
  return (
    <div className="fx-auth2__preview">
      <div className="fx-auth2__card fx-auth2__card--store">
        <div className="fx-auth2__store-head">
          <span className="fx-auth2__avatar">C</span>
          <div>
            <strong>Café de la esquina</strong>
            <small>Abierto · Pedidos online</small>
          </div>
        </div>
        <div className="fx-auth2__products">
          {[['Latte', 'S/ 12.00'], ['Torta de chocolate', 'S/ 30.00'], ['Cold brew', 'S/ 14.00']].map(([name, price], i) => (
            <div key={name} className="fx-auth2__product">
              <span className={`fx-auth2__thumb fx-auth2__thumb--${i}`} />
              <span className="fx-auth2__product-name">{name}</span>
              <span className="fx-auth2__product-price">{price}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="fx-auth2__card fx-auth2__card--order">
        <span className="fx-auth2__icon"><Icon name="checkCircle" size={16} /></span>
        <div>
          <strong>Nuevo pedido #1042</strong>
          <small>2 productos · S/ 42.00 · Yape</small>
        </div>
      </div>

      <div className="fx-auth2__card fx-auth2__card--sales">
        <small>Ventas de la semana</small>
        <strong>S/ 1,280</strong>
        <div className="fx-auth2__bars" aria-hidden="true">
          {[38, 55, 42, 70, 62, 88, 76].map((h, i) => <span key={i} style={{ height: `${h}%` }} />)}
        </div>
      </div>
    </div>
  )
}

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
        <div className="fx-auth2__glow fx-auth2__glow--a" />
        <div className="fx-auth2__glow fx-auth2__glow--b" />
        <div className="fx-auth2__grid" />
        <div className="fx-auth2__content">
          <div className="fx-auth2__copy">
            <h2>{copy.title}</h2>
            <p>{copy.text}</p>
            <ul>
              {POINTS.map((point) => (
                <li key={point}><Icon name="check" size={14} /> {point}</li>
              ))}
            </ul>
          </div>
          <StorePreview />
        </div>
      </aside>
    </div>
  )
}
