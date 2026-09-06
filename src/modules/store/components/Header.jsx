import { useEffect, useState } from 'react'
import Icon from '@/components/Icon'

export default function Header({ company, cartCount, onCartOpen }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const phone = company?.phone?.replace(/[^0-9]/g, '')
  const waMsg = encodeURIComponent(
    `Hola, vi la tienda ${company?.name || ''} y quisiera hacer una consulta.`
  )
  const showBranding = company?.plan !== 'BUSINESS'

  return (
    <header className={`store-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="store-container store-header__inner">
        <a className="store-brand" href="#top" aria-label={`Ir al inicio de ${company?.name || 'la tienda'}`}>
          {company?.logoUrl ? (
            <img className="store-brand__logo" src={company.logoUrl} alt="" />
          ) : (
            <span className="store-brand__mark" aria-hidden="true">
              {company?.name?.[0]?.toUpperCase() || 'F'}
            </span>
          )}
          <span className="store-brand__copy">
            <strong>{company?.name || 'Tienda'}</strong>
            {showBranding && <small>Tienda creada con Fluxy</small>}
          </span>
        </a>

        <nav className="store-nav" aria-label="Navegación principal">
          <a href="#products">Catálogo</a>
          <a href="#store-confidence">Garantías</a>
          <a href="#store-contact">Contacto</a>
        </nav>

        <div className="store-header__actions">
          {phone && company?.plan !== 'FREE' && (
            <a
              className="store-header__contact"
              href={`https://wa.me/${phone}?text=${waMsg}`}
              target="_blank"
              rel="noreferrer"
            >
              <Icon name="message" size={16} />
              <span>Consultar</span>
            </a>
          )}
          <button className="store-cart-button" onClick={onCartOpen} aria-label={`Abrir carrito, ${cartCount} productos`}>
            <Icon name="orders" size={18} />
            <span className="store-cart-button__label">Carrito</span>
            {cartCount > 0 && <span className="store-cart-button__count">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  )
}
