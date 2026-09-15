// Encabezado de la tienda: marca, secciones, búsqueda con sugerencias y carrito.
import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/components/Icon'
import { matchesSearch, money, productImages } from '../lib/storeFormat'

export function BrandMark({ company, size = 44 }) {
  const initial = company?.name?.trim()?.[0]?.toUpperCase() || 'T'
  return company?.logoUrl
    ? <img className="sf-brand__logo" src={company.logoUrl} alt="" style={{ width: size, height: size }} />
    : <span className="sf-brand__mark" style={{ width: size, height: size }} aria-hidden="true">{initial}</span>
}

function tagline(company) {
  const description = company?.description?.trim()
  if (description && description.length <= 38) return description
  return 'Tienda oficial'
}

function SearchBox({ products, onOpenProduct, onSearch, autoFocus, onDone }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const box = useRef(null)

  const results = useMemo(
    () => (query.trim().length < 2 ? [] : products.filter((p) => matchesSearch(p, query)).slice(0, 6)),
    [products, query],
  )

  useEffect(() => {
    const close = (event) => { if (!box.current?.contains(event.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const submit = (event) => {
    event.preventDefault()
    if (active >= 0 && results[active]) {
      onOpenProduct(results[active])
    } else {
      onSearch(query.trim())
    }
    setOpen(false)
    setQuery('')
    onDone?.()
  }

  return (
    <form ref={box} className="sf-search" role="search" onSubmit={submit}>
      <Icon name="search" size={18} />
      <input
        type="search"
        value={query}
        autoFocus={autoFocus}
        placeholder="Buscar productos…"
        aria-label="Buscar productos"
        aria-expanded={open && results.length > 0}
        aria-controls="sf-search-results"
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(-1) }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(results.length - 1, i + 1)) }
          if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(-1, i - 1)) }
          if (e.key === 'Escape') { setOpen(false); onDone?.() }
          if (e.key === 'Enter') submit(e)
        }}
      />
      {open && query.trim().length >= 2 && (
        <div className="sf-search__results" id="sf-search-results" role="listbox">
          {results.length === 0 ? (
            <p className="sf-search__empty">Sin resultados para “{query.trim()}”</p>
          ) : (
            <>
              {results.map((product, index) => {
                const image = productImages(product)[0]
                return (
                  <button key={product.id} type="button" role="option" aria-selected={index === active}
                    className={`sf-search__item${index === active ? ' is-active' : ''}`}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => { onOpenProduct(product); setOpen(false); setQuery(''); onDone?.() }}>
                    <span className="sf-search__thumb">{image ? <img src={image} alt="" /> : <Icon name="package" size={16} />}</span>
                    <span className="sf-search__name">{product.name}</span>
                    <strong>{money(product.price)}</strong>
                  </button>
                )
              })}
              <button type="submit" className="sf-search__all">Ver todos los resultados <Icon name="arrowRight" size={14} /></button>
            </>
          )}
        </div>
      )}
    </form>
  )
}

export default function StoreHeader({ company, view, products, cartCount, onNavigate, onOpenProduct, onSearch, onCartOpen }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileSearch, setMobileSearch] = useState(false)
  const [bump, setBump] = useState(false)
  const previousCount = useRef(cartCount)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // El contador del carrito rebota cuando se agrega algo.
  useEffect(() => {
    if (cartCount > previousCount.current) {
      setBump(true)
      const timer = setTimeout(() => setBump(false), 450)
      previousCount.current = cartCount
      return () => clearTimeout(timer)
    }
    previousCount.current = cartCount
    return undefined
  }, [cartCount])

  const links = [
    { key: 'home', label: 'Inicio', go: () => onNavigate('home') },
    { key: 'catalog', label: 'Productos', go: () => onNavigate('catalog') },
    { key: 'about', label: 'Nosotros', go: () => onNavigate('home', 'nosotros') },
    { key: 'contact', label: 'Contacto', go: () => onNavigate('home', 'contacto') },
  ]

  return (
    <header className={`sf-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="sf-container sf-header__inner">
        <button type="button" className="sf-brand" onClick={() => onNavigate('home')} aria-label={`Inicio de ${company?.name || 'la tienda'}`}>
          <BrandMark company={company} />
          <span className="sf-brand__copy">
            <strong>{company?.name || 'Tienda'}</strong>
            <small>{tagline(company)}</small>
          </span>
        </button>

        <nav className="sf-nav" aria-label="Secciones de la tienda">
          {links.map((link) => (
            <button key={link.key} type="button" onClick={link.go}
              className={view === link.key ? 'is-active' : ''} aria-current={view === link.key ? 'page' : undefined}>
              {link.label}
            </button>
          ))}
        </nav>

        <div className="sf-header__actions">
          <div className="sf-header__search">
            <SearchBox products={products} onOpenProduct={onOpenProduct} onSearch={onSearch} />
          </div>
          <button type="button" className="sf-icon-btn sf-header__search-toggle" onClick={() => setMobileSearch((v) => !v)}
            aria-label="Buscar" aria-expanded={mobileSearch}>
            <Icon name={mobileSearch ? 'close' : 'search'} size={20} />
          </button>
          <button type="button" className={`sf-icon-btn sf-cart-btn${bump ? ' is-bump' : ''}`} onClick={onCartOpen}
            aria-label={`Abrir carrito, ${cartCount} ${cartCount === 1 ? 'producto' : 'productos'}`}>
            <Icon name="cart" size={21} />
            {cartCount > 0 && <span className="sf-cart-btn__count">{cartCount > 99 ? '99+' : cartCount}</span>}
          </button>
        </div>
      </div>

      {mobileSearch && (
        <div className="sf-container sf-header__mobile-search">
          <SearchBox products={products} onOpenProduct={onOpenProduct} onSearch={onSearch} autoFocus onDone={() => setMobileSearch(false)} />
        </div>
      )}
    </header>
  )
}
