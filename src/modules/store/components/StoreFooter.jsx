// Pie de la tienda, barra inferior en móvil y accesos flotantes.
import Icon from '@/components/Icon'
import { BrandMark } from './StoreHeader'
import { PAYMENT_LABELS, mapsLink, money, paymentMethods } from '../lib/storeFormat'

export function StoreFooter({ company, whatsapp, onNavigate }) {
  const methods = paymentMethods(company)
  const showBranding = company?.plan !== 'BUSINESS'
  return (
    <footer className="sf-footer" id="contacto">
      <div className="sf-container sf-footer__grid">
        <div className="sf-footer__brand">
          <div className="sf-brand sf-brand--static">
            <BrandMark company={company} size={44} />
            <span className="sf-brand__copy"><strong>{company?.name}</strong><small>Tienda oficial</small></span>
          </div>
          <p>{company?.description || 'Pedí online y coordiná la entrega directamente con el negocio.'}</p>
          {whatsapp && (
            <a className="sf-btn sf-btn--whatsapp" href={whatsapp} target="_blank" rel="noreferrer">
              <Icon name="whatsapp" size={17} /> Escribinos por WhatsApp
            </a>
          )}
        </div>

        <div className="sf-footer__col">
          <h3>Contacto</h3>
          <ul>
            {company?.address && (
              <li><Icon name="mapPin" size={16} /><a href={mapsLink(company.address)} target="_blank" rel="noreferrer">{company.address}</a></li>
            )}
            {company?.phone && (
              <li><Icon name="phone" size={16} /><a href={`tel:${company.phone.replace(/[^\d+]/g, '')}`}>{company.phone}</a></li>
            )}
            {!company?.address && !company?.phone && <li><Icon name="message" size={16} /><span>Hacé tu pedido y te contactamos.</span></li>}
          </ul>
        </div>

        <div className="sf-footer__col">
          <h3>Tienda</h3>
          <ul className="sf-footer__links">
            <li><button type="button" onClick={() => onNavigate('home')}>Inicio</button></li>
            <li><button type="button" onClick={() => onNavigate('catalog')}>Productos</button></li>
            <li><button type="button" onClick={() => onNavigate('catalog', null, { onlyFavorites: true })}>Mis favoritos</button></li>
            <li><button type="button" onClick={() => onNavigate('home', 'nosotros')}>Nosotros</button></li>
          </ul>
        </div>

        {methods.length > 0 && (
          <div className="sf-footer__col">
            <h3>Medios de pago</h3>
            <div className="sf-footer__pays">
              {methods.map((key) => <span key={key}>{PAYMENT_LABELS[key] || key}</span>)}
            </div>
          </div>
        )}
      </div>

      <div className="sf-container sf-footer__bottom">
        <span>© {new Date().getFullYear()} {company?.name}. Todos los derechos reservados.</span>
        {showBranding && <a href="/" target="_blank" rel="noreferrer">Tienda creada con <strong>Fluxy</strong></a>}
      </div>
    </footer>
  )
}

export function MobileNav({ view, count, total, whatsapp, cartOpen, onNavigate, onCartOpen }) {
  return (
    <>
      {count > 0 && !cartOpen && (
        <button type="button" className="sf-cartbar" onClick={onCartOpen}>
          <span className="sf-cartbar__count">{count}</span>
          <span>Ver mi pedido</span>
          <strong>{money(total)}</strong>
        </button>
      )}
      <nav className="sf-tabbar" aria-label="Navegación de la tienda">
        <button type="button" className={view === 'home' ? 'is-active' : ''} onClick={() => onNavigate('home')}>
          <Icon name="home" size={21} /><span>Inicio</span>
        </button>
        <button type="button" className={view === 'catalog' ? 'is-active' : ''} onClick={() => onNavigate('catalog')}>
          <Icon name="grid" size={21} /><span>Productos</span>
        </button>
        <button type="button" onClick={onCartOpen} className={cartOpen ? 'is-active' : ''}>
          <span className="sf-tabbar__cart"><Icon name="cart" size={21} />{count > 0 && <b>{count > 99 ? '99+' : count}</b>}</span>
          <span>Carrito</span>
        </button>
        {whatsapp ? (
          <a href={whatsapp} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={21} /><span>WhatsApp</span></a>
        ) : (
          <button type="button" onClick={() => onNavigate('home', 'contacto')}><Icon name="phone" size={21} /><span>Contacto</span></button>
        )}
      </nav>
    </>
  )
}

export function FloatingWhatsapp({ href, hidden }) {
  if (!href || hidden) return null
  return (
    <a className="sf-float-wa" href={href} target="_blank" rel="noreferrer" aria-label="Escribir por WhatsApp">
      <Icon name="whatsapp" size={24} />
      <span>¿Te ayudamos?</span>
    </a>
  )
}
